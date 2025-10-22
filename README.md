# Speak

> Universal voice-to-text dictation that works everywhere. Hold Ctrl+Win to dictate in any app.

![Flow UI Preview](./image.png)

## Overview

Speak is an open-source voice dictation application that brings seamless speech-to-text to every application on your computer. Inspired by Flow, Speak uses OpenAI's advanced Whisper models (gpt-4o-transcribe) to deliver high-accuracy transcription with minimal latency.

### Key Features

- **Universal Compatibility**: Works in any application via global hotkey (Ctrl+Win)
- **High Accuracy**: Powered by OpenAI's gpt-4o-transcribe model (>95% accuracy)
- **Fast Response**: <2 second latency from recording to text insertion
- **Multi-Language**: Supports 50+ languages automatically
- **Privacy-Focused**: Your data stays with you (bring your own OpenAI API key)
- **Open Source**: Fully extensible and customizable

### Current Status

**Phase 1 - Development**: Building production-ready MVP

See [Roadmap](./.genie/product/roadmap.md) for detailed development plan.

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Microphone access

### Installation (Coming Soon)

Download installers for your platform:
- [Windows Installer]() - Coming soon
- [macOS Installer]() - Coming soon
- [Linux AppImage]() - Coming soon

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/speak.git
cd speak

# Install dependencies
npm install

# Configure API key
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run development build
npm run dev
```

## How It Works

1. **Activate**: Hold Ctrl+Win (or your custom hotkey)
2. **Speak**: Clearly dictate your text
3. **Release**: Let go of the keys when done
4. **Result**: Transcribed text appears at your cursor within 2 seconds

## Documentation

- **[Mission](./.genie/product/mission.md)** - Product vision and goals
- **[Tech Stack](./.genie/product/tech-stack.md)** - Architecture and technologies
- **[Roadmap](./.genie/product/roadmap.md)** - Development phases and timeline
- **[Environment](./.genie/product/environment.md)** - Setup and configuration guide

## Technology

### Core Stack
- **Electron**: Cross-platform desktop framework
- **Node.js**: Runtime environment
- **OpenAI Whisper API**: Speech-to-text engine
  - Primary: `gpt-4o-transcribe` (high quality)
  - Alternative: `gpt-4o-mini-transcribe` (faster/cheaper)
  - Meeting Mode: `gpt-4o-transcribe-diarize` (speaker identification)

### Key Libraries
- `openai` - API client
- `electron-store` - Settings persistence
- `robotjs` - Keyboard automation
- `node-record-lpcm16` - Audio recording

See [Tech Stack](./.genie/product/tech-stack.md) for complete details.

## Configuration

### API Key Setup

1. Get your OpenAI API key: https://platform.openai.com/api-keys
2. Open Speak settings (system tray icon → Settings)
3. Enter your API key in "API Configuration"
4. Click "Validate" to test connection
5. Save settings

### Customization

- **Model Selection**: Choose between quality/speed/cost tradeoffs
- **Language**: Set primary language (auto-detected by default)
- **Hotkey**: Customize activation keys
- **Dictionary**: Add custom terms, acronyms, technical vocabulary
- **Prompting**: Improve accuracy with context-specific prompts

See [Environment Guide](./.genie/product/environment.md) for all configuration options.

## Roadmap

### Phase 1 (Current) - Production MVP
- Core transcription functionality
- Global hotkey system
- Settings management
- Speaker diarization (meeting mode)
- Streaming transcription
- Custom vocabulary/prompting

### Phase 2 (Q3 2025) - User Growth
- Offline mode (local models)
- Voice commands (formatting)
- Cloud sync (optional)
- Enhanced statistics
- Performance optimizations

### Phase 3 (Q4 2025) - Enterprise
- Team collaboration features
- Custom model training
- API for integrations
- Mobile companion app

See [Full Roadmap](./.genie/product/roadmap.md) for details.

## Contributing

Speak is built with the Genie AI development framework. Contributions are welcome!

### Development Workflow

```bash
# Create a wish (feature request)
genie wish "Add support for custom voice commands"

# Work gets orchestrated through Genie Forge
# See AGENTS.md for framework details
```

### Reporting Issues

Found a bug? Have a feature request?
- [Open an issue](https://github.com/yourusername/speak/issues)
- Join our [Discussions](https://github.com/yourusername/speak/discussions)

## License

[MIT License](./LICENSE) - Free to use, modify, and distribute.

## Acknowledgments

- Inspired by [Flow](https://www.flowvoice.ai/) - Original voice dictation concept
- Powered by [OpenAI Whisper](https://openai.com/research/whisper) - Speech recognition
- Built with [Genie](https://github.com/genie-ai/genie) - AI development framework

## Support

- **Documentation**: See `.genie/product/` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/speak/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/speak/discussions)

---

**Status**: 🚧 Phase 1 Development - Not yet ready for production use

[⭐ Star on GitHub](https://github.com/yourusername/speak) | [📖 Read the Docs](./.genie/product/) | [🐛 Report Bug](https://github.com/yourusername/speak/issues)
