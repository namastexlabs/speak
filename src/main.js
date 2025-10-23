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
const hotkeyManager = require('./hotkey/manager');
const SystemTray = require('./ui/tray');
const notificationManager = require('./ui/notifications');
const errorHandler = require('./utils/error-handler');
const { createApplicationMenu } = require('./ui/menu');

// Global references
let mainWindow;
let settingsWindow;
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
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      // Enable media access for microphone
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    titleBarStyle: 'default',
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

// Create settings window
function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 800,
    height: 700,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false
    },
    title: 'Speak - Settings',
    show: false
  });

  settingsWindow.loadFile(path.join(__dirname, 'renderer/settings.html'));

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

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
      const result = hotkeyManager.updateHotkey(modifier);
      return result;
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'update-hotkey', modifier });
    }
  });

  // Recording handlers (Web Audio API in renderer)
  ipcMain.handle('start-recording', async () => {
    try {
      await audioRecorder.startRecording();
      systemTray.setRecordingState(true);
      notificationManager.showRecordingStarted();

      return { success: true };
    } catch (error) {
      return errorHandler.handleError(error, { handler: 'start-recording' });
    }
  });

  ipcMain.handle('stop-recording', async (event, audioData) => {
    try {
      // Receive audio data from renderer process
      const savedAudio = await audioRecorder.stopRecording(audioData);
      systemTray.setRecordingState(false);

      // Transcribe the audio
      notificationManager.showRecordingStopped();

      const transcription = await whisperTranscriber.transcribeAudio(
        savedAudio.filePath,
        { language: settingsManager.getAll().language }
      );

      // Insert the text
      await textInserter.insertText(transcription.text);

      // Show completion notification
      const wordCount = transcription.text.trim().split(/\s+/).length;
      notificationManager.showTranscriptionCompleted(transcription.text, wordCount);

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

  ipcMain.handle('close-settings', async () => {
    if (settingsWindow) {
      settingsWindow.close();
    }
    return { success: true };
  });

  // Handle settings window requests
  ipcMain.handle('open-settings', async (event, options = {}) => {
    createSettingsWindow();

    // If specific tab requested, send message to settings window
    if (options.tab && settingsWindow) {
      settingsWindow.webContents.on('did-finish-load', () => {
        settingsWindow.webContents.send('switch-tab', options.tab);
      });
    }

    return { success: true };
  });
}

// Set up hotkey callbacks
function setupHotkeyCallbacks() {
  hotkeyManager.setRecordingCallback(async (action) => {
    try {
      if (action === 'start') {
        // Trigger recording start via renderer
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('hotkey-start-recording');
        }
      } else if (action === 'stop') {
        // Trigger recording stop via renderer
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('hotkey-stop-recording');
        }
      }
    } catch (error) {
      errorHandler.handleError(error, { context: 'hotkey-callback', action });
    }
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

  // Set up hotkey system
  setupHotkeyCallbacks();
  const hotkeyResult = hotkeyManager.registerHotkey(
    settingsManager.getAll().hotkey,
    hotkeyManager.recordingCallback
  );

  if (!hotkeyResult.success) {
    console.warn('Failed to register initial hotkey:', hotkeyResult.error);
    notificationManager.showError(
      'Hotkey Registration Failed',
      'Could not register the global hotkey. You can configure it in settings.',
      hotkeyResult.error
    );
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
  hotkeyManager.unregisterHotkey();
  notificationManager.cleanup();
  errorHandler.cleanup();
});

// Handle app-level events
app.on('browser-window-focus', () => {
  // Re-register hotkey if needed
  if (!hotkeyManager.isRegistered && mainWindow) {
    const currentHotkey = settingsManager.getAll().hotkey;
    hotkeyManager.registerHotkey(currentHotkey, hotkeyManager.recordingCallback);
  }
});

// Microphone permissions are handled automatically by Web Audio API
// The browser will prompt when getUserMedia() is called in the renderer process
console.log('Microphone access will be requested via Web Audio API when recording starts');

// Basic app info
console.log('Speak voice dictation app starting...');
console.log('Version: 0.1.0');
console.log('Platform:', process.platform);
console.log('Settings location:', settingsManager.store.path);