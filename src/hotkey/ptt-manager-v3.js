const { globalShortcut } = require('electron');

// Try to load VAD, but make it optional (native deps might not be built yet)
let MicVAD = null;
try {
  MicVAD = require('@ricky0123/vad-node').MicVAD;
  console.log('PTT V3: VAD module loaded successfully');
} catch (error) {
  console.warn('PTT V3: VAD module not available (native deps not built), using manual-stop mode only');
  console.warn('PTT V3: Run "pnpm install" to enable VAD auto-stop feature');
}

/**
 * PTT Manager V3 - Toggle mode with optional VAD auto-stop
 * SIMPLE. RELIABLE. ACTUALLY WORKS.
 *
 * Press hotkey → Start recording (+ VAD monitoring if available)
 * VAD detects silence → Auto-stop after X seconds (if VAD available)
 * Or press hotkey again → Manual stop
 */
class PTTManagerV3 {
  constructor() {
    this.isRecording = false;
    this.recordingCallback = null;
    this.hotkey = null;
    this.isEnabled = false;
    this.vad = null;
    this.silenceTimeout = null;
    this.silenceDuration = 2000; // Auto-stop after 2s of silence
  }

  /**
   * Start PTT system
   */
  start(hotkey, callback) {
    if (this.isEnabled) {
      this.stop();
    }

    this.recordingCallback = callback;
    this.hotkey = this.convertHotkey(hotkey);

    // Validate hotkey before registration
    const validation = this.validateHotkey(this.hotkey);
    if (!validation.valid) {
      console.error('PTT V3: Invalid hotkey:', validation.error);
      return { success: false, error: validation.error };
    }

    console.log(`PTT V3: Registering toggle hotkey: ${this.hotkey}`);
    console.log('PTT V3: Platform:', process.platform);
    console.log('PTT V3: Callback function:', typeof callback);

    // Register global shortcut (toggle mode)
    const success = globalShortcut.register(this.hotkey, () => {
      console.log('🔥🔥🔥 PTT V3: HOTKEY PRESSED!!! 🔥🔥🔥');
      console.log('PTT V3: Toggling recording state from:', this.isRecording);
      this.toggle();
    });

    if (!success) {
      console.error('❌ PTT V3: Failed to register hotkey');
      console.error('❌ Hotkey that failed:', this.hotkey);
      const errorMsg = this.hotkey.includes('Super')
        ? 'Failed to register hotkey. The Windows key is not supported on Windows. Please use Ctrl, Alt, or Shift instead.'
        : 'Failed to register hotkey. It may already be in use by another application.';
      return { success: false, error: errorMsg };
    }

    // Verify registration
    const isRegistered = globalShortcut.isRegistered(this.hotkey);
    console.log(`✅ PTT V3: Registration successful! Verified: ${isRegistered}`);

    this.isEnabled = true;
    console.log('PTT V3: System started (toggle mode)');
    console.log('PTT V3: Press your hotkey now:', this.hotkey);
    return { success: true };
  }

  /**
   * Validate hotkey for current platform
   */
  validateHotkey(hotkey) {
    if (!hotkey || hotkey.trim() === '') {
      return { valid: false, error: 'Hotkey is empty' };
    }

    // Check for Windows key (Super) on Windows - NOT supported by Electron
    if (process.platform === 'win32' && hotkey.includes('Super')) {
      return {
        valid: false,
        error: 'Windows key (Super) is not supported on Windows. Please use Ctrl, Alt, or Shift instead.'
      };
    }

    return { valid: true };
  }

