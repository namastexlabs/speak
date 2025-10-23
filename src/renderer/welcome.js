/* eslint-disable no-unused-vars */
const { ipcRenderer } = require('electron');

let currentStep = 1;
let recordedHotkey = null;
let pressedKeys = new Set();

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
        // Enter on step 4 completes setup
        if (event.key === 'Enter' && currentStep === 4) {
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
    } else if (stepNumber === 3) {
        setupHotkeyRecorder();
    }
}

// Update progress indicator
function updateProgress(activeStep) {
    for (let i = 1; i <= 4; i++) {
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

// Setup hotkey recorder
function setupHotkeyRecorder() {
    const recorder = document.getElementById('hotkey-recorder');
    const display = document.getElementById('hotkey-display');

    if (!recorder) return;

    // Focus the recorder
    setTimeout(() => recorder.focus(), 400);

    // Handle click to focus
    recorder.addEventListener('click', () => {
        recorder.focus();
        display.textContent = 'Press your keys...';
        display.classList.remove('opacity-50');
        pressedKeys.clear();
    });

    // Record keydown
    recorder.addEventListener('keydown', (event) => {
        event.preventDefault();

        // Add key to pressed set
        const key = normalizeKey(event);
        if (key) {
            pressedKeys.add(key);
        }

        // Build hotkey string
        const hotkey = buildHotkeyString();
        if (hotkey) {
            display.textContent = hotkey;
            display.classList.remove('opacity-50');
        }
    });

    // Save on keyup (when releasing keys)
    recorder.addEventListener('keyup', (event) => {
        event.preventDefault();

        // Only save if we have at least one modifier + key or 2+ modifiers
        const keys = Array.from(pressedKeys);
        if (keys.length >= 2) {
            const hotkey = buildHotkeyString();
            recordedHotkey = hotkey;

            console.log('Hotkey recorded:', hotkey);
            showStatus('step-3-status', `✓ Hotkey set: ${hotkey}`, 'success');

            // Add success animation
            const step3 = document.getElementById('step-3');
            step3.classList.add('pulse-success');

            // Save hotkey to settings
            ipcRenderer.invoke('update-settings', { hotkey });

            // Auto-advance to step 4
            setTimeout(() => {
                advanceToStep(4);
                // Update final display
                document.getElementById('final-hotkey-display').textContent = hotkey;
            }, 1000);
        }

        // Clear pressed keys
        pressedKeys.clear();
    });

    // Handle blur
    recorder.addEventListener('blur', () => {
        if (!recordedHotkey) {
            display.textContent = 'Click here and press your keys...';
            display.classList.add('opacity-50');
        }
    });
}

// Normalize key from event to standard format
function normalizeKey(event) {
    const key = event.key;

    // Modifiers
    if (key === 'Control') return 'Control';
    if (key === 'Alt') return 'Alt';
    if (key === 'Shift') return 'Shift';
    if (key === 'Meta') {
        // Meta is Win on Windows/Linux, Command on Mac
        if (process.platform === 'darwin') return 'Command';
        return 'Super';
    }

    // Regular keys (only allow single letters, F-keys, or special keys)
    if (/^[A-Z]$/i.test(key)) return key.toUpperCase();
    if (/^F\d{1,2}$/i.test(key)) return key.toUpperCase();
    if (key === ' ' || key === 'Space') return 'Space';

    return null;
}

// Build hotkey string from pressed keys
function buildHotkeyString() {
    const keys = Array.from(pressedKeys);
    if (keys.length === 0) return '';

    // Order: modifiers first (Control, Alt, Shift, Super/Command), then regular key
    const modifierOrder = ['Control', 'Alt', 'Shift', 'Super', 'Command'];
    const modifiers = [];
    const regularKeys = [];

    keys.forEach(key => {
        if (modifierOrder.includes(key)) {
            modifiers.push(key);
        } else {
            regularKeys.push(key);
        }
    });

    // Sort modifiers by standard order
    modifiers.sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b));

    // Combine: modifiers + regular keys
    return [...modifiers, ...regularKeys].join('+');
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
