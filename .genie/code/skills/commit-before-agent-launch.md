# Commit Before Agent Launch Protocol

## Critical Workflow Rule 🔴 CRITICAL

**Rule:** ALWAYS commit and push documentation/wish files to git BEFORE launching discovery or forge agents.

## The Problem
- Genie agents operate in isolated worktrees
- Agents access files from git HEAD, not uncommitted workspace changes
- Launching agents before committing creates invisible dependencies
- Agents fail or work with incomplete/outdated context

## What Happened (Historical Incident)
Created wish document at `.genie/wishes/speak-initial-enhancements/wish.md` and immediately launched discovery and forge agents WITHOUT committing and pushing first.

**Result:** Agents couldn't access the wish document, violating persistent state management principles.

## Correct Workflow Pattern
```
1. Create/edit documentation or wish files
2. git add <files>
3. git commit -m "Add wish: <description>"
4. git push origin main
5. THEN launch discovery/forge agents
6. Agents execute with full committed context
```

## Why This Matters
- **State Persistence:** Agents work from committed repository state
- **Isolation:** Worktrees clone from git HEAD
- **Reliability:** Prevents failed sessions due to missing context
- **Efficiency:** Avoids wasted time debugging invisible dependencies

## Enforcement Checklist
Before launching ANY agent:
- [ ] Are all relevant files committed to git?
- [ ] Have changes been pushed to remote?
- [ ] Can agents access all required context from git HEAD?

## Related Skills
- `@.genie/skills/persistent-tracking-protocol.md` - State management principles
- `@.genie/skills/workspace-system.md` - Worktree isolation
- `@.genie/skills/execution-integrity-protocol.md` - Reliable execution patterns

## Meta-Learning Applied
This protocol created to prevent recurrence of commit-before-launch violations.