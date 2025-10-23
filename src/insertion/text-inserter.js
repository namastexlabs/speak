const { clipboard } = require('electron');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class TextInserter {
  constructor() {
    this.platform = process.platform;
  }

  // Insert text at cursor position
  async insertText(text) {
    if (!text || text.trim().length === 0) {
      console.warn('No text to insert');
      return { success: false, error: 'No text provided' };
    }

    try {
      // Use clipboard method with platform-specific paste simulation
      return await this.insertWithClipboard(text);

    } catch (error) {
      console.error('Text insertion failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown insertion error',
        method: 'none'
      };
    }
  }

  // Insert text using clipboard with platform-specific paste
  async insertWithClipboard(text) {
    try {
      // Store current clipboard content
      const originalClipboard = clipboard.readText();

      // Copy text to clipboard
      clipboard.writeText(text);

      // Small delay to ensure clipboard is ready
      await this.delay(100);

      // Simulate paste based on platform
      await this.simulatePaste();

      // Restore original clipboard content after a delay
      setTimeout(() => {
        try {
          clipboard.writeText(originalClipboard);
        } catch (error) {
          console.warn('Failed to restore clipboard:', error);
        }
      }, 500);

      console.log(`Inserted text with clipboard: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      return {
        success: true,
        method: 'clipboard',
        characters: text.length
      };

    } catch (error) {
      console.error('Clipboard insertion failed:', error);
      return {
        success: false,
        error: error.message,
        method: 'clipboard'
      };
    }
  }

  // Simulate paste using platform-specific tools
  async simulatePaste() {
    try {
      if (this.platform === 'linux') {
        // Use xdotool on Linux
        await execAsync('xdotool key ctrl+v');
      } else if (this.platform === 'darwin') {
        // Use AppleScript on macOS
        await execAsync('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
      } else if (this.platform === 'win32') {
        // Use PowerShell on Windows
        await execAsync('powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^v\')"');
      }

      // Small delay after paste
      await this.delay(50);

    } catch (error) {
      console.error('Failed to simulate paste:', error);
      throw new Error(`Paste simulation failed: ${error.message}`);
    }
  }

  // Test if clipboard is available
  async testClipboard() {
    try {
      const testText = 'test-clipboard-' + Date.now();
      clipboard.writeText(testText);
      const readText = clipboard.readText();
      return {
        available: readText === testText
      };
    } catch (error) {
      console.warn('Clipboard not available:', error);
      return {
        available: false,
        error: error.message
      };
    }
  }

  // Get insertion capabilities
  async getCapabilities() {
    const clipboardTest = await this.testClipboard();
    const pasteTest = await this.testPaste();

    return {
      clipboard: clipboardTest,
      paste: pasteTest,
      preferred: 'clipboard'
    };
  }

  // Test paste simulation
  async testPaste() {
    try {
      // Test if the required tool is available
      if (this.platform === 'linux') {
        await execAsync('which xdotool');
        return { available: true, tool: 'xdotool' };
      } else if (this.platform === 'darwin') {
        return { available: true, tool: 'osascript' };
      } else if (this.platform === 'win32') {
        return { available: true, tool: 'powershell' };
      }
      return { available: false, error: 'Unknown platform' };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        suggestion: this.platform === 'linux' ? 'Install xdotool: sudo apt-get install xdotool' : null
      };
    }
  }

  // Handle special characters and formatting
  sanitizeText(text) {
    if (!text) return '';

    // Handle common issues:
    // - Trim whitespace
    // - Normalize line endings
    // - Handle special characters that might cause issues

    return text
      .trim()
      .replace(/\r\n/g, '\n') // Normalize Windows line endings
      .replace(/\r/g, '\n'); // Normalize old Mac line endings
  }

  // Insert text with special handling
  async insertTextAdvanced(text) {
    const sanitizedText = this.sanitizeText(text);
    // Advanced insertion just uses regular clipboard method
    return await this.insertText(sanitizedText);
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Handle platform-specific key combinations
  getPlatformModifier() {
    return process.platform === 'darwin' ? 'command' : 'control';
  }
}

module.exports = new TextInserter();