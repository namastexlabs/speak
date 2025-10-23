const { UiohookKey, uIOhook } = require('uiohook-napi');

/**
 * Push-to-Talk (PTT) Manager using native key event hooks
 * Supports true hold-to-record functionality across Windows and macOS
 */
class PTTManager {
  constructor() {
    this.isRecording = false;
    this.recordingCallback = null;
    this.currentKeys = new Set();
    this.requiredKeys = []; // Array of arrays: [[leftCtrl, rightCtrl], [leftMeta, rightMeta], [keyS]]
    this.isEnabled = false;
    this.pressStartTime = null;
    this.minHoldTime = 200; // Minimum hold time in ms to prevent accidental triggers
    this.holdTimer = null;
  }

  /**
   * Start the PTT system with specified key combination
   * @param {string} hotkey - Hotkey string like "Super+Control+S"
   * @param {function} callback - Callback function(action: 'start'|'stop')
   */
  start(hotkey, callback) {
    if (this.isEnabled) {
      this.stop();
    }

    this.recordingCallback = callback;
    this.requiredKeys = this.parseHotkey(hotkey);

    console.log('Starting PTT with keys:', JSON.stringify(this.requiredKeys));

    // Remove all existing listeners to prevent duplicates
    uIOhook.removeAllListeners('keydown');
    uIOhook.removeAllListeners('keyup');

    // Set up key event listeners
    uIOhook.on('keydown', (event) => {
      this.handleKeyDown(event);
    });

    uIOhook.on('keyup', (event) => {
      this.handleKeyUp(event);
    });

    // Start the hook
    uIOhook.start();
    this.isEnabled = true;

    return { success: true };
  }

  /**
   * Parse hotkey string to uiohook key codes
   * Returns array of key groups where each group contains variants of the same logical key
   */
  parseHotkey(hotkeyString) {
    const keyGroups = [];
    const parts = hotkeyString.split('+');

    console.log(`PTT: Parsing hotkey "${hotkeyString}", parts:`, parts);

    for (const part of parts) {
      const trimmed = part.trim();
      const keyCode = this.getKeyCode(trimmed);
      console.log(`PTT: Parsed "${trimmed}" -> keycode: ${keyCode}`);
      if (keyCode !== null) {
        // Store as array even if single key (for consistent logic)
        if (Array.isArray(keyCode)) {
          keyGroups.push(keyCode);
        } else {
          keyGroups.push([keyCode]);
        }
      }
    }

    console.log(`PTT: Final requiredKeys:`, keyGroups);
    return keyGroups;
  }

  /**
   * Map key names to uiohook key codes
   */
  getKeyCode(keyName) {
    const keyMap = {
      // Modifiers - return arrays for keys that have left/right variants
      'Control': [UiohookKey.Ctrl, UiohookKey.CtrlRight],
      'Ctrl': [UiohookKey.Ctrl, UiohookKey.CtrlRight],
      'Alt': [UiohookKey.Alt, UiohookKey.AltRight],
      'Shift': [UiohookKey.Shift, UiohookKey.ShiftRight],
      'Super': process.platform === 'darwin' ? [UiohookKey.Meta, UiohookKey.MetaRight] : [UiohookKey.Meta, UiohookKey.MetaRight],
      'Command': [UiohookKey.Meta, UiohookKey.MetaRight],
      'Meta': [UiohookKey.Meta, UiohookKey.MetaRight],

      // Letters
      'A': UiohookKey.A, 'B': UiohookKey.B, 'C': UiohookKey.C,
      'D': UiohookKey.D, 'E': UiohookKey.E, 'F': UiohookKey.F,
      'G': UiohookKey.G, 'H': UiohookKey.H, 'I': UiohookKey.I,
      'J': UiohookKey.J, 'K': UiohookKey.K, 'L': UiohookKey.L,
      'M': UiohookKey.M, 'N': UiohookKey.N, 'O': UiohookKey.O,
      'P': UiohookKey.P, 'Q': UiohookKey.Q, 'R': UiohookKey.R,
      'S': UiohookKey.S, 'T': UiohookKey.T, 'U': UiohookKey.U,
      'V': UiohookKey.V, 'W': UiohookKey.W, 'X': UiohookKey.X,
      'Y': UiohookKey.Y, 'Z': UiohookKey.Z,

      // Numbers
      '0': UiohookKey.Digit0, '1': UiohookKey.Digit1, '2': UiohookKey.Digit2,
      '3': UiohookKey.Digit3, '4': UiohookKey.Digit4, '5': UiohookKey.Digit5,
      '6': UiohookKey.Digit6, '7': UiohookKey.Digit7, '8': UiohookKey.Digit8,
      '9': UiohookKey.Digit9,

      // Function keys
      'F1': UiohookKey.F1, 'F2': UiohookKey.F2, 'F3': UiohookKey.F3,
      'F4': UiohookKey.F4, 'F5': UiohookKey.F5, 'F6': UiohookKey.F6,
      'F7': UiohookKey.F7, 'F8': UiohookKey.F8, 'F9': UiohookKey.F9,
      'F10': UiohookKey.F10, 'F11': UiohookKey.F11, 'F12': UiohookKey.F12,

      // Special keys
      'Space': UiohookKey.Space,
      'Enter': UiohookKey.Enter,
      'Escape': UiohookKey.Escape,
      'Tab': UiohookKey.Tab,
      'Backspace': UiohookKey.Backspace,
    };

    return keyMap[keyName] || null;
  }

