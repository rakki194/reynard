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

### 3. Update CHANGELOG.md and Version Management

**CHANGELOG Version Bump Strategy:**

The CHANGELOG.md follows the [Keep a Changelog](https://keepachangelog.com/) format with an "Unreleased" section that gets promoted to a versioned release.

**Current CHANGELOG Structure:**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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

## [X.Y.Z] - YYYY-MM-DD

[Previous release content...]
```

**Version Bump Process:**

1. **Analyze Changes** to determine version bump type:
   - **Major (X.0.0)**: Breaking changes, major new features
   - **Minor (X.Y.0)**: New features, backward compatible changes
   - **Patch (X.Y.Z)**: Bug fixes, documentation updates, minor improvements

2. **Promote Unreleased to Versioned Release:**

   ```bash
   # Get current version from package.json
   CURRENT_VERSION=$(node -p "require('./package.json').version")

   # Determine next version based on change analysis
   if [[ $CHANGE_TYPE == "major" ]]; then
       NEXT_VERSION=$(semver -i major $CURRENT_VERSION)
   elif [[ $CHANGE_TYPE == "minor" ]]; then
       NEXT_VERSION=$(semver -i minor $CURRENT_VERSION)
   else
       NEXT_VERSION=$(semver -i patch $CURRENT_VERSION)
   fi

   # Update CHANGELOG.md: Replace [Unreleased] with [NEXT_VERSION] - YYYY-MM-DD
   TODAY=$(date +%Y-%m-%d)
   sed -i "s/## \[Unreleased\]/## \[$NEXT_VERSION\] - $TODAY/" CHANGELOG.md

   # Add new [Unreleased] section at the top
   sed -i '/^# Changelog/a\\n## [Unreleased]\n\n### Added\n\n### Changed\n\n### Deprecated\n\n### Removed\n\n### Fixed\n\n### Security\n' CHANGELOG.md
   ```

3. **Preserve Existing Entries:**
   - Never overwrite existing changelog content
   - Only promote "Unreleased" section to versioned release
   - Add new "Unreleased" section for future changes
   - Maintain chronological order (newest first)

**CHANGELOG Entry Requirements:**

- Promote "Unreleased" section to versioned release with current date
- Add new "Unreleased" section for future changes
- Categorize changes by type (Added, Changed, Deprecated, Removed, Fixed, Security)
- Include detailed descriptions of significant changes
- Mention any breaking changes prominently
- Reference commit hash and date in versioned releases

### 4. Update Package Versions and Create Git Tags

**Version Bump Strategy:**

- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (X.Y.0)**: New features, backward compatible changes
- **Patch (X.Y.Z)**: Bug fixes, documentation updates, minor improvements

**Files to Update:**

```bash
# Root package.json
package.json

# Individual package package.json files (if needed)
packages/*/package.json

# Version references in documentation
docs/*.md
README.md
```

**Version Update and Tagging Process:**

```bash
# Step 1: Update root package.json version
npm version $VERSION_TYPE --no-git-tag-version

# Step 2: Get the new version for tagging
NEW_VERSION=$(node -p "require('./package.json').version")

# Step 3: Create annotated Git tag with release notes
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION

$(grep -A 50 "## \[$NEW_VERSION\]" CHANGELOG.md | head -n -1 | tail -n +2)

Full changelog: https://github.com/your-org/reynard/compare/v$PREVIOUS_VERSION...v$NEW_VERSION"

# Step 4: Push tags to remote
git push origin "v$NEW_VERSION"
```

**Git Tag Requirements:**

- Use semantic versioning format: `v1.2.3`
- Create annotated tags with `-a` flag
- Include release notes from CHANGELOG.md in tag message
- Reference previous version in changelog link
- Push tags to remote repository

### 5. Execute Git Operations with Version Management

**Complete Git Workflow:**

```bash
# Step 1: Stage all changes
git add .

# Step 2: Commit changes with conventional commit message
git commit --no-verify -m "$COMMIT_MESSAGE"

# Step 3: Get previous version for changelog link
PREVIOUS_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")

# Step 4: Update package.json version (without creating tag)
npm version $VERSION_TYPE --no-git-tag-version

# Step 5: Get new version
NEW_VERSION=$(node -p "require('./package.json').version")

# Step 6: Update CHANGELOG.md (promote Unreleased to versioned release)
TODAY=$(date +%Y-%m-%d)
sed -i "s/## \[Unreleased\]/## \[$NEW_VERSION\] - $TODAY/" CHANGELOG.md

# Step 7: Add new [Unreleased] section at the top
sed -i '/^# Changelog/a\\n## [Unreleased]\n\n### Added\n\n### Changed\n\n### Deprecated\n\n### Removed\n\n### Fixed\n\n### Security\n' CHANGELOG.md

# Step 8: Stage CHANGELOG.md changes
git add CHANGELOG.md

# Step 9: Create release commit
git commit -m "chore: release v$NEW_VERSION

- Promote unreleased changes to v$NEW_VERSION
- Update CHANGELOG.md with release date
- Add new [Unreleased] section for future changes"

# Step 10: Create annotated Git tag with release notes
RELEASE_NOTES=$(grep -A 50 "## \[$NEW_VERSION\]" CHANGELOG.md | head -n -1 | tail -n +2)
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION

$RELEASE_NOTES

Full changelog: https://github.com/your-org/reynard/compare/$PREVIOUS_VERSION...v$NEW_VERSION"

# Step 11: Push commits and tags to remote
git push origin main
git push origin "v$NEW_VERSION"

echo "✅ Successfully released v$NEW_VERSION with Git tag!"
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

# Step 3: Determine version bump type based on changes
echo "🔍 Determining version bump type..."
if grep -q "BREAKING CHANGE\|feat!:" /tmp/git-changes-semantic.txt; then
    VERSION_TYPE="major"
    CHANGE_TYPE="major"
elif grep -q "feat:" /tmp/git-changes-semantic.txt; then
    VERSION_TYPE="minor"
    CHANGE_TYPE="minor"
else
    VERSION_TYPE="patch"
    CHANGE_TYPE="patch"
fi
echo "📈 Version bump type: $VERSION_TYPE"

# Step 4: Update CHANGELOG.md and package versions
echo "📚 Updating CHANGELOG.md and package versions..."

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

# Update package.json version (without creating tag)
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "🎯 New version: $NEW_VERSION"

# Update CHANGELOG.md: Replace [Unreleased] with [NEW_VERSION] - TODAY
TODAY=$(date +%Y-%m-%d)
sed -i "s/## \[Unreleased\]/## \[$NEW_VERSION\] - $TODAY/" CHANGELOG.md

# Add new [Unreleased] section at the top
sed -i '/^# Changelog/a\\n## [Unreleased]\n\n### Added\n\n### Changed\n\n### Deprecated\n\n### Removed\n\n### Fixed\n\n### Security\n' CHANGELOG.md

echo "📝 CHANGELOG.md updated: promoted [Unreleased] to [$NEW_VERSION] - $TODAY"

# Step 5: Execute git operations with delta preview
echo "🚀 Executing git operations..."
echo "📋 Previewing changes with delta..."
git diff --staged | delta --side-by-side || git diff --staged

# Stage all changes
git add .

# Commit changes
git commit --no-verify -m "$COMMIT_MESSAGE"

# Get previous version for changelog link
PREVIOUS_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
echo "🔗 Previous version: $PREVIOUS_VERSION"

# Create release commit for CHANGELOG.md changes
git commit -m "chore: release v$NEW_VERSION

- Promote unreleased changes to v$NEW_VERSION
- Update CHANGELOG.md with release date
- Add new [Unreleased] section for future changes"

# Create annotated Git tag with release notes
RELEASE_NOTES=$(grep -A 50 "## \[$NEW_VERSION\]" CHANGELOG.md | head -n -1 | tail -n +2)
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION

$RELEASE_NOTES

Full changelog: https://github.com/your-org/reynard/compare/$PREVIOUS_VERSION...v$NEW_VERSION"

echo "🏷️  Created Git tag: v$NEW_VERSION"

# Push commits and tags to remote
git push origin main
git push origin "v$NEW_VERSION"

echo "✅ Git workflow completed successfully with version v$NEW_VERSION and Git tag!"
```

## Quality Assurance Checklist

### Pre-Commit Validation

- [ ] All changes analyzed and categorized
- [ ] Commit message follows conventional format
- [ ] Version bump type determined (major/minor/patch)
- [ ] CHANGELOG.md [Unreleased] section has content
- [ ] Package versions will be bumped appropriately
- [ ] No sensitive data in commits
- [ ] All files properly staged

### Post-Commit Verification

- [ ] Commit pushed successfully
- [ ] CHANGELOG.md [Unreleased] promoted to versioned release
- [ ] New [Unreleased] section added to CHANGELOG.md
- [ ] Package.json version updated
- [ ] Git tag created with release notes
- [ ] Git tag pushed to remote repository
- [ ] Remote repository updated
- [ ] CI/CD pipeline triggered
- [ ] Documentation reflects changes
- [ ] Version numbers consistent across all files

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

# Check for version mismatches
git diff --name-only | grep package.json | xargs -I {} sh -c 'echo "=== {} ===" && cat {} | grep version'
```

#### Issue: CHANGELOG.md format errors

```bash
# Validate CHANGELOG.md format
grep -n "## \[" CHANGELOG.md

# Check for proper [Unreleased] section
grep -A 5 "## \[Unreleased\]" CHANGELOG.md

# Fix malformed CHANGELOG.md structure
sed -i '/^## \[Unreleased\]/,$d' CHANGELOG.md
echo -e "\n## [Unreleased]\n\n### Added\n\n### Changed\n\n### Deprecated\n\n### Removed\n\n### Fixed\n\n### Security\n" >> CHANGELOG.md
```

#### Issue: Git tag already exists

```bash
# Check existing tags
git tag -l | grep "v$NEW_VERSION"

# Delete local tag if exists
git tag -d "v$NEW_VERSION"

# Delete remote tag if exists
git push origin :refs/tags/v$NEW_VERSION

# Recreate tag
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
git push origin "v$NEW_VERSION"
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
3. ✅ Version bump type determined correctly (major/minor/patch)
4. ✅ CHANGELOG.md [Unreleased] section promoted to versioned release
5. ✅ New [Unreleased] section added to CHANGELOG.md for future changes
6. ✅ Package.json version updated appropriately
7. ✅ Git tag created with release notes from CHANGELOG.md
8. ✅ Changes are committed and pushed successfully
9. ✅ Git tag is pushed to remote repository
10. ✅ Repository state is clean and consistent

## Example Execution

```bash
# Execute the complete workflow
./git-workflow-automation.sh

# Expected output:
🦦 Starting Reynard Git Workflow Automation with Delta...
📊 Analyzing source code changes with delta...
🔍 Performing semantic change analysis...
🛡️  Analyzing security and impact...
🧪 Analyzing test coverage changes...
📝 Generating commit message...
🔍 Determining version bump type...
📈 Version bump type: minor
📚 Updating CHANGELOG.md and package versions...
📦 Current version: 1.2.3
🎯 New version: 1.3.0
📝 CHANGELOG.md updated: promoted [Unreleased] to [1.3.0] - 2025-09-15
🚀 Executing git operations...
📋 Previewing changes with delta...
🔗 Previous version: v1.2.3
🏷️  Created Git tag: v1.3.0
✅ Git workflow completed successfully with version v1.3.0 and Git tag!
```

---

_This prompt provides a comprehensive framework for automating Git workflows in the Reynard monorepo, ensuring_
_consistent, high-quality commits with proper CHANGELOG.md version management, semantic versioning, and Git tagging._
