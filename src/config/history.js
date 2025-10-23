const Store = require('electron-store');
const { app } = require('electron');

// Transcription history manager
const historyStore = new Store({
  cwd: app.getPath('userData'),
  name: 'speak-history',
  schema: {
    transcriptions: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          wordCount: { type: 'number' },
          timestamp: { type: 'number' },
          duration: { type: 'number' }, // recording duration in ms
          language: { type: 'string' }
        }
      }
    }
  }
});

class TranscriptionHistory {
  constructor() {
    this.store = historyStore;
  }

  // Add a new transcription to history
  add(transcription) {
    const entry = {
      id: Date.now().toString(),
      text: transcription.text,
      wordCount: transcription.text.trim().split(/\s+/).filter(w => w.length > 0).length,
      timestamp: Date.now(),
      duration: transcription.duration || 0,
      language: transcription.language || 'en'
    };

    const history = this.store.get('transcriptions') || [];
    history.unshift(entry); // Add to beginning

    // Keep only last 1000 transcriptions
    if (history.length > 1000) {
      history.splice(1000);
    }

    this.store.set('transcriptions', history);
    return entry;
  }

  // Get all transcriptions
  getAll() {
    return this.store.get('transcriptions') || [];
  }

  // Get transcriptions from today
  getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    return this.getAll().filter(t => t.timestamp >= todayTimestamp);
  }

  // Get transcriptions from yesterday
  getYesterday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTimestamp = yesterday.getTime();

    return this.getAll().filter(t =>
      t.timestamp >= yesterdayTimestamp && t.timestamp < todayTimestamp
    );
  }

  // Get transcriptions grouped by date
  getGroupedByDate() {
    const all = this.getAll();
    const grouped = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - (24 * 60 * 60 * 1000);
    const thisWeek = today - (7 * 24 * 60 * 60 * 1000);

    all.forEach(t => {
      if (t.timestamp >= today) {
        grouped.today.push(t);
      } else if (t.timestamp >= yesterday) {
        grouped.yesterday.push(t);
      } else if (t.timestamp >= thisWeek) {
        grouped.thisWeek.push(t);
      } else {
        grouped.older.push(t);
      }
    });

    return grouped;
  }

  // Get statistics
  getStats() {
    const all = this.getAll();
    const today = this.getToday();

    const totalWords = all.reduce((sum, t) => sum + t.wordCount, 0);
    const todayWords = today.reduce((sum, t) => sum + t.wordCount, 0);

    // Calculate WPM (words per minute) average
    const totalDuration = all.reduce((sum, t) => sum + (t.duration || 0), 0);
    const avgWPM = totalDuration > 0 ? Math.round((totalWords / (totalDuration / 1000 / 60))) : 0;

    return {
      totalTranscriptions: all.length,
      todayTranscriptions: today.length,
      totalWords,
      todayWords,
      avgWPM
    };
  }

  // Delete a transcription
  delete(id) {
    const history = this.getAll().filter(t => t.id !== id);
    this.store.set('transcriptions', history);
  }

  // Clear all history
  clear() {
    this.store.set('transcriptions', []);
  }

  // Search transcriptions
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(t =>
      t.text.toLowerCase().includes(lowerQuery)
    );
  }
}

module.exports = new TranscriptionHistory();
