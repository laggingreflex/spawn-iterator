const { spawn } = require('child_process');

module.exports = (...args) => {
  const cp = spawn(...args);
  const output = { stdout: null, stderr: null };
  const cleanup = [];

  let current = defer();
  const iterator = {
    cp,
    value: current.promise,
    done: false,
    next() { return this },
    [Symbol.iterator]() { return this },
  };

  cp.on('exit', code => {
    iterator.done = true;
    if (code) {
      current.reject(code);
    } else {
      current.resolve(output);
    }
    for (const fn of cleanup) {
      fn();
    }
  });

  for (const key in output) {
    if (!cp[key]) continue;
    const fn = data => {
      if (iterator.done) return;
      const resolve = current.resolve.bind(current, {
        ...output,
        [key]: data,
      });
      current = defer();
      iterator.value = current.promise;
      resolve();
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
