const { ipcRenderer } = require('electron');

// Tab switching functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    loadSettings();
    updateHotkeyDisplay();
});

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

// Load current settings from main process
async function loadSettings() {
    try {
        const settings = await ipcRenderer.invoke('get-settings');
        console.log('Loaded settings:', settings);

        // Handle API key display
        const apiKeyInput = document.getElementById('api-key');
        if (settings.apiKey === '***configured***' || settings.apiKey) {
            apiKeyInput.value = '';
            apiKeyInput.placeholder = 'API key configured (hidden for security)';
        } else {
            apiKeyInput.value = '';
            apiKeyInput.placeholder = 'sk-...';
        }

        // Load other settings
        if (settings.audioDevice) {
            document.getElementById('audio-device').value = settings.audioDevice;
        }
        if (settings.hotkey) {
            document.getElementById('hotkey-modifier').value = settings.hotkey;
        }
        if (settings.language) {
            document.getElementById('language').value = settings.language;
        }
        if (settings.theme) {
            document.getElementById('theme').value = settings.theme;
        }

        // Update hotkey display
        updateHotkeyDisplay();
    } catch (error) {
        console.error('Failed to load settings:', error);
        showStatus('general-status', 'Failed to load settings: ' + error.message, 'error');
    }
}

// Update hotkey display
function updateHotkeyDisplay() {
    const hotkey = document.getElementById('hotkey-modifier').value;
    // Handle both simple (e.g., "R") and complex (e.g., "Super+Control+S") hotkey formats
    let display;
    if (hotkey.includes('+')) {
        // Complex format - show as-is with friendly names
        display = hotkey
            .replace('Super', '⊞ Win')
            .replace('Command', '⌘')
            .replace('Control', 'Ctrl')
            .replace('Alt', 'Alt')
            .replace('Shift', '⇧');
    } else {
        // Simple format (legacy)
        display = (hotkey === 'Command' ? '⌘' : hotkey) + ' + Hold';
    }
    document.getElementById('current-hotkey').textContent = display;
}

// Event listeners for hotkey changes
document.getElementById('hotkey-modifier').addEventListener('input', updateHotkeyDisplay);
document.getElementById('hotkey-modifier').addEventListener('change', updateHotkeyDisplay);

// API Key functions
async function testApiKey() {
    const apiKey = document.getElementById('api-key').value.trim();

    showStatus('api-status', 'Testing API key...', 'info');

    try {
        // If no key in input, test the stored/configured key
        const result = await ipcRenderer.invoke('test-api-key', apiKey || null);
        if (result.valid) {
            showStatus('api-status', 'API key is valid! ✓', 'success');
        } else {
            showStatus('api-status', 'API key is invalid: ' + result.error, 'error');
        }
    } catch (error) {
        showStatus('api-status', 'Failed to test API key: ' + error.message, 'error');
    }
}

async function saveApiKey() {
    const apiKey = document.getElementById('api-key').value.trim();
    if (!apiKey) {
        showStatus('api-status', 'Please enter an API key', 'error');
        return;
    }

    try {
        await ipcRenderer.invoke('update-settings', { apiKey });
        showStatus('api-status', 'API key saved successfully! ✓', 'success');
    } catch (error) {
        showStatus('api-status', 'Failed to save API key: ' + error.message, 'error');
    }
}

// Audio settings functions
async function saveAudioSettings() {
    const audioDevice = document.getElementById('audio-device').value;

    try {
        await ipcRenderer.invoke('update-settings', { audioDevice });
        showStatus('audio-status', 'Audio settings saved successfully! ✓', 'success');
    } catch (error) {
        showStatus('audio-status', 'Failed to save audio settings: ' + error.message, 'error');
    }
}

// Hotkey settings functions
async function saveHotkeySettings() {
    const hotkey = document.getElementById('hotkey-modifier').value;

    try {
        await ipcRenderer.invoke('update-settings', { hotkey });
        await ipcRenderer.invoke('update-hotkey', hotkey);
        showStatus('hotkey-status', 'Hotkey settings saved successfully! ✓', 'success');
    } catch (error) {
        showStatus('hotkey-status', 'Failed to save hotkey settings: ' + error.message, 'error');
    }
}

// General settings functions
async function saveGeneralSettings() {
    const language = document.getElementById('language').value;
    const theme = document.getElementById('theme').value;

    try {
        await ipcRenderer.invoke('update-settings', { language, theme });
        showStatus('general-status', 'General settings saved successfully! ✓', 'success');
    } catch (error) {
        showStatus('general-status', 'Failed to save general settings: ' + error.message, 'error');
    }
}

// Utility function to show status messages
function showStatus(elementId, message, type) {
    const statusElement = document.getElementById(elementId);
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

// Navigation function
function goBack() {
    // Close settings window and show main window
    ipcRenderer.invoke('close-settings');
}

// Listen for recording state changes
ipcRenderer.on('recording-state-changed', (event, isRecording) => {
    const indicator = document.getElementById('recording-indicator');
    indicator.style.display = isRecording ? 'block' : 'none';
});