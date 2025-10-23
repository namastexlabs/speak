const { ipcRenderer } = require('electron');

// Main UI functionality for Speak
document.addEventListener('DOMContentLoaded', () => {
    console.log('Speak main UI loaded');
    initializeUI();
    loadSettings();
});

// Initialize UI elements and event listeners
async function initializeUI() {
    // Set up event listeners
    document.getElementById('start-btn').addEventListener('click', startRecording);
    document.getElementById('stop-btn').addEventListener('click', stopRecording);

    // Listen for hotkey-triggered recording events
    ipcRenderer.on('hotkey-start-recording', () => {
        startRecording();
    });

    ipcRenderer.on('hotkey-stop-recording', () => {
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

    console.log('UI initialized');
}

// Load and display current settings
async function loadSettings() {
    try {
        const settings = await ipcRenderer.invoke('get-settings');

        // Update hotkey display
        const hotkeyDisplay = document.getElementById('hotkey-display');
        const hotkeyInstruction = document.getElementById('hotkey-instruction');

        if (settings.hotkey === 'Command') {
            hotkeyDisplay.textContent = '⌘ + Hold';
            hotkeyInstruction.textContent = '⌘';
        } else {
            hotkeyDisplay.textContent = settings.hotkey + ' + Hold';
            hotkeyInstruction.textContent = settings.hotkey;
        }

        // Update status based on API key
        updateStatus(settings);

    } catch (error) {
        console.error('Failed to load settings:', error);
        showTestStatus('Failed to load settings: ' + error.message, 'error');
    }
}

// Update status display based on settings
function updateStatus(settings) {
    const statusCard = document.getElementById('status-card');
    const statusText = document.getElementById('status-text');
    const statusDescription = document.getElementById('status-description');

    if (!settings.apiKey || settings.apiKey === '***configured***') {
        // API key is configured
        statusCard.className = 'status-card status-ready';
        statusText.textContent = '🎯 Ready to Dictate';
        statusDescription.innerHTML = 'Hold <span id="hotkey-display" class="hotkey-display">' +
            (settings.hotkey === 'Command' ? '⌘ + Hold' : settings.hotkey + ' + Hold') +
            '</span> to start recording';
    } else {
        // API key not configured
        statusCard.className = 'status-card status-error';
        statusText.textContent = '⚠️ Setup Required';
        statusDescription.innerHTML = 'Please configure your OpenAI API key in <button onclick="openSettings()" style="background: none; border: none; color: #0066CC; text-decoration: underline; cursor: pointer;">Settings</button>';
    }
}

// Start recording
async function startRecording() {
    try {
        showTestStatus('Starting recording...', 'info');

        // Start Web Audio recording in renderer
        await window.audioBridge.startRecording();

        // Notify main process
        const result = await ipcRenderer.invoke('start-recording');

        if (result.success) {
            updateRecordingState(true);
            showTestStatus('Recording started! Speak now...', 'success');
        } else {
            showTestStatus('Failed to start recording: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Recording start failed:', error);
        showTestStatus('Recording start failed: ' + error.message, 'error');
    }
}

// Stop recording
async function stopRecording() {
    try {
        showTestStatus('Stopping recording and transcribing...', 'info');

        // Stop Web Audio recording and get data
        const audioData = await window.audioBridge.stopRecording();
        updateRecordingState(false);

        // Send audio data to main process for transcription
        const result = await ipcRenderer.invoke('stop-recording', audioData);

        if (result.success) {
            showTestStatus(`Transcription complete! ${result.wordCount} words inserted.`, 'success');

            // Show the transcribed text
            showLastTranscription(result.text);
        } else {
            showTestStatus('Transcription failed: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Recording stop failed:', error);
        showTestStatus('Recording stop failed: ' + error.message, 'error');
        updateRecordingState(false);
    }
}

// Update recording state in UI
function updateRecordingState(isRecording) {
    const statusCard = document.getElementById('status-card');
    const statusText = document.getElementById('status-text');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const indicator = document.getElementById('recording-indicator');

    if (isRecording) {
        statusCard.className = 'status-card status-recording';
        statusText.textContent = '🎙️ Recording...';
        startBtn.disabled = true;
        stopBtn.disabled = false;
        indicator.style.display = 'block';
    } else {
        statusCard.className = 'status-card status-ready';
        statusText.textContent = '🎯 Ready to Dictate';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        indicator.style.display = 'none';
    }
}

// Show test status messages
function showTestStatus(message, type) {
    const statusElement = document.getElementById('test-status');
    statusElement.className = 'status ' + type;
    statusElement.textContent = message;
    statusElement.style.display = 'block';

    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
}

// Show last transcription
function showLastTranscription(text) {
    const container = document.getElementById('last-transcription');
    const textElement = document.getElementById('transcription-text');

    textElement.textContent = text;
    container.style.display = 'block';

    // Auto-hide after 10 seconds
    setTimeout(() => {
        container.style.display = 'none';
    }, 10000);
}

// Open settings window
function openSettings(options = {}) {
    ipcRenderer.invoke('open-settings', options);
}

// Open external URL
function openExternal(url) {
    ipcRenderer.invoke('open-external', url);
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl+R or Cmd+R to start/stop recording (for testing)
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        if (document.getElementById('start-btn').disabled) {
            stopRecording();
        } else {
            startRecording();
        }
    }

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

// Export functions for global access (needed for onclick handlers)
window.openSettings = openSettings;
window.openExternal = openExternal;
window.startRecording = startRecording;
window.stopRecording = stopRecording;
