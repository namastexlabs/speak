const { GlobalKeyboardListener } = require('node-global-key-listener');

/**
 * NEW PTT Manager using node-global-key-listener
 * MUCH simpler and more reliable than uiohook-napi
 */
class PTTManagerV2 {
  constructor() {
    this.listener = new GlobalKeyboardListener();
    this.isRecording = false;
    this.recordingCallback = null;
    this.requiredKeys = []; // e.g., ['LEFT META', 'LEFT CONTROL']
    this.pressedKeys = new Set();
    this.isEnabled = false;
    this.minHoldTime = 200;
    this.holdTimer = null;
    this.pressStartTime = null;
  }

  /**
   * Start PTT with specified hotkey
   * @param {string} hotkey - e.g., "Super+Control"
   * @param {function} callback - Called with 'start' or 'stop'
   */
  start(hotkey, callback) {
    if (this.isEnabled) {
      this.stop();
    }

    this.recordingCallback = callback;
    this.requiredKeys = this.parseHotkey(hotkey);

    console.log('PTT V2: Starting with keys:', this.requiredKeys);

    // Listen for all key events
    this.listener.addListener((event, down) => {
      const keyName = this.normalizeKeyName(event.name, event.state);

      if (down.DOWN) {
        this.handleKeyDown(keyName);
      } else if (down.UP) {
        this.handleKeyUp(keyName);
      }
    });

    this.isEnabled = true;
    return { success: true };
  }

  /**
   * Parse hotkey string to key names
   */
  parseHotkey(hotkeyString) {
    const parts = hotkeyString.split('+').map(p => p.trim());
    const keys = [];

    for (const part of parts) {
      const normalized = this.mapToKeyName(part);
      if (normalized) {
        keys.push(normalized);
      }
    }

    console.log(`PTT V2: Parsed "${hotkeyString}" → ${JSON.stringify(keys)}`);
    return keys;
  }

  /**
   * Map our hotkey format to node-global-key-listener format
   */
  mapToKeyName(key) {
    const map = {
      'Super': process.platform === 'darwin' ? 'LEFT META' : 'LEFT META',
      'Command': 'LEFT META',
      'Meta': 'LEFT META',
      'Control': 'LEFT CONTROL',
      'Ctrl': 'LEFT CONTROL',
      'Alt': 'LEFT ALT',
      'Shift': 'LEFT SHIFT',
    };

    return map[key] || key.toUpperCase();
  }

  /**
   * Normalize key names from listener
   */
  normalizeKeyName(name, state) {
    // The library gives us names like "LEFT META", "LEFT CONTROL", etc.
    return name.toUpperCase();
  }

  /**
   * Handle key down
   */
  handleKeyDown(keyName) {
    console.log(`PTT V2: Key down: ${keyName}, pressedKeys:`, Array.from(this.pressedKeys));

    this.pressedKeys.add(keyName);

    // Check if all required keys are now pressed
    if (this.areAllKeysPressed()) {
      console.log('PTT V2: All keys pressed!');

      if (!this.pressStartTime) {
        this.pressStartTime = Date.now();
      }

      if (!this.isRecording && !this.holdTimer) {
        this.holdTimer = setTimeout(() => {
          this.holdTimer = null;
          if (this.areAllKeysPressed()) {
            this.startRecording();
          } else {
            this.pressStartTime = null;
          }
        }, this.minHoldTime);
      }
    }
  }

  /**
   * Handle key up
   */
  handleKeyUp(keyName) {
    console.log(`PTT V2: Key up: ${keyName}, pressedKeys before:`, Array.from(this.pressedKeys));

    this.pressedKeys.delete(keyName);

    console.log(`PTT V2: pressedKeys after:`, Array.from(this.pressedKeys));

    // If any required key is released, stop
    if (this.requiredKeys.includes(keyName)) {
      console.log('PTT V2: Required key released, stopping');

      if (this.holdTimer) {
        clearTimeout(this.holdTimer);
        this.holdTimer = null;
        this.pressStartTime = null;
      }

      if (this.isRecording) {
        const holdDuration = this.pressStartTime ? Date.now() - this.pressStartTime : 0;
        console.log(`PTT V2: Stopping recording (held ${holdDuration}ms)`);
        this.stopRecording();
      }

      this.pressStartTime = null;
    }
  }

  /**
   * Check if all required keys are currently pressed
   */
  areAllKeysPressed() {
    for (const key of this.requiredKeys) {
      if (!this.pressedKeys.has(key)) {
        return false;
      }
    }
    return this.requiredKeys.length > 0;
  }

  /**
   * Start recording
   */
  startRecording() {
    if (this.isRecording) return;

    this.isRecording = true;
    console.log('PTT V2: Recording STARTED');

    if (this.recordingCallback) {
      this.recordingCallback('start');
    }
  }

  /**
   * Stop recording
   */
  stopRecording() {
    if (!this.isRecording) return;

    this.isRecording = false;
    this.pressStartTime = null;
    console.log('PTT V2: Recording STOPPED');

    if (this.recordingCallback) {
      this.recordingCallback('stop');
    }
  }

  /**
   * Stop the PTT system
   */
  stop() {
    if (!this.isEnabled) return;

    this.listener.kill();
    this.listener = new GlobalKeyboardListener(); // Reset for next start

    this.isEnabled = false;
    this.isRecording = false;
    this.pressedKeys.clear();
    this.pressStartTime = null;

    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    console.log('PTT V2: System stopped');
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isRecording: this.isRecording,
      requiredKeys: this.requiredKeys,
      pressedKeys: Array.from(this.pressedKeys)
    };
  }
}

module.exports = new PTTManagerV2();
