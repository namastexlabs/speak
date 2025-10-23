/* eslint-disable no-unused-vars */
// Settings Modal JavaScript

const { ipcRenderer } = require('electron');

// Open settings modal
async function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.showModal();

    // Load settings when modal opens
    await loadModalSettings();
    await loadModalAudioDevices();
    await loadModalAppVersion();
    await checkModalForUpdates();
}

// Load settings
async function loadModalSettings() {
    try {
        const settings = await ipcRenderer.invoke('get-settings');
        console.log('Loaded settings:', settings);

        // Handle API key display with status indicator
        const apiKeyInput = document.getElementById('modal-api-key');
        const apiKeyStatus = document.getElementById('api-key-status');

        if (settings.apiKey === '***configured***') {
            apiKeyInput.value = '';
            apiKeyInput.placeholder = '••••••••••••••••••••••••••••••••';
            apiKeyStatus.innerHTML = '<div class="alert alert-success text-sm"><span>✓ API key is configured</span></div>';
            apiKeyStatus.style.display = 'block';
        } else {
            apiKeyInput.value = '';
            apiKeyInput.placeholder = 'sk-...';
            apiKeyStatus.style.display = 'none';
        }

        // Load other settings
        if (settings.audioDevice) {
            const audioSelect = document.getElementById('modal-audio-device');
            if (audioSelect) {
                audioSelect.value = settings.audioDevice;
            }
        }

        if (settings.hotkey) {
            const hotkeyInput = document.getElementById('modal-hotkey-modifier');
            if (hotkeyInput) {
                hotkeyInput.value = settings.hotkey;
                updateModalHotkeyDisplay();
            }
        }

        if (settings.language) {
            const languageSelect = document.getElementById('modal-language');
            if (languageSelect) {
                languageSelect.value = settings.language;
            }
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
        showModalStatus('modal-api-status', 'Failed to load settings: ' + error.message, 'error');
    }
}

// Load audio devices
async function loadModalAudioDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');

        const select = document.getElementById('modal-audio-device');
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

// Load app version
async function loadModalAppVersion() {
    try {
        const version = await ipcRenderer.invoke('get-app-version');
        document.getElementById('modal-app-version').textContent = `v${version}`;
    } catch (error) {
        console.error('Failed to load app version:', error);
        document.getElementById('modal-app-version').textContent = 'Unknown';
    }
}

// Check for updates
async function checkModalForUpdates() {
    const updateStatus = document.getElementById('modal-update-status');

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
function updateModalHotkeyDisplay() {
    const hotkeyInput = document.getElementById('modal-hotkey-modifier');
    const hotkeyDisplay = document.getElementById('modal-current-hotkey');

    if (!hotkeyInput || !hotkeyDisplay) return;

    const hotkey = hotkeyInput.value || (process.platform === 'darwin' ? 'Command+Control' : 'Super+Control');

    let display;
    if (hotkey.includes('+')) {
        display = hotkey
            .replace('Super', '⊞ Win')
            .replace('Command', '⌘')
            .replace('Control', 'Ctrl')
            .replace('Alt', 'Alt')
            .replace('Shift', '⇧');
    } else {
        display = (hotkey === 'Command' ? '⌘' : hotkey) + ' + Hold';
    }
    hotkeyDisplay.textContent = display;
}

// API Key functions
async function modalTestApiKey() {
    const apiKey = document.getElementById('modal-api-key').value.trim();

    showModalStatus('modal-api-status', 'Testing API key...', 'info');

    try {
        const result = await ipcRenderer.invoke('test-api-key', apiKey || null);
        if (result.valid) {
            showModalStatus('modal-api-status', '✓ API key is valid!', 'success');
        } else {
            showModalStatus('modal-api-status', '✗ API key is invalid: ' + result.error, 'error');
        }
    } catch (error) {
        showModalStatus('modal-api-status', '✗ Failed to test API key: ' + error.message, 'error');
    }
}

async function modalSaveApiKey() {
    const apiKey = document.getElementById('modal-api-key').value.trim();
    if (!apiKey) {
        showModalStatus('modal-api-status', 'Please enter an API key', 'error');
        return;
    }

    try {
        await ipcRenderer.invoke('update-settings', { apiKey });
        showModalStatus('modal-api-status', '✓ API key saved successfully!', 'success');

        // Update status indicator
        const apiKeyStatus = document.getElementById('api-key-status');
        apiKeyStatus.innerHTML = '<div class="alert alert-success text-sm"><span>✓ API key is configured</span></div>';
        apiKeyStatus.style.display = 'block';

        // Clear input and update placeholder
        document.getElementById('modal-api-key').value = '';
        document.getElementById('modal-api-key').placeholder = '••••••••••••••••••••••••••••••••';
    } catch (error) {
        showModalStatus('modal-api-status', '✗ Failed to save API key: ' + error.message, 'error');
    }
}

// Audio settings
async function modalSaveAudioSettings() {
    const audioDevice = document.getElementById('modal-audio-device').value;

    try {
        await ipcRenderer.invoke('update-settings', { audioDevice });
        showModalStatus('modal-audio-status', '✓ Audio settings saved successfully!', 'success');
    } catch (error) {
        showModalStatus('modal-audio-status', '✗ Failed to save audio settings: ' + error.message, 'error');
    }
}

// Hotkey settings
async function modalSaveHotkeySettings() {
    const hotkey = document.getElementById('modal-hotkey-modifier').value;

    try {
        await ipcRenderer.invoke('update-settings', { hotkey });
        await ipcRenderer.invoke('update-hotkey', hotkey);
        showModalStatus('modal-hotkey-status', '✓ Hotkey settings saved successfully!', 'success');
        updateModalHotkeyDisplay();

        // Update main window hotkey display
        const mainHotkeyDisplay = document.getElementById('hotkey-display');
        if (mainHotkeyDisplay) {
            mainHotkeyDisplay.textContent = document.getElementById('modal-current-hotkey').textContent;
        }
    } catch (error) {
        showModalStatus('modal-hotkey-status', '✗ Failed to save hotkey settings: ' + error.message, 'error');
    }
}

// Language settings
async function modalSaveLanguage() {
    const language = document.getElementById('modal-language').value;

    try {
        await ipcRenderer.invoke('update-settings', { language });
        showModalStatus('modal-language-status', '✓ Language settings saved successfully!', 'success');
    } catch (error) {
        showModalStatus('modal-language-status', '✗ Failed to save language settings: ' + error.message, 'error');
    }
}

// Data management
async function modalClearCache() {
    if (!confirm('Are you sure you want to clear the cache? This will delete temporary audio files.')) {
        return;
    }

    showModalStatus('modal-data-status', 'Clearing cache...', 'info');

    try {
        const result = await ipcRenderer.invoke('clear-cache');
        if (result.success) {
            showModalStatus('modal-data-status', '✓ Cache cleared successfully!', 'success');
        } else {
            showModalStatus('modal-data-status', '✗ Failed to clear cache: ' + result.error, 'error');
        }
    } catch (error) {
        showModalStatus('modal-data-status', '✗ Failed to clear cache: ' + error.message, 'error');
    }
}

async function modalClearAllData() {
    if (!confirm('⚠️ WARNING: This will reset ALL settings and clear ALL transcription history. This action cannot be undone. Are you sure?')) {
        return;
    }

    if (!confirm('This is your final warning. All data will be permanently deleted. Continue?')) {
        return;
    }

    showModalStatus('modal-data-status', 'Resetting all settings...', 'info');

    try {
        const result = await ipcRenderer.invoke('clear-all-data');
        if (result.success) {
            showModalStatus('modal-data-status', '✓ All settings reset successfully! Restarting app...', 'success');
            setTimeout(() => {
                ipcRenderer.invoke('restart-app');
            }, 2000);
        } else {
            showModalStatus('modal-data-status', '✗ Failed to reset settings: ' + result.error, 'error');
        }
    } catch (error) {
        showModalStatus('modal-data-status', '✗ Failed to reset settings: ' + error.message, 'error');
    }
}

// Utility function to show status messages
function showModalStatus(elementId, message, type) {
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

// Listen for hotkey input changes
document.addEventListener('DOMContentLoaded', () => {
    const hotkeyInput = document.getElementById('modal-hotkey-modifier');
    if (hotkeyInput) {
        hotkeyInput.addEventListener('input', updateModalHotkeyDisplay);
        hotkeyInput.addEventListener('change', updateModalHotkeyDisplay);
    }
});

// Export openSettings to window for global access
window.openSettings = openSettings;
