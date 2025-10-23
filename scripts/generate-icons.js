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

// Create a simple 256x256 PNG icon for Windows builds
// This is a minimal approach - creates a simple colored square
// For production, you might want to use a proper SVG->PNG converter like sharp
const create256x256PNG = () => {
  // Create a simple 256x256 icon with a microphone-like design
  // Using a simple approach without external dependencies

  // PNG header for 256x256 RGBA image
  const width = 256;
  const height = 256;

  // Create RGBA pixel data (256x256 * 4 bytes per pixel)
  const pixels = Buffer.alloc(width * height * 4);

  // Fill with a simple microphone icon design
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Center coordinates
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;

      // Draw a simple microphone shape
      // Microphone body (ellipse in top portion)
      const bodyTop = cy - 60;
      const bodyBottom = cy + 20;
      const bodyWidth = 40;

      // Check if pixel is inside microphone body
      if (y >= bodyTop && y <= bodyBottom && Math.abs(dx) <= bodyWidth) {
        // Rounded corners
        if ((y < bodyTop + bodyWidth && Math.pow(dx, 2) + Math.pow(y - bodyTop - bodyWidth, 2) > Math.pow(bodyWidth, 2)) ||
            (y > bodyBottom - bodyWidth && Math.pow(dx, 2) + Math.pow(y - bodyBottom + bodyWidth, 2) > Math.pow(bodyWidth, 2))) {
          pixels[idx] = 0; pixels[idx + 1] = 0; pixels[idx + 2] = 0; pixels[idx + 3] = 0;
        } else {
          // Blue microphone body
          pixels[idx] = 59;      // R
          pixels[idx + 1] = 130;  // G
          pixels[idx + 2] = 246;  // B
          pixels[idx + 3] = 255;  // A
        }
      }
      // Stand (vertical line below body)
      else if (y >= cy + 20 && y <= cy + 80 && Math.abs(dx) <= 3) {
        pixels[idx] = 59; pixels[idx + 1] = 130; pixels[idx + 2] = 246; pixels[idx + 3] = 255;
      }
      // Base (horizontal line at bottom)
      else if (y >= cy + 75 && y <= cy + 80 && Math.abs(dx) <= 50) {
        pixels[idx] = 59; pixels[idx + 1] = 130; pixels[idx + 2] = 246; pixels[idx + 3] = 255;
      }
      // Transparent background
      else {
        pixels[idx] = 0; pixels[idx + 1] = 0; pixels[idx + 2] = 0; pixels[idx + 3] = 0;
      }
    }
  }

  // Build PNG file
  const { createHash } = require('crypto');
  const chunks = [];

  // PNG signature
  chunks.push(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // bit depth
  ihdr.writeUInt8(6, 9);  // color type (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace
  chunks.push(createChunk('IHDR', ihdr));

  // IDAT chunk (image data)
  const zlib = require('zlib');
  const rows = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rows[y * (1 + width * 4)] = 0; // filter type
    pixels.copy(rows, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(rows, { level: 9 });
  chunks.push(createChunk('IDAT', compressed));

  // IEND chunk
  chunks.push(createChunk('IEND', Buffer.alloc(0)));

  return Buffer.concat(chunks);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    const crcData = Buffer.concat([typeBuffer, data]);
    crc.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([len, typeBuffer, data, crc]);
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = crc ^ buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ -1) >>> 0;
  }
};

// Create app-icon.png (electron-builder requires at least 256x256 for Windows)
const appIconPng = path.join(outputPath, 'app-icon.png');
fs.writeFileSync(appIconPng, create256x256PNG());
console.log('Created app-icon.png (256x256 for Windows builds)');

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
