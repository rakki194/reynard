# Git Workflow Automation Prompt

## Task Description

Execute a comprehensive Git workflow that analyzes code changes, creates meaningful commit messages, updates documentation, and manages versioning across the Reynard monorepo.

## Complete Workflow Steps

### 1. Analyze Source Code Changes

```bash
# Get comprehensive diff of all changes
git diff --stat
git diff --name-only
git diff --name-status

# Analyze specific change types
git diff --stat | grep -E "(packages/|backend/|e2e/|docs/)"
git status --porcelain
```

**Analysis Requirements:**

- Identify all modified, added, and deleted files
- Categorize changes by type (features, fixes, docs, tests, etc.)
- Determine which packages are affected
- Assess the scope and impact of changes
- Identify any breaking changes or major features

### 2. Generate Comprehensive Commit Message

**Commit Message Structure:**

```
<type>[optional scope]: <description>

[optional body with detailed explanation]

[optional footer with breaking changes, issues, etc.]
```

**Message Requirements:**

- Use conventional commit format (feat, fix, docs, refactor, etc.)
- Include scope for package-specific changes
- Provide detailed body explaining the changes
- Mention any breaking changes or migration notes
- Reference related issues or PRs if applicable

**Example Format:**

```
feat: comprehensive codebase modernization and documentation overhaul

- Enhanced Husky pre-commit hooks with markdown link validation
- Updated comprehensive documentation across all packages and examples
- Improved testing infrastructure with better Vitest configuration
- Enhanced security validation and input sanitization
- Updated i18n system with improved translation management
- Modernized component architecture and composables
- Enhanced AI/ML integration documentation and examples
- Improved E2E testing setup with penetration testing capabilities
- Updated package configurations and dependencies
- Streamlined development workflow and tooling

This commit represents a major modernization effort across the entire
Reynard framework, improving developer experience, security, and
maintainability while maintaining backward compatibility.
```

### 3. Update CHANGELOG.md

**CHANGELOG Entry Requirements:**

- Add new version entry at the top (following semantic versioning)
- Categorize changes by type (Added, Changed, Deprecated, Removed, Fixed, Security)
- Include detailed descriptions of significant changes
- Mention any breaking changes prominently
- Reference commit hash and date

**CHANGELOG Format:**

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added

- New features and capabilities

### Changed

- Changes to existing functionality

### Deprecated

- Features marked for removal

### Removed

- Removed features

### Fixed

- Bug fixes

### Security

- Security improvements
```

### 4. Update Package Versions

**Version Bump Strategy:**

- **Major (X.0.0)**: Breaking changes
- **Minor (X.Y.0)**: New features, backward compatible
- **Patch (X.Y.Z)**: Bug fixes, backward compatible

**Files to Update:**

```bash
# Root package.json
package.json