  /**
   * Handle key down events
   */
  handleKeyDown(event) {
    // Ignore key repeats (when key is already pressed)
    if (this.currentKeys.has(event.keycode)) {
      return;
    }

    console.log(`PTT: Key down event - keycode: ${event.keycode}, currentKeys before: ${Array.from(this.currentKeys)}`);
    this.currentKeys.add(event.keycode);
    console.log(`PTT: currentKeys after: ${Array.from(this.currentKeys)}, allKeysPressed: ${this.allKeysPressed()}`);

    // Check if all required keys are pressed
    if (this.allKeysPressed()) {
      if (!this.pressStartTime) {
        this.pressStartTime = Date.now();
      }

      if (!this.isRecording && !this.holdTimer) {
        this.holdTimer = setTimeout(() => {
          this.holdTimer = null;

          if (!this.allKeysPressed()) {
            console.log('PTT: Hold released before activation, skip recording start');
            this.pressStartTime = null;
            return;
          }

          this.startRecording();
        }, this.minHoldTime);
      }
    }
  }

  /**
   * Handle key up events
   */
  handleKeyUp(event) {
    console.log(`PTT: Key up event - keycode: ${event.keycode}, currentKeys: ${Array.from(this.currentKeys)}, requiredKeys: ${JSON.stringify(this.requiredKeys)}`);
    this.currentKeys.delete(event.keycode);

    const stillHoldingRequiredKeys = this.allKeysPressed();

    if (this.holdTimer && !stillHoldingRequiredKeys) {
      console.log('PTT: Hold released before activation, cancelling pending start');
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
      this.pressStartTime = null;
      return;
    }

    // If any required key is released and we're recording, stop
    if (this.isRecording && !stillHoldingRequiredKeys) {
      const holdDuration = this.pressStartTime ? Date.now() - this.pressStartTime : 0;
      console.log(`PTT: Hold duration: ${holdDuration}ms`);
      this.stopRecording();
    }
  }

  /**
   * Check if all required keys are currently pressed
   * For each key group, at least one variant must be pressed
   */
  allKeysPressed() {
    if (this.requiredKeys.length === 0) return false;

    for (const keyGroup of this.requiredKeys) {
      // Check if ANY variant of this key group is pressed
      const anyVariantPressed = keyGroup.some(keyCode => this.currentKeys.has(keyCode));
      if (!anyVariantPressed) {
        return false;
      }
    }
    return true;
  }

  /**
   * Start recording
   */
  startRecording() {
    if (this.isRecording) return;

    this.isRecording = true;
    console.log('PTT: Recording started');

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
    console.log('PTT: Recording stopped');

    if (this.recordingCallback) {
      this.recordingCallback('stop');
    }
  }

  /**
   * Stop the PTT system
   */
  stop() {
    if (!this.isEnabled) return;

    // Clean up
    this.isEnabled = false;
    this.isRecording = false;
    this.currentKeys.clear();
    this.pressStartTime = null;

    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    // Remove event listeners
    uIOhook.removeAllListeners('keydown');
    uIOhook.removeAllListeners('keyup');

    // Stop uiohook
    uIOhook.stop();

    console.log('PTT system stopped');
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isRecording: this.isRecording,
      requiredKeys: this.requiredKeys,
      currentKeys: Array.from(this.currentKeys)
    };
  }
}

module.exports = new PTTManager();
