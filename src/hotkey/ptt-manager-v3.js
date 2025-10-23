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

    console.log(`PTT V3: Registering toggle hotkey: ${this.hotkey}`);

    // Register global shortcut (toggle mode)
    const success = globalShortcut.register(this.hotkey, () => {
      console.log('PTT V3: Hotkey pressed, toggling recording');
      this.toggle();
    });

    if (!success) {
      console.error('PTT V3: Failed to register hotkey');
      return { success: false, error: 'Failed to register hotkey' };
    }

    this.isEnabled = true;
    console.log('PTT V3: System started (toggle mode)');
    return { success: true };
  }

  /**
   * Convert our hotkey format to Electron format
   * Super+Control → CommandOrControl+Super (Windows: Ctrl+Win, Mac: Cmd+Ctrl)
   */
  convertHotkey(hotkey) {
    // Electron format: Modifier+Key
    // Available modifiers: Command (or Cmd), Control (or Ctrl), CommandOrControl (or CmdOrCtrl),
    //                      Alt, Option, AltGr, Shift, Super

    const parts = hotkey.split('+').map(p => p.trim());
    const electronParts = [];

    for (const part of parts) {
      switch (part) {
        case 'Super':
          // On Windows: Windows key, On Mac: Cmd key
          electronParts.push(process.platform === 'darwin' ? 'Cmd' : 'Super');
          break;
        case 'Command':
          electronParts.push('Cmd');
          break;
        case 'Control':
        case 'Ctrl':
          electronParts.push('Ctrl');
          break;
        case 'Alt':
          electronParts.push('Alt');
          break;
        case 'Shift':
          electronParts.push('Shift');
          break;
        default:
          electronParts.push(part);
      }
    }

    return electronParts.join('+');
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
