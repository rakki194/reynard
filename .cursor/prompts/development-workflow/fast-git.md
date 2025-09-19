# Fast Git Workflow Prompt for AI Agents

## Mission: Quick, Accurate Git Operations

Execute a streamlined Git workflow that prioritizes **accuracy over speed** while maintaining efficiency. Ensure you make precise commits with correct messages that actually reflect the changes made.

## Core Principles

### 🎯 **Accuracy First, Speed Second**

- **ALWAYS** examine actual file changes before writing commit messages
- **NEVER** assume what changed based on file names or patterns
- **VERIFY** the actual diff content matches your commit message
- **DOUBLE-CHECK** changelog entries against real changes

### ⚡ **Streamlined Process**

- Skip version management and releases (fast push only)
- Use `--no-verify` to bypass pre-commit hooks
- Focus on accurate commit messages and changelog updates
- Push immediately after verification

## Fast Workflow Steps

### 1. **CRITICAL: Analyze Actual Changes**

```bash
# Get comprehensive change overview
git status --porcelain
git diff --stat
git diff --name-status

# Examine actual content changes (MANDATORY)
git diff --name-only | head -10 | xargs -I {} git diff HEAD -- {}
```

**⚠️ CRITICAL RULE**: Never write commit messages without examining the actual diff content!

### 1. **Verify Changes Match Your Understanding**

```bash
# Check what files were actually modified
git diff --stat | grep -E "^ [0-9]+ files? changed"

# Look at specific file changes
git diff HEAD -- <filename>

# Verify deletions and additions
git diff --name-status | grep -E "^[AD]"
```

### 2. **Update CHANGELOG.md (If Needed)**

**Only update CHANGELOG.md if there are significant changes worth documenting.**

```bash
# Check if CHANGELOG.md needs updates
git diff HEAD -- CHANGELOG.md

# If updating, add entries that match ACTUAL changes
# Use format: "- **Brief Description**: What actually changed (Agent-Name)"
```

### 3. **Stage and Commit with Accurate Message**

```bash
# Stage all changes
git add .

# Write commit message based on ACTUAL changes
git commit --no-verify -m "type: accurate description of what actually changed

- List only the changes that actually occurred
- Be specific about what was modified, added, or removed
- Reference actual file names and changes
- Keep descriptions factual and precise

This commit represents [actual summary of changes]."
```

### 4. **Push Immediately**

```bash
# Push to remote
git push origin main

# If amending previous commit, use force push
git push --force-with-lease origin main
```

## Commit Message Templates

### **Feature Addition**

```text
feat: add [specific feature] to [component]

- Added [specific file] with [specific functionality]
- Enhanced [component] with [specific improvement]
- Updated [file] to include [specific change]

This commit adds [specific feature] to improve [specific aspect].
```

### **Bug Fix**

```text
fix: resolve [specific issue] in [component]

- Fixed [specific problem] in [file]
- Corrected [specific error] in [component]
- Resolved [specific issue] affecting [functionality]

This commit resolves [specific issue] that was causing [specific problem].
```

### **Refactoring**

```text
refactor: improve [component] structure and organization

- Refactored [file] to [specific improvement]
- Reorganized [component] for better [specific benefit]
- Streamlined [functionality] by [specific change]

This commit improves [component] maintainability and [specific benefit].
```

### **Documentation**

```text
docs: update [specific documentation] with [specific content]

- Updated [file] with [specific information]
- Enhanced [documentation] to include [specific details]
- Improved [guide] with [specific improvements]

This commit enhances [specific documentation] for better [specific benefit].
```

### **Cleanup**

```text
chore: clean up [specific area] and remove obsolete files

- Removed [specific files] that were [specific reason]
- Cleaned up [specific area] by [specific action]
- Deleted [obsolete files] for [specific benefit]

This commit removes obsolete files and improves [specific aspect].
```

## Error Prevention Checklist

### ✅ **Before Writing Commit Message**

- [ ] Examined `git diff --stat` output
- [ ] Checked `git diff --name-status` for file types
- [ ] Looked at actual content changes with `git diff`
- [ ] Verified what was added, modified, or deleted
- [ ] Confirmed changes match your understanding

### ✅ **Before Committing**

- [ ] Commit message describes actual changes
- [ ] No fictional features or components mentioned
- [ ] File names and changes are accurate
- [ ] Changelog entries (if any) match reality
- [ ] Used appropriate commit type (feat/fix/docs/refactor/chore)

### ✅ **Before Pushing**

- [ ] Commit message is factual and precise
- [ ] All staged changes are intentional
- [ ] No sensitive data in commit
- [ ] Ready to push with `--no-verify` flag

## Common Mistakes to Avoid

### ❌ **NEVER Do These**

- Write commit messages without checking actual diffs
- Assume changes based on file names
- Mention features that weren't actually implemented
- Reference components that weren't modified
- Create fictional changelog entries
- Use generic commit messages like "various updates"

### ❌ **Example of BAD Commit Message**

```text
feat: comprehensive E2E testing framework and monitoring system

- Added advanced effects testing with comprehensive monitoring
- Implemented dependency fixtures and unified results management
- Enhanced ecosystem documentation with latest capabilities

# PROBLEM: This describes changes that never happened!
```

### ✅ **Example of GOOD Commit Message**

```text
feat: research prompt system reorganization and enhancement

- Enhanced academic-review-prompt.md with improved evaluation frameworks
- Added implementation-guide.md for research methodology guidance
- Added novelty-verification-prompt.md for contribution assessment
- Removed redundant enhanced-academic-review-prompt.md

# GOOD: This accurately describes what actually changed
```

## Fast Workflow Script Template

```bash
#!/bin/bash
# Fast Git Workflow for AI Agents

echo "🦊 Starting Fast Git Workflow..."

# Step 1: Analyze actual changes
echo "📊 Analyzing changes..."
git status --porcelain
git diff --stat
git diff --name-status

# Step 2: Show sample of actual changes with Delta
echo "🔍 Sample of actual changes (using Delta):"
git diff --name-only | head -5 | xargs -I {} sh -c 'echo "=== {} ===" && git diff HEAD -- {} | head -20'

# Step 2b: Show full diff with Delta for analysis
echo "📋 Full diff for analysis:"
git diff

# Step 3: Wait for agent to write accurate commit message
echo "⏳ Please examine the changes above and write an accurate commit message"
echo "   Remember: Only describe what actually changed!"

# Step 4: Stage and commit
echo "📝 Staging changes..."
git add .

# Step 5: Commit with --no-verify
echo "💾 Committing with --no-verify..."
# Agent should replace this with actual commit message
git commit --no-verify -m "REPLACE_WITH_ACCURATE_MESSAGE"

# Step 6: Push
echo "🚀 Pushing to remote..."
git push origin main

echo "✅ Fast Git workflow completed!"
```

## Success Criteria

The workflow is successful when:

1. ✅ **Accurate Analysis**: Agent examined actual file changes before writing commit message
2. ✅ **Precise Message**: Commit message describes only what actually changed
3. ✅ **Factual Changelog**: Any changelog entries match real changes
4. ✅ **Clean Push**: Changes pushed successfully to remote
5. ✅ **No Fiction**: No mention of features or changes that didn't occur

## Emergency Fixes

### **If You Made an Inaccurate Commit**

```bash
# Amend the commit message
git commit --amend --no-verify -m "corrected: accurate description of changes"

# Force push the corrected commit
git push --force-with-lease origin main
```

---

**Remember**: Speed is good, but accuracy is essential. A fast but wrong commit message is worse than a slow but correct one. Always verify your changes before committing! 🦊
