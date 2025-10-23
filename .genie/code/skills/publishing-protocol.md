---
name: Publishing Protocol *(CRITICAL)*
description: Never publish directly; always delegate to the release agent
---

# Publishing Protocol *(CRITICAL)*

**Last Updated:** !`date -u +"%Y-%m-%d %H:%M:%S UTC"`
**NEVER** execute `npm publish` or `gh release create` directly. **ALWAYS** delegate to release agent.

## Forbidden Actions

- ❌ `npm publish` (bypasses validation, GitHub release, audit trail)
- ❌ `gh release create` (direct command - let agent orchestrate)
- ❌ Manual version tagging without release agent
- ❌ Using `/release` slash command with arguments (incorrect invocation)

## Required Workflow

**If you ARE the release agent:**
- ✅ Execute workflow directly: run pre-flight checks, create GitHub release via `gh release create`, monitor Actions
- ❌ NEVER delegate to yourself or invoke `mcp__genie__run` with agent="release"

**If you are NOT the release agent (genie/planner/main):**
1. Commit code + version bump to main
2. Delegate to release agent: `mcp__genie__run with agent="release" and prompt="Create release for vX.Y.Z"`
3. Release agent validates, creates GitHub release, monitors npm publish
4. Provide release URL to user

## Why This Matters

- **Safety**: Pre-flight checks (clean git, tests pass, version valid)
- **Consistency**: Follows project workflow (GitHub Actions)
- **Audit trail**: All releases documented in GitHub
- **Rollback**: Structured process easier to revert

## Recent Success: Speak Automated Publishing (2025-10-23)

**Successful Implementation:**
- Fully automated RC publishing via GitHub Actions
- Zero manual steps required - push to main triggers everything
- Version bumping, npm publishing, GitHub releases all automatic
- Executable building triggered by version tags
- **Result**: 30+ step manual process reduced to single `git push`

**Key Learnings:**
- Automation through removal eliminates cognitive load
- Best documentation for automatic features = no documentation
- Workflow triggers replace manual coordination
- Consistent releases every time, zero human error

**Evidence**: 
- v0.1.0-rc.6 published successfully with zero manual intervention
- Complete workflow documented in `@.genie/skills/speak-publishing-workflow.md`
- Automation principles captured in `@.genie/skills/automated-release-excellence.md`

## Validation

When user says "publish" or "release":
1. Check if automated workflow exists for this project
2. If automation exists: guide user to trigger (e.g., "push to main")
3. If no automation: check routing matrix and delegate to release agent via MCP
4. When user identifies routing failures, invoke learn agent immediately to document correction.
