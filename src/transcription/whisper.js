const fs = require('fs');
const path = require('path');
const settingsManager = require('../config/settings');

class WhisperTranscriber {
  constructor() {
    this.openai = null;
  }

  // Initialize with current OpenAI client
  initialize() {
    this.openai = settingsManager.getOpenAI();
  }

  // Transcribe audio file using OpenAI Whisper
  async transcribeAudio(audioFilePath, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Please configure API key first.');
    }

    if (!fs.existsSync(audioFilePath)) {
      throw new Error('Audio file does not exist: ' + audioFilePath);
    }

    try {
      // Get file stats
      const stats = fs.statSync(audioFilePath);
      if (stats.size === 0) {
        throw new Error('Audio file is empty');
      }

      console.log(`Transcribing audio file: ${audioFilePath} (${stats.size} bytes)`);

      // Create readable stream from file
      const audioStream = fs.createReadStream(audioFilePath);

      // Prepare transcription options
      const transcriptionOptions = {
        file: audioStream,
        model: 'whisper-1',
        response_format: 'text', // Return plain text
        temperature: 0, // More deterministic results
      };

      // Add language if specified
      if (options.language && options.language !== 'auto') {
        transcriptionOptions.language = options.language;
      }

      // Add prompt for better context (optional)
      if (options.prompt) {
        transcriptionOptions.prompt = options.prompt;
      }

      // Call OpenAI Whisper API
      const transcription = await this.openai.audio.transcriptions.create(transcriptionOptions);

      // Clean up the response
      const text = typeof transcription === 'string' ? transcription : transcription.text || '';

      console.log(`Transcription completed: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);

      return {
        text: text.trim(),
        language: options.language || 'auto',
        confidence: 1.0, // OpenAI doesn't provide confidence scores
        duration: stats.size / (16000 * 2) // Rough estimate: bytes / (sampleRate * bytesPerSample)
      };

    } catch (error) {
      console.error('Whisper transcription failed:', error);

      // Handle specific OpenAI errors
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
      } else if (error.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (error.status === 400) {
        throw new Error('Invalid audio file format. Please ensure the file is a valid WAV file.');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Network connection failed. Please check your internet connection.');
      } else {
        throw new Error(`Transcription failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Transcribe audio buffer directly (alternative to file-based)
  async transcribeAudioBuffer(audioBuffer, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Please configure API key first.');
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Audio buffer is empty');
    }

    try {
      console.log(`Transcribing audio buffer: ${audioBuffer.length} bytes`);

      // Create a temporary file from buffer
      const tempDir = require('os').tmpdir();
      const tempFile = path.join(tempDir, `whisper-buffer-${Date.now()}.wav`);

      // Write buffer to temporary file
      fs.writeFileSync(tempFile, audioBuffer);

      try {
        // Transcribe the temporary file
        const result = await this.transcribeAudio(tempFile, options);
        return result;
      } finally {
        // Clean up temporary file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }

    } catch (error) {
      console.error('Buffer transcription failed:', error);
      throw error;
    }
  }

  // Get supported languages
  getSupportedLanguages() {
    return settingsManager.getSupportedLanguages();
  }

  // Test API connectivity
  async testConnection() {
    if (!this.openai) {
      return { success: false, error: 'OpenAI client not initialized' };
    }

    try {
      // Make a simple API call to test connectivity
      await this.openai.models.list();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Connection test failed'
      };
    }
  }

  // Estimate transcription cost (rough estimate)
  estimateCost(audioDurationSeconds) {
    // Whisper API pricing: $0.006 per minute
    const costPerMinute = 0.006;
    const minutes = audioDurationSeconds / 60;
    return minutes * costPerMinute;
  }

  // Validate audio file format
  validateAudioFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return { valid: false, error: 'File does not exist' };
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      return { valid: false, error: 'File is empty' };
    }

    if (stats.size > 25 * 1024 * 1024) { // 25MB limit
      return { valid: false, error: 'File too large (max 25MB)' };
    }

    // Basic WAV header check
    try {
      const buffer = fs.readFileSync(filePath, { start: 0, end: 12 });
      const riff = buffer.toString('ascii', 0, 4);
      const wave = buffer.toString('ascii', 8, 12);

      if (riff !== 'RIFF' || wave !== 'WAVE') {
        return { valid: false, error: 'Not a valid WAV file' };
      }
    } catch (error) {
      return { valid: false, error: 'Cannot read file header' };
    }

    return { valid: true };
  }
}

module.exports = new WhisperTranscriber();