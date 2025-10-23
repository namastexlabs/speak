// Electron main process for Speak voice dictation app
// Full MVP implementation with all core features

// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, ipcMain, dialog, shell, systemPreferences, session } = require('electron');
const path = require('path');

// Set app name BEFORE any modules that use electron-store
// This ensures settings are stored in "Speak" folder instead of "Electron"
app.setName('Speak');

// Set app user model ID for Windows notifications (fixes "Electron" showing in notifications)
if (process.platform === 'win32') {
  app.setAppUserModelId('com.speak.dictation');
}

// Import our modules
const settingsManager = require('./config/settings');
const audioRecorder = require('./audio/recorder');
const whisperTranscriber = require('./transcription/whisper');
const textInserter = require('./insertion/text-inserter');
const pttManager = require('./hotkey/ptt-manager-v3'); // V3: Toggle mode with VAD auto-stop
const transcriptionHistory = require('./config/history');
const SystemTray = require('./ui/tray');
const notificationManager = require('./ui/notifications');
const errorHandler = require('./utils/error-handler');
const { createApplicationMenu } = require('./ui/menu');

// Global references
let mainWindow;
let welcomeWindow;
let systemTray;

// Initialize all modules
function initializeModules() {
  // Initialize OpenAI client
  whisperTranscriber.initialize();

  // Set up global error handlers
  errorHandler.setupGlobalErrorHandlers();

  console.log('All modules initialized');
}

// Function to create the main application window
function createMainWindow() {
  // Check if first run
  const isFirstRun = settingsManager.isFirstRun();

  // Get app icon path
  const iconPath = path.join(__dirname, '../assets/icons/app-icon.svg');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    frame: false, // Remove window frame for app-like experience
    backgroundColor: '#1a1a1a', // Luxury theme background
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      // Enable media access for microphone
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    show: false
  });

  // Load appropriate page based on first run status
  if (isFirstRun) {
    mainWindow.loadFile(path.join(__dirname, 'renderer/welcome.html'));
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up IPC handlers
  setupIPCHandlers();

  return mainWindow;
}

// Settings now use a modal dialog in the main window
// No separate window needed

// Create welcome window (for first run)
function createWelcomeWindow() {
  if (welcomeWindow) {
    welcomeWindow.focus();
    return;
  }

  welcomeWindow = new BrowserWindow({
    width: 900,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false
    },
    title: 'Welcome to Speak',
    show: false
  });

  welcomeWindow.loadFile(path.join(__dirname, 'renderer/welcome.html'));

  welcomeWindow.once('ready-to-show', () => {
    welcomeWindow.show();
  });

  welcomeWindow.on('closed', () => {
    welcomeWindow = null;
  });
}

