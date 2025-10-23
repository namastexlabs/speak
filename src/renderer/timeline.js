const { ipcRenderer } = require('electron');

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Timeline UI loaded');
    initializeApp();
});

// Initialize application
async function initializeApp() {
    await loadSettings();
    await loadTranscriptionHistory();
    setupEventListeners();
    updateStats();
}

// Load settings from main process
async function loadSettings() {
    try {
        const settings = await ipcRenderer.invoke('get-settings');
        updateHotkeyDisplay(settings.hotkey);
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// Update hotkey display
function updateHotkeyDisplay(hotkey) {
    const display = hotkey
        .replace('Super', '⊞ Win')
        .replace('Command', '⌘')
        .replace('Control', 'Ctrl')
        .replace('Alt', 'Alt')
        .replace('Shift', '⇧');

    document.querySelectorAll('#hotkey-display, #empty-hotkey').forEach(el => {
        el.textContent = display;
    });
}

// Load transcription history
async function loadTranscriptionHistory() {
    try {
        const history = await ipcRenderer.invoke('get-history');

        if (!history || history.length === 0) {
            showEmptyState();
            return;
        }

        hideEmptyState();
        renderTimeline(history);
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

// Render timeline
function renderTimeline(history) {
    const today = history.today || [];
    const yesterday = history.yesterday || [];
    const thisWeek = history.thisWeek || [];

    // Render today's transcriptions
    if (today.length > 0) {
        renderSection('today-transcriptions', today);
    }

    // Render yesterday's transcriptions
    if (yesterday.length > 0) {
        document.getElementById('timeline-yesterday').classList.remove('hidden');
        renderSection('yesterday-transcriptions', yesterday);
    }

    // Render this week's transcriptions
    if (thisWeek.length > 0) {
        document.getElementById('timeline-week').classList.remove('hidden');
        renderSection('week-transcriptions', thisWeek);
    }
}

// Render a section of transcriptions
function renderSection(containerId, transcriptions) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    transcriptions.forEach(entry => {
        const card = createTranscriptionCard(entry);
        container.appendChild(card);
    });
}

// Create a transcription card element
function createTranscriptionCard(entry) {
    const card = document.createElement('div');
    card.className = 'card bg-base-100 shadow-sm hover:shadow-md transition-shadow timeline-entry';

    const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    card.innerHTML = `
        <div class="card-body p-4">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                    <p class="text-base-content/90 whitespace-pre-wrap">${escapeHtml(entry.text)}</p>
                </div>
                <div class="flex flex-col items-end gap-2 shrink-0">
                    <span class="text-xs opacity-50 font-mono">${time}</span>
                    <div class="badge badge-ghost badge-sm">${entry.wordCount} words</div>
                </div>
            </div>
        </div>
    `;

    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show empty state
function showEmptyState() {
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('timeline-today').classList.add('hidden');
    document.getElementById('timeline-yesterday').classList.add('hidden');
    document.getElementById('timeline-week').classList.add('hidden');
}

// Hide empty state
function hideEmptyState() {
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('timeline-today').classList.remove('hidden');
}

// Update stats
async function updateStats() {
    try {
        const stats = await ipcRenderer.invoke('get-stats');

        document.getElementById('total-words').textContent = formatNumber(stats.todayWords);
        document.getElementById('wpm').textContent = stats.avgWPM || 0;

        // Calculate streak (simplified)
        const streakWeeks = Math.floor(stats.totalTranscriptions / 50);
        document.getElementById('streak-count').textContent = `${streakWeeks} week${streakWeeks !== 1 ? 's' : ''}`;
    } catch (error) {
        console.error('Failed to update stats:', error);
    }
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Setup event listeners
function setupEventListeners() {
    // Listen for hotkey-triggered recording
    ipcRenderer.on('hotkey-start-recording', async () => {
        showRecordingStatus();
        await startRecording(true); // fromHotkey = true
    });

    ipcRenderer.on('hotkey-stop-recording', async () => {
        await stopRecording(true); // fromHotkey = true
        hideRecordingStatus();
    });

    // Listen for new transcription
    ipcRenderer.on('transcription-added', async (event, entry) => {
        await loadTranscriptionHistory();
        await updateStats();
    });
}

// Start recording
async function startRecording(fromHotkey = false) {
    try {
        await window.audioBridge.startRecording();
        await ipcRenderer.invoke('start-recording', { fromHotkey });
    } catch (error) {
        console.error('Failed to start recording:', error);
    }
}

// Stop recording
async function stopRecording(fromHotkey = false) {
    try {
        const audioData = await window.audioBridge.stopRecording();
        const result = await ipcRenderer.invoke('stop-recording', audioData, { fromHotkey });

        if (result.success) {
            console.log('Transcription completed:', result.text);
        }
    } catch (error) {
        console.error('Failed to stop recording:', error);
    }
}

// Show recording status
function showRecordingStatus() {
    document.getElementById('recording-status').classList.remove('hidden');
}

// Hide recording status
function hideRecordingStatus() {
    document.getElementById('recording-status').classList.add('hidden');
}

// Open settings
function openSettings() {
    ipcRenderer.invoke('open-settings');
}

// Open external URL
function openExternal(url) {
    ipcRenderer.invoke('open-external', url);
}

// Export for global access
window.openSettings = openSettings;
window.openExternal = openExternal;
