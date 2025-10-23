const notificationManager = require('../ui/notifications');

class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.maxRetries = 3;
    this.retryDelays = [1000, 2000, 5000]; // Progressive backoff
  }

  // Handle different types of errors
  handleError(error, context = {}) {
    console.error('Error handled:', error, 'Context:', context);

    // Categorize the error
    const errorType = this.categorizeError(error);

    // Increment error count for this type
    this.incrementErrorCount(errorType);

    // Handle based on error type
    switch (errorType) {
      case 'api_key':
        return this.handleApiKeyError(error, context);
      case 'microphone':
        return this.handleMicrophoneError(error, context);
      case 'network':
        return this.handleNetworkError(error, context);
      case 'transcription':
        return this.handleTranscriptionError(error, context);
      case 'hotkey':
        return this.handleHotkeyError(error, context);
      case 'permission':
        return this.handlePermissionError(error, context);
      default:
        return this.handleGenericError(error, context);
    }
  }

  // Categorize error based on message and type
  categorizeError(error) {
    const message = error.message || error.toString();

    if (message.includes('API key') || message.includes('401') || message.includes('authentication')) {
      return 'api_key';
    }
    if (message.includes('microphone') || message.includes('audio') || message.includes('recording')) {
      return 'microphone';
    }
    if (message.includes('network') || message.includes('connection') || message.includes('ECONNREFUSED')) {
      return 'network';
    }
    if (message.includes('transcription') || message.includes('whisper') || message.includes('OpenAI')) {
      return 'transcription';
    }
    if (message.includes('hotkey') || message.includes('shortcut') || message.includes('global')) {
      return 'hotkey';
    }
    if (message.includes('permission') || message.includes('denied') || message.includes('access')) {
      return 'permission';
    }

    return 'generic';
  }

  // Handle API key errors
  handleApiKeyError(error, context) {
    const userMessage = 'OpenAI API key is invalid or missing. Please check your settings.';
    const details = 'Go to Settings > API Key to configure your OpenAI API key.';

    notificationManager.showError('API Key Required', userMessage, details);

    // Emit event to open settings
    if (global.mainWindow) {
      global.mainWindow.webContents.send('open-settings', { tab: 'api' });
    }

    return {
      type: 'api_key',
      userMessage: userMessage,
      action: 'open_settings',
      retryable: false
    };
  }

  // Handle microphone errors
  handleMicrophoneError(error, context) {
    const userMessage = 'Microphone access required for voice dictation.';
    const details = 'Please allow microphone access when prompted by your browser.';

    notificationManager.showMicrophonePermissionRequired();

    return {
      type: 'microphone',
      userMessage: userMessage,
      action: 'request_permission',
      retryable: true,
      retryDelay: 2000
    };
  }

  // Handle network errors
  handleNetworkError(error, context) {
    const userMessage = 'Network connection failed. Please check your internet connection.';
    const details = 'Voice transcription requires an internet connection to use OpenAI Whisper.';

    notificationManager.showError('Network Error', userMessage, details);

    return {
      type: 'network',
      userMessage: userMessage,
      action: 'retry',
      retryable: true,
      retryDelay: this.getRetryDelay('network')
    };
  }

  // Handle transcription errors
  handleTranscriptionError(error, context) {
    const userMessage = 'Failed to transcribe audio. Please try again.';
    const details = error.message || 'Unknown transcription error occurred.';

    notificationManager.showError('Transcription Failed', userMessage, details);

    return {
      type: 'transcription',
      userMessage: userMessage,
      action: 'retry',
      retryable: true,
      retryDelay: this.getRetryDelay('transcription')
    };
  }

  // Handle hotkey errors
  handleHotkeyError(error, context) {
    const userMessage = 'Failed to register global hotkey.';
    const details = 'The hotkey may already be in use by another application. Try a different modifier key.';

    notificationManager.showError('Hotkey Error', userMessage, details);

    return {
      type: 'hotkey',
      userMessage: userMessage,
      action: 'open_settings',
      retryable: false
    };
  }

  // Handle permission errors
  handlePermissionError(error, context) {
    const userMessage = 'Permission denied for required functionality.';
    const details = 'Please check your system settings and grant the necessary permissions.';

    notificationManager.showError('Permission Required', userMessage, details);

    return {
      type: 'permission',
      userMessage: userMessage,
      action: 'open_system_settings',
      retryable: false
    };
  }

  // Handle generic errors
  handleGenericError(error, context) {
    const userMessage = 'An unexpected error occurred.';
    const details = error.message || 'Please try again or restart the application.';

    notificationManager.showError('Unexpected Error', userMessage, details);

    return {
      type: 'generic',
      userMessage: userMessage,
      action: 'retry',
      retryable: true,
      retryDelay: 1000
    };
  }

  // Retry mechanism with exponential backoff
  async retryOperation(operation, errorType, maxRetries = this.maxRetries) {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        console.log(`Retry attempt ${attempt}/${maxRetries} for ${errorType}`);

        if (attempt >= maxRetries) {
          throw error;
        }

        const delay = this.getRetryDelay(errorType, attempt - 1);
        await this.delay(delay);
      }
    }
  }

  // Get retry delay based on error type and attempt
  getRetryDelay(errorType, attempt = 0) {
    const baseDelays = {
      network: [1000, 2000, 5000],
      transcription: [500, 1000, 2000],
      microphone: [1000, 2000, 3000],
      generic: [500, 1000, 2000]
    };

    const delays = baseDelays[errorType] || baseDelays.generic;
    return delays[Math.min(attempt, delays.length - 1)] || 1000;
  }

  // Increment error count for tracking
  incrementErrorCount(errorType) {
    const count = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, count + 1);
  }

  // Get error statistics
  getErrorStats() {
    return {
      counts: Object.fromEntries(this.errorCounts),
      totalErrors: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0)
    };
  }

  // Reset error counts
  resetErrorCounts() {
    this.errorCounts.clear();
  }

  // Handle async errors in promises
  async handleAsyncError(promise, context = {}) {
    try {
      return await promise;
    } catch (error) {
      return this.handleError(error, { ...context, async: true });
    }
  }

  // Create user-friendly error messages
  createUserMessage(error, context = {}) {
    const errorType = this.categorizeError(error);

    const messages = {
      api_key: 'Please configure your OpenAI API key in settings.',
      microphone: 'Please check your microphone connection and permissions.',
      network: 'Please check your internet connection and try again.',
      transcription: 'Transcription failed. Please try recording again.',
      hotkey: 'Hotkey registration failed. Try a different key combination.',
      permission: 'Required permissions are not granted.',
      generic: 'An error occurred. Please try again.'
    };

    return messages[errorType] || messages.generic;
  }

  // Log error for debugging
  logError(error, context = {}) {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      system: {
        platform: process.platform,
        version: process.version,
        uptime: process.uptime()
      }
    };

    console.error('Detailed error log:', JSON.stringify(errorInfo, null, 2));

    // In production, you might send this to a logging service
    // this.sendToLoggingService(errorInfo);
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Handle uncaught exceptions
  setupGlobalErrorHandlers() {
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.logError(error, { type: 'uncaught_exception' });

      // Show user-friendly notification
      notificationManager.showError(
        'Application Error',
        'An unexpected error occurred. The application may need to restart.',
        'Please save your work and restart Speak.'
      );
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.logError(reason, { type: 'unhandled_rejection' });
    });
  }

  // Clean up on app quit
  cleanup() {
    this.resetErrorCounts();
  }
}

module.exports = new ErrorHandler();