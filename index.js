const { spawn } = require('child_process');

module.exports = (...args) => {
  const cp = spawn(...args);
  const output = { stdout: null, stderr: null };
  const cleanup = [];

  let deferred = defer();
  const promise = {
    onFulfilled: [],
    onRejected: [],
    onFinally: [],
  };
  const iterator = {
    cp,
    value: deferred.promise,
    done: false,
    next() { return this },
    [Symbol.iterator]() { return this },
    then(onFulfilled, onRejected) {
      if (onFulfilled) promise.onFulfilled.push(onFulfilled);
      if (onRejected) promise.onRejected.push(onRejected);
      return this;
    },
    catch (onRejected) {
      if (onRejected) promise.onRejected.push(onRejected);
      return this;
    },
    finally(onFinally) {
      if (onFinally) promise.onFinally.push(onFinally);
      return this;
    },
  };
  const resolve = (value, done = false) => {
    if (iterator.done) return;
    const resolve = deferred.resolve.bind(deferred, value);
    iterator.done = done;
    if (!iterator.done) {
      deferred = defer();
      iterator.value = deferred.promise;
    }
    resolve();
  };
  const reject = (error) => {
    if (iterator.done) return;
    iterator.done = true;
    deferred.reject(error);
  };

  cp.on('exit', code => {
    cleanup.forEach(cleanup => cleanup());
    if (code) {
      reject(code);
      promise.onRejected.forEach(onRejected => onRejected(code));
    } else {
      resolve(output, true);
      promise.onFulfilled.forEach(onFulfilled => onFulfilled(output));
    }
    promise.onFinally.forEach(onFinally => onFinally(code, output));
  });

  for (const key in output) {
    if (!cp[key]) continue;
    const fn = data => {
      resolve({
        ...output,
        [key]: data,
      });
    };
    cp[key].on('data', fn);
    cleanup.push(() => cp[key].off('data', fn));
  }

  return iterator;
};

function defer() {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}
