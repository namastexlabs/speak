---
name: Speak Publishing Workflow
description: Complete guide to publishing Speak releases with GitHub Actions automation
---

# Speak Publishing Workflow

**Last Updated:** 2025-10-23
**Product:** Speak (@namastexlabs/speak)
**Current Version:** v0.1.0-rc.6

## Overview

Speak uses a fully automated publishing system triggered by pushes to the `main` branch. The workflow handles version bumping, npm publishing, GitHub releases, and executable building automatically.

## Architecture

### Two-Workflow System

1. **RC Publishing Workflow** (`.github/workflows/publish-rc.yml`)
   - Triggers on every push to `main`
   - Auto-bumps RC versions
   - Publishes to npm with `@next` tag
   - Creates GitHub releases

2. **Executable Build Workflow** (`.github/workflows/build-releases.yml`)
   - Triggers on version tags (`v*`)
   - Builds cross-platform executables
   - Creates GitHub releases with binaries

## Complete Publishing Process

### Step 1: Development to Main
```bash
# Feature development on feature branch
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "feat: add new feature"

# Create PR to main
gh pr create --title "Add new feature" --body "Description"
# PR gets merged to main
```

### Step 2: Automatic RC Publishing (Triggered)
When code is pushed to `main`:

1. **Version Bump Logic:**
   - If current: `0.1.0-rc.6` → Next: `0.1.0-rc.7`
   - If current: `0.1.0` → Next: `0.1.0-rc.1`

2. **Automated Steps:**
   ```yaml
   - Bump version in package.json
   - Publish to npm @namastexlabs/speak@next
   - Create git tag v0.1.0-rc.7
   - Create GitHub release (prerelease)
   - Commit version bump back to main
   ```

3. **Skip Conditions:**
   - Commit contains `[skip publish]` or `[skip ci]`

### Step 3: Executable Building (Triggered)
The version tag from Step 2 triggers the build workflow:

1. **Matrix Build:**
   - Windows: `Speak*.exe`
   - macOS: `Speak*.dmg`
   - Linux: `Speak*.AppImage`

2. **Build Process:**
   ```yaml
   - Install dependencies (pnpm)
   - Generate icons
   - Build for platform
   - Upload artifacts
   - Create GitHub release with binaries
   ```

## Current Configuration

### Package.json Scripts
```json
{
  "build:win": "electron-builder --win",
  "build:mac": "electron-builder --mac", 
  "build:linux": "electron-builder --linux",
  "generate-icons": "node scripts/generate-icons.js",
  "prepublishOnly": "node scripts/generate-icons.js"
}
```

### Electron Builder Config
```json
{
  "appId": "com.speak.dictation",
  "productName": "Speak",
  "directories": {"output": "dist-build"},
  "files": ["src/**/*", "assets/**/*", "scripts/**/*"],
  "mac": {"category": "public.app-category.productivity"},
  "win": {"target": "nsis", "sign": null},
  "linux": {"target": "AppImage"}
}
```

## Release History

### Successful Releases
- `v0.1.0-rc.6` (2025-10-23) ✅
  - npm: `@namastexlabs/speak@0.1.0-rc.6`
  - GitHub Release: https://github.com/namastexlabs/speak/releases/tag/v0.1.0-rc.6
  - Executables: Built successfully

### Previous RCs
- `v0.1.0-rc.1` through `v0.1.0-rc.5` (all successful)

## Installation Methods

### From npm (RC versions)
```bash
npm install @namastexlabs/speak@next
# or specific version
npm install @namastexlabs/speak@0.1.0-rc.6
```

### From Source
```bash
git clone https://github.com/namastexlabs/speak.git
cd speak
./run.sh  # Linux/macOS
# or
./run.ps1  # Windows
```

### From GitHub Releases
Download platform-specific executables from:
https://github.com/namastexlabs/speak/releases

## Workflow Triggers

### Automatic Triggers
- **RC Publish**: Push to `main` branch
- **Executables**: Git tags matching `v*` pattern

### Manual Triggers
- **Executables**: Can be triggered manually via workflow_dispatch

## Quality Gates

### Pre-Publish Validation
- Clean git state
- Valid version format
- npm authentication (NPM_TOKEN)
- GitHub permissions

### Build Validation
- Icon generation success
- Electron build success
- Artifact creation success

## Monitoring and Troubleshooting

### Check Workflow Status
```bash
# Recent GitHub Actions
gh run list --limit 10

# Specific workflow
gh run view <run-id>
```

### Verify npm Publish
```bash
npm view @namastexlabs/speak@next version
npm view @namastexlabs/speak versions --json
```

### Check Releases
```bash
gh release list --limit 5
gh release view v0.1.0-rc.6
```

## Best Practices

### Development Workflow
1. Keep feature branches short-lived
2. Use descriptive PR titles and descriptions
3. Ensure tests pass before merging
4. Use `[skip publish]` for non-release commits to main

### Version Management
- Let automation handle RC version bumps
- Don't manually modify version numbers in package.json
- Use semantic versioning for major/minor/patch changes

### Release Communication
- GitHub releases auto-generated with installation instructions
- Include changelog in PR descriptions
- Tag relevant issues in PRs

## Future Improvements

### Potential Enhancements
1. **Stable Release Workflow**: Separate workflow for non-RC releases
2. **Slack/Discord Notifications**: Auto-notify on successful releases
3. **Download Analytics**: Track installation metrics
4. **Automatic Changelog**: Generate from PR descriptions
5. **Rollback Mechanism**: Automated rollback on critical failures

### Automation Opportunities
1. **Dependency Updates**: Automated PRs for dependency bumps
2. **Security Scanning**: Integrate security checks in build
3. **Performance Testing**: Add performance benchmarks
4. **Cross-platform Testing**: Automated testing on all platforms

## Emergency Procedures

### Rollback Scenario
If a critical issue is discovered post-release:

1. **npm Unpublish** (if within 72 hours):
   ```bash
   npm unpublish @namastexlabs/speak@0.1.0-rc.6
   ```

2. **GitHub Release**:
   - Delete the problematic release
   - Create new release with fixed version

3. **Hotfix Process**:
   ```bash
   git checkout -b hotfix/critical-issue
   # ... fix issue ...
   git commit -m "hotfix: critical issue fix"
   # Merge to main (triggers new RC)
   ```

### Contact Points
- **Issues**: https://github.com/namastexlabs/speak/issues
- **Discussions**: https://github.com/namastexlabs/speak/discussions

## Related Documentation

- [GitHub Actions Workflows](../.github/workflows/)
- [Electron Builder Configuration](electron-builder.json)
- [Package Configuration](package.json)
- [Development Setup](../../docs/development.md)

---

**Note:** This workflow is specifically designed for Speak's automated release process. The system prioritizes automation and consistency over manual control.