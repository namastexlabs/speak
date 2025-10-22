# Roadmap

## Phase 0: MVP Foundation ✅ COMPLETED (Conceptual)
**Goal**: Validate core concept with minimal viable features

### Completed Features
- Global hotkey activation (Ctrl+Win)
- Basic voice recording with visual feedback
- OpenAI Whisper API integration (gpt-4o-transcribe)
- Text insertion into active applications
- User statistics dashboard (usage tracking, word count, WPM)
- Dictionary/snippets management
- Style preferences configuration
- Notes feature for user annotations

### Success Criteria ✅
- Proof of concept demonstrating voice-to-text workflow
- Basic UI mockup (see image.png)
- Technical feasibility validated
- OpenAI API integration tested

---

## Phase 1: Production-Ready MVP 🎯 CURRENT PHASE
**Goal**: Build production-quality application ready for initial users

**Timeline**: 8-12 weeks
**Priority**: High

### Core Implementation Tasks
1. **Project Setup**
   - Initialize Electron + Node.js project
   - Configure TypeScript/JavaScript build pipeline
   - Set up development environment
   - Configure Genie Forge integration

2. **Audio Recording System**
   - Implement microphone capture
   - Add Voice Activity Detection (VAD)
   - Create visual recording feedback UI
   - Handle audio format conversion (to supported formats)

3. **OpenAI Integration**
   - Build OpenAI API client wrapper
   - Implement gpt-4o-transcribe transcription
   - Add streaming transcription support
   - Implement retry logic and error handling
   - Add custom prompting for accuracy improvement

4. **System Integration**
   - Global hotkey registration (Ctrl+Win)
   - Clipboard and keyboard automation
   - Text insertion at cursor position
   - Active window detection

5. **Settings & Configuration**
   - API key management (secure storage)
   - User preferences (language, model selection)
   - Dictionary/snippets management
   - Statistics tracking and persistence

6. **User Interface**
   - System tray integration
   - Settings panel
   - Statistics dashboard
   - Minimal recording indicator

### Enhanced Features
7. **Speaker Diarization (Meeting Mode)**
   - Integrate gpt-4o-transcribe-diarize
   - Support known speaker references
   - Format diarized output with speaker labels
   - Add UI toggle for meeting mode

8. **Custom Vocabulary/Prompting**
   - User-defined terminology dictionary
   - Context-aware prompting
   - Domain-specific accuracy improvements

9. **Multi-format Support**
   - Support mp3, wav, webm, m4a formats
   - Audio compression for API efficiency
   - Handle long-form recordings (chunking for >25MB limit)

### Success Criteria
- ✅ Application runs on Windows, macOS, Linux
- ✅ <2s latency from recording stop to text insertion
- ✅ >95% transcription accuracy on clean audio
- ✅ Successful API key configuration and storage
- ✅ 50+ hours of internal testing without critical bugs
- ✅ Installer/distribution packages created
- ✅ Basic documentation (README, setup guide)

### Measurable Goals
- **Performance**: 95%+ transcription accuracy, <2s latency
- **Stability**: Zero crashes in 50+ hours of testing
- **Usability**: Setup completed in <5 minutes by non-technical users
- **Compatibility**: Works on 3 major platforms (Win/Mac/Linux)

---

## Phase 2: User Growth & Refinement (Q3 2025)
**Goal**: Achieve product-market fit with early adopters

### Planned Features
- **Offline Mode**: Local model support (Whisper.cpp)
- **Voice Commands**: Formatting commands ("new paragraph", "capitalize")
- **Translation Support**: Use OpenAI translations endpoint
- **Enhanced Statistics**: Detailed analytics, trends over time
- **Cloud Sync**: Optional settings/snippets sync across devices
- **Performance Optimizations**: Reduce latency to <1s
- **Accessibility**: Screen reader support, keyboard navigation

### Success Criteria
- 1000+ active users
- >4.5/5 average user rating
- <5% churn rate
- Active community contributions (GitHub issues/PRs)

---

## Phase 3: Enterprise & Advanced Features (Q4 2025)
**Goal**: Expand to professional and team use cases

### Planned Features
- **Team Collaboration**: Shared dictionaries, team statistics
- **Custom Model Training**: Fine-tuned models for specific industries
- **API for Integrations**: Webhooks, third-party app integrations
- **Mobile Companion**: iOS/Android app for on-the-go dictation
- **Advanced Security**: SSO, enterprise key management
- **White-label Options**: Customizable branding for enterprises

### Success Criteria
- 5+ enterprise customers
- 10,000+ total users
- Revenue targets met (if monetization strategy defined)
- API ecosystem with 3+ third-party integrations

---

## Future Considerations (2026+)
- Real-time collaboration (multiple speakers, live transcription)
- AI-powered editing suggestions
- Multi-modal input (voice + gestures)
- Integration with popular productivity tools (Notion, Obsidian, etc.)
- Browser extension for web-based apps

---

## Risk Mitigation

### Technical Risks
- **API Rate Limits**: Implement exponential backoff, user quota management
- **Audio Quality Issues**: Add preprocessing, noise reduction
- **Platform Compatibility**: Early testing on all platforms, CI/CD validation

### Business Risks
- **OpenAI API Costs**: Transparent pricing for users, model selection options
- **Competition**: Focus on unique features (universal compatibility, extensibility)
- **User Adoption**: Community building, content marketing, open-source visibility

---

## Decision Log
- **2025-10-22**: Chose Electron over Tauri for better ecosystem support
- **2025-10-22**: Decided on gpt-4o-transcribe as default (vs whisper-1) for quality
- **2025-10-22**: Meeting mode (diarization) moved to Phase 1 (user request)
