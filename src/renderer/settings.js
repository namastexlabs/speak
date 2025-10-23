/* eslint-disable no-unused-vars */
// Functions called from HTML onclick handlers

const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadAudioDevices();
    loadAppVersion();
    checkForUpdates();
});

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

        updateHotkeyDisplay();
    } catch (error) {
        console.error('Failed to load settings:', error);
        showStatus('api-status', 'Failed to load settings: ' + error.message, 'error');
    }
}

async function loadAudioDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');

        const select = document.getElementById('audio-device');
        select.innerHTML = '';

        if (audioInputs.length === 0) {
            select.innerHTML = '<option value="default">Default System Microphone</option>';
            return;
        }

        audioInputs.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId || 'default';
            option.textContent = device.label || `Microphone ${index + 1}`;
            select.appendChild(option);
        });

        const settings = await ipcRenderer.invoke('get-settings');
        if (settings.audioDevice) {
            select.value = settings.audioDevice;
        }
    } catch (error) {
        console.warn('Failed to enumerate audio devices:', error);
    }
}

async function loadAppVersion() {
    try {
        const version = await ipcRenderer.invoke('get-app-version');
        document.getElementById('app-version').textContent = `v${version}`;
    } catch (error) {
        console.error('Failed to load app version:', error);
        document.getElementById('app-version').textContent = 'Unknown';
    }
}

async function checkForUpdates() {
    const updateStatus = document.getElementById('update-status');

    try {
        const updateInfo = await ipcRenderer.invoke('check-for-updates');

        if (updateInfo.updateAvailable) {
            updateStatus.innerHTML = `
                <span class="badge badge-warning">Update Available</span>
                <span class="text-sm font-mono">${updateInfo.latestVersion}</span>
            `;
        } else {
            updateStatus.innerHTML = `
                <span class="badge badge-success">Up to date</span>
            `;
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
        updateStatus.innerHTML = `
            <span class="text-sm opacity-60">Check failed</span>
        `;
    }
}

// Update hotkey display
function updateHotkeyDisplay() {
    const hotkeyInput = document.getElementById('hotkey-modifier');
    const hotkeyDisplay = document.getElementById('current-hotkey');

    if (!hotkeyInput || !hotkeyDisplay) return;

    const hotkey = hotkeyInput.value || (process.platform === 'darwin' ? 'Command+Control' : 'Super+Control');

    // Handle modifier combinations
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
    hotkeyDisplay.textContent = display;
}

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

// Language settings functions
async function saveLanguage() {
    const language = document.getElementById('language').value;

    try {
        await ipcRenderer.invoke('update-settings', { language });
        showStatus('language-status', 'Language settings saved successfully! ✓', 'success');
    } catch (error) {
        showStatus('language-status', 'Failed to save language settings: ' + error.message, 'error');
    }
}

// Data management functions
async function clearCache() {
    if (!confirm('Are you sure you want to clear the cache? This will delete temporary audio files.')) {
        return;
    }

    showStatus('data-status', 'Clearing cache...', 'info');

    try {
        const result = await ipcRenderer.invoke('clear-cache');
        if (result.success) {
            showStatus('data-status', 'Cache cleared successfully! ✓', 'success');
        } else {
            showStatus('data-status', 'Failed to clear cache: ' + result.error, 'error');
        }
    } catch (error) {
        showStatus('data-status', 'Failed to clear cache: ' + error.message, 'error');
    }
}

async function clearAllData() {
    if (!confirm('⚠️ WARNING: This will reset ALL settings and clear ALL transcription history. This action cannot be undone. Are you sure?')) {
        return;
    }

    if (!confirm('This is your final warning. All data will be permanently deleted. Continue?')) {
        return;
    }

    showStatus('data-status', 'Resetting all settings...', 'info');

    try {
        const result = await ipcRenderer.invoke('clear-all-data');
        if (result.success) {
            showStatus('data-status', 'All settings reset successfully! Restarting app...', 'success');
            setTimeout(() => {
                ipcRenderer.invoke('restart-app');
            }, 2000);
        } else {
            showStatus('data-status', 'Failed to reset settings: ' + result.error, 'error');
        }
    } catch (error) {
        showStatus('data-status', 'Failed to reset settings: ' + error.message, 'error');
    }
}

// Utility function to show status messages
function showStatus(elementId, message, type) {
    const statusElement = document.getElementById(elementId);
    if (!statusElement) return;

    const alertClass = {
        'success': 'alert alert-success',
        'error': 'alert alert-error',
        'info': 'alert alert-info'
    }[type] || 'alert';

    statusElement.className = alertClass + ' text-sm';
    statusElement.textContent = message;
    statusElement.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
}

function goBack() {
    ipcRenderer.invoke('close-settings');
}