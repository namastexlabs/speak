const { ipcRenderer } = require('electron');

// Main UI functionality for Speak
document.addEventListener('DOMContentLoaded', () => {
    console.log('Speak main UI loaded');
    initializeUI();
    loadSettings();
});

// Initialize UI elements and event listeners
async function initializeUI() {
    // Listen for hotkey-triggered recording events
    ipcRenderer.on('hotkey-start-recording', () => {
        console.log('Hotkey START event received in renderer');
        startRecording();
    });

    ipcRenderer.on('hotkey-stop-recording', () => {
        console.log('Hotkey STOP event received in renderer');
        stopRecording();
    });

    // Listen for recording state changes from main process
    ipcRenderer.on('recording-state-changed', (event, isRecording) => {
        updateRecordingState(isRecording);
    });

    // Listen for settings updates
    ipcRenderer.on('settings-updated', () => {
        loadSettings();
    });

    // Listen for open-settings requests from main process (tray, notifications, etc.)
    ipcRenderer.on('open-settings', (event, options = {}) => {
        openSettings(options);
    });

    console.log('UI initialized - PTT hotkey listeners ready');
}

// Load and display current settings
async function loadSettings() {
    try {
        const settings = await ipcRenderer.invoke('get-settings');

        // Update hotkey display in the new UI
        const hotkeyDisplay = document.getElementById('hotkey-display');
        const emptyHotkey = document.getElementById('empty-hotkey');

        if (hotkeyDisplay) {
            hotkeyDisplay.textContent = formatHotkey(settings.hotkey);
        }
        if (emptyHotkey) {
            emptyHotkey.textContent = formatHotkey(settings.hotkey);
        }

        console.log('Settings loaded, hotkey:', settings.hotkey);

    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// Format hotkey for display
function formatHotkey(hotkey) {
    // Convert hotkey to readable format
    if (hotkey === 'Command') {
        return '⌘';
    } else if (hotkey.includes('Super')) {
        return hotkey.replace('Super', '⊞ Win').replace('+', ' + ');
    }
    return hotkey.replace('+', ' + ');
}

// Start recording (called by hotkey)
async function startRecording() {
    try {
        console.log('startRecording() called');

        // Start Web Audio recording in renderer
        await window.audioBridge.startRecording();

        // Notify main process (with hotkey flag to suppress duplicate notifications)
        const result = await ipcRenderer.invoke('start-recording', { fromHotkey: true });

        if (result.success) {
            updateRecordingState(true);
            console.log('Recording started successfully via hotkey');
        } else {
            console.error('Failed to start recording:', result.error);
        }
    } catch (error) {
        console.error('Recording start failed:', error);
    }
}

// Stop recording (called by hotkey or VAD)
async function stopRecording() {
    try {
        console.log('stopRecording() called');

        // Stop Web Audio recording and get data
        const audioData = await window.audioBridge.stopRecording();
        updateRecordingState(false);

        console.log('Audio data captured, sending to main process for transcription...');

        // Send audio data to main process for transcription (with hotkey flag)
        const result = await ipcRenderer.invoke('stop-recording', audioData, { fromHotkey: true });

        if (result.success) {
            console.log(`Transcription complete! ${result.wordCount} words: "${result.text}"`);
        } else {
            console.error('Transcription failed:', result.error);
        }
    } catch (error) {
        console.error('Recording stop failed:', error);
        updateRecordingState(false);
    }
}

// Update recording state in UI (new UI with recording-status element)
function updateRecordingState(isRecording) {
    const recordingStatus = document.getElementById('recording-status');

    if (recordingStatus) {
        if (isRecording) {
            recordingStatus.classList.remove('hidden');
            console.log('UI: Recording status shown');
        } else {
            recordingStatus.classList.add('hidden');
            console.log('UI: Recording status hidden');
        }
    }
}

// openSettings is now defined in settings-modal.js (modal dialog instead of separate window)

// Open external URL
function openExternal(url) {
    ipcRenderer.invoke('open-external', url);
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl+, or Cmd+, to open settings
    if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault();
        openSettings();
    }
});

// Handle window focus to refresh settings
window.addEventListener('focus', () => {
    loadSettings();
});

// Handle window controls
function minimizeWindow() {
    ipcRenderer.invoke('minimize-window');
}

function closeWindow() {
    ipcRenderer.invoke('close-window');
}

// Export functions for global access (needed for onclick handlers)
// Note: window.openSettings is defined in settings-modal.js
window.openExternal = openExternal;
window.minimizeWindow = minimizeWindow;
window.closeWindow = closeWindow;
