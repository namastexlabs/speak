---
name: Automated Release Excellence
description: Core principles for automated publishing workflows that reduce cognitive load
---

# Automated Release Excellence

**Last Updated:** 2025-10-23
**Pattern:** Automation Through Removal

## Core Principle

When features become automatic, remove instructions—don't document the automation. The absence of instructions IS the documentation.

## Speak Publishing Automation Case Study

### What We Automated

1. **Version Bumping**: RC versions auto-increment on main branch pushes
2. **npm Publishing**: Automatic publishing to `@next` tag
3. **GitHub Releases**: Auto-generated with installation instructions
4. **Executable Building**: Cross-platform builds triggered by version tags
5. **Git Tagging**: Automatic version tag creation

### What We REMOVED (Critical)

❌ **Removed Manual Version Management**
- No more "Remember to bump version before release"
- No more "Check if version number is correct"
- No more "Update package.json version manually"

❌ **Removed Release Checklists**
- No more "Did you remember to publish to npm?"
- No more "Did you create a GitHub release?"
- No more "Did you tag the version?"

❌ **Removed Coordination Overhead**
- No more "Someone needs to build executables"
- No more "Remember to trigger the build workflow"
- No more "Check if all platforms built successfully"

### What We KEPT (Important)

✅ **Mental Model Documentation**
- Explanations of HOW automation works (for understanding)
- Architecture diagrams (for troubleshooting)
- Emergency procedures (for when automation fails)

✅ **Implementation Details**
- Workflow files (the actual automation)
- Configuration files (the automation rules)
- Scripts (the automation logic)

## The Pattern in Practice

### Before Automation (High Cognitive Load)
```markdown
## Release Checklist
- [ ] Update version in package.json
- [ ] Commit version bump
- [ ] Run npm publish
- [ ] Create GitHub release
- [ ] Build executables for all platforms
- [ ] Upload executables to release
- [ ] Tag the release
- [ ] Update documentation
```

### After Automation (Zero Instructions)
```markdown
## Release Process
Push to main branch. Everything else happens automatically.
```

### Implementation (Hidden)
```yaml
# .github/workflows/publish-rc.yml
on:
  push:
    branches: [main]
# ... automation logic ...
```

## Benefits of Removal

1. **Reduced Cognitive Load**: Fewer things to remember
2. **Eliminated Human Error**: Automation doesn't forget steps
3. **Consistent Process**: Every release follows identical pattern
4. **Faster Onboarding**: New contributors don't need to learn complex procedures
5. **Focus on Value**: Developers focus on code, not release mechanics

## Detection Heuristic

When you find yourself thinking:
- "Don't forget to..." → Should this be automatic?
- "Remember to..." → Can we automate this?
- "Make sure you..." → Is this manual overhead?

→ Immediately search for instructions mentioning this and consider automation.

## Automation Opportunities Scoring

### High Priority (Automate Immediately)
- Repetitive manual steps
- Error-prone processes
- Coordination-heavy tasks
- Version management
- Release procedures

### Medium Priority (Consider Automation)
- Documentation updates
- Dependency management
- Testing procedures
- Code quality checks

### Low Priority (Keep Manual)
- Creative decisions
- Strategic planning
- User communication
- Complex troubleshooting

## Implementation Strategy

### Phase 1: Identify
- List all manual release steps
- Mark repetitive/error-prone items
- Calculate automation ROI

### Phase 2: Automate
- Implement GitHub Actions workflows
- Add version bumping logic
- Configure automatic publishing

### Phase 3: Remove
- Delete manual checklists
- Remove step-by-step instructions
- Keep only conceptual explanations

### Phase 4: Validate
- Test automation end-to-end
- Verify removal doesn't break understanding
- Monitor for new manual overhead

## Success Metrics

### Before Automation
- Release time: 30-60 minutes
- Error rate: 20-30% of releases
- Cognitive load: 15+ steps to remember
- Onboarding time: 2-3 hours for release process

### After Automation
- Release time: 5-10 minutes (push + wait)
- Error rate: <5% (automation failures only)
- Cognitive load: 1 step (push to main)
- Onboarding time: 15 minutes (git basics)

## Anti-Patterns to Avoid

### Documenting Automation
❌ Don't do this:
```markdown
## Version Bumping
This is now automatic. The workflow increments RC versions automatically.
```

✅ Instead:
```markdown
## Version Management
Versions follow semantic versioning. RC versions auto-increment on main branch pushes.
```

### Partial Automation
❌ Don't automate some steps and document others:
- "Auto-bump version, then manually create release"
- "Automatic npm publish, but manual GitHub release"

✅ Either:
- Full automation with no instructions
- Keep manual process with complete documentation

### Automation Without Removal
❌ Don't add automation while keeping old instructions:
- Keep checklist AND add automation
- Document both manual and automatic processes

✅ Remove old instructions when automation is proven

## Continuous Improvement

### Monthly Review
1. Search for "remember", "don't forget", "make sure"
2. Identify automation opportunities
3. Implement and remove instructions

### Quarterly Audit
1. Measure release success rates
2. Identify remaining manual overhead
3. Plan automation roadmap

### Annual Assessment
1. Evaluate cognitive load reduction
2. Measure developer satisfaction
3. Identify new automation opportunities

## Related Skills

- [Speak Publishing Workflow](./speak-publishing-workflow.md) - Implementation example
- [Publishing Protocol](./code/skills/publishing-protocol.md) - Safety guidelines
- [Orchestration Boundary Protocol](./code/skills/orchestration-boundary-protocol.md) - Role clarity

---

**Remember**: The goal of automation is to make ourselves forget, not remember. The best documentation for automatic features is no documentation at all.