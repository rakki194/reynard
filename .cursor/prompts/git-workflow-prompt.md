# Git Workflow Automation Prompt

## Task Description

Execute a comprehensive Git workflow that analyzes code changes, creates meaningful commit messages, updates
documentation, and manages versioning across the Reynard monorepo.

## Complete Workflow Steps

### 1. Analyze Source Code Changes

#### Enhanced Diff Analysis with Delta

**Prerequisites - Delta Setup:**

Delta is a syntax-highlighting pager for Git that significantly enhances diff readability. Install and configure it:

```bash
# Install delta (Arch Linux)
sudo pacman -S git-delta

# Install delta (Ubuntu/Debian)
sudo apt install git-delta

# Install delta (macOS)
brew install git-delta

# Install delta (Windows)
choco install delta
```

**Configure Delta with Git:**

```bash
# Set delta as the default pager
git config --global core.pager delta

# Configure delta for interactive diffs
git config --global interactive.diffFilter "delta --color-only"

# Enable navigation between diff sections (use n/N keys)
git config --global delta.navigate true

# Enable side-by-side view for better comparison
git config --global delta.side-by-side true

# Show line numbers for better context
git config --global delta.line-numbers true

# Set syntax highlighting theme
git config --global delta.syntax-theme "Monokai Extended"

# Configure merge conflict display
git config --global merge.conflictstyle zdiff3
```

#### Advanced Diff Commands for AI Agents

```bash
# Get comprehensive diff of all changes
git diff --stat
git diff --name-only
git diff --name-status

# Enhanced diff analysis with word-level changes
git diff --word-diff
git diff --word-diff-regex='[^[:space:]]'

# Ignore whitespace changes for cleaner analysis
git diff -w
git diff --ignore-space-change
git diff --ignore-all-space

# Compare specific file types or directories
git diff --stat | grep -E "(packages/|backend/|e2e/|docs/)"
git diff --name-only -- '*.ts' '*.tsx' '*.py'

# Analyze staged vs unstaged changes
git diff --staged
git diff --cached
git status --porcelain

# Compare between commits with enhanced output
git diff HEAD~1..HEAD
git diff --stat HEAD~5..HEAD

# Branch comparison with detailed analysis
git diff --stat main..feature-branch
git diff --name-status main..feature-branch
```

**Analysis Requirements:**

- Identify all modified, added, and deleted files
- Categorize changes by type (features, fixes, docs, tests, etc.)
- Determine which packages are affected
- Assess the scope and impact of changes
- Identify any breaking changes or major features

#### AI Agent Diffing Best Practices

**Strategic Diff Analysis:**

```bash
# Focus on semantic changes, not formatting
git diff -w --word-diff

# Analyze changes by impact level
git diff --stat --find-renames --find-copies

# Identify potential breaking changes
git diff --name-only | xargs -I {} git log -1 --oneline -- {}

# Check for security-sensitive changes
git diff --name-only | grep -E "(auth|security|password|token|key)"

# Analyze test coverage changes
git diff --stat | grep -E "(test|spec|__tests__)"
```

**Change Impact Assessment:**

```bash
# High-impact changes (breaking, security, architecture)
git diff --name-only | grep -E "(package\.json|tsconfig|config|schema)"

# Medium-impact changes (features, APIs)
git diff --name-only | grep -E "(api|service|component|util)"

# Low-impact changes (docs, tests, styling)
git diff --name-only | grep -E "(\.md$|\.test\.|\.spec\.|\.css$)"
```

**Delta Configuration for AI Agents:**

```ini
# ~/.gitconfig - Optimized for AI analysis
[delta]
    # Enhanced readability for automated analysis
    side-by-side = true
    line-numbers = true
    syntax-theme = "Monokai Extended"
    navigate = true

    # Word-level highlighting for precise change detection
    word-diff = true
    word-diff-regex = '[^[:space:]]'

    # Clean output for parsing
    hunk-header-style = "bold yellow"
    file-style = "bold blue"
    file-decoration-style = "blue ul"

    # Merge conflict enhancement
    merge-conflict-begin-symbol = "◀"
    merge-conflict-end-symbol = "▶"
    merge-conflict-ours-diff-header-style = "bold red"
    merge-conflict-theirs-diff-header-style = "bold green"
```

#### Documentation Word Diffing

For comprehensive word-level diffing of documentation files (Markdown, reStructuredText, AsciiDoc, DOCX),
refer to the [Documentation Word Diffing Guide](../../docs/development/documentation-word-diffing-guide.md) which covers:

