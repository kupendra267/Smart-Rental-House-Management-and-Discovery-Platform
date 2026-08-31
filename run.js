const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '======================================================================');
console.log('\x1b[36m%s\x1b[0m', '🚀 Launching Smart Rental House Management & Discovery Platform');
console.log('\x1b[36m%s\x1b[0m', '======================================================================\n');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

// 1. Launch Backend (Port 5000)
console.log('\x1b[33m%s\x1b[0m', '🔌 Starting Backend API (Port 5000)...');
const backendProcess = spawn(npmCmd, ['run', 'start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, PORT: '5000' }
});

backendProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.log('\x1b[34m[BACKEND]\x1b[0m %s', line);
  });
});

backendProcess.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.error('\x1b[31m[BACKEND-ERR]\x1b[0m %s', line);
  });
});

// 2. Launch Frontend (Port 5173)
console.log('\x1b[33m%s\x1b[0m', '🎨 Starting Frontend UI (Port 5173)...');
const frontendProcess = spawn(npmCmd, ['run', 'dev', '--', '--host', '0.0.0.0'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true
});

frontendProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.log('\x1b[32m[FRONTEND]\x1b[0m %s', line);
  });
});

frontendProcess.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.error('\x1b[31m[FRONTEND-ERR]\x1b[0m %s', line);
  });
});

// Handle termination
const cleanup = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Stopping all services...');
  backendProcess.kill();
  frontendProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
