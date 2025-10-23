#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Simple SVG to PNG converter using Canvas (if available) or fallback to base64
function createSimpleIcon(color, size, filename) {
  // Create a simple colored circle as SVG
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="${color}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/6}" fill="none" stroke="white" stroke-width="2"/>
    <circle cx="${size/2}" cy="${size/2 - size/8}" r="${size/12}" fill="white"/>
  </svg>`;
  
  return svg;
}

function createTrayNormalIcon() {
  // Gray microphone icon for idle state
  return createSimpleIcon('#808080', 32, 'tray-normal');
}

function createTrayRecordingIcon() {
  // Red microphone icon for recording state
  return createSimpleIcon('#FF4444', 32, 'tray-recording');
}

function createNotificationIcon() {
  // Blue app icon for notifications
  return createSimpleIcon('#4A90E2', 64, 'notification');
}

function saveIconAsSVG(svg, filename, outputPath) {
  const filePath = path.join(outputPath, `${filename}.svg`);
  fs.writeFileSync(filePath, svg);
  return filePath;
}

function createPNGFallback(outputPath) {
  // Create a simple 1x1 pixel PNG as fallback (this is a minimal valid PNG)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk start
    0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x20, // 32x32 image
    0x08, 0x02, 0x00, 0x00, 0x00, 0xFC, 0x18, 0xED, // Bit depth, color type
    0x33, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk start
    0x54, 0x08, 0x99, 0x01, 0x01, 0x01, 0x00, 0x00, // Minimal image data
    0xFE, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // 
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82  // PNG end
  ]);
  
  return pngData;
}

function savePNGFallback(outputPath, filename, color) {
  const filePath = path.join(outputPath, `${filename}.png`);
  const pngData = createPNGFallback(outputPath);
  fs.writeFileSync(filePath, pngData);
  return filePath;
}

function tryCanvasConversion(svgPath, outputPath, filename) {
  try {
    // Try to use sharp or canvas for conversion if available
    const sharp = require('sharp');
    
    // Convert SVG to PNG using sharp
    sharp(svgPath)
      .png()
      .toFile(path.join(outputPath, `${filename}.png`))
      .then(() => {
        log(`✅ Generated ${filename}.png using sharp`, 'green');
      })
      .catch(() => {
        throw new Error('Sharp conversion failed');
      });
    
    return true;
  } catch (error) {
    try {
      // Fallback to canvas
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(32, 32);
      const ctx = canvas.getContext('2d');
      
      // Draw simple circle
      ctx.beginPath();
      ctx.arc(16, 16, 10, 0, 2 * Math.PI);
      ctx.fillStyle = filename.includes('recording') ? '#FF4444' : '#808080';
      ctx.fill();
      
      // Save as PNG
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(outputPath, `${filename}.png`), buffer);
      
      log(`✅ Generated ${filename}.png using canvas`, 'green');
      return true;
    } catch (canvasError) {
      return false;
    }
  }
}

function main() {
  log('🎨 Speak - Icon Generator', 'blue');
  log('==========================', 'blue');
  
  const projectRoot = process.cwd();
  const assetsPath = path.join(projectRoot, 'assets');
  const iconsPath = path.join(assetsPath, 'icons');
  
  // Create directories
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
    log(`📁 Created assets directory`, 'yellow');
  }
  
  if (!fs.existsSync(iconsPath)) {
    fs.mkdirSync(iconsPath, { recursive: true });
    log(`📁 Created icons directory`, 'yellow');
  }
  
  const icons = [
    { name: 'tray-normal', svg: createTrayNormalIcon, color: '#808080' },
    { name: 'tray-recording', svg: createTrayRecordingIcon, color: '#FF4444' },
    { name: 'notification', svg: createNotificationIcon, color: '#4A90E2' }
  ];
  
  let successCount = 0;
  
  for (const icon of icons) {
    try {
      // Save SVG version
      const svgContent = icon.svg();
      const svgPath = saveIconAsSVG(svgContent, icon.name, iconsPath);
      log(`✅ Created ${icon.name}.svg`, 'green');
      
      // Try to convert to PNG
      const pngConverted = tryCanvasConversion(svgPath, iconsPath, icon.name);
      
      if (!pngConverted) {
        // Create PNG fallback
        savePNGFallback(iconsPath, icon.name, icon.color);
        log(`⚠️  Created ${icon.name}.png (fallback - install sharp for better quality)`, 'yellow');
      } else {
        successCount++;
      }
      
      successCount++;
    } catch (error) {
      log(`❌ Failed to create ${icon.name}: ${error.message}`, 'red');
    }
  }
  
  log('\n' + '='.repeat(40), 'blue');
  
  if (successCount === icons.length) {
    log('🎉 All icons generated successfully!', 'green');
    log('   For better PNG quality, install: npm install sharp', 'blue');
  } else {
    log(`⚠️  Generated ${successCount}/${icons.length} icons`, 'yellow');
  }
  
  // Create an index file for easy access
  const iconIndexPath = path.join(iconsPath, 'index.js');
  const iconIndexContent = `
// Auto-generated icon paths
module.exports = {
  trayNormal: __dirname + '/tray-normal.png',
  trayRecording: __dirname + '/tray-recording.png',
  notification: __dirname + '/notification.png'
};
`;
  
  fs.writeFileSync(iconIndexPath, iconIndexContent.trim());
  log(`✅ Created icon index file`, 'green');
}

if (require.main === module) {
  main();
}

module.exports = {
  createSimpleIcon,
  createTrayNormalIcon,
  createTrayRecordingIcon,
  createNotificationIcon
};