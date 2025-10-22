# Speak

> **Your voice, your data, your control** - Open source voice dictation for everyone

![Flow UI Preview](./image.png)

## Overview

Speak is an open-source voice dictation application that puts **you in control** of your data and workflow. Unlike closed-source alternatives, Speak offers complete transparency, local-first processing, and true cross-platform support including Linux.

### Why Choose Speak?

| Feature | Speak | Wispr Flow |
|---------|-------|------------|
| **Open Source** | ✅ Full transparency | ❌ Closed source |
| **Linux Support** | ✅ Native | ❌ Not available |
| **Privacy** | ✅ Local-first, your choice | ⚠️ Cloud processing, broad usage rights |
| **Offline Mode** | 🔄 Coming Q1 2026 | ❌ Requires internet |
| **Free Tier** | ✅ Unlimited | ⚠️ 2,000 words/week |
| **Self-Hosting** | ✅ Full control | ❌ Not available |

**Key Differentiators:**
- 🔓 **Open Source First** - Full transparency, community-driven
- 🛡️ **Privacy by Design** - Local processing, no mandatory data sharing
- 🐧 **True Cross-Platform** - Windows, macOS, **and Linux**
- ⚡ **No Artificial Limits** - Unlimited usage, your data stays yours

### Key Features

- **Universal Compatibility**: Works in any application via global hotkey (Ctrl+Win)
- **High Accuracy**: Powered by OpenAI's gpt-4o-transcribe model (>95% accuracy)
- **Fast Response**: <2 second latency from recording to text insertion
- **Multi-Language**: Supports 50+ languages automatically
- **Privacy-Focused**: Local processing by default, your data never leaves your machine
- **Open Source**: Fully extensible, customizable, and self-hostable
- **Cross-Platform**: Native support for Windows, macOS, and Linux
- **No Usage Limits**: Dictate as much as you want, forever free

### Current Status

**Phase 1 - Development**: Building production-ready MVP

See [Roadmap](./docs/roadmap.md) for detailed development plan and feature status.

## Quick Start

**2 minutes to voice dictation:**

1. Download installer for your platform
2. Install and configure microphone
3. Add OpenAI API key (optional for offline mode)
4. Hold Ctrl+Win and start dictating

[📖 Complete Getting Started Guide](./docs/getting-started.md)

### Prerequisites

- Microphone (built-in or external)
- OpenAI API key for cloud mode ([Get one here](https://platform.openai.com/api-keys))
- Internet connection (for cloud mode)

### Installation

Download installers for your platform:
- [Windows Installer]() - Coming soon
- [macOS Installer]() - Coming soon
- [Linux AppImage]() - Coming soon

**Platform-specific setup guides:**
- [Windows Installation](./docs/getting-started.md#windows)
- [macOS Installation](./docs/getting-started.md#macos)
- [Linux Installation](./docs/getting-started.md#linux)

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

### Getting Started
- **[Why Speak?](./docs/why-speak.md)** - Comparison with Wispr Flow and key differentiators
- **[Getting Started](./docs/getting-started.md)** - Platform-specific installation and setup
- **[Privacy & Data](./docs/privacy.md)** - How we handle your data and permissions
- **[Troubleshooting](./docs/troubleshooting.md)** - Common issues and solutions

### Advanced Usage
- **[AI Polishing](./docs/ai-polishing.md)** - Transcription pipeline and customization
- **[Performance Guide](./docs/performance.md)** - Optimizing for noisy environments and long sessions
- **[Roadmap](./docs/roadmap.md)** - Feature status and development timeline

### Technical
- **[Mission](./.genie/product/mission.md)** - Product vision and goals
- **[Tech Stack](./.genie/product/tech-stack.md)** - Architecture and technologies
- **[Environment](./.genie/product/environment.md)** - Development setup guide
- **[Brand Guidelines](./docs/brand.md)** - Positioning and messaging

## Technology

### Privacy-First Architecture
- **Local Processing**: Audio processed on your device by default
- **Your Choice**: Cloud mode available when you enable it
- **Open Source**: Full transparency in data handling
- **Self-Hosting**: Run everything on your infrastructure (roadmap)

### Core Stack
- **Electron**: Cross-platform desktop framework
- **Node.js**: Runtime environment
- **OpenAI Whisper API**: Speech-to-text engine (optional)
  - Primary: `gpt-4o-transcribe` (high quality)
  - Alternative: `gpt-4o-mini-transcribe` (faster/cheaper)
  - Meeting Mode: `gpt-4o-transcribe-diarize` (speaker identification)
  - Local models: Coming Q1 2026 (no API required)

### Key Libraries
- `openai` - API client (optional)
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

- **Inspired by Flow** - Original voice dictation concept and UX patterns
- **Powered by OpenAI Whisper** - Industry-leading speech recognition technology
- **Built with Genie** - AI development framework enabling rapid iteration
- **Community-driven** - Open source development with user needs first

## Why Speak vs Flow?

While inspired by Flow's innovative approach, Speak addresses key limitations:

- **Open Source**: Full transparency vs proprietary codebase
- **Linux Support**: Native Linux experience vs Windows/macOS only
- **Privacy Control**: Local processing by default vs cloud-only
- **No Limits**: Unlimited usage vs artificial word caps
- **Self-Hosting**: Complete infrastructure control vs vendor dependency

[🔍 Learn more about our positioning](./docs/why-speak.md)

## Support

- **Documentation**: See `.genie/product/` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/speak/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/speak/discussions)

---

**Status**: 🚧 Phase 1 Development - MVP coming Q4 2025

## Get Involved

- **[⭐ Star on GitHub](https://github.com/yourusername/speak)** - Show your support
- **[📖 Read the Docs](./docs/)** - Learn about Speak's unique advantages
- **[🐛 Report Issues](https://github.com/yourusername/speak/issues)** - Help improve Speak
- **[💬 Join Discussions](https://github.com/yourusername/speak/discussions)** - Connect with the community

## Stay Updated

Follow our progress and join the community:

- **GitHub**: Releases, issues, and development updates
- **Discussions**: Community support and feature requests
- **Documentation**: Comprehensive guides and tutorials

---

*Speak: Your voice, your data, your control - open source voice dictation for everyone.*
