const fs = require('fs');
const path = require('path');
const os = require('os');

class AudioRecorder {
  constructor() {
    this.isRecording = false;
    this.tempFile = null;
    this.audioBuffer = null;
  }

  // Start recording (delegated to renderer process)
  async startRecording() {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    this.isRecording = true;
    console.log('Recording started (handled by Web Audio API in renderer)');
    return { success: true };
  }

  // Stop recording and save audio data from renderer
  async stopRecording(audioData) {
    if (!this.isRecording) {
      throw new Error('Not currently recording');
    }

    try {
      // Create temporary file for audio data
      this.tempFile = path.join(os.tmpdir(), `speak-recording-${Date.now()}.wav`);

      // Save buffer to file
      const buffer = Buffer.from(audioData.buffer);
      fs.writeFileSync(this.tempFile, buffer);

      this.audioBuffer = buffer;
      this.isRecording = false;

      console.log(`Recording stopped, saved ${buffer.length} bytes to ${this.tempFile}`);

      return {
        filePath: this.tempFile,
        buffer: buffer,
        size: buffer.length
      };

    } catch (error) {
      console.error('Failed to process recorded audio:', error);
      this.isRecording = false;
      throw error;
    }
  }

  // Get current recording status
  getStatus() {
    return {
      isRecording: this.isRecording,
      tempFile: this.tempFile
    };
  }

  // Clean up temporary files
  cleanup() {
    if (this.tempFile && fs.existsSync(this.tempFile)) {
      try {
        fs.unlinkSync(this.tempFile);
        console.log('Cleaned up temporary audio file:', this.tempFile);
      } catch (error) {
        console.error('Failed to cleanup temporary file:', error);
      }
    }
    this.tempFile = null;
    this.audioBuffer = null;
  }

  // Check if microphone is available (always true with Web Audio API)
  async checkMicrophoneAccess() {
    return true; // Web Audio API handles permission checks automatically
  }

  // Get system diagnostic information
  getSystemDiagnostics() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      audioAPI: 'Web Audio API',
      tempDir: os.tmpdir()
    };
  }
}

module.exports = new AudioRecorder();
