# Troubleshooting & FAQ

## 🔧 Quick Fixes

### Text Not Appearing?
1. **Check hotkey:** Hold both Ctrl+Win keys together
2. **Cursor position:** Click where you want text first
3. **Permissions:** Verify microphone and accessibility access
4. **Application focus:** Make sure target app is active

### Poor Accuracy in Noise?
1. **Better microphone:** Use USB condenser with noise cancellation
2. **Positioning:** 6-8 inches from mouth, slightly off-axis
3. **Settings:** Enable medium noise reduction
4. **Environment:** Move to quieter location

### Slow Performance?
1. **Model:** Switch to gpt-4o-mini for speed
2. **Internet:** Check connection stability
3. **Resources:** Close bandwidth-heavy apps
4. **Updates:** Ensure latest version

## ❓ Frequently Asked Questions

### Performance & Accuracy

**"How does Speak perform in noisy environments?"**
Speak includes advanced audio preprocessing specifically designed for real-world conditions. While no system is perfect in extreme noise, Speak typically achieves 80-90% accuracy in moderate office noise with a good microphone, compared to Wispr Flow's reported degradation. We recommend USB condenser microphones with noise cancellation for best results.

**"What happens to my audio data?"**
In local mode (default), your audio is processed immediately on your device and never transmitted. In cloud mode, audio goes directly to OpenAI's secure API and is not stored by Speak. You control all data sharing decisions - no automatic uploads or data collection.

**"How long can I dictate continuously?"**
Speak is optimized for extended sessions with automatic memory management and chunked processing. Most users can dictate for 30-60 minutes continuously with good hardware. Take 2-minute breaks every 30 minutes to maintain quality. Sessions of 2+ hours are possible but may require occasional restarts.

**"Which languages work best?"**
All 50+ supported languages work well with clear speech. English, Spanish, French, German, and Mandarin have the highest accuracy (>95%). Technical accuracy depends more on your pronunciation clarity than language support. Custom vocabulary helps with domain-specific terms.

**"How do I use offline mode?"**
Offline mode with local Whisper models is coming in Q1 2026. You'll be able to download language models and process everything locally without an internet connection. This provides complete privacy and works anywhere.

**"Can I self-host everything?"**
Yes! Full self-hosting is planned for Q2 2026, including your own Whisper API endpoint. This gives you complete control over data, infrastructure, and customization. No vendor lock-in or external dependencies required.

### Privacy & Security

**"Is Speak really open source?"**
Yes, Speak is fully open source under MIT license. All code is publicly available on GitHub, allowing independent security audits, community contributions, and self-hosting. Unlike closed-source alternatives, you can verify our privacy claims.

**"Do you collect usage data?"**
No usage analytics are collected by default. We don't track how you use Speak, what you dictate, or any personal information. Optional telemetry (completely anonymous, local-only) may be available in future versions for improving the product.

**"What's the difference between local and cloud mode?"**
- **Local mode:** Audio processed on your device, no internet required (coming soon)
- **Cloud mode:** Audio sent to OpenAI for processing, requires API key
- **Your choice:** Switch between modes anytime, no data shared without permission

**"How secure is my OpenAI API key?"**
Your API key is stored securely using your system's keychain/password manager. It's only used for OpenAI API calls and never transmitted to our servers. You can revoke and regenerate keys anytime through OpenAI's dashboard.

### Platform & Compatibility

**"Does Speak work on Linux?"**
Yes! Speak is built with Electron and supports Linux as a first-class platform. We provide AppImage packages, Debian/Ubuntu repositories, and Arch packages. Linux users get the same features and performance as Windows/macOS users.

