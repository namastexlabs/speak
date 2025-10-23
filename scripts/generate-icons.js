#!/usr/bin/env node
/**
 * Generate tray and notification icons from Lucide icons
 */

const fs = require('fs');
const path = require('path');

// Path to lucide icons
const lucidePath = path.join(__dirname, '../node_modules/lucide-static/icons');
const outputPath = path.join(__dirname, '../assets/icons');

// Copy the mic icon for tray-normal
const micIcon = path.join(lucidePath, 'mic.svg');
const trayNormal = path.join(outputPath, 'tray-normal.svg');

// Copy the mic icon for notification
const notificationIcon = path.join(outputPath, 'notification.svg');

// For recording state, we'll need to create a custom version with a red dot
// For now, let's use the mic icon as base
const micContent = fs.readFileSync(micIcon, 'utf8');

// Write tray-normal (just the mic)
fs.writeFileSync(trayNormal, micContent);
console.log('Created tray-normal.svg');

// Write notification icon
fs.writeFileSync(notificationIcon, micContent);
console.log('Created notification.svg');

// Create tray-recording with red circle indicator
// Modify the SVG to add a red circle
const recordingContent = micContent.replace(
  '</svg>',
  '<circle cx="18" cy="6" r="4" fill="red" stroke="white" stroke-width="1"/></svg>'
);
const trayRecording = path.join(outputPath, 'tray-recording.svg');
fs.writeFileSync(trayRecording, recordingContent);
console.log('Created tray-recording.svg');

// Create app icon (512x512 for better quality)
const appIconContent = micContent
  .replace('width="24"', 'width="512"')
  .replace('height="24"', 'height="512"')
  .replace('stroke-width="2"', 'stroke-width="32"');

const appIcon = path.join(outputPath, 'app-icon.svg');
fs.writeFileSync(appIcon, appIconContent);
console.log('Created app-icon.svg');

// Export icon generation as module
const iconIndex = path.join(outputPath, 'index.js');
fs.writeFileSync(iconIndex, `
const path = require('path');

module.exports = {
  trayNormal: path.join(__dirname, 'tray-normal.svg'),
  trayRecording: path.join(__dirname, 'tray-recording.svg'),
  notification: path.join(__dirname, 'notification.svg'),
  appIcon: path.join(__dirname, 'app-icon.svg')
};
`);
console.log('Created index.js');

console.log('\n✅ All icons generated successfully!');
