const robot = require('robotjs');
const { clipboard } = require('electron');

class TextInserter {
  constructor() {
    this.useRobotJs = true; // Default to robotjs, fallback to clipboard
  }

  // Insert text at cursor position
  async insertText(text) {
    if (!text || text.trim().length === 0) {
      console.warn('No text to insert');
      return { success: false, error: 'No text provided' };
    }

    try {
      // Try robotjs first (direct keyboard simulation)
      if (this.useRobotJs) {
        const result = await this.insertWithRobotJs(text);
        if (result.success) {
          return result;
        }
        console.warn('RobotJs insertion failed, falling back to clipboard');
      }

      // Fallback to clipboard method
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

  // Insert text using robotjs (direct keyboard simulation)
  async insertWithRobotJs(text) {
    try {
      // Small delay to ensure focus is ready
      await this.delay(100);

      // Type the text character by character
      // This preserves cursor position and works in any application
      robot.typeString(text);

      // Small delay after typing
      await this.delay(50);

      console.log(`Inserted text with robotjs: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      return {
        success: true,
        method: 'robotjs',
        characters: text.length
      };

    } catch (error) {
      console.error('RobotJs insertion failed:', error);
      return {
        success: false,
        error: error.message,
        method: 'robotjs'
      };
    }
  }

  // Insert text using clipboard (fallback method)
  async insertWithClipboard(text) {
    try {
      // Store current clipboard content
      const originalClipboard = clipboard.readText();

      // Copy text to clipboard
      clipboard.writeText(text);

      // Small delay
      await this.delay(50);

      // Simulate Ctrl+V (or Cmd+V on Mac)
      const modifier = process.platform === 'darwin' ? 'command' : 'control';
      robot.keyTap('v', modifier);

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

  // Test if robotjs is working
  async testRobotJs() {
    try {
      // Try to get screen size as a basic functionality test
      const screenSize = robot.getScreenSize();
      return {
        available: true,
        screenSize: screenSize
      };
    } catch (error) {
      console.warn('RobotJs not available:', error);
      return {
        available: false,
        error: error.message
      };
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
    const robotjsTest = await this.testRobotJs();
    const clipboardTest = await this.testClipboard();

    return {
      robotjs: robotjsTest,
      clipboard: clipboardTest,
      preferred: robotjsTest.available ? 'robotjs' : 'clipboard'
    };
  }

  // Set preferred insertion method
  setPreferredMethod(method) {
    if (method === 'robotjs') {
      this.useRobotJs = true;
    } else if (method === 'clipboard') {
      this.useRobotJs = false;
    } else {
      console.warn('Invalid insertion method:', method);
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
  async insertTextAdvanced(text, options = {}) {
    const sanitizedText = this.sanitizeText(text);

    if (options.delayBetweenChars) {
      // Type with delays between characters (slower but more compatible)
      return await this.insertWithDelays(sanitizedText, options.delayBetweenChars);
    } else {
      // Normal insertion
      return await this.insertText(sanitizedText);
    }
  }

  // Insert text with delays between characters
  async insertWithDelays(text, delayMs = 10) {
    try {
      for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // Handle special characters
        if (char === '\n') {
          robot.keyTap('enter');
        } else if (char === '\t') {
          robot.keyTap('tab');
        } else {
          robot.typeString(char);
        }

        if (delayMs > 0) {
          await this.delay(delayMs);
        }
      }

      return {
        success: true,
        method: 'robotjs-delayed',
        characters: text.length
      };

    } catch (error) {
      console.error('Delayed insertion failed:', error);
      return {
        success: false,
        error: error.message,
        method: 'robotjs-delayed'
      };
    }
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