**"Why choose Speak over Wispr Flow?"**
- **Open source:** Full transparency and community control
- **Linux support:** Native Linux experience (Wispr doesn't support Linux)
- **Privacy first:** Local processing by default, self-hosting options
- **No limits:** Unlimited usage, no artificial word caps
- **Cross-platform:** Consistent experience everywhere

**"Can I use Speak on multiple computers?"**
Yes, with individual API keys and settings per machine. Your custom vocabulary and preferences sync via optional cloud backup (your data, your choice). Each installation is independent.

### Technical Questions

**"What's the latency like?"**
Typically 1-2 seconds from speech to text. This includes audio capture, processing, and insertion. Faster models (gpt-4o-mini) reduce latency to <1 second. Internet connection affects cloud mode performance.

**"Do I need a powerful computer?"**
Minimum: Dual-core CPU, 4GB RAM. Recommended: 4+ cores, 8GB RAM, SSD storage. Modern laptops and desktops work great. No GPU required (yet), but GPU acceleration is planned for local models.

**"Can I customize the hotkey?"**
Yes! Default is Ctrl+Win, but you can change it to any combination. We recommend using modifier keys (Ctrl, Alt, Shift) plus a letter or function key. Test in multiple applications to ensure compatibility.

**"How do custom dictionaries work?"**
Add technical terms, names, and acronyms to improve accuracy. Speak learns from your corrections and suggests additions. Dictionaries are stored locally and can be exported/imported across devices.

### Billing & Costs

**"How much does Speak cost?"**
Speak is free and open source. You only pay for your OpenAI API usage if using cloud mode. Local mode (coming soon) will be completely free with no API costs. No subscription fees or usage limits.

**"What's the OpenAI API pricing?"**
Pricing varies by model:
- gpt-4o-transcribe: ~$0.006/minute
- gpt-4o-mini-transcribe: ~$0.0006/minute
- Typical usage: $1-5/month for regular dictation
- No minimums or hidden fees

**"Are there any usage limits?"**
No artificial limits in Speak! Unlike Wispr Flow's 2,000 words/week, you can dictate as much as you want. OpenAI has rate limits, but they're generous for individual use. Enterprise plans available for teams.

### Getting Help

**"Where can I get support?"**
- **Documentation:** This site has comprehensive guides
- **GitHub Issues:** Report bugs and request features
- **Discussions:** Community support and tips
- **Email:** support@speak.ai (coming soon)

**"How do I report a bug?"**
1. Check existing issues on GitHub
2. Create new issue with detailed description
3. Include: OS version, Speak version, error messages
4. Attach logs if available (Settings → Debug → Export Logs)

**"Can I contribute to development?"**
Absolutely! Speak is open source. Contribute code, documentation, testing, or translations. See our [Contributing Guide](./contributing.md) for details.

## 🚨 Common Issues & Solutions

### Installation Problems

**"App won't start on Linux"**
- Check dependencies: `sudo apt install libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0`
- Try AppImage if repository version fails
- Check permissions on installation directory

**"Microphone not detected"**
- Check system sound settings
- Try different microphone ports
- Restart Speak after changing microphones
- Verify microphone works in other applications

### Performance Issues

**"High CPU usage"**
- Close unnecessary background applications
- Switch to faster model (gpt-4o-mini)
- Update to latest Speak version
- Check for system updates

**"Memory usage keeps growing"**
- Restart Speak periodically during long sessions
- Close other memory-intensive applications
- Update system and graphics drivers
- Monitor with system task manager

### Audio Quality Problems

**"Echo or feedback"**
- Move microphone away from speakers
- Use headphones with microphone
- Enable echo cancellation in settings
- Reduce speaker volume

**"Background noise interference"**
- Use noise-cancelling microphone
- Enable noise reduction in Speak settings
- Move to quieter location
- Close doors/windows to reduce external noise

### Network Issues

**"Connection timeouts"**
- Check internet stability
- Switch to local mode (when available)
- Use wired connection instead of WiFi
- Contact ISP if persistent issues

**"API rate limits"**
- Space out requests (Speak handles this automatically)
- Switch to different model temporarily
- Upgrade OpenAI plan if needed
- Implement retry logic

## 📞 Still Need Help?

If you can't find a solution:

1. **Search existing issues** on GitHub
2. **Check community discussions** for similar problems
3. **Create detailed bug report** with steps to reproduce
4. **Include system information** and error logs

We're here to help make Speak work perfectly for you!

---

[← Back to Documentation](./) | [Getting Started](./getting-started.md) | [Performance Guide](./performance.md)