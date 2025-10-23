const recorder = require('node-record-lpcm16');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class AudioRecorder {
  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.audioChunks = [];
    this.tempFile = null;
    this.soxAvailable = this.checkSoxAvailability();
  }

  // Check if sox is available
  checkSoxAvailability() {
    try {
      execSync('which sox', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Start recording audio
  startRecording() {
    return new Promise((resolve, reject) => {
      if (this.isRecording) {
        reject(new Error('Already recording'));
        return;
      }

      // Check sox availability
      if (!this.soxAvailable) {
        reject(new Error(
          'sox is not installed. Audio recording requires sox.\n' +
          'Install instructions:\n' +
          '  macOS: brew install sox\n' +
          '  Ubuntu: sudo apt-get install sox libsox-fmt-all\n' +
          '  Fedora: sudo dnf install sox\n' +
          '  Windows: choco install sox or download from sox.sourceforge.net'
        ));
        return;
      }

      try {
        // Create temporary file for audio data
        this.tempFile = path.join(os.tmpdir(), `speak-recording-${Date.now()}.wav`);

        // Configure recording options for Whisper compatibility
        const recordingOptions = {
          sampleRate: 16000, // 16kHz required by Whisper
          channels: 1, // Mono
          audioType: 'wav', // WAV format
          recorder: 'sox', // Use sox for cross-platform compatibility
          device: 'default' // Use default audio device
        };

        // Start recording
        this.recording = recorder.record(recordingOptions);

        // Handle recording errors
        this.recording.on('error', (error) => {
          console.error('Recording error:', error);
          
          // Provide more helpful error messages
          let errorMessage = error.message;
          if (error.message.includes('sox')) {
            errorMessage = 'sox failed to start. Make sure sox is installed and accessible.';
          } else if (error.message.includes('Permission')) {
            errorMessage = 'Microphone permission denied. Please grant microphone access to Speak.';
          } else if (error.message.includes('device')) {
            errorMessage = 'No audio device found. Please check your microphone connection.';
          }
          
          const enhancedError = new Error(errorMessage);
          enhancedError.originalError = error;
          
          this.stopRecording().catch(console.error);
          reject(enhancedError);
        });

        // Set up stream to collect audio data
        const audioStream = this.recording.stream();
        this.audioChunks = [];

        audioStream.on('data', (chunk) => {
          this.audioChunks.push(chunk);
        });

        audioStream.on('end', () => {
          console.log('Audio stream ended');
        });

        this.isRecording = true;
        console.log('Started recording audio');
        resolve();

      } catch (error) {
        console.error('Failed to start recording:', error);
        reject(error);
      }
    });
  }

  // Stop recording and return audio data
  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.isRecording || !this.recording) {
        reject(new Error('Not currently recording'));
        return;
      }

      try {
        // Stop the recording
        this.recording.stop();
        this.isRecording = false;

        // Wait a bit for the stream to finish
        setTimeout(() => {
          try {
            // Combine all audio chunks
            const audioBuffer = Buffer.concat(this.audioChunks);

            // Write to temporary file
            fs.writeFileSync(this.tempFile, audioBuffer);

            console.log(`Recording stopped, saved ${audioBuffer.length} bytes to ${this.tempFile}`);
            resolve({
              filePath: this.tempFile,
              buffer: audioBuffer,
              size: audioBuffer.length
            });

          } catch (error) {
            console.error('Failed to process recorded audio:', error);
            reject(error);
          }
        }, 500); // Wait 500ms for stream to finish

      } catch (error) {
        console.error('Failed to stop recording:', error);
        this.isRecording = false;
        reject(error);
      }
    });
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
    this.audioChunks = [];
  }

  // Check if microphone is available
  async checkMicrophoneAccess() {
    return new Promise((resolve) => {
      // First check if sox is available
      if (!this.soxAvailable) {
        resolve(false);
        return;
      }

      try {
        // Try to start a very short recording to test microphone access
        const testRecording = recorder.record({
          sampleRate: 16000,
          channels: 1,
          audioType: 'wav',
          recorder: 'sox',
          device: 'default'
        });

        const timeout = setTimeout(() => {
          testRecording.stop();
          resolve(false); // Timeout indicates no microphone access
        }, 2000);

        testRecording.on('error', (error) => {
          clearTimeout(timeout);
          console.error('Microphone test error:', error.message);
          resolve(false);
        });

        // If we get data, microphone is accessible
        const stream = testRecording.stream();
        stream.on('data', (chunk) => {
          if (chunk && chunk.length > 0) {
            clearTimeout(timeout);
            testRecording.stop();
            resolve(true);
          }
        });

      } catch (error) {
        console.error('Microphone access check failed:', error);
        resolve(false);
      }
    });
  }

  // Get system diagnostic information
  getSystemDiagnostics() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      soxAvailable: this.soxAvailable,
      tempDir: os.tmpdir()
    };
  }

  // Get available audio devices (basic implementation)
  getAvailableDevices() {
    // This is a simplified implementation
    // In a real app, you might use additional libraries to enumerate devices
    return [
      { id: 'default', name: 'Default System Microphone' }
    ];
  }
}

module.exports = new AudioRecorder();