# Individual package package.json files
packages/*/package.json

# Version references in documentation
docs/*.md
README.md
```

**Version Update Commands:**

```bash
# Update root package version
npm version patch|minor|major

# Update individual package versions
cd packages/package-name
npm version patch|minor|major
```

### 5. Execute Git Operations

**Complete Git Workflow:**

```bash
# Stage all changes
git add .

# Commit with --no-verify (skip pre-commit hooks if needed)
git commit --no-verify -m "feat: comprehensive codebase modernization and documentation overhaul

- Enhanced Husky pre-commit hooks with markdown link validation
- Updated comprehensive documentation across all packages and examples
- Improved testing infrastructure with better Vitest configuration
- Enhanced security validation and input sanitization
- Updated i18n system with improved translation management
- Modernized component architecture and composables
- Enhanced AI/ML integration documentation and examples
- Improved E2E testing setup with penetration testing capabilities
- Updated package configurations and dependencies
- Streamlined development workflow and tooling

This commit represents a major modernization effort across the entire
Reynard framework, improving developer experience, security, and
maintainability while maintaining backward compatibility."

# Push to remote repository
git push origin main
```

## Detailed Analysis Requirements

### Change Categorization

**Feature Changes:**

- New functionality or capabilities
- New packages or components
- New API endpoints or services
- New configuration options

**Bug Fixes:**

- Resolved issues or defects
- Performance improvements
- Security vulnerabilities fixed
- Edge case handling

**Documentation:**

- README updates
- API documentation
- Architecture documentation
- Examples and tutorials

**Refactoring:**

- Code organization improvements
- Performance optimizations
- Type safety improvements
- Dependency updates

**Testing:**

- New test coverage
- Test infrastructure improvements
- E2E test updates
- Test utilities

### Impact Assessment

**High Impact:**

- Breaking changes
- New major features
- Security improvements
- Performance optimizations
- Architecture changes

**Medium Impact:**

- New minor features
- Bug fixes
- Documentation updates
- Dependency updates

**Low Impact:**

- Code style changes
- Minor documentation updates
- Test improvements
- Configuration updates

## Automation Script Template

```bash
#!/bin/bash

# Git Workflow Automation Script
set -e

echo "🦊 Starting Reynard Git Workflow Automation..."

# Step 1: Analyze changes
echo "📊 Analyzing source code changes..."
git diff --stat > /tmp/git-changes-stat.txt
git diff --name-only > /tmp/git-changes-files.txt
git diff --name-status > /tmp/git-changes-status.txt

# Step 2: Generate commit message based on analysis
echo "📝 Generating commit message..."
# Analysis logic here

# Step 3: Update CHANGELOG.md
echo "📚 Updating CHANGELOG.md..."
# CHANGELOG update logic here

# Step 4: Update package versions
echo "📦 Updating package versions..."
# Version bump logic here

# Step 5: Execute git operations
echo "🚀 Executing git operations..."
git add .
git commit --no-verify -m "$COMMIT_MESSAGE"
git push origin main

echo "✅ Git workflow completed successfully!"
```

## Quality Assurance Checklist

### Pre-Commit Validation

- [ ] All changes analyzed and categorized
- [ ] Commit message follows conventional format
- [ ] CHANGELOG.md updated with new version
- [ ] Package versions bumped appropriately
- [ ] No sensitive data in commits
- [ ] All files properly staged

### Post-Commit Verification

- [ ] Commit pushed successfully
- [ ] Remote repository updated
- [ ] CI/CD pipeline triggered
- [ ] Documentation reflects changes
- [ ] Version numbers consistent

## Error Handling

### Common Issues and Solutions

**Issue: Pre-commit hooks failing**

```bash
# Use --no-verify flag
git commit --no-verify -m "commit message"
```

**Issue: Merge conflicts**

```bash
# Resolve conflicts first
git add .
git commit -m "resolve: merge conflicts"
```

#### Issue: Large file commit

```bash
# Use Git LFS or remove large files
git lfs track "*.large"
```

**Issue: Version conflicts**

```bash
# Ensure consistent versioning across packages
npm version patch --workspaces
```

## Success Criteria

The workflow is successful when:

1. ✅ All changes are properly analyzed and categorized
2. ✅ Commit message accurately describes the changes
3. ✅ CHANGELOG.md is updated with new version entry
4. ✅ Package versions are bumped appropriately
5. ✅ Changes are committed and pushed successfully
6. ✅ Repository state is clean and consistent

## Example Execution

```bash
# Execute the complete workflow
./git-workflow-automation.sh

# Expected output:
🦊 Starting Reynard Git Workflow Automation...
📊 Analyzing source code changes...
📝 Generating commit message...
📚 Updating CHANGELOG.md...
📦 Updating package versions...
🚀 Executing git operations...
✅ Git workflow completed successfully!
```

---

_This prompt provides a comprehensive framework for automating Git workflows in the Reynard monorepo, ensuring consistent, high-quality commits with proper documentation and versioning._
