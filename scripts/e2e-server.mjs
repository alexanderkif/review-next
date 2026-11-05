import { spawn } from 'node:child_process';

const noDatabaseUrl = 'postgresql://127.0.0.1:1/e2e_disabled';

if (process.env.E2E_NO_DATABASE !== '1' || process.env.POSTGRES_URL !== noDatabaseUrl) {
  throw new Error('E2E server must run with the database-disabled test configuration.');
}

const nextCli = 'node_modules/next/dist/bin/next';
const serverEnv = {
  ...process.env,
  NEXTAUTH_URL: 'http://127.0.0.1:3100',
  NEXTAUTH_SECRET: 'e2e-only-not-a-production-secret',
};

function runNext(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [nextCli, ...args], {
      env: serverEnv,
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`next ${args[0]} exited with code ${code}`));
      }
    });
  });
}

await runNext(['build']);

const server = spawn(
  process.execPath,
  [nextCli, 'start', '--hostname', '127.0.0.1', '--port', '3100'],
  { env: serverEnv, stdio: 'inherit' },
);

const stopServer = () => {
  if (server.exitCode === null) {
    server.kill('SIGTERM');
  }
};

process.once('SIGINT', stopServer);
process.once('SIGTERM', stopServer);

server.once('error', (error) => {
  console.error('Failed to start the E2E Next.js server:', error);
  process.exitCode = 1;
});

server.once('exit', (code) => {
  process.exitCode = code ?? 1;
});
