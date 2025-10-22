# AI Polishing & Text Processing

## 🎯 How Speak Turns Voice into Text

Speak uses advanced AI to transform your spoken words into polished, formatted text. This document explains the complete transcription pipeline and how to customize it for your needs.

## 🔄 The Transcription Pipeline

### 1. Audio Capture
**What happens:** When you hold the hotkey, Speak starts recording audio
- **Format:** 16kHz, 16-bit, mono WAV
- **Compression:** Minimal processing to preserve voice quality
- **Buffering:** Real-time streaming for immediate processing

### 2. Raw Transcription
**Engine:** OpenAI Whisper models
- **Model options:**
  - `gpt-4o-transcribe`: Highest accuracy (recommended)
  - `gpt-4o-mini-transcribe`: Faster processing
  - `gpt-4o-transcribe-diarize`: Meeting mode with speaker identification

**Features:**
- **Multi-language detection:** Automatic language identification
- **Speaker diarization:** Identifies different speakers in conversations
- **Confidence scoring:** Quality assessment for each transcription
- **Real-time streaming:** No waiting for complete audio

### 3. AI Polishing (Optional)
**Enhancement layer:** Post-processing for better formatting
- **Grammar correction:** Fixes common speech patterns
- **Punctuation addition:** Adds commas, periods, question marks
- **Capitalization:** Proper sentence and name capitalization
- **Formatting detection:** Recognizes lists, emails, code blocks

### 4. Text Insertion
**Methods:**
- **Clipboard injection:** Copies to clipboard, pastes at cursor
- **Accessibility API:** Direct insertion (where supported)
- **Platform optimization:** Different methods per operating system

## 🎨 Processing Modes

### Standard Mode (Default)
- Raw transcription with basic punctuation
- Fastest processing (<1 second)
- Best for: Quick notes, commands, searches

### Polished Mode
- Full grammar and formatting correction
- Slightly slower (1-2 seconds)
- Best for: Emails, documents, professional writing

### Meeting Mode
- Speaker identification and labeling
- Timestamp markers
- Best for: Interviews, meetings, conversations

### Custom Mode
- Your own prompts and formatting rules
- Domain-specific vocabulary
- Best for: Technical writing, specialized fields

## ⚙️ Customization Options

### Language Settings

#### Primary Language
```yaml
# Set your main language for better accuracy
language: "en"  # English
# Options: en, es, fr, de, it, pt, ru, ja, zh, ko, ar, hi, +40 more
```

#### Multi-language Detection
- **Auto-detect:** Switches languages automatically
- **Manual override:** Force specific language for session
- **Mixed content:** Handles code-switching between languages

### Custom Vocabulary

#### Technical Terms
```yaml
vocabulary:
  - "Kubernetes"     # Instead of "koo-ber-net-eez"
  - "PostgreSQL"     # Instead of "post-gres queue el"
  - "TypeScript"     # Instead of "type script"
```

#### Names and Acronyms
```yaml
names:
  - "Nayr"          # Proper pronunciation
  - "OpenAI"        # Company names
  - "GPT-4"         # Product names
```

#### Domain-Specific
```yaml
medical:
  - "myocardial infarction"  # "heart attack"
  - "electroencephalogram"  # "EEG"

legal:
  - "power of attorney"
  - "due diligence"
  - "fiduciary duty"
```

### Prompt Engineering

#### Context Prompts
```yaml
# For technical writing
prompt: "This is technical documentation. Use precise terminology."

# For creative writing
prompt: "This is creative fiction. Use descriptive language."

# For emails
prompt: "This is a professional email. Use formal tone."
```

#### Formatting Instructions
```yaml
formatting:
  - "Format lists as markdown"
  - "Use Oxford comma"
  - "Expand contractions when formal"
  - "Add section headers automatically"
```

### Voice Commands (Roadmap)

#### Text Formatting
- "New paragraph" → Inserts line break
- "New line" → Inserts soft break
- "Bullet list" → Starts markdown list
- "Numbered list" → Starts numbered list

#### Punctuation
- "Period" → Adds "." and capitalizes next word
- "Question mark" → Adds "?" and capitalizes next word
- "Exclamation point" → Adds "!" and capitalizes next word

