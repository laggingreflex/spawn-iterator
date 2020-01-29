const spawn = require('.');

(async () => {
  for await (const { stdout, stderr } of spawn('ping google.com', { shell: true })) {
    if (stdout) process.stdout.write(stdout)
    if (stderr) process.stderr.write(stderr)
  }
})().catch(console.error);

(async () => {
  const output = await spawn('ping google.com', { shell: true });
  console.log({ output });
})().catch(console.error);
