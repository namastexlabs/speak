# Data & Privacy

## 🔒 Privacy by Design

Speak is built with **privacy first**. Your voice data never leaves your machine unless you explicitly choose to use cloud processing. We believe you should have complete control over your data and how it's used.

## 📊 What We Collect

### Local Processing (Default)
- ✅ **Audio data**: Processed locally on your device only
- ✅ **No transcripts stored**: Audio is processed and discarded immediately
- ✅ **No usage analytics**: We don't track how you use Speak
- ✅ **No personal data**: No account creation or user profiling

### Cloud Processing (Optional)
When you enable cloud mode with OpenAI's API:
- ⚠️ **Audio sent to OpenAI**: Only when you activate cloud transcription
- ⚠️ **API usage data**: OpenAI may log API requests (see their privacy policy)
- ⚠️ **No data retention by Speak**: We don't store your audio or transcripts

### Configuration Data
- ✅ **Settings stored locally**: Hotkeys, language preferences, custom vocabulary
- ✅ **Stored securely**: Using your system's secure storage mechanisms
- ✅ **Never transmitted**: Configuration stays on your device

## 🔑 Permissions Required

Speak needs certain system permissions to function. We request only what's necessary and explain why each permission is needed.

### Microphone Access
**Why we need it:** To capture your voice for transcription
- **When used:** Only when you activate dictation (hold hotkey)
- **Data handling:** Audio is processed immediately and not stored
- **Privacy:** Audio never leaves your device in local mode

### Clipboard Access
**Why we need it:** To insert transcribed text where you're typing
- **When used:** After transcription is complete
- **Data handling:** We only write text, never read clipboard contents
- **Privacy:** No clipboard data is collected or transmitted

### Accessibility/Global Hotkey
**Why we need it:** To work in any application via global hotkey
- **When used:** To register the global hotkey (Ctrl+Win by default)
- **Data handling:** No data collection, just keyboard event monitoring
- **Privacy:** Only monitors the specific hotkey combination

### File System (Optional)
**Why we need it:** For custom vocabulary files and offline models
- **When used:** When you add custom dictionaries or download local models
- **Data handling:** Your files remain under your control
- **Privacy:** No automatic file scanning or data collection

## 🌐 Third-Party Services

### OpenAI Whisper API (Optional)
- **Purpose:** High-quality speech-to-text transcription
- **Data sent:** Audio recordings (when cloud mode is enabled)
- **Privacy:** Governed by [OpenAI's Privacy Policy](https://openai.com/privacy/)
- **Control:** You can disable cloud mode and use local processing only
- **API Key:** You provide your own key - we never see or store it

### Future Services (Roadmap)
- **Local Whisper models:** No internet required, completely private
- **Self-hosted options:** Run everything on your own infrastructure
- **Plugin ecosystem:** Community-built services with your approval

## 🛡️ Security Measures

### Data Encryption
- **At rest:** Configuration files encrypted using system keychain
- **In transit:** HTTPS for any cloud communications
- **Local processing:** No network transmission of audio data

### Access Controls
- **No accounts:** No user accounts or authentication required
- **Local only:** All processing happens on your device
- **No backdoors:** Open source code means anyone can verify security

### Incident Response
- **Transparency:** Any security issues will be publicly disclosed
- **No data breach risk:** Since we don't store user data, there's nothing to breach
- **Community oversight:** Open source community can audit and improve security

## 📋 Privacy Checklist

Before using Speak, consider:

- [ ] **Local mode enabled:** Keep processing on your device
- [ ] **Microphone permissions:** Granted only to Speak
- [ ] **API key security:** Store your OpenAI key securely
- [ ] **Network monitoring:** Be aware when cloud mode is active
- [ ] **Custom vocabulary:** Don't include sensitive information in dictionaries

## 🔄 Data Deletion

### Local Data
- **Settings:** Delete the Speak configuration directory
- **Cache:** Clear any temporary audio processing files
- **Custom files:** Remove vocabulary and model files you added

### Cloud Data
- **OpenAI:** Follow their data deletion policies
- **No Speak data:** We don't store any of your data on our servers

## 📞 Contact & Questions

Have privacy concerns or questions?

- **GitHub Issues:** [Report privacy issues](https://github.com/yourusername/speak/issues)
- **Discussions:** [Ask privacy questions](https://github.com/yourusername/speak/discussions)
- **Code Review:** [Audit our privacy implementation](https://github.com/yourusername/speak)

## 📜 Privacy Promise

**We promise:**
- Your voice data stays yours
- No mandatory data collection
- Full transparency in our code
- Community oversight of privacy practices
- Self-hosting options for maximum control

*Last updated: October 2025*

---

[← Back to Documentation](./) | [Getting Started](./getting-started.md)