#### Editing
- "Delete last sentence" → Removes previous sentence
- "Correct that" → Allows re-dictation of last phrase
- "Capitalize that" → Fixes capitalization

## 📊 Performance Optimization

### Audio Quality Settings

#### Sample Rate
- **16kHz:** Optimal for Whisper (default)
- **44.1kHz:** Higher quality, slower processing
- **8kHz:** Faster, lower quality

#### Noise Reduction
- **Light:** Minimal processing, preserves voice
- **Medium:** Balanced noise reduction (recommended)
- **Heavy:** Maximum noise reduction, may affect clarity

#### Voice Activity Detection
- **Sensitive:** Captures more audio, may include silence
- **Balanced:** Good balance of sensitivity (default)
- **Conservative:** Reduces false activations

### Processing Speed

#### Chunking Strategy
- **Real-time:** Process as you speak (default)
- **Sentence:** Wait for sentence endings
- **Paragraph:** Wait for paragraph breaks

#### Caching
- **Model caching:** Keeps models in memory
- **Vocabulary caching:** Faster loading of custom terms
- **Prompt caching:** Reuses processed prompts

## 🔧 Advanced Configuration

### Custom Models (Roadmap)
```yaml
models:
  custom:
    path: "/path/to/fine-tuned-model"
    vocabulary: "extended"
    language: "en-tech"
```

### Plugin System (Roadmap)
```yaml
plugins:
  - name: "code-formatter"
    trigger: "code block"
    action: "format_as_markdown_code"

  - name: "spell-check"
    trigger: "spell check"
    action: "run_spell_check"
```

### API Integration
```yaml
api:
  endpoints:
    - "https://custom-transcription.service"
    - "https://local-whisper-endpoint"
```

## 📈 Accuracy Improvement Tips

### Speaking Techniques
- **Clear articulation:** Speak distinctly, not too fast
- **Microphone position:** 6-8 inches from mouth
- **Background noise:** Minimize ambient sound
- **Pacing:** Pause briefly between sentences

### Environment Optimization
- **Quiet space:** Use noise-cancelling microphone
- **Consistent volume:** Speak at steady level
- **Test recordings:** Verify audio quality before long sessions
- **Acoustic treatment:** Soft furnishings reduce echo

### Content Preparation
- **Custom vocabulary:** Add technical terms beforehand
- **Context prompts:** Set appropriate mode for content type
- **Practice sessions:** Test with your typical content
- **Feedback loop:** Note and correct recurring errors

## 🔍 Troubleshooting Transcription

### Common Issues

#### Poor Accuracy
- **Solution:** Check microphone quality and positioning
- **Solution:** Add custom vocabulary for technical terms
- **Solution:** Try different Whisper models
- **Solution:** Use context prompts for domain-specific content

#### Latency Issues
- **Solution:** Switch to gpt-4o-mini model
- **Solution:** Reduce audio quality settings
- **Solution:** Check internet connection speed
- **Solution:** Close bandwidth-intensive applications

#### Formatting Problems
- **Solution:** Adjust AI polishing settings
- **Solution:** Use voice commands for manual formatting
- **Solution:** Customize punctuation rules
- **Solution:** Switch to raw transcription mode

### Debug Tools

#### Audio Analysis
- **View raw audio:** Check waveform in settings
- **Test recordings:** Record and analyze sample audio
- **Quality metrics:** Monitor signal-to-noise ratio

#### Performance Monitoring
- **Latency tracking:** View processing times
- **Error logging:** Check transcription error rates
- **Model switching:** Compare accuracy across models

## 🚀 Future Enhancements

### Offline Mode
- **Local Whisper:** No internet required
- **Custom models:** Fine-tuned for your voice
- **Edge computing:** On-device processing

### Advanced Features
- **Real-time translation:** Dictate in one language, output in another
- **Voice cloning:** Train on your voice for better accuracy
- **Emotion detection:** Adjust tone based on speaking style
- **Multi-modal:** Combine voice with keyboard shortcuts

### Integration APIs
- **REST API:** Integrate Speak into other applications
- **WebSocket:** Real-time transcription streams
- **Plugin SDK:** Build custom processing pipelines

---

[← Back to Documentation](./) | [Getting Started](./getting-started.md) | [Troubleshooting](./troubleshooting.md)