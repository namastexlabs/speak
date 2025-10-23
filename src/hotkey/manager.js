const { globalShortcut, app } = require('electron');

class HotkeyManager {
  constructor() {
    this.currentHotkey = null;
    this.isRegistered = false;
    this.isRecording = false;
    this.recordingCallback = null;
    this.stopCallback = null;
    this.lastTriggerTime = 0;
    this.debounceDelay = 300; // 300ms debounce to prevent rapid toggling
  }

  // Register global hotkey
  registerHotkey(hotkeyString, callback) {
    try {
      // Unregister existing hotkey first
      this.unregisterHotkey();

      // Parse hotkey string - can be simple like "R" or complex like "Super+Control+S"
      let accelerator;
      if (hotkeyString.includes('+')) {
        // Already a full accelerator string (e.g., "Super+Control+S")
        accelerator = hotkeyString;
      } else {
        // Simple modifier (legacy format, e.g., "R")
        if (process.platform === 'darwin') {
          accelerator = `Command+${hotkeyString}`;
        } else {
          accelerator = `Control+${hotkeyString}`;
        }
      }

      this.currentHotkey = accelerator;
      this.recordingCallback = callback;

      console.log(`Attempting to register hotkey: ${accelerator}`);

      // Register the hotkey
      const success = globalShortcut.register(accelerator, () => {
        this.handleHotkeyPress();
      });

      if (success) {
        this.isRegistered = true;
        console.log(`Hotkey registered successfully: ${accelerator}`);
        return { success: true };
      } else {
        console.error(`Failed to register hotkey: ${accelerator}`);
        return { success: false, error: 'Hotkey already in use by another application' };
      }

    } catch (error) {
      console.error('Hotkey registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle hotkey press (start/stop recording)
  handleHotkeyPress() {
    // Debounce to prevent rapid toggling
    const now = Date.now();
    if (now - this.lastTriggerTime < this.debounceDelay) {
      console.log('Hotkey press ignored (debounce)');
      return;
    }
    this.lastTriggerTime = now;

    if (this.isRecording) {
      // Stop recording
      this.stopRecording();
    } else {
      // Start recording
      this.startRecording();
    }
  }

  // Start recording
  startRecording() {
    if (this.isRecording) return;

    this.isRecording = true;
    console.log('Recording started via hotkey');

    // Notify renderer process
    if (this.recordingCallback) {
      this.recordingCallback('start');
    }

    // Set up auto-stop timer (30 seconds max)
    this.recordingTimer = setTimeout(() => {
      if (this.isRecording) {
        console.log('Auto-stopping recording after 30 seconds');
        this.stopRecording();
      }
    }, 30000);
  }

  // Stop recording
  stopRecording() {
    if (!this.isRecording) return;

    this.isRecording = false;
    console.log('Recording stopped via hotkey');

    // Clear auto-stop timer
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

    // Notify renderer process
    if (this.recordingCallback) {
      this.recordingCallback('stop');
    }
  }

  // Unregister current hotkey
  unregisterHotkey() {
    if (this.isRegistered && this.currentHotkey) {
      globalShortcut.unregister(this.currentHotkey);
      this.isRegistered = false;
      console.log(`Unregistered hotkey: ${this.currentHotkey}`);
    }
    this.currentHotkey = null;
  }

  // Update hotkey with new modifier
  updateHotkey(modifier) {
    const result = this.registerHotkey(modifier, this.recordingCallback);
    return result;
  }

  // Get current hotkey status
  getStatus() {
    return {
      isRegistered: this.isRegistered,
      currentHotkey: this.currentHotkey,
      isRecording: this.isRecording
    };
  }

  // Set recording callback
  setRecordingCallback(callback) {
    this.recordingCallback = callback;
  }

  // Check if hotkey is available
  isHotkeyAvailable(modifier) {
    let accelerator;
    if (process.platform === 'darwin') {
      accelerator = `Command+${modifier}`;
    } else {
      accelerator = `Control+${modifier}`;
    }

    // Try to register temporarily to check availability
    const wasRegistered = globalShortcut.isRegistered(accelerator);
    if (!wasRegistered) {
      // Try to register and immediately unregister
      const success = globalShortcut.register(accelerator, () => {});
      if (success) {
        globalShortcut.unregister(accelerator);
        return true;
      }
    }
    return false;
  }

  // Get available modifiers for the current platform
  getAvailableModifiers() {
    const modifiers = ['Control', 'Alt', 'Shift'];

    if (process.platform === 'darwin') {
      modifiers.unshift('Command'); // macOS prefers Command
    }

    return modifiers;
  }

  // Get platform-specific hotkey display text
  getHotkeyDisplay(modifier) {
    if (process.platform === 'darwin') {
      return `⌘ + ${modifier}`;
    } else {
      return `Ctrl + ${modifier}`;
    }
  }

  // Handle app-level events
  handleAppEvents() {
    // Re-register hotkey when app gains focus (in case it was stolen)
    app.on('browser-window-focus', () => {
      if (!this.isRegistered && this.currentHotkey) {
        console.log('Re-registering hotkey after window focus');
        this.registerHotkey(this.currentHotkey.split('+')[1], this.recordingCallback);
      }
    });

    // Clean up on app quit
    app.on('before-quit', () => {
      this.unregisterHotkey();
    });
  }

  // Simulate hotkey press (for testing)
  simulateHotkeyPress() {
    if (this.isRegistered) {
      this.handleHotkeyPress();
    }
  }

  // Get system information
  getSystemInfo() {
    return {
      platform: process.platform,
      availableModifiers: this.getAvailableModifiers(),
      currentHotkey: this.currentHotkey,
      isRegistered: this.isRegistered
    };
  }
}

module.exports = new HotkeyManager();