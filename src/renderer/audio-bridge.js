// Bridge between renderer process (Web Audio API) and main process
// This runs in the renderer and handles Web Audio recording

class AudioBridge {
  constructor() {
    this.mediaRecorder = null;
    this.mediaStream = null;
    this.isRecording = false;
    this.audioChunks = [];
  }

  // Request microphone access and start recording
  async startRecording() {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    try {
      // Request microphone access (triggers Windows permission dialog automatically)
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Whisper prefers 16kHz
          channelCount: 1 // Mono
        }
      });

      // Create MediaRecorder with best available format
      const options = {
        mimeType: this.getSupportedMimeType(),
        audioBitsPerSecond: 128000
      };

      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);
      this.audioChunks = [];

      // Collect audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;

      console.log('Started Web Audio recording');
      return { success: true };

    } catch (error) {
      console.error('Failed to start recording:', error);

      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No microphone found');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Microphone is already in use');
      } else {
        throw new Error(`Microphone access failed: ${error.message}`);
      }
    }
  }

  // Stop recording and return audio data
  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('Not currently recording');
    }

    return new Promise((resolve, reject) => {
      try {
        // Handle recording stop
        this.mediaRecorder.onstop = async () => {
          try {
            // Create blob from chunks
            const audioBlob = new Blob(this.audioChunks, {
              type: this.getSupportedMimeType()
            });

            // Convert to WAV format (Whisper compatible)
            const wavBuffer = await this.convertToWav(audioBlob);

            // Clean up media stream
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
            this.isRecording = false;

            console.log(`Recording stopped, ${wavBuffer.byteLength} bytes captured`);

            resolve({
              buffer: Array.from(new Uint8Array(wavBuffer)),
              size: wavBuffer.byteLength
            });

          } catch (error) {
            console.error('Failed to process recorded audio:', error);
            reject(error);
          }
        };

        // Stop the recorder
        this.mediaRecorder.stop();

      } catch (error) {
        console.error('Failed to stop recording:', error);
        this.isRecording = false;
        reject(error);
      }
    });
  }

  // Convert audio blob to WAV format (16kHz mono for Whisper)
  async convertToWav(audioBlob) {
    // Create audio context with target sample rate
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000
    });

    // Decode audio data
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get channel data (mono)
    const channelData = audioBuffer.numberOfChannels > 1
      ? this.mixToMono(audioBuffer)
      : audioBuffer.getChannelData(0);

    // Resample to 16kHz if needed
    const targetSampleRate = 16000;
    const resampledData = audioBuffer.sampleRate !== targetSampleRate
      ? this.resample(channelData, audioBuffer.sampleRate, targetSampleRate)
      : channelData;

    // Convert to WAV format
    const wavBuffer = this.encodeWav(resampledData, targetSampleRate);

    await audioContext.close();
    return wavBuffer;
  }

  // Mix stereo to mono
  mixToMono(audioBuffer) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : left;
    const mono = new Float32Array(left.length);

    for (let i = 0; i < left.length; i++) {
      mono[i] = (left[i] + right[i]) / 2;
    }

    return mono;
  }

  // Simple linear resampling
  resample(audioData, sourceSampleRate, targetSampleRate) {
    if (sourceSampleRate === targetSampleRate) {
      return audioData;
    }

    const ratio = sourceSampleRate / targetSampleRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const index = Math.floor(srcIndex);
      const fraction = srcIndex - index;

      if (index + 1 < audioData.length) {
        result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
      } else {
        result[i] = audioData[index];
      }
    }

    return result;
  }

  // Encode Float32Array to WAV format
  encodeWav(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    return buffer;
  }

  // Helper to write strings to DataView
  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // Get supported MIME type for MediaRecorder
  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  // Check if microphone is available
  async checkMicrophoneAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone access check failed:', error);
      return false;
    }
  }

  // Get recording status
  getStatus() {
    return {
      isRecording: this.isRecording
    };
  }
}

// Create global instance
window.audioBridge = new AudioBridge();
