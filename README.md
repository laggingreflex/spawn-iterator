# spawn-iterator

Iterate through spawn output

## Install

```
npm i spawn-iterator
```

## Usage

```js
const spawn = require('spawn-iterator')

for await (const { stdout, stderr } of spawn('ping google.com')) {
  process.stdout.write(stdout)
  process.stderr.write(stderr)
}
```