// Set up IPC handlers for communication with renderer processes
function setupIPCHandlers() {
  // Settings handlers
  ipcMain.handle('get-settings', async () => {
    try {
      return settingsManager.getAll();
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'get-settings' });
    }
  });

  ipcMain.handle('update-settings', async (event, settings) => {
    try {
      settingsManager.updateSettings(settings);

      // Re-initialize OpenAI if API key changed
      if (settings.apiKey) {
        whisperTranscriber.initialize();
      }

      return { success: true };
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'update-settings', settings });
    }
  });

  ipcMain.handle('test-api-key', async (event, apiKey) => {
    try {
      return await settingsManager.validateApiKey(apiKey);
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'test-api-key' });
    }
  });

  // Hotkey handlers
  ipcMain.handle('update-hotkey', async (event, modifier) => {
    try {
      // Stop current PTT manager
      pttManager.stop();

      // Restart PTT manager with new hotkey
      const pttCallback = (action) => {
        if (mainWindow && mainWindow.webContents) {
          if (action === 'start') {
            mainWindow.webContents.send('hotkey-start-recording');
          } else if (action === 'stop') {
            mainWindow.webContents.send('hotkey-stop-recording');
          }
        }
      };

      const result = pttManager.start(modifier, pttCallback);
      console.log(`PTT hotkey updated to: ${modifier}`);

      return result;
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'update-hotkey', modifier });
    }
  });

  // Recording handlers (Web Audio API in renderer)
  ipcMain.handle('start-recording', async (event, options = {}) => {
    try {
      await audioRecorder.startRecording();
      systemTray.setRecordingState(true);

      // Only show notification if not triggered by hotkey
      if (!options.fromHotkey) {
        notificationManager.showRecordingStarted();
      }

      return { success: true };
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'start-recording' });
    }
  });

  ipcMain.handle('stop-recording', async (event, audioData, options = {}) => {
    try {
      // Receive audio data from renderer process
      const savedAudio = await audioRecorder.stopRecording(audioData);
      systemTray.setRecordingState(false);

      // Only show "Recording stopped" notification if not from hotkey
      if (!options.fromHotkey) {
        notificationManager.showRecordingStopped();
      }

      const transcription = await whisperTranscriber.transcribeAudio(
        savedAudio.filePath,
        { language: settingsManager.getAll().language }
      );

      // Insert the text
      await textInserter.insertText(transcription.text);

      // Show completion notification
      const wordCount = transcription.text.trim().split(/\s+/).length;
      notificationManager.showTranscriptionCompleted(transcription.text, wordCount);

      // Save to history
      const settings = settingsManager.getAll();
      const historyEntry = transcriptionHistory.add({
        text: transcription.text,
        duration: savedAudio.duration || 0,
        language: settings.language
      });

      // Notify renderer about new transcription
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('transcription-added', historyEntry);
      }

      // Clean up
      audioRecorder.cleanup();

      return {
        success: true,
        text: transcription.text,
        wordCount: wordCount
      };
    } catch (error) {
      systemTray.setRecordingState(false);
      audioRecorder.cleanup();
      return errorHandler.handleError(error, { handler: 'stop-recording' });
    }
  });

  // Welcome/setup handlers
  ipcMain.handle('complete-welcome', async () => {
    try {
      settingsManager.completeFirstRun();

      // Close welcome window and show main window
      if (welcomeWindow) {
        welcomeWindow.close();
      }

      if (mainWindow) {
        mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
      }

      return { success: true };
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'complete-welcome' });
    }
  });

  ipcMain.handle('skip-welcome', async () => {
    try {
      settingsManager.completeFirstRun();

      if (welcomeWindow) {
        welcomeWindow.close();
      }

      if (mainWindow) {
        mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
      }

      return { success: true };
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'skip-welcome' });
    }
  });

  // Utility handlers
  ipcMain.handle('open-external', async (event, url) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'open-external', url });
    }
  });

  // Window controls
  ipcMain.handle('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
    return { success: true };
  });

  ipcMain.handle('close-window', () => {
    if (mainWindow) {
      mainWindow.close();
    }
    return { success: true };
  });

  // Settings window handlers removed - now using modal dialog

  // History handlers
  ipcMain.handle('get-history', async () => {
    try {
      return transcriptionHistory.getGroupedByDate();
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'get-history' });
    }
  });

  ipcMain.handle('get-stats', async () => {
    try {
      return transcriptionHistory.getStats();
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'get-stats' });
    }
  });

  // Version and update handlers
  ipcMain.handle('get-app-version', async () => {
    try {
      return app.getVersion();
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'get-app-version' });
    }
  });

  ipcMain.handle('check-for-updates', async () => {
    try {
      const https = require('https');
      const currentVersion = app.getVersion();

      return new Promise((resolve) => {
        https.get('https://api.github.com/repos/namastexlabs/speak/releases/latest', {
          headers: { 'User-Agent': 'Speak-App' }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const release = JSON.parse(data);
              const latestVersion = release.tag_name.replace(/^v/, '');
              const updateAvailable = latestVersion !== currentVersion;
              resolve({ updateAvailable, latestVersion, currentVersion });
            } catch (error) {
              resolve({ updateAvailable: false, error: 'Failed to parse release data' });
            }
          });
        }).on('error', (error) => {
          resolve({ updateAvailable: false, error: error.message });
        });
      });
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'check-for-updates' });
    }
  });

  // Data management handlers
  ipcMain.handle('clear-cache', async () => {
    try {
      const fs = require('fs');
      const path = require('path');
      const tmpDir = path.join(app.getPath('userData'), 'tmp');

      if (fs.existsSync(tmpDir)) {
        const files = fs.readdirSync(tmpDir);
        for (const file of files) {
          fs.unlinkSync(path.join(tmpDir, file));
        }
        return { success: true, filesDeleted: files.length };
      }
      return { success: true, filesDeleted: 0 };
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'clear-cache' });
    }
  });

  ipcMain.handle('clear-all-data', async () => {
    try {
      settingsManager.store.clear();
      transcriptionHistory.clear();
      return { success: true };
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'clear-all-data' });
    }
  });

  ipcMain.handle('restart-app', async () => {
    app.relaunch();
    app.exit(0);
  });
}

// App event handlers
app.whenReady().then(async () =>{
  // Set up permission handlers for media devices (MUST be before creating windows)
  // DON'T auto-approve - let the system show the permission dialog
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log(`Permission request: ${permission}`);

    // For media permissions, always approve so Windows shows the OS-level permission dialog
    // The actual permission is controlled by Windows, not Electron
    if (permission === 'media') {
      console.log('Approving media permission - Windows will handle the OS dialog');
      callback(true);
      return;
    }

    // Deny other permissions
    callback(false);
  });

  // Initialize all modules
  initializeModules();

  // Create main window
  createMainWindow();

  // Create application menu
  createApplicationMenu(mainWindow);

  // Create system tray
  systemTray = new SystemTray(mainWindow);

  // Set up PTT system
  const pttCallback = (action) => {
    if (mainWindow && mainWindow.webContents) {
      if (action === 'start') {
        mainWindow.webContents.send('hotkey-start-recording');
      } else if (action === 'stop') {
        mainWindow.webContents.send('hotkey-stop-recording');
      }
    }
  };

  const pttResult = pttManager.start(
    settingsManager.getAll().hotkey,
    pttCallback
  );

  if (!pttResult.success) {
    console.warn('Failed to start PTT:', pttResult.error);
    notificationManager.showError(
      'PTT Registration Failed',
      'Could not register the push-to-talk hotkey. You can configure it in settings.',
      pttResult.error
    );
  } else {
    console.log('PTT system started successfully');
  }

  // Set up notification event handlers
  notificationManager.setupEventHandlers(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed (tray keeps it alive)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Clean up
  if (systemTray) {
    systemTray.destroy();
  }
  pttManager.stop();
  notificationManager.cleanup();
  errorHandler.cleanup();
});


// Microphone permissions are handled automatically by Web Audio API
// The browser will prompt when getUserMedia() is called in the renderer process
console.log('Microphone access will be requested via Web Audio API when recording starts');

// Basic app info
console.log('Speak voice dictation app starting...');
console.log('Version: 0.1.0');
console.log('Platform:', process.platform);
console.log('Settings location:', settingsManager.store.path);