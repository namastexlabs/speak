const { ipcRenderer } = require('electron');

// Welcome screen functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome screen loaded');

    // Check if we already have an API key
    checkExistingSetup();
});

// Check if API key is already configured
async function checkExistingSetup() {
    try {
        const settings = await ipcRenderer.invoke('get-settings');
        if (settings.apiKey === '***configured***') {
            // API key is already configured (likely from .env)
            showStatus('api-status', '✅ API key loaded from configuration', 'success');

            // Auto-validate the existing key
            const validation = await ipcRenderer.invoke('test-api-key');
            if (validation.valid) {
                showStatus('api-status', '✅ API key is valid and ready to use', 'success');
            } else {
                showStatus('api-status', '⚠️ API key configured but validation failed: ' + validation.error, 'error');
            }
        }
    } catch (error) {
        console.warn('Failed to check existing setup:', error);
    }
}

// Test API key functionality
async function testApiKey() {
    const apiKey = document.getElementById('api-key').value.trim();
    if (!apiKey) {
        showStatus('api-status', 'Please enter an API key first', 'error');
        return;
    }

    showStatus('api-status', 'Testing API key...', 'info');

    try {
        const result = await ipcRenderer.invoke('test-api-key', apiKey);
        if (result.valid) {
            showStatus('api-status', '✅ API key is valid!', 'success');
        } else {
            showStatus('api-status', '❌ API key is invalid: ' + result.error, 'error');
        }
    } catch (error) {
        showStatus('api-status', '❌ Failed to test API key: ' + error.message, 'error');
    }
}

// Save API key and continue
async function saveApiKey() {
    const apiKey = document.getElementById('api-key').value.trim();
    if (!apiKey) {
        showStatus('api-status', 'Please enter an API key', 'error');
        return;
    }

    try {
        await ipcRenderer.invoke('update-settings', { apiKey });
        showStatus('api-status', '✅ API key saved successfully!', 'success');

        // Clear any previous error status after a delay
        setTimeout(() => {
            document.getElementById('api-status').style.display = 'none';
        }, 2000);

    } catch (error) {
        showStatus('api-status', '❌ Failed to save API key: ' + error.message, 'error');
    }
}

// Complete setup and start the app
async function completeSetup() {
    try {
        // Mark first run as complete
        await ipcRenderer.invoke('update-settings', { firstRun: false });

        // Request microphone permission
        await requestMicrophonePermission();

        // Close welcome screen and show main app
        ipcRenderer.invoke('complete-welcome');

    } catch (error) {
        console.error('Failed to complete setup:', error);
        showStatus('api-status', '❌ Setup failed: ' + error.message, 'error');
    }
}

// Request microphone permission
async function requestMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately - we just wanted permission
        stream.getTracks().forEach(track => track.stop());
        console.log('Microphone permission granted');
    } catch (error) {
        console.warn('Microphone permission denied or failed:', error);
        // Don't block setup for this - user can grant later
    }
}

// Skip welcome screen
function skipWelcome() {
    ipcRenderer.invoke('skip-welcome');
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

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl+Enter or Cmd+Enter to complete setup
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        completeSetup();
    }

    // Escape to skip
    if (event.key === 'Escape') {
        event.preventDefault();
        skipWelcome();
    }
});

// Auto-focus API key input
document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key');
    if (apiKeyInput) {
        apiKeyInput.focus();
    }
});

// Handle external links
document.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
        event.preventDefault();
        ipcRenderer.invoke('open-external', event.target.href);
    }
});