- **Semantic change detection** for documentation content
- **Cross-reference analysis** for link and reference changes
- **Content quality analysis** for spelling, grammar, and formatting
- **Documentation structure analysis** for organization changes
- **AI agent optimization** for automated documentation review
- **Binary format support** (DOCX, ODT, PDF) with Pandoc integration
- **Pre-commit validation** and automated review workflows

### 2. Generate Comprehensive Commit Message

**Commit Message Structure:**

```text
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

```text
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

# Git Workflow Automation Script with Delta Enhancement
set -e

echo "🦦 Starting Reynard Git Workflow Automation with Delta..."

# Verify delta is installed and configured
if ! command -v delta &> /dev/null; then
    echo "⚠️  Delta not found. Installing..."
    # Auto-detect package manager and install delta
    if command -v pacman &> /dev/null; then
        sudo pacman -S git-delta --noconfirm
    elif command -v apt &> /dev/null; then
        sudo apt install git-delta -y
    elif command -v brew &> /dev/null; then
        brew install git-delta
    else
        echo "❌ Please install delta manually for your system"
        exit 1
    fi
fi

# Step 1: Enhanced change analysis with delta
echo "📊 Analyzing source code changes with delta..."
git diff --stat > /tmp/git-changes-stat.txt
git diff --name-only > /tmp/git-changes-files.txt
git diff --name-status > /tmp/git-changes-status.txt

# Enhanced analysis for AI agents
echo "🔍 Performing semantic change analysis..."
git diff -w --word-diff > /tmp/git-changes-semantic.txt
git diff --stat --find-renames --find-copies > /tmp/git-changes-detailed.txt

# Security and impact analysis
echo "🛡️  Analyzing security and impact..."
git diff --name-only | grep -E "(auth|security|password|token|key)" > /tmp/git-changes-security.txt || true
git diff --name-only | grep -E "(package\.json|tsconfig|config|schema)" > /tmp/git-changes-high-impact.txt || true
git diff --name-only | grep -E "(\.md$|\.test\.|\.spec\.|\.css$)" > /tmp/git-changes-low-impact.txt || true

# Test coverage analysis
echo "🧪 Analyzing test coverage changes..."
git diff --stat | grep -E "(test|spec|__tests__)" > /tmp/git-changes-tests.txt || true

# Step 2: Generate commit message based on enhanced analysis
echo "📝 Generating commit message..."
# Enhanced analysis logic here using the generated files

# Step 3: Update CHANGELOG.md
echo "📚 Updating CHANGELOG.md..."
# CHANGELOG update logic here

# Step 4: Update package versions
echo "📦 Updating package versions..."
# Version bump logic here

# Step 5: Execute git operations with delta preview
echo "🚀 Executing git operations..."
echo "📋 Previewing changes with delta..."
git diff --staged | delta --side-by-side || git diff --staged

git add .
git commit --no-verify -m "$COMMIT_MESSAGE"
git push origin main

echo "✅ Git workflow completed successfully with delta enhancement!"
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

#### Issue: Pre-commit hooks failing

```bash
# Use --no-verify flag
git commit --no-verify -m "commit message"
```

#### Issue: Merge conflicts

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

#### Issue: Version conflicts

```bash
# Ensure consistent versioning across packages
npm version patch --workspaces
```

#### Issue: Delta not displaying properly

```bash
# Check delta installation
which delta
delta --version

# Verify git configuration
git config --list | grep delta

# Test delta with a simple diff
echo "test" > test.txt && git add test.txt && git diff --staged | delta

# Reset to default pager if needed
git config --global --unset core.pager
```

#### Issue: Delta performance issues with large diffs

```bash
# Configure delta for better performance
git config --global delta.max-line-distance 0.6
git config --global delta.max-line-length 1000

# Use minimal delta configuration for large repos
git config --global delta.minus-style "red"
git config --global delta.plus-style "green"
git config --global delta.side-by-side false
```

#### Issue: Delta syntax highlighting not working

```bash
# Check available themes
delta --list-syntax-themes

# Set a different theme
git config --global delta.syntax-theme "GitHub"

# Disable syntax highlighting if problematic
git config --global delta.syntax-theme "none"
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

_This prompt provides a comprehensive framework for automating Git workflows in the Reynard monorepo, ensuring_
_consistent, high-quality commits with proper documentation and versioning._