  /**
   * Convert our hotkey format to Electron globalShortcut accelerator format
   *
   * Electron accelerators: https://www.electronjs.org/docs/latest/api/accelerator
   * Valid modifiers: Command/Cmd, Control/Ctrl, Alt, Option, AltGr, Shift, Super/Meta/CommandOrControl/CmdOrCtrl
   *
   * Note: User-configured hotkeys should already be in a compatible format
   */
  convertHotkey(hotkey) {
    console.log(`PTT V3: Converting hotkey "${hotkey}" on platform: ${process.platform}`);

    const parts = hotkey.split('+').map(p => p.trim());
    const electronParts = [];

    for (const part of parts) {
      switch (part) {
        case 'Super':
          // On macOS, convert to Command
          if (process.platform === 'darwin') {
            electronParts.push('Command');
          }
          // On Windows, use Super (Win key)
          else if (process.platform === 'win32') {
            electronParts.push('Super');
          }
          // On Linux, pass through as-is (may not work on all systems)
          else {
            console.warn('PTT V3: Super key may not work reliably on Linux');
            electronParts.push('Super');
          }
          break;
        case 'Command':
          electronParts.push('Command');
          break;
        case 'Control':
        case 'Ctrl':
          electronParts.push('Control');
          break;
        case 'Alt':
          electronParts.push('Alt');
          break;
        case 'Shift':
          electronParts.push('Shift');
          break;
        default:
          // Regular keys pass through
          electronParts.push(part);
      }
    }

    const result = electronParts.join('+');
    console.log(`PTT V3: Converted to Electron format: "${result}"`);
    return result;
  }

  /**
   * Toggle recording on/off
   */
  async toggle() {
    if (this.isRecording) {
      console.log('PTT V3: Stopping recording (manual)');
      this.stopRecording();
    } else {
      console.log('PTT V3: Starting recording');
      await this.startRecording();
    }
  }

  /**
   * Start recording with VAD monitoring
   */
  async startRecording() {
    if (this.isRecording) return;

    this.isRecording = true;

    if (this.recordingCallback) {
      this.recordingCallback('start');
    }

    // Start VAD for auto-stop on silence
    this.startVAD();

    console.log('PTT V3: Recording STARTED (VAD monitoring enabled)');
  }

  /**
   * Stop recording
   */
  stopRecording() {
    if (!this.isRecording) return;

    this.isRecording = false;

    // Stop VAD
    this.stopVAD();

    // Clear silence timeout
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    if (this.recordingCallback) {
      this.recordingCallback('stop');
    }

    console.log('PTT V3: Recording STOPPED');
  }

  /**
   * Start Voice Activity Detection
   */
  async startVAD() {
    // Skip VAD if module not available
    if (!MicVAD) {
      console.log('PTT V3: VAD not available, use manual stop (press hotkey again)');
      return;
    }

    try {
      this.vad = await MicVAD.new({
        onSpeechStart: () => {
          console.log('PTT V3 VAD: Speech detected');
          // Clear silence timeout when speech detected
          if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
          }
        },
        onSpeechEnd: () => {
          console.log('PTT V3 VAD: Silence detected');
          // Start silence timeout
          if (this.isRecording && !this.silenceTimeout) {
            this.silenceTimeout = setTimeout(() => {
              console.log(`PTT V3 VAD: Silence for ${this.silenceDuration}ms, auto-stopping`);
              this.stopRecording();
            }, this.silenceDuration);
          }
        },
        onVADMisfire: () => {
          console.log('PTT V3 VAD: Misfire');
        }
      });

      this.vad.start();
      console.log('PTT V3 VAD: Started');
    } catch (error) {
      console.error('PTT V3 VAD: Failed to start:', error);
    }
  }

  /**
   * Stop Voice Activity Detection
   */
  stopVAD() {
    if (this.vad) {
      try {
        this.vad.destroy();
        this.vad = null;
        console.log('PTT V3 VAD: Stopped');
      } catch (error) {
        console.error('PTT V3 VAD: Failed to stop:', error);
      }
    }
  }

  /**
   * Stop the PTT system
   */
  stop() {
    if (!this.isEnabled) return;

    // Unregister hotkey
    if (this.hotkey) {
      globalShortcut.unregister(this.hotkey);
    }

    // Stop recording if active
    if (this.isRecording) {
      this.stopRecording();
    }

    this.isEnabled = false;
    console.log('PTT V3: System stopped');
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isRecording: this.isRecording,
      hotkey: this.hotkey
    };
  }
}

module.exports = new PTTManagerV3();
