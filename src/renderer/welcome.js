/* eslint-disable no-unused-vars */
const { ipcRenderer } = require('electron');

let currentStep = 1;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome screen loaded');
    setupEventListeners();
    checkExistingSetup();
});

// Set up all event listeners
function setupEventListeners() {
    const apiKeyInput = document.getElementById('api-key');

    // Auto-focus API key input
    apiKeyInput.focus();

    // Auto-validate on paste
    apiKeyInput.addEventListener('paste', async (e) => {
        // Wait for paste to complete
        setTimeout(() => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey.startsWith('sk-')) {
                validateAndAdvance(apiKey);
            }
        }, 100);
    });

    // Also validate on input (for manual typing)
    let inputTimer;
    apiKeyInput.addEventListener('input', () => {
        clearTimeout(inputTimer);
        const apiKey = apiKeyInput.value.trim();

        // Only validate if it looks like a complete key
        if (apiKey.startsWith('sk-') && apiKey.length > 20) {
            inputTimer = setTimeout(() => {
                validateAndAdvance(apiKey);
            }, 500); // Debounce 500ms
        }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            skipWelcome();
        }
        // Enter on step 3 completes setup
        if (event.key === 'Enter' && currentStep === 3) {
            event.preventDefault();
            completeSetup();
        }
    });

    // Handle external links
    document.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' && event.target.href && event.target.href.startsWith('http')) {
            event.preventDefault();
            ipcRenderer.invoke('open-external', event.target.href);
        }
    });
}

// Check if API key is already configured
async function checkExistingSetup() {
    try {
        const settings = await ipcRenderer.invoke('get-settings');
        if (settings.apiKey === '***configured***') {
            const apiKeyInput = document.getElementById('api-key');
            apiKeyInput.value = '••••••••••••••••';
            apiKeyInput.disabled = true;

            showStatus('step-1-status', '✓ API key already configured', 'success');

            // Auto-validate existing key
            const validation = await ipcRenderer.invoke('test-api-key');
            if (validation.valid) {
                setTimeout(() => {
                    advanceToStep(2);
                }, 1000);
            }
        }
    } catch (error) {
        console.warn('Failed to check existing setup:', error);
    }
}

// Validate API key and advance if valid
async function validateAndAdvance(apiKey) {
    showStatus('step-1-status', 'Validating...', 'info');

    try {
        // Save the key first
        await ipcRenderer.invoke('update-settings', { apiKey });

        // Then validate
        const result = await ipcRenderer.invoke('test-api-key', apiKey);

        if (result.valid) {
            showStatus('step-1-status', '✓ API key validated', 'success');

            // Add success animation
            const step1 = document.getElementById('step-1');
            step1.classList.add('pulse-success');

            // Auto-advance to step 2 after short delay
            setTimeout(() => {
                advanceToStep(2);
            }, 800);
        } else {
            showStatus('step-1-status', '✗ Invalid API key: ' + result.error, 'error');
        }
    } catch (error) {
        showStatus('step-1-status', '✗ Validation failed: ' + error.message, 'error');
    }
}

// Advance to specific step
function advanceToStep(stepNumber) {
    // Hide current step
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    if (currentStepEl) {
        currentStepEl.classList.remove('step-visible');
        currentStepEl.classList.add('step-hidden');
    }

    // Show new step
    const newStepEl = document.getElementById(`step-${stepNumber}`);
    if (newStepEl) {
        newStepEl.classList.remove('step-hidden');
        newStepEl.classList.add('step-visible');
    }

    // Update progress indicator
    updateProgress(stepNumber);

    currentStep = stepNumber;

    // Step-specific actions
    if (stepNumber === 2) {
        loadAudioDevices();
        setTimeout(() => {
            document.getElementById('grant-mic-btn')?.focus();
        }, 400);
    }
}

// Update progress indicator
function updateProgress(activeStep) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`progress-${i}`);
        if (i <= activeStep) {
            indicator.classList.remove('bg-base-300');
            indicator.classList.add('bg-primary');
        } else {
            indicator.classList.remove('bg-primary');
            indicator.classList.add('bg-base-300');
        }
    }
}

// Load available audio devices
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

        // Save selection when changed
        select.addEventListener('change', () => {
            const selectedDevice = select.value;
            ipcRenderer.invoke('update-settings', { audioDevice: selectedDevice });
        });

    } catch (error) {
        console.warn('Failed to enumerate audio devices:', error);
    }
}

// Grant microphone access
async function grantMicrophoneAccess() {
    const btn = document.getElementById('grant-mic-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    showStatus('step-2-status', 'Requesting permission...', 'info');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Stop the stream immediately - we just wanted permission
        stream.getTracks().forEach(track => track.stop());

        showStatus('step-2-status', '✓ Microphone access granted', 'success');

        // Add success animation
        const step2 = document.getElementById('step-2');
        step2.classList.add('pulse-success');

        // Auto-advance to step 3
        setTimeout(() => {
            advanceToStep(3);
        }, 800);

    } catch (error) {
        console.warn('Microphone permission denied:', error);
        showStatus('step-2-status', '⚠ Microphone access denied. You can grant it later in settings.', 'warning');

        btn.classList.remove('loading');
        btn.disabled = false;

        // Still allow advancing after a delay
        setTimeout(() => {
            advanceToStep(3);
        }, 2000);
    }
}

// Complete setup
async function completeSetup() {
    try {
        // Mark first run as complete
        await ipcRenderer.invoke('update-settings', { firstRun: false });

        // Close welcome and show main app
        ipcRenderer.invoke('complete-welcome');
    } catch (error) {
        console.error('Failed to complete setup:', error);
    }
}

// Skip welcome
function skipWelcome() {
    ipcRenderer.invoke('skip-welcome');
}

// Show status message
function showStatus(elementId, message, type) {
    const statusElement = document.getElementById(elementId);

    const alertClass = {
        'success': 'alert alert-success',
        'error': 'alert alert-error',
        'info': 'alert alert-info',
        'warning': 'alert alert-warning'
    }[type] || 'alert';

    statusElement.className = alertClass + ' text-sm';
    statusElement.textContent = message;
    statusElement.style.display = 'block';

    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 2000);
    }
}

// Window controls
function minimizeWindow() {
    ipcRenderer.invoke('minimize-window');
}

function closeWindow() {
    ipcRenderer.invoke('close-window');
}
