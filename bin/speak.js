#!/usr/bin/env node
// Speak - Voice Dictation CLI Entry Point
// Launches the Electron app directly

const { spawn } = require('child_process');
const path = require('path');

// Get the package root directory
const packageRoot = path.join(__dirname, '..');

// Launch Electron with the main.js file
const electron = require('electron');
const proc = spawn(electron, [path.join(packageRoot, 'src', 'main.js')], {
  stdio: 'inherit',
  cwd: packageRoot
});

proc.on('close', (code) => {
  process.exit(code);
});
