const Store = require('electron-store');
const { OpenAI } = require('openai');

// Initialize electron-store with schema validation
const store = new Store({
  schema: {
    apiKey: {
      type: 'string',
      default: ''
    },
    audioDevice: {
      type: 'string',
      default: 'default'
    },
    hotkey: {
      type: 'string',
      default: 'R'
    },
    language: {
      type: 'string',
      default: 'en'
    },
    theme: {
      type: 'string',
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    firstRun: {
      type: 'boolean',
      default: true
    }
  },
  name: 'speak-settings',
  encryptionKey: 'speak-secure-storage-key' // Basic encryption for API key
});

class SettingsManager {
  constructor() {
    this.store = store;
    this.openai = null;
    this.loadEnvApiKey();
    this.initializeOpenAI();
  }

  // Load API key from .env file if present and no key is stored
  loadEnvApiKey() {
    const storedKey = store.get('apiKey');
    const envKey = process.env.OPENAI_API_KEY;

    // If .env has a key and no key is stored, use the .env key
    if (envKey && !storedKey) {
      console.log('Loading OpenAI API key from .env file');
      store.set('apiKey', envKey);
    }
  }

  // Initialize OpenAI client with current API key
  initializeOpenAI() {
    const apiKey = this.getApiKey();
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey
      });
    } else {
      this.openai = null;
    }
  }

  // Get API key
  getApiKey() {
    return store.get('apiKey');
  }

  // Set API key and reinitialize OpenAI client
  setApiKey(apiKey) {
    store.set('apiKey', apiKey);
    this.initializeOpenAI();
  }

  // Validate API key by making a test request
  async validateApiKey(apiKey = null) {
    // Use provided key or fall back to stored key
    const keyToTest = apiKey || this.getApiKey();

    if (!keyToTest) {
      return { valid: false, error: 'No API key configured' };
    }

    try {
      // Create a temporary OpenAI client to test the key
      const testClient = new OpenAI({ apiKey: keyToTest });

      // Make a minimal test request to validate the key
      await testClient.models.list();
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error.message || 'Invalid API key'
      };
    }
  }

  // Check if API key is configured (without exposing it)
  hasApiKey() {
    return !!this.getApiKey();
  }

  // Get all settings
  getAll() {
    return {
      apiKey: this.getApiKey() ? '***configured***' : '', // Don't expose actual key
      audioDevice: store.get('audioDevice'),
      hotkey: store.get('hotkey'),
      language: store.get('language'),
      theme: store.get('theme'),
      firstRun: store.get('firstRun')
    };
  }

  // Update settings
  updateSettings(settings) {
    const { apiKey, audioDevice, hotkey, language, theme, firstRun } = settings;

    if (apiKey !== undefined) {
      this.setApiKey(apiKey);
    }
    if (audioDevice !== undefined) {
      store.set('audioDevice', audioDevice);
    }
    if (hotkey !== undefined) {
      store.set('hotkey', hotkey);
    }
    if (language !== undefined) {
      store.set('language', language);
    }
    if (theme !== undefined) {
      store.set('theme', theme);
    }
    if (firstRun !== undefined) {
      store.set('firstRun', firstRun);
    }
  }

  // Get OpenAI client instance
  getOpenAI() {
    return this.openai;
  }

  // Check if app is configured for first use
  isFirstRun() {
    return store.get('firstRun');
  }

  // Mark first run as complete
  completeFirstRun() {
    store.set('firstRun', false);
  }

  // Get supported languages for Whisper
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'nl', name: 'Dutch' },
      { code: 'sv', name: 'Swedish' },
      { code: 'da', name: 'Danish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'fi', name: 'Finnish' },
      { code: 'pl', name: 'Polish' },
      { code: 'tr', name: 'Turkish' },
      { code: 'he', name: 'Hebrew' },
      { code: 'th', name: 'Thai' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'id', name: 'Indonesian' },
      { code: 'ms', name: 'Malay' },
      { code: 'tl', name: 'Tagalog' }
    ];
  }
}

module.exports = new SettingsManager();