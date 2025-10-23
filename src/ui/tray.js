const { Tray, Menu, app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');

class SystemTray {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.tray = null;
    this.isRecording = false;
    this.createTray();
  }

  // Create system tray icon
  createTray() {
    try {
      // Create tray icon
      const iconPath = this.getTrayIcon();
      this.tray = new Tray(iconPath);

      // Set tooltip
      this.tray.setToolTip('Speak - Voice Dictation');

      // Create context menu
      this.updateContextMenu();

      // Handle tray click events
      this.tray.on('click', () => {
        this.handleTrayClick();
      });

      // Handle double-click
      this.tray.on('double-click', () => {
        this.showMainWindow();
      });

      console.log('System tray created successfully');

    } catch (error) {
      console.error('Failed to create system tray:', error);
    }
  }

  // Get appropriate tray icon based on platform and state
  getTrayIcon() {
    const iconName = this.isRecording ? 'tray-recording.png' : 'tray-normal.png';

    // Try to find icon in different locations
    const possiblePaths = [
      path.join(__dirname, '../../assets/icons', iconName),
      path.join(__dirname, '../assets/icons', iconName),
      path.join(process.resourcesPath, 'assets/icons', iconName),
      // Fallback to a simple text-based icon
    ];

    for (const iconPath of possiblePaths) {
      try {
        if (require('fs').existsSync(iconPath)) {
          return iconPath;
        }
      } catch (error) {
        // Continue to next path
      }
    }

    // Fallback: create a simple icon programmatically
    return this.createFallbackIcon();
  }

  // Create a fallback tray icon
  createFallbackIcon() {
    const size = process.platform === 'darwin' ? 22 : 16;
    const icon = nativeImage.createEmpty();

    // Create a simple colored square as fallback
    // In a real app, you'd include proper icon files
    return icon;
  }

  // Update context menu based on current state
  updateContextMenu() {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: this.isRecording ? '🔴 Recording...' : '🎙️ Ready to Record',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Show Speak',
        click: () => this.showMainWindow()
      },
      {
        label: 'Settings',
        click: () => this.openSettings()
      },
      { type: 'separator' },
      {
        label: 'About Speak',
        click: () => this.showAbout()
      },
      {
        label: 'Quit Speak',
        click: () => app.quit()
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  // Handle tray click
  handleTrayClick() {
    // On Windows/Linux, single click shows context menu
    // On macOS, single click might show main window
    if (process.platform === 'darwin') {
      this.showMainWindow();
    }
    // On other platforms, context menu appears automatically
  }

  // Show main window
  showMainWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  // Open settings window
  openSettings() {
    // This will be handled by the main process
    // Send IPC message to open settings
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('open-settings');
    }
  }

  // Show about dialog
  showAbout() {
    const { dialog } = require('electron');
    dialog.showMessageBox(null, {
      type: 'info',
      title: 'About Speak',
      message: 'Speak - Open Source Voice Dictation',
      detail: `Version 0.1.0\n\nYour voice, your data, your control.\nOpen source voice dictation for everyone.\n\nPlatform: ${process.platform}`,
      buttons: ['OK'],
      icon: this.getTrayIcon()
    });
  }

  // Update recording state
  setRecordingState(isRecording) {
    const wasRecording = this.isRecording;
    this.isRecording = isRecording;

    // Update tray icon if state changed
    if (wasRecording !== isRecording) {
      try {
        const newIcon = this.getTrayIcon();
        this.tray.setImage(newIcon);
      } catch (error) {
        console.warn('Failed to update tray icon:', error);
      }

      // Update context menu
      this.updateContextMenu();

      // Show notification for state change
      this.showRecordingNotification(isRecording);
    }
  }

  // Show recording state notification
  showRecordingNotification(isRecording) {
    const { Notification } = require('electron');

    if (Notification.isSupported()) {
      const notification = new Notification({
        title: 'Speak Voice Dictation',
        body: isRecording ? 'Recording started...' : 'Recording stopped',
        icon: this.getTrayIcon(),
        silent: true // Don't play sound for these notifications
      });

      notification.show();

      // Auto-hide after 2 seconds
      setTimeout(() => {
        notification.close();
      }, 2000);
    }
  }

  // Get current tray status
  getStatus() {
    return {
      isRecording: this.isRecording,
      hasTray: this.tray !== null
    };
  }

  // Clean up tray on app quit
  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  // Handle platform-specific tray behavior
  handlePlatformSpecifics() {
    if (process.platform === 'darwin') {
      // macOS specific behavior
      app.dock.hide(); // Hide dock icon since we have tray
    } else if (process.platform === 'win32') {
      // Windows specific behavior
      // Tray works well by default
    } else {
      // Linux specific behavior
      // May need additional handling for different desktop environments
    }
  }

  // Set custom tray icon (for themes or custom icons)
  setCustomIcon(iconPath) {
    if (this.tray && require('fs').existsSync(iconPath)) {
      try {
        this.tray.setImage(iconPath);
      } catch (error) {
        console.warn('Failed to set custom tray icon:', error);
      }
    }
  }

  // Flash tray icon (for alerts)
  flashIcon(duration = 500, times = 3) {
    if (!this.tray) return;

    const normalIcon = this.getTrayIcon();
    let flashCount = 0;

    const flash = () => {
      if (flashCount >= times * 2) return;

      try {
        if (flashCount % 2 === 0) {
          // Create a highlighted version (you'd have a different icon)
          this.tray.setImage(normalIcon);
        } else {
          this.tray.setImage(normalIcon);
        }
      } catch (error) {
        console.warn('Failed to flash tray icon:', error);
      }

      flashCount++;
      setTimeout(flash, duration);
    };

    flash();
  }
}

module.exports = SystemTray;