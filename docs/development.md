# Development Environment Setup

## 🚀 Quick Start for Developers

**Get Speak running locally in 5 minutes:**

```bash
git clone https://github.com/yourusername/speak.git
cd speak
npm install
npm run dev
```

That's it! The app will open with developer tools enabled.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** (LTS recommended) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **OpenAI API Key** (for testing cloud features) - [Get one](https://platform.openai.com/api-keys)

### Platform-Specific Requirements

#### Windows
- Windows 10 or later (64-bit)
- Visual Studio Build Tools (for native modules)
  ```bash
  npm install --global windows-build-tools
  ```

#### macOS
- macOS 11.0 or later
- Xcode Command Line Tools
  ```bash
  xcode-select --install
  ```

#### Linux (Ubuntu/Debian)
- Ubuntu 18.04+ or equivalent
- Build essentials
  ```bash
  sudo apt update
  sudo apt install build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev
  ```

## 🛠️ Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/speak.git
cd speak
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- Electron (desktop app framework)
- OpenAI SDK (for Whisper API)
- Build tools (electron-builder, TypeScript)
- Development tools (ESLint, testing frameworks)

### 3. Configure Environment (Optional)
Create a `.env` file for local development:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 4. Start Development
```bash
npm run dev
```

This opens the app with:
- Hot reload enabled
- Developer tools open
- Source maps for debugging

## 🏗️ Project Structure

```
speak/
├── src/                    # Source code
│   ├── main.js            # Electron main process
│   └── renderer/          # UI code
│       └── index.html     # Main UI
├── docs/                  # Documentation
├── .genie/               # Framework files
├── package.json          # Dependencies and scripts
├── electron-builder.json # Build configuration
└── tsconfig.json         # TypeScript config
```

### Key Files
- **`src/main.js`** - Application lifecycle, window management
- **`src/renderer/index.html`** - User interface
- **`package.json`** - Dependencies and build scripts
- **`docs/`** - User and developer documentation

## 🔧 Development Scripts

### Core Commands
```bash
npm run dev          # Start development with hot reload
npm start           # Start production build
npm run build:win   # Build Windows installer
npm run build:mac   # Build macOS DMG
npm run build:linux # Build Linux AppImage
npm run lint        # Run ESLint
npm test            # Run tests
```

### Development Workflow
1. **Make changes** to source files
2. **Run `npm run dev`** to test changes
3. **Check console** for errors/warnings
4. **Test builds** with platform-specific commands
5. **Run linting** before committing

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Manual Testing Checklist
- [ ] App launches without errors
- [ ] Window displays correctly
- [ ] Developer tools open in dev mode
- [ ] No console errors
- [ ] Basic UI interactions work

### Platform Testing
Test builds on target platforms:
- **Windows**: `npm run build:win`
- **macOS**: `npm run build:mac`
- **Linux**: `npm run build:linux`

## 🐛 Debugging

### Common Issues

#### "Electron failed to install"
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`

#### "Cannot find module" errors
- Check Node.js version: `node --version`
- Ensure dependencies installed: `npm install`
- Try deleting package-lock.json and reinstalling

#### Build failures
- Check electron-builder config
- Ensure all dependencies are listed in package.json
- Test on clean environment (VM/container)

### Debug Tools
- **Chrome DevTools**: Built into Electron (F12)
- **Electron DevTools**: Additional debugging tools
- **Console logging**: Use `console.log()` in main process
- **Breakpoints**: Set in DevTools for renderer process

## 🚀 Building for Distribution

### Development Builds
```bash
# Quick test build
npm run build:linux  # or build:win, build:mac
```

### Production Builds
1. **Update version** in package.json
2. **Test thoroughly** on target platforms
3. **Create release** on GitHub
4. **Upload artifacts** from CI/CD

### Build Artifacts
- **Windows**: `.exe` installer + portable version
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` + `.deb` package

## 🤝 Contributing

### Code Style
- **JavaScript**: Modern ES6+ syntax
- **Linting**: ESLint with standard rules
- **Formatting**: 2-space indentation
- **Comments**: JSDoc for functions

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### Pull Request Process
1. **Fork** the repository
2. **Create** feature branch
3. **Implement** changes
4. **Test** thoroughly
5. **Submit** pull request
6. **Address** review feedback

## 📚 Learning Resources

### Electron
- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Fiddle](https://www.electronjs.org/fiddle) - Test code snippets
- [Awesome Electron](https://github.com/sindresorhus/awesome-electron)

### OpenAI Whisper
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Whisper Model Details](https://openai.com/research/whisper)
- [API Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

### Development Tools
- [VS Code Extensions](https://marketplace.visualstudio.com/) for Electron
- [Electron Builder](https://www.electron.build/) documentation
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🆘 Getting Help

### Community Support
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and community help
- **Discord**: Real-time chat (coming soon)

### Development Help
- **Documentation**: Check `docs/` folder first
- **Code Examples**: Look at existing implementations
- **Tests**: Run and examine test cases
- **Logs**: Check console output for error details

## 📋 Development Roadmap

### Immediate Priorities
- [ ] Complete basic dictation functionality
- [ ] Add settings UI
- [ ] Implement global hotkey system
- [ ] Add audio processing pipeline

### Medium Term
- [ ] Offline mode with local models
- [ ] Voice commands and formatting
- [ ] Cross-platform testing automation
- [ ] Performance optimization

### Long Term
- [ ] Plugin system
- [ ] Team collaboration features
- [ ] Mobile companion apps
- [ ] Enterprise deployment options

---

*Ready to contribute? Start with `npm run dev` and explore the codebase!*

[← Back to Documentation](./) | [Getting Started](./getting-started.md) | [Troubleshooting](./troubleshooting.md)