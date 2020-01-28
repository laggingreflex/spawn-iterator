const spawn = require('.');

(async () => {
  for await (const { stdout, stderr } of spawn('ping google.com', { shell: true })) {
    if (stdout) process.stdout.write(stdout)
    if (stderr) process.stderr.write(stderr)
  }
})().catch(console.error);
