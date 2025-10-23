# Speak Publishing Quick Reference

## 🚀 How to Release Speak

### For RC Releases (Current Process)
1. **Merge PR to main** → Everything happens automatically
2. **Wait 5-10 minutes** → GitHub Actions do the work
3. **Check results**:
   - npm: `npm view @namastexlabs/speak@next version`
   - GitHub: https://github.com/namastexlabs/speak/releases

### What Happens Automatically
- ✅ Version bump (0.1.0-rc.6 → 0.1.0-rc.7)
- ✅ npm publish (@namastexlabs/speak@next)
- ✅ GitHub release creation
- ✅ Git tagging
- ✅ Cross-platform executable builds
- ✅ Release notes generation

## 📋 Current Status
- **Version**: v0.1.0-rc.6
- **npm Package**: @namastexlabs/speak
- **Release Tag**: @next
- **Automation**: Fully operational

## 🔧 Commands for Verification
```bash
# Check latest version
npm view @namastexlabs/speak@next version

# See recent releases
gh release list --limit 3

# Check workflow status
gh run list --limit 5
```

## ⚠️ Important Notes
- **No manual version bumps** - automation handles it
- **No manual npm publish** - automation handles it  
- **No manual GitHub releases** - automation handles it
- Use `[skip publish]` in commit message to avoid auto-release

## 🆘 Emergency
If something goes wrong:
1. Check GitHub Actions: https://github.com/namastexlabs/speak/actions
2. Check recent releases: https://github.com/namastexlabs/speak/releases
3. Create issue: https://github.com/namastexlabs/speak/issues

---
*This is the quick reference. See [Speak Publishing Workflow](.genie/skills/speak-publishing-workflow.md) for complete documentation.*