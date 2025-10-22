# Environment Configuration

## Required Variables

### OpenAI API Configuration
```bash
OPENAI_API_KEY=sk-...
```
**Description**: Your OpenAI API key for accessing Whisper transcription services
**Required**: Yes
**How to obtain**:
1. Create account at https://platform.openai.com/
2. Navigate to API Keys section
3. Create new secret key
4. Store securely (key is shown only once)

**Security Notes**:
- Never commit this key to version control
- Store in OS keychain or secure environment
- Application will use `electron-store` encryption for storage
- Rotate keys periodically for security

---

## Optional Variables

### Model Selection
```bash
WHISPER_MODEL=gpt-4o-transcribe
```
**Description**: Choose transcription model
**Default**: `gpt-4o-transcribe`
**Options**:
- `gpt-4o-transcribe` - High quality, balanced speed/cost
- `gpt-4o-mini-transcribe` - Faster, cheaper, slightly lower quality
- `gpt-4o-transcribe-diarize` - Speaker identification (meeting mode)
- `whisper-1` - Legacy Whisper model (broader parameter support)

### Audio Configuration
```bash
AUDIO_SAMPLE_RATE=16000
AUDIO_CHANNELS=1
AUDIO_FORMAT=wav
```
**Description**: Audio recording parameters
**Defaults**: 16kHz mono WAV (optimized for speech)

### API Request Configuration
```bash
OPENAI_API_TIMEOUT=30000
OPENAI_MAX_RETRIES=3
OPENAI_RETRY_DELAY=1000
```
**Description**: API client configuration
**Defaults**: 30s timeout, 3 retries, 1s delay between retries

### Application Behavior
```bash
HOTKEY_COMBINATION="Control+Meta"
AUTO_START=false
MINIMIZE_TO_TRAY=true
```
**Description**: User behavior preferences
**Defaults**:
- Hotkey: Ctrl+Win (Meta/Command)
- Auto-start: Disabled
- Minimize to tray: Enabled

### Logging & Debugging
```bash
LOG_LEVEL=info
DEBUG_MODE=false
ENABLE_TELEMETRY=false
```
**Description**: Development and diagnostics
**Defaults**: Info logging, debug off, telemetry opt-in only

---

## Setup Instructions

### First-Time Setup

#### Step 1: Install Application
- Download installer for your platform (Windows/Mac/Linux)
- Run installer and follow prompts
- Application will appear in system tray

#### Step 2: Configure API Key
1. Click system tray icon → "Settings"
2. Navigate to "API Configuration"
3. Enter your OpenAI API key
4. Click "Validate" to test connection
5. Save settings

#### Step 3: Test Functionality
1. Open any text editor or application
2. Place cursor where you want text inserted
3. Hold Ctrl+Win (or Command+Option on Mac)
4. Speak clearly into your microphone
5. Release keys when done
6. Transcribed text should appear within 2 seconds

#### Step 4: Customize Settings (Optional)
- **Model**: Choose transcription model (Settings → Model)
- **Language**: Set primary language (auto-detected by default)
- **Hotkey**: Customize activation keys (Settings → Hotkeys)
- **Dictionary**: Add custom words/acronyms (Settings → Dictionary)

### Development Setup

#### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- Git
- Platform-specific tools:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: build-essential, libasound2-dev

#### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/speak.git
cd speak

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your OpenAI API key to .env
echo "OPENAI_API_KEY=sk-..." >> .env

# Run development build
npm run dev
```

#### Development Scripts
```bash
npm run dev          # Start development mode with hot-reload
npm run build        # Build production bundle
npm run package      # Create platform-specific installer
npm run test         # Run test suite
npm run lint         # Check code quality
```

---

## Environment File Template

Create `.env` file in project root:

```bash
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional - Model Configuration
WHISPER_MODEL=gpt-4o-transcribe

# Optional - Audio Settings
AUDIO_SAMPLE_RATE=16000
AUDIO_CHANNELS=1
AUDIO_FORMAT=wav

# Optional - API Configuration
OPENAI_API_TIMEOUT=30000
OPENAI_MAX_RETRIES=3
OPENAI_RETRY_DELAY=1000

# Optional - Application Behavior
HOTKEY_COMBINATION=Control+Meta
AUTO_START=false
MINIMIZE_TO_TRAY=true

# Optional - Development
LOG_LEVEL=info
DEBUG_MODE=false
ENABLE_TELEMETRY=false
```

---

## Troubleshooting

### API Key Issues
- **Error**: "Invalid API key"
  - **Solution**: Verify key is correct, check for extra spaces
- **Error**: "Insufficient quota"
  - **Solution**: Add billing information to OpenAI account

### Audio Issues
- **Error**: "Microphone not detected"
  - **Solution**: Grant microphone permissions in OS settings
- **Error**: "Poor transcription quality"
  - **Solution**: Check microphone quality, reduce background noise, try gpt-4o-transcribe

### Hotkey Issues
- **Error**: "Hotkey not responding"
  - **Solution**: Check for conflicting hotkeys, try different combination
- **Error**: "Text not inserting"
  - **Solution**: Verify clipboard permissions, check active window focus

### Platform-Specific Issues
- **Windows**: Run as administrator if hotkey registration fails
- **macOS**: Grant accessibility permissions in System Preferences
- **Linux**: Install required audio libraries (libasound2, pulseaudio)

---

## Security Best Practices
1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment-specific keys** - Development vs Production
3. **Rotate API keys** - Periodically regenerate keys
4. **Monitor usage** - Check OpenAI dashboard for unexpected activity
5. **User data privacy** - Audio not stored unless explicitly enabled
6. **Encrypt settings** - Use `electron-store` encryption for sensitive data

---

## External Dependencies
- **OpenAI API**: https://platform.openai.com/docs/api-reference
- **Node.js**: https://nodejs.org/
- **Electron**: https://www.electronjs.org/
- **GitHub**: https://github.com/yourusername/speak
