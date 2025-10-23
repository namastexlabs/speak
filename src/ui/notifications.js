const { Notification, app, shell } = require('electron');

class NotificationManager {
  constructor() {
    this.notifications = new Map();
    this.notificationId = 0;
  }

  // Check if notifications are supported
  isSupported() {
    return Notification.isSupported();
  }

  // Request notification permission (if needed)
  async requestPermission() {
    if (!this.isSupported()) {
      return { granted: false, error: 'Notifications not supported on this system' };
    }

    // On some platforms, permissions are granted automatically
    // On others, we might need to request them
    return { granted: true };
  }

  // Show a basic notification
  show(options) {
    if (!this.isSupported()) {
      console.warn('Notifications not supported, logging instead:', options.body);
      return null;
    }

    const notificationOptions = {
      title: options.title || 'Speak',
      body: options.body || '',
      icon: options.icon,
      silent: options.silent || false,
      urgency: options.urgency || 'normal', // low, normal, critical
      timeoutType: options.timeoutType || 'default', // default, never
      ...options
    };

    try {
      const notification = new Notification(notificationOptions);

      // Generate unique ID
      const id = ++this.notificationId;
      this.notifications.set(id, notification);

      // Handle click events
      if (options.onClick) {
        notification.on('click', () => {
          options.onClick();
        });
      }

      // Handle close events
      notification.on('close', () => {
        this.notifications.delete(id);
      });

      // Show the notification
      notification.show();

      // Auto-close after specified duration
      if (options.duration && options.duration > 0) {
        setTimeout(() => {
          notification.close();
        }, options.duration);
      }

      return {
        id: id,
        notification: notification,
        success: true
      };

    } catch (error) {
      console.error('Failed to show notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Show recording started notification
  showRecordingStarted() {
    return this.show({
      title: 'Speak - Recording Started',
      body: 'Hold your hotkey to continue recording, release to transcribe',
      icon: this.getIconPath('recording'),
      silent: true,
      urgency: 'normal',
      duration: 3000
    });
  }

  // Show recording stopped notification
  showRecordingStopped() {
    return this.show({
      title: 'Speak - Recording Stopped',
      body: 'Transcribing your voice...',
      icon: this.getIconPath('processing'),
      silent: true,
      urgency: 'normal',
      duration: 2000
    });
  }

  // Show transcription completed notification
  showTranscriptionCompleted(text, wordCount) {
    const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;

    return this.show({
      title: 'Speak - Text Inserted',
      body: `${wordCount} words inserted: "${preview}"`,
      icon: this.getIconPath('success'),
      silent: true,
      urgency: 'low',
      duration: 4000,
      onClick: () => {
        // Could focus the application or show the text
        console.log('Transcription notification clicked');
      }
    });
  }

  // Show error notification
  showError(title, message, details = '') {
    const body = details ? `${message}\n${details}` : message;

    return this.show({
      title: `Speak - ${title}`,
      body: body,
      icon: this.getIconPath('error'),
      silent: false,
      urgency: 'critical',
      timeoutType: 'never', // Don't auto-close error notifications
      onClick: () => {
        // Could open settings or show help
        console.log('Error notification clicked');
      }
    });
  }

  // Show API key required notification
  showApiKeyRequired() {
    return this.show({
      title: 'Speak - Setup Required',
      body: 'Please configure your OpenAI API key in settings to start using voice dictation',
      icon: this.getIconPath('warning'),
      silent: false,
      urgency: 'normal',
      timeoutType: 'never',
      onClick: () => {
        // Emit event to open settings
        if (global.mainWindow) {
          global.mainWindow.webContents.send('open-settings');
        }
      }
    });
  }

  // Show microphone permission required notification
  showMicrophonePermissionRequired() {
    return this.show({
      title: 'Speak - Microphone Access Required',
      body: 'Please grant microphone permission to use voice dictation',
      icon: this.getIconPath('warning'),
      silent: false,
      urgency: 'critical',
      timeoutType: 'never',
      onClick: () => {
        // Could open system settings
        this.openSystemPrivacySettings();
      }
    });
  }

  // Show welcome notification for first run
  showWelcome() {
    return this.show({
      title: 'Welcome to Speak!',
      body: 'Your open source voice dictation app is ready. Click here to configure your settings.',
      icon: this.getIconPath('welcome'),
      silent: false,
      urgency: 'normal',
      duration: 5000,
      onClick: () => {
        if (global.mainWindow) {
          global.mainWindow.webContents.send('open-settings');
        }
      }
    });
  }

  // Show update available notification
  showUpdateAvailable(version) {
    return this.show({
      title: 'Speak - Update Available',
      body: `Version ${version} is available. Click to download.`,
      icon: this.getIconPath('update'),
      silent: false,
      urgency: 'normal',
      timeoutType: 'never',
      onClick: () => {
        // Open download URL
        shell.openExternal('https://github.com/namastexlabs/speak/releases');
      }
    });
  }

  // Get icon path for notifications
  getIconPath(type) {
    // In a real app, you'd have different icons for different notification types
    // For now, return a default icon path or null
    try {
      const path = require('path');
      const iconName = `notification-${type}.png`;
      const iconPath = path.join(__dirname, '../../assets/icons', iconName);

      if (require('fs').existsSync(iconPath)) {
        return iconPath;
      }
    } catch (error) {
      // Continue to fallback
    }

    // Fallback: return null (system default icon)
    return null;
  }

  // Open system privacy settings (platform-specific)
  openSystemPrivacySettings() {
    const { shell } = require('electron');

    try {
      if (process.platform === 'darwin') {
        // macOS: Open System Preferences > Security & Privacy > Privacy > Microphone
        shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone');
      } else if (process.platform === 'win32') {
        // Windows: Open Settings > Privacy > Microphone
        shell.openExternal('ms-settings:privacy-microphone');
      } else {
        // Linux: This varies by desktop environment
        console.log('Please check your system settings to grant microphone permission');
      }
    } catch (error) {
      console.warn('Failed to open system privacy settings:', error);
    }
  }

  // Close a specific notification
  close(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.close();
      this.notifications.delete(notificationId);
    }
  }

  // Close all notifications
  closeAll() {
    for (const [id, notification] of this.notifications) {
      notification.close();
    }
    this.notifications.clear();
  }

  // Get notification statistics
  getStats() {
    return {
      supported: this.isSupported(),
      activeCount: this.notifications.size,
      totalShown: this.notificationId
    };
  }

  // Set up notification event handlers
  setupEventHandlers(mainWindow) {
    // Store reference to main window for notifications that need it
    global.mainWindow = mainWindow;

    // Handle notification actions from renderer
    if (mainWindow) {
      mainWindow.webContents.on('show-notification', (event, options) => {
        this.show(options);
      });
    }
  }

  // Clean up on app quit
  cleanup() {
    this.closeAll();
  }
}

module.exports = new NotificationManager();