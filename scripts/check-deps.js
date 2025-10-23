#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function checkCommand(command, name, required = true) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    log(`✅ ${name} installed`, 'green');
    return true;
  } catch (error) {
    if (required) {
      log(`❌ ${name} not found (required)`, 'red');
    } else {
      log(`⚠️  ${name} not found (optional)`, 'yellow');
    }
    return required ? false : true;
  }
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    log(`✅ Node.js ${nodeVersion}`, 'green');
    return true;
  } else {
    log(`❌ Node.js ${nodeVersion} (18+ required)`, 'red');
    return false;
  }
}

function checkNpmDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  if (!fs.existsSync(packageJsonPath)) {
    log(`❌ package.json not found`, 'red');
    return false;
  }
  
  if (!fs.existsSync(nodeModulesPath)) {
    log(`❌ node_modules not found (run npm install)`, 'red');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    let missingDeps = [];
    for (const [name, version] of Object.entries(dependencies)) {
      const depPath = path.join(nodeModulesPath, name);
      if (!fs.existsSync(depPath)) {
        missingDeps.push(name);
      }
    }
    
    if (missingDeps.length === 0) {
      log(`✅ All npm dependencies installed`, 'green');
      return true;
    } else {
      log(`❌ Missing npm dependencies: ${missingDeps.join(', ')}`, 'red');
      log(`   Run: npm install`, 'blue');
      return false;
    }
  } catch (error) {
    log(`❌ Error checking npm dependencies: ${error.message}`, 'red');
    return false;
  }
}

function checkNativeModules() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  // Check robotjs (native module that often fails to compile)
  const robotjsPath = path.join(nodeModulesPath, 'robotjs');
  if (fs.existsSync(robotjsPath)) {
    try {
      require('robotjs');
      log(`✅ robotjs native module working`, 'green');
      return true;
    } catch (error) {
      log(`❌ robotjs native module failed to load`, 'red');
      log(`   Try: npm rebuild robotjs`, 'blue');
      return false;
    }
  } else {
    log(`⚠️  robotjs not installed (optional for hotkeys)`, 'yellow');
    return true; // Not critical
  }
}

function checkAudioDependencies() {
  // Web Audio API is built into Electron/Chromium - no external dependencies needed
  log(`✅ Web Audio API (built-in)`, 'green');
  return true;
}

function checkAssets() {
  const assetsPath = path.join(process.cwd(), 'assets');
  const iconsPath = path.join(assetsPath, 'icons');
  
  if (!fs.existsSync(iconsPath)) {
    log(`⚠️  Assets/icons directory not found`, 'yellow');
    log(`   Run: npm run generate-icons`, 'blue');
    return false;
  }
  
  const requiredIcons = ['tray-normal.png', 'tray-recording.png', 'notification.png'];
  let missingIcons = [];
  
  for (const icon of requiredIcons) {
    const iconPath = path.join(iconsPath, icon);
    if (!fs.existsSync(iconPath)) {
      missingIcons.push(icon);
    }
  }
  
  if (missingIcons.length === 0) {
    log(`✅ All required icons present`, 'green');
    return true;
  } else {
    log(`⚠️  Missing icons: ${missingIcons.join(', ')}`, 'yellow');
    log(`   Run: npm run generate-icons`, 'blue');
    return false;
  }
}

function showInstallInstructions() {
  log('\n📋 Installation Instructions:', 'blue');
  log('==============================', 'blue');

  log('All Platforms:', 'yellow');
  log('  npm install             # Install Node.js dependencies', 'blue');
  log('  npm run generate-icons  # Generate app icons', 'blue');
  log('  ./run.sh                # Start the app', 'blue');
}

function main() {
  log('🔍 Speak - Dependency Checker', 'blue');
  log('===============================', 'blue');
  
  let allChecksPassed = true;
  
  // Check Node.js version
  if (!checkNodeVersion()) {
    allChecksPassed = false;
  }
  
  // Check npm dependencies
  if (!checkNpmDependencies()) {
    allChecksPassed = false;
  }
  
  // Check native modules
  if (!checkNativeModules()) {
    allChecksPassed = false;
  }
  
  // Check audio dependencies
  if (!checkAudioDependencies()) {
    allChecksPassed = false;
  }
  
  // Check assets
  checkAssets(); // This is optional, don't fail the check
  
  log('\n' + '='.repeat(40), 'blue');
  
  if (allChecksPassed) {
    log('🎉 All critical dependencies satisfied!', 'green');
    log('   You can run: ./run.sh', 'blue');
    process.exit(0);
  } else {
    log('❌ Some dependencies are missing', 'red');
    showInstallInstructions();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkNodeVersion,
  checkNpmDependencies,
  checkAudioDependencies,
  checkAssets
};