# Getting Started with Speak

## 🚀 Quick Start (2 minutes)

1. **Download** the installer for your platform
2. **Install** Speak
3. **Configure** your microphone and hotkey
4. **Add API key** (optional for offline mode)
5. **Start dictating** with Ctrl+Win

That's it! You're ready to dictate.

## 📥 Installation

### Windows

#### Option 1: Installer (Recommended)
1. Download `Speak-Setup.exe` from [releases](https://github.com/yourusername/speak/releases)
2. Run the installer as administrator
3. Follow the setup wizard
4. Launch Speak from the Start menu

#### Option 2: Portable Version
1. Download `Speak-Portable.zip`
2. Extract to any folder
3. Run `Speak.exe`

#### Windows Requirements
- Windows 10 or later (64-bit)
- Microphone (built-in or external)
- Internet connection (for cloud mode)

### macOS

#### Option 1: DMG Installer
1. Download `Speak.dmg` from [releases](https://github.com/yourusername/speak/releases)
2. Open the DMG file
3. Drag Speak to Applications folder
4. Launch Speak from Applications

#### Option 2: Homebrew
```bash
brew install --cask speak
```

#### macOS Requirements
- macOS 11.0 or later
- Microphone permissions (granted automatically)
- Internet connection (for cloud mode)

#### First Launch Setup
On first run, macOS will ask for:
- **Microphone access**: Click "Allow"
- **Accessibility access**: Go to System Settings → Privacy & Security → Accessibility → Enable Speak

### Linux

#### Option 1: AppImage (Recommended)
1. Download `Speak.AppImage` from [releases](https://github.com/yourusername/speak/releases)
2. Make it executable: `chmod +x Speak.AppImage`
3. Run: `./Speak.AppImage`

#### Option 2: Debian/Ubuntu
```bash
# Add our repository
echo "deb [signed-by=/usr/share/keyrings/speak.gpg] https://repo.speak.ai/apt stable main" | sudo tee /etc/apt/sources.list.d/speak.list

# Install
sudo apt update && sudo apt install speak
```

#### Option 3: Arch Linux
```bash
yay -S speak-bin
```

#### Option 4: Build from Source
```bash
git clone https://github.com/yourusername/speak.git
cd speak
npm install
npm run build
npm start
```

#### Linux Requirements
- Ubuntu 18.04+, Fedora 30+, or Arch Linux
- PulseAudio or PipeWire
- Microphone access
- Internet connection (for cloud mode)

## 🎙️ Microphone Setup

### Testing Your Microphone

1. Open Speak settings (system tray icon → Settings)
2. Go to "Audio" tab
3. Click "Test Microphone"
4. Speak clearly: "Testing one two three"
5. Check that the audio levels show activity

### Microphone Recommendations

#### For Quiet Environments
- Built-in laptop microphone (usually sufficient)
- USB conference microphone ($20-50)

#### For Noisy Environments
- Noise-cancelling USB microphone (Blue Yeti, Audio-Technica AT2020)
- Lavalier/lapel microphone with preamp
- Professional USB audio interface

### Audio Settings Optimization

#### Sample Rate: 16kHz
Speak works best at 16kHz sample rate for Whisper model compatibility.

#### Channels: Mono
Single channel (mono) recording is recommended for voice dictation.

#### Bit Depth: 16-bit
16-bit audio provides the best balance of quality and file size.

## ⚡ Hotkey Configuration

### Default Hotkey: Ctrl+Win

**How to use:**
1. Position cursor where you want text to appear
2. Hold **Ctrl+Win** (both keys together)
3. Start speaking clearly
4. Release keys when done
5. Text appears instantly

### Changing the Hotkey

1. Open Speak settings
2. Go to "Hotkey" tab
3. Click "Change Hotkey"
4. Press your desired key combination
5. Test the new hotkey

### Hotkey Tips

- **Use both modifier keys**: Ctrl+Win works reliably across applications
- **Avoid common shortcuts**: Don't use Ctrl+C, Ctrl+V, etc.
- **Test in different apps**: Make sure it works where you need it
- **Backup option**: Set Ctrl+Alt+Space as secondary hotkey

## 🔑 API Configuration (Optional)

### Why You Need an API Key
- **Cloud mode**: Higher accuracy, faster processing
- **Offline mode**: Coming soon (no API key needed)

### Getting an OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (keep it secure!)

### Adding Your API Key to Speak
1. Open Speak settings
2. Go to "API" tab
3. Paste your API key
4. Click "Validate"
5. Select your preferred model

### Model Options
- **gpt-4o-transcribe**: Highest accuracy (recommended)
- **gpt-4o-mini-transcribe**: Faster, cheaper
- **gpt-4o-transcribe-diarize**: Meeting mode with speaker identification

## 🧪 Testing Speak

### Basic Test
1. Open any text editor (Notepad, TextEdit, etc.)
2. Position cursor in empty document
3. Hold Ctrl+Win and say: "Hello world, this is Speak working perfectly."
4. Release keys
5. Check that text appeared

### Advanced Test
1. Open your favorite application (Word, browser, email, etc.)
2. Navigate to a text field
3. Dictate a longer paragraph
4. Test different speaking speeds and volumes

## 🔧 Troubleshooting

### Text Not Appearing
- **Check hotkey**: Make sure you're holding both keys
- **Cursor position**: Click where you want text to appear first
- **Application focus**: Make sure target app is active
- **Permissions**: Verify microphone and accessibility permissions

### Poor Audio Quality
- **Microphone selection**: Try different microphone in settings
- **Background noise**: Move to quieter location
- **Microphone position**: Speak closer to microphone
- **Test recording**: Use audio settings to verify input

### High Latency
- **Internet connection**: Faster connection = lower latency
- **Model selection**: Try gpt-4o-mini for speed
- **Audio length**: Shorter phrases process faster
- **System resources**: Close other applications

### Permission Issues

#### Windows
- Settings → Privacy → Microphone → Allow apps to access microphone
- Enable "Allow desktop apps to access microphone"

#### macOS
- System Settings → Privacy & Security → Microphone → Enable Speak
- System Settings → Privacy & Security → Accessibility → Enable Speak

#### Linux
- Check PulseAudio/PipeWire permissions
- Run: `pactl list sources` to verify microphone detection

## 📚 Next Steps

### Customize Your Experience
- **Language settings**: Set your primary language
- **Custom vocabulary**: Add technical terms, names, acronyms
- **Prompt engineering**: Improve accuracy with context prompts

### Advanced Features
- **Meeting mode**: Speaker diarization for conversations
- **Custom dictionaries**: Domain-specific terminology
- **Offline mode**: Coming soon - no internet required

### Get Help
- [Full Documentation](./)
- [GitHub Issues](https://github.com/yourusername/speak/issues)
- [Community Discussions](https://github.com/yourusername/speak/discussions)

## 🎯 Success Metrics

**You're set up correctly if:**
- ✅ Hotkey activates consistently across applications
- ✅ Text appears within 2 seconds of speaking
- ✅ Accuracy is >95% for clear speech
- ✅ No permission errors or crashes

**Need help?** Check the [troubleshooting guide](./troubleshooting.md) or [open an issue](https://github.com/yourusername/speak/issues).

---

[← Back to Documentation](./) | [Why Speak?](./why-speak.md) | [Privacy](./privacy.md)