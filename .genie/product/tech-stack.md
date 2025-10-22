# Tech Stack

## Core Technologies

### Language & Runtime
- **Node.js**: Primary runtime environment
- **TypeScript**: Type-safe development (if applicable)
- **JavaScript**: Alternative for rapid prototyping

### Voice Processing
- **OpenAI Whisper API**: Primary transcription engine
  - `gpt-4o-transcribe`: Standard transcription (high quality)
  - `gpt-4o-mini-transcribe`: Faster/cheaper alternative
  - `gpt-4o-transcribe-diarize`: Speaker identification for meetings (Phase 1)

### Desktop Framework
- **Electron**: Cross-platform desktop application (recommended)
  - Global hotkey registration
  - System tray integration
  - Native text injection
- **Tauri**: Lightweight alternative (Rust + WebView)

### Frontend (if using web-based UI)
- **React**: UI component library (or Svelte/Vue as alternatives)
- **Tailwind CSS**: Styling framework
- **Framer Motion**: Animations for visual feedback

### Audio Handling
- **node-record-lpcm16**: Audio recording from microphone
- **sox**: Audio format conversion and processing
- **Web Audio API**: Browser-based audio capture

### System Integration
- **robotjs** or **nut.js**: Cross-platform keyboard automation
- **global-hotkey**: Global keyboard listener
- **active-win**: Detect active application for context

### Storage
- **electron-store**: Settings and preferences persistence
- **SQLite** or **lowdb**: Local database for snippets/dictionary
- **IndexedDB**: Browser-based storage alternative

## Architecture

### Application Layers
```
┌─────────────────────────────────────┐
│   Presentation Layer (Electron/UI)  │
│   - System tray                     │
│   - Settings panel                  │
│   - Statistics dashboard            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Business Logic Layer              │
│   - Hotkey manager                  │
│   - Recording controller            │
│   - Transcription service           │
│   - Text injection                  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Integration Layer                 │
│   - OpenAI API client               │
│   - Audio capture                   │
│   - OS clipboard/keyboard           │
│   - Local storage                   │
└─────────────────────────────────────┘
```

### Key Components
1. **Hotkey Manager**: Listens for Ctrl+Win, manages recording state
2. **Audio Recorder**: Captures microphone input, handles VAD (Voice Activity Detection)
3. **Transcription Client**: Manages OpenAI API calls, handles streaming/batching
4. **Text Injector**: Inserts transcribed text at cursor position
5. **Settings Manager**: Persists user preferences, API keys, customizations
6. **Statistics Tracker**: Records usage data (words, time, WPM)

## Dependencies

### Production Dependencies
```json
{
  "openai": "^4.x",
  "electron": "^28.x",
  "electron-store": "^8.x",
  "robotjs": "^0.6.x",
  "node-record-lpcm16": "^1.x",
  "global-hotkey": "^1.x"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.x",
  "electron-builder": "^24.x",
  "eslint": "^8.x",
  "prettier": "^3.x"
}
```

## Infrastructure

### Development
- **Git**: Version control
- **GitHub**: Repository hosting
- **GitHub Actions**: CI/CD pipeline
- **Genie Forge**: Task orchestration

### Distribution
- **electron-builder**: App packaging and installers
- **GitHub Releases**: Binary distribution
- **Auto-update**: Electron's built-in updater

### Monitoring (Future)
- **Sentry**: Error tracking
- **PostHog**: Product analytics (privacy-respecting)

## Security Considerations
- API keys stored securely in OS keychain (electron-store encryption)
- No server-side components (client-side only)
- User controls their own OpenAI API account
- Audio data never stored permanently (unless user opts in)
- HTTPS for all API communications

## Platform Support
- **Primary**: Windows 10/11, macOS 12+, Linux (Ubuntu 20.04+)
- **Architecture**: x64, ARM64 (M1/M2 Macs)
