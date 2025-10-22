# Mission

## Pitch
Speak is a voice-to-text dictation application that works seamlessly across all your apps. Hold Ctrl+Win to dictate anywhere - in emails, messages, docs, or any other application. Built as an open-source clone inspired by Flow, with focus on accuracy, speed, and universal compatibility.

## Users
- **Knowledge Workers**: Professionals who write frequently (emails, documents, reports)
- **Content Creators**: Writers, bloggers, journalists who need fast text input
- **Accessibility Users**: People with mobility challenges or RSI who prefer voice input
- **Multilingual Users**: People working across multiple languages who need accurate transcription
- **Productivity Enthusiasts**: Users seeking to optimize their workflow with voice input

## Problem
Typing is slower than speaking. Most voice dictation tools are:
- Limited to specific applications
- Require context switching
- Have poor accuracy with technical terms or multilingual content
- Lack offline capabilities
- Don't integrate seamlessly into existing workflows

## Solution
Speak provides:
- **Universal Compatibility**: Works in any application via global hotkey (Ctrl+Win)
- **High Accuracy**: Powered by OpenAI's gpt-4o-transcribe model
- **Seamless Integration**: Direct text insertion at cursor position
- **Multi-language Support**: Supports 50+ languages out of the box
- **Privacy-Focused**: User controls their data and API keys
- **Extensible**: Open-source architecture allowing customization

## Key Features

### Phase 0 (MVP)
- [x] Global hotkey activation (Ctrl+Win)
- [x] Voice recording with visual feedback
- [x] Real-time transcription via OpenAI Whisper API
- [x] Direct text insertion into active application
- [x] User statistics (usage tracking, word count, WPM)
- [x] Dictionary/snippets management
- [x] Style preferences
- [x] Notes feature

### Phase 1 (Current - see roadmap.md)
- [ ] Speaker diarization (meeting mode with gpt-4o-transcribe-diarize)
- [ ] Streaming transcription for real-time feedback
- [ ] Custom vocabulary/prompting for domain-specific accuracy
- [ ] Multi-format audio support
- [ ] Enhanced error handling and retry logic
- [ ] Settings persistence and configuration management

### Future Phases
- Offline mode with local models
- Custom voice commands (formatting, navigation)
- Team collaboration features
- API for third-party integrations
- Mobile companion app

## Success Metrics
- **Transcription Accuracy**: >95% word accuracy across supported languages
- **Response Time**: <2 seconds from stop speaking to text insertion
- **User Adoption**: 1000+ active users within 6 months
- **Reliability**: 99.5% uptime for critical path components
- **User Satisfaction**: >4.5/5 average rating from user feedback
