# Git Workflow Automation Prompt

## Task Description

Execute a comprehensive Git workflow that analyzes code changes, creates meaningful commit messages, updates
documentation, and manages versioning across the Reynard monorepo.

## Complete Workflow Steps

### 1. Analyze Source Code Changes

#### Enhanced Diff Analysis with Delta

**Prerequisites - Delta Setup:**

Delta is a syntax-highlighting pager for Git that significantly enhances diff readability.

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
- **Detect and analyze potential junk files** from Python and TypeScript development

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

#### Junk File Detection and Analysis

**CRITICAL** - Before proceeding with any Git workflow, perform comprehensive junk file detection to identify and
discuss potential development artifacts that should not be committed to version control.

**Python Development Artifacts:**

```bash
# Python bytecode and cache files
find . -name "*.pyc" -o -name "*.pyo" -o -name "__pycache__" -type d
find . -name "*.pyd" -o -name "*.so" -o -name "*.egg-info" -type d

# Python virtual environments and build artifacts
find . -name "venv" -o -name ".venv" -o -name "env" -o -name ".env" -type d
find . -name "build" -o -name "dist" -o -name "*.egg" -type d
find . -name ".pytest_cache" -o -name ".coverage" -o -name "htmlcov" -type d

# Python IDE and editor files
find . -name ".vscode" -o -name ".idea" -o -name "*.swp" -o -name "*.swo"
find . -name ".ropeproject" -o -name ".mypy_cache" -o -name ".tox" -type d

# Python temporary and log files
find . -name "*.log" -o -name "*.tmp" -o -name "*.temp"
find . -name ".DS_Store" -o -name "Thumbs.db"
```

**TypeScript/JavaScript Development Artifacts:**

```bash
# TypeScript declaration files and build outputs
find . -name "*.d.ts" -not -path "*/node_modules/*"
find . -name "*.js.map" -o -name "*.d.ts.map"
find . -name "dist" -o -name "build" -o -name "out" -type d

# Node.js and npm artifacts
find . -name "node_modules" -type d
find . -name "package-lock.json" -o -name "yarn.lock" -o -name "pnpm-lock.yaml"
find . -name ".npm" -o -name ".yarn" -o -name ".pnpm" -type d

# TypeScript/JavaScript cache and temporary files
find . -name ".tsbuildinfo" -o -name "*.tsbuildinfo"
find . -name ".eslintcache" -o -name ".stylelintcache"
find . -name "coverage" -o -name ".nyc_output" -type d

# Build tool artifacts
find . -name ".vite" -o -name ".rollup.cache" -o -name ".turbo" -type d
find . -name "*.bundle.js" -o -name "*.chunk.js" -o -name "*.vendor.js"
```

**Reynard-Specific Artifacts:**

```bash
# Reynard monorepo specific patterns
find . -name "*.generated.*" -o -name "*.auto.*"
find . -name "temp" -o -name "tmp" -o -name ".temp" -type d
find . -name "*.backup" -o -name "*.bak" -o -name "*.orig"

# MCP server artifacts
find . -name "*.mcp.log" -o -name "mcp-*.json"
find . -name ".mcp-cache" -o -name "mcp-temp" -type d

# ECS World simulation artifacts
find . -name "*.sim.log" -o -name "ecs-*.json"
find . -name ".ecs-cache" -o -name "simulation-temp" -type d

# Agent naming system artifacts
find . -name "agent-names-*.json" -o -name ".agent-cache" -type d
find . -name "*.agent.log" -o -name "agent-temp" -type d
```

**Junk File Analysis Workflow:**

```bash
#!/bin/bash
# Comprehensive junk file detection script

echo "🔍 Scanning for potential junk files in Reynard monorepo..."

# Create temporary files for analysis
PYTHON_JUNK="/tmp/python-junk-files.txt"
TYPESCRIPT_JUNK="/tmp/typescript-junk-files.txt"
REYNARD_JUNK="/tmp/reynard-junk-files.txt"
ALL_JUNK="/tmp/all-junk-files.txt"

# Detect Python artifacts
echo "🐍 Detecting Python development artifacts..."
find . -name "*.pyc" -o -name "*.pyo" -o -name "__pycache__" -type d \
     -o -name "venv" -o -name ".venv" -o -name "env" -o -name ".env" -type d \
     -o -name "build" -o -name "dist" -o -name "*.egg" -type d \
     -o -name ".pytest_cache" -o -name ".coverage" -o -name "htmlcov" -type d \
     -o -name ".vscode" -o -name ".idea" -o -name "*.swp" -o -name "*.swo" \
     -o -name ".ropeproject" -o -name ".mypy_cache" -o -name ".tox" -type d \
     -o -name "*.log" -o -name "*.tmp" -o -name "*.temp" \
     -o -name ".DS_Store" -o -name "Thumbs.db" > "$PYTHON_JUNK"

# Detect TypeScript/JavaScript artifacts
echo "📦 Detecting TypeScript/JavaScript development artifacts..."
find . -name "*.d.ts" -not -path "*/node_modules/*" \
     -o -name "*.js.map" -o -name "*.d.ts.map" \
     -o -name "dist" -o -name "build" -o -name "out" -type d \
     -o -name "node_modules" -type d \
     -o -name ".tsbuildinfo" -o -name "*.tsbuildinfo" \
     -o -name ".eslintcache" -o -name ".stylelintcache" \
     -o -name "coverage" -o -name ".nyc_output" -type d \
     -o -name ".vite" -o -name ".rollup.cache" -o -name ".turbo" -type d \
     -o -name "*.bundle.js" -o -name "*.chunk.js" -o -name "*.vendor.js" > "$TYPESCRIPT_JUNK"

# Detect Reynard-specific artifacts
echo "🦊 Detecting Reynard-specific artifacts..."
find . -name "*.generated.*" -o -name "*.auto.*" \
     -o -name "temp" -o -name "tmp" -o -name ".temp" -type d \
     -o -name "*.backup" -o -name "*.bak" -o -name "*.orig" \
     -o -name "*.mcp.log" -o -name "mcp-*.json" \
     -o -name ".mcp-cache" -o -name "mcp-temp" -type d \
     -o -name "*.sim.log" -o -name "ecs-*.json" \
     -o -name ".ecs-cache" -o -name "simulation-temp" -type d \
     -o -name "agent-names-*.json" -o -name ".agent-cache" -type d \
     -o -name "*.agent.log" -o -name "agent-temp" -type d > "$REYNARD_JUNK"

# Combine all junk files
cat "$PYTHON_JUNK" "$TYPESCRIPT_JUNK" "$REYNARD_JUNK" | sort -u > "$ALL_JUNK"

# Analyze results
PYTHON_COUNT=$(wc -l < "$PYTHON_JUNK")
TYPESCRIPT_COUNT=$(wc -l < "$TYPESCRIPT_JUNK")
REYNARD_COUNT=$(wc -l < "$REYNARD_JUNK")
TOTAL_COUNT=$(wc -l < "$ALL_JUNK")

echo ""
echo "📊 Junk File Detection Results:"
echo "   🐍 Python artifacts: $PYTHON_COUNT files"
echo "   📦 TypeScript/JS artifacts: $TYPESCRIPT_COUNT files"
echo "   🦊 Reynard-specific artifacts: $REYNARD_COUNT files"
echo "   📋 Total potential junk files: $TOTAL_COUNT files"

if [ "$TOTAL_COUNT" -gt 0 ]; then
    echo ""
    echo "⚠️  POTENTIAL JUNK FILES DETECTED!"
    echo "   Review the following files before proceeding with Git workflow:"
    echo ""
    cat "$ALL_JUNK" | head -20
    if [ "$TOTAL_COUNT" -gt 20 ]; then
        echo "   ... and $((TOTAL_COUNT - 20)) more files"
    fi
    echo ""
    echo "🔧 Recommended actions:"
    echo "   1. Review each file to determine if it should be committed"
    echo "   2. Add appropriate patterns to .gitignore if needed"
    echo "   3. Remove or clean up unnecessary files"
    echo "   4. Re-run this detection after cleanup"
    echo ""
    echo "📁 Full list saved to: $ALL_JUNK"

    # Clean up temporary files
    rm -f "$PYTHON_JUNK" "$TYPESCRIPT_JUNK" "$REYNARD_JUNK"

    exit 1
else
    echo ""
    echo "✅ No junk files detected! Repository is clean."

    # Clean up temporary files
    rm -f "$PYTHON_JUNK" "$TYPESCRIPT_JUNK" "$REYNARD_JUNK" "$ALL_JUNK"

    exit 0
fi
```

**User Interaction Protocol:**

When junk files are detected, the workflow MUST:

1. **STOP** the Git workflow process
2. **DISPLAY** a comprehensive report of detected junk files
3. **WAIT** for user confirmation before proceeding
4. **PROVIDE** recommendations for cleanup actions
5. **ALLOW** user to review and decide on each file category

**Example User Interaction:**

```bash
⚠️  POTENTIAL JUNK FILES DETECTED!

📊 Detection Results:
   🐍 Python artifacts: 15 files
   📦 TypeScript/JS artifacts: 8 files
   🦊 Reynard-specific artifacts: 3 files
   📋 Total potential junk files: 26 files

🔍 Sample detected files:
   ./packages/core/__pycache__/
   ./packages/rag/src/index.d.ts
   ./backend/.pytest_cache/
   ./services/mcp-server/mcp-temp/
   ./packages/components/dist/

❓ How would you like to proceed?

1. Review and clean up junk files (RECOMMENDED)
2. Add patterns to .gitignore and continue
3. Force continue without cleanup (NOT RECOMMENDED)
4. Exit workflow to handle manually

Please select an option (1-4): _
```

**Integration with Git Workflow:**

The junk file detection should be integrated as the **FIRST STEP** in the Git workflow automation script,
before any analysis or commit operations:

```bash
#!/bin/bash
# Enhanced Git Workflow with Junk File Detection

echo "🦦 Starting Reynard Git Workflow Automation with Junk File Detection..."

# Step 0: Junk file detection (MANDATORY FIRST STEP)
echo "🔍 Performing junk file detection..."
if ! ./scripts/detect-junk-files.sh; then
    echo "❌ Junk files detected. Please clean up before proceeding."
    echo "   Run: ./scripts/detect-junk-files.sh for detailed analysis"
    exit 1
fi

echo "✅ Repository is clean. Proceeding with Git workflow..."

# Continue with existing workflow steps...
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

The CHANGELOG.md follows the [Keep a Changelog](https://keepachangelog.com/) format with an "Unreleased" section
that gets promoted to a versioned release.

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

   # Add new [Unreleased] section after the header (line 8)
   sed -i '8a\
   \
   ```

## [Unreleased]\

\

### Added\

\

### Changed\

\

### Deprecated\

\

### Removed\

\

### Fixed\

\

### Security\

' CHANGELOG.md

````bash

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

**CHANGELOG.md Structure Explanation:**

> **Note**: The sed commands in this documentation use specific formatting that may trigger markdown linting warnings. This formatting is intentional and necessary for the commands to work correctly across different systems.

The Reynard CHANGELOG.md follows the [Keep a Changelog](https://keepachangelog.com/) format with this specific structure:

```markdown
# Changelog

All notable changes to the Reynard framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
[Future changes go here]

## [X.Y.Z] - YYYY-MM-DD

### Added
[Released changes go here]
````

**Critical Positioning Rules:**

1. **`[Unreleased]` section MUST be at the top** (after the header, before any versioned releases)
2. **Versioned releases are in reverse chronological order** (newest first)
3. **Each version entry has the format**: `## [VERSION] - YYYY-MM-DD`
4. **The sed command targets line 8** because that's where the new `[Unreleased]` section should be inserted

**Common CHANGELOG.md Issues and Solutions:**

#### Issue: Malformed version entries

```bash
# BAD: Concatenated versions like "## [0.7.0] - 2025-09-16 [0.6.1] - 2025-09-16"
# GOOD: Separate entries
## [0.7.0] - 2025-09-16
## [0.6.1] - 2025-09-16
```

**Issue: `[Unreleased]` section in wrong position**

```bash
# BAD: [Unreleased] section appears after versioned releases
# GOOD: [Unreleased] section is always first (after header)
```

#### Issue: Incorrect sed command syntax

```bash
# BAD: Using a\\n which doesn't work in all sed implementations
sed -i '/^# Changelog/a\\n## [Unreleased]' CHANGELOG.md

# GOOD: Using proper sed append syntax with line numbers
sed -i '8a\
\
## [Unreleased]\
' CHANGELOG.md
```

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

Full changelog: https://github.com/rakki194/reynard/compare/v$PREVIOUS_VERSION...v$NEW_VERSION"

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

# Step 7: Add new [Unreleased] section after the header (line 8)
sed -i '8a\
\
## [Unreleased]\
\
### Added\
\
### Changed\
\
### Deprecated\
\
### Removed\
\
### Fixed\
\
### Security\
' CHANGELOG.md

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

Full changelog: https://github.com/rakki194/reynard/compare/$PREVIOUS_VERSION...v$NEW_VERSION"

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

# Git Workflow Automation Script with Junk File Detection and Delta Enhancement
set -e

echo "🦦 Starting Reynard Git Workflow Automation with Junk File Detection and Delta..."

# Step 0: Junk file detection (MANDATORY FIRST STEP)
echo "🔍 Performing comprehensive junk file detection..."
if ! ./scripts/detect-junk-files.sh; then
    echo "❌ Junk files detected. Please clean up before proceeding."
    echo "   Run: ./scripts/detect-junk-files.sh for detailed analysis"
    echo "   Or review the detected files and add appropriate .gitignore patterns"
    exit 1
fi

echo "✅ Repository is clean. Proceeding with Git workflow..."

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

# Add new [Unreleased] section after the header (line 8)
sed -i '8a\
\
## [Unreleased]\
\
### Added\
\
### Changed\
\
### Deprecated\
\
### Removed\
\
### Fixed\
\
### Security\
' CHANGELOG.md

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

Full changelog: https://github.com/rakki194/reynard/compare/$PREVIOUS_VERSION...v$NEW_VERSION"

echo "🏷️  Created Git tag: v$NEW_VERSION"

# Push commits and tags to remote
git push origin main
git push origin "v$NEW_VERSION"

echo "✅ Git workflow completed successfully with version v$NEW_VERSION and Git tag!"
```

## Junk File Detection Script Setup

### CRITICAL - Before using the enhanced Git workflow, create the junk file detection script

```bash
#!/bin/bash
# Create the junk file detection script
mkdir -p scripts
cat > scripts/detect-junk-files.sh << 'EOF'
#!/bin/bash
# Comprehensive junk file detection script for Reynard monorepo

echo "🔍 Scanning for potential junk files in Reynard monorepo..."

# Create temporary files for analysis
PYTHON_JUNK="/tmp/python-junk-files.txt"
TYPESCRIPT_JUNK="/tmp/typescript-junk-files.txt"
REYNARD_JUNK="/tmp/reynard-junk-files.txt"
ALL_JUNK="/tmp/all-junk-files.txt"

# Detect Python artifacts
echo "🐍 Detecting Python development artifacts..."
find . -name "*.pyc" -o -name "*.pyo" -o -name "__pycache__" -type d \
     -o -name "venv" -o -name ".venv" -o -name "env" -o -name ".env" -type d \
     -o -name "build" -o -name "dist" -o -name "*.egg" -type d \
     -o -name ".pytest_cache" -o -name ".coverage" -o -name "htmlcov" -type d \
     -o -name ".vscode" -o -name ".idea" -o -name "*.swp" -o -name "*.swo" \
     -o -name ".ropeproject" -o -name ".mypy_cache" -o -name ".tox" -type d \
     -o -name "*.log" -o -name "*.tmp" -o -name "*.temp" \
     -o -name ".DS_Store" -o -name "Thumbs.db" > "$PYTHON_JUNK"

# Detect TypeScript/JavaScript artifacts
echo "📦 Detecting TypeScript/JavaScript development artifacts..."
find . -name "*.d.ts" -not -path "*/node_modules/*" \
     -o -name "*.js.map" -o -name "*.d.ts.map" \
     -o -name "dist" -o -name "build" -o -name "out" -type d \
     -o -name "node_modules" -type d \
     -o -name ".tsbuildinfo" -o -name "*.tsbuildinfo" \
     -o -name ".eslintcache" -o -name ".stylelintcache" \
     -o -name "coverage" -o -name ".nyc_output" -type d \
     -o -name ".vite" -o -name ".rollup.cache" -o -name ".turbo" -type d \
     -o -name "*.bundle.js" -o -name "*.chunk.js" -o -name "*.vendor.js" > "$TYPESCRIPT_JUNK"

# Detect Reynard-specific artifacts
echo "🦊 Detecting Reynard-specific artifacts..."
find . -name "*.generated.*" -o -name "*.auto.*" \
     -o -name "temp" -o -name "tmp" -o -name ".temp" -type d \
     -o -name "*.backup" -o -name "*.bak" -o -name "*.orig" \
     -o -name "*.mcp.log" -o -name "mcp-*.json" \
     -o -name ".mcp-cache" -o -name "mcp-temp" -type d \
     -o -name "*.sim.log" -o -name "ecs-*.json" \
     -o -name ".ecs-cache" -o -name "simulation-temp" -type d \
     -o -name "agent-names-*.json" -o -name ".agent-cache" -type d \
     -o -name "*.agent.log" -o -name "agent-temp" -type d > "$REYNARD_JUNK"

# Combine all junk files
cat "$PYTHON_JUNK" "$TYPESCRIPT_JUNK" "$REYNARD_JUNK" | sort -u > "$ALL_JUNK"

# Analyze results
PYTHON_COUNT=$(wc -l < "$PYTHON_JUNK")
TYPESCRIPT_COUNT=$(wc -l < "$TYPESCRIPT_JUNK")
REYNARD_COUNT=$(wc -l < "$REYNARD_JUNK")
TOTAL_COUNT=$(wc -l < "$ALL_JUNK")

echo ""
echo "📊 Junk File Detection Results:"
echo "   🐍 Python artifacts: $PYTHON_COUNT files"
echo "   📦 TypeScript/JS artifacts: $TYPESCRIPT_COUNT files"
echo "   🦊 Reynard-specific artifacts: $REYNARD_COUNT files"
echo "   📋 Total potential junk files: $TOTAL_COUNT files"

if [ "$TOTAL_COUNT" -gt 0 ]; then
    echo ""
    echo "⚠️  POTENTIAL JUNK FILES DETECTED!"
    echo "   Review the following files before proceeding with Git workflow:"
    echo ""
    cat "$ALL_JUNK" | head -20
    if [ "$TOTAL_COUNT" -gt 20 ]; then
        echo "   ... and $((TOTAL_COUNT - 20)) more files"
    fi
    echo ""
    echo "🔧 Recommended actions:"
    echo "   1. Review each file to determine if it should be committed"
    echo "   2. Add appropriate patterns to .gitignore if needed"
    echo "   3. Remove or clean up unnecessary files"
    echo "   4. Re-run this detection after cleanup"
    echo ""
    echo "📁 Full list saved to: $ALL_JUNK"

    # Clean up temporary files
    rm -f "$PYTHON_JUNK" "$TYPESCRIPT_JUNK" "$REYNARD_JUNK"

    exit 1
else
    echo ""
    echo "✅ No junk files detected! Repository is clean."

    # Clean up temporary files
    rm -f "$PYTHON_JUNK" "$TYPESCRIPT_JUNK" "$REYNARD_JUNK" "$ALL_JUNK"

    exit 0
fi
EOF

# Make the script executable
chmod +x scripts/detect-junk-files.sh

echo "✅ Junk file detection script created at scripts/detect-junk-files.sh"
echo "   Run: ./scripts/detect-junk-files.sh to test the detection"
```

## Quality Assurance Checklist

### Pre-Commit Validation

- [ ] **Junk file detection completed** - No Python/TypeScript development artifacts detected
- [ ] All changes analyzed and categorized
- [ ] Commit message follows conventional format
- [ ] Version bump type determined (major/minor/patch)
- [ ] CHANGELOG.md [Unreleased] section has content
- [ ] CHANGELOG.md structure is valid (see validation commands below)
- [ ] Package versions will be bumped appropriately
- [ ] No sensitive data in commits
- [ ] All files properly staged

### CHANGELOG.md Validation Commands

```bash
# Validate CHANGELOG.md structure
echo "🔍 Validating CHANGELOG.md structure..."

# Check if [Unreleased] section exists and is in correct position
UNRELEASED_LINE=$(grep -n "## \[Unreleased\]" CHANGELOG.md | cut -d: -f1)
if [ -z "$UNRELEASED_LINE" ]; then
    echo "❌ [Unreleased] section not found"
    exit 1
elif [ "$UNRELEASED_LINE" -ne 9 ]; then
    echo "❌ [Unreleased] section at line $UNRELEASED_LINE, should be at line 9"
    exit 1
else
    echo "✅ [Unreleased] section correctly positioned at line $UNRELEASED_LINE"
fi

# Check for malformed version entries
MALFORMED_ENTRIES=$(grep -n "## \[.*\] - .* \[.*\] -" CHANGELOG.md)
if [ -n "$MALFORMED_ENTRIES" ]; then
    echo "❌ Malformed version entries found:"
    echo "$MALFORMED_ENTRIES"
    exit 1
else
    echo "✅ No malformed version entries found"
fi

# Check version entry format
VERSION_ENTRIES=$(grep -n "## \[[0-9]" CHANGELOG.md)
if [ -n "$VERSION_ENTRIES" ]; then
    echo "📋 Version entries found:"
    echo "$VERSION_ENTRIES"

    # Validate each version entry has proper date format
    while IFS= read -r line; do
        if ! echo "$line" | grep -q "## \[[0-9]\+\.[0-9]\+\.[0-9]\+\] - [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}$"; then
            echo "❌ Invalid version entry format: $line"
            exit 1
        fi
    done <<< "$VERSION_ENTRIES"
    echo "✅ All version entries have correct format"
fi

echo "✅ CHANGELOG.md structure validation passed"
```

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

#### Issue: Concatenated version entries in CHANGELOG.md

```bash
# Check for malformed entries like "## [0.7.0] - 2025-09-16 [0.6.1] - 2025-09-16"
grep -n "## \[.*\] - .* \[.*\] -" CHANGELOG.md

# Fix concatenated version entries
sed -i 's/## \[\([0-9]\+\.[0-9]\+\.[0-9]\+\)\] - \([0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}\) \[\([0-9]\+\.[0-9]\+\.[0-9]\+\)\] - \([0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}\)/## [\1] - \2/' CHANGELOG.md

# Verify the fix
grep -n "## \[" CHANGELOG.md
```

#### Issue: [Unreleased] section in wrong position

```bash
# Check if [Unreleased] is in the correct position (should be line 9)
grep -n "## \[Unreleased\]" CHANGELOG.md

# If [Unreleased] is not at line 9, fix the positioning
# First, remove the misplaced [Unreleased] section
sed -i '/^## \[Unreleased\]/,/^## \[/ { /^## \[Unreleased\]/d; /^## \[/!d; }' CHANGELOG.md

# Then add it in the correct position (after line 8)
sed -i '8a\
\
## [Unreleased]\
\
### Added\
\
### Changed\
\
### Deprecated\
\
### Removed\
\
### Fixed\
\
### Security\
' CHANGELOG.md
```

#### Issue: Sed command not working on macOS/BSD

```bash
# macOS/BSD sed requires different syntax
# Use this instead of the Linux sed commands:

# For promoting [Unreleased] to versioned release
sed -i '' "s/## \[Unreleased\]/## \[$NEW_VERSION\] - $TODAY/" CHANGELOG.md

# For adding new [Unreleased] section
sed -i '' '8a\
\
## [Unreleased]\
\
### Added\
\
### Changed\
\
### Deprecated\
\
### Removed\
\
### Fixed\
\
### Security\
' CHANGELOG.md
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

## .gitignore Enhancement for Junk File Prevention

### CRITICAL - After detecting junk files, update the .gitignore file to prevent future accumulation

```bash
#!/bin/bash
# Enhanced .gitignore for Reynard monorepo

# Create or update .gitignore with comprehensive patterns
cat >> .gitignore << 'EOF'

# =============================================================================
# REYNARD MONOREPO - JUNK FILE PREVENTION PATTERNS
# =============================================================================

# Python Development Artifacts
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Python Virtual Environments
venv/
.venv/
env/
.env/
ENV/
env.bak/
venv.bak/

# Python Testing and Coverage
.pytest_cache/
.coverage
htmlcov/
.tox/
.nox/
coverage.xml
*.cover
.hypothesis/

# Python IDE and Editor Files
.vscode/
.idea/
*.swp
*.swo
*~
.ropeproject
.mypy_cache/
.dmypy.json
dmypy.json

# TypeScript/JavaScript Build Artifacts
*.d.ts
*.js.map
*.d.ts.map
dist/
build/
out/
*.tsbuildinfo
.eslintcache
.stylelintcache

# Node.js and Package Managers
node_modules/
.npm/
.yarn/
.pnpm/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build Tool Caches
.vite/
.rollup.cache/
.turbo/
*.bundle.js
*.chunk.js
*.vendor.js

# Coverage and Testing
coverage/
.nyc_output/
junit.xml

# Reynard-Specific Artifacts
*.generated.*
*.auto.*
temp/
tmp/
.temp/
*.backup
*.bak
*.orig

# MCP Server Artifacts
*.mcp.log
mcp-*.json
.mcp-cache/
mcp-temp/

# ECS World Simulation Artifacts
*.sim.log
ecs-*.json
.ecs-cache/
simulation-temp/

# Agent Naming System Artifacts
agent-names-*.json
.agent-cache/
*.agent.log
agent-temp/

# System Files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Log Files
*.log
*.tmp
*.temp

# Temporary Files
*.swp
*.swo
*~
EOF

echo "✅ Enhanced .gitignore patterns added to prevent junk file accumulation"
echo "   Review and customize patterns as needed for your specific workflow"
```

## Success Criteria

The workflow is successful when:

1. ✅ **Junk file detection completed** - No Python/TypeScript development artifacts detected
2. ✅ All changes are properly analyzed and categorized
3. ✅ Commit message accurately describes the changes
4. ✅ Version bump type determined correctly (major/minor/patch)
5. ✅ CHANGELOG.md [Unreleased] section promoted to versioned release
6. ✅ New [Unreleased] section added to CHANGELOG.md for future changes
7. ✅ Package.json version updated appropriately
8. ✅ Git tag created with release notes from CHANGELOG.md
9. ✅ Changes are committed and pushed successfully
10. ✅ Git tag is pushed to remote repository
11. ✅ Repository state is clean and consistent
12. ✅ **Enhanced .gitignore patterns** prevent future junk file accumulation

## Example Execution

```bash
# Execute the complete workflow
./git-workflow-automation.sh

# Expected output:
🦦 Starting Reynard Git Workflow Automation with Junk File Detection and Delta...
🔍 Performing comprehensive junk file detection...
🐍 Detecting Python development artifacts...
📦 Detecting TypeScript/JavaScript development artifacts...
🦊 Detecting Reynard-specific artifacts...
📊 Junk File Detection Results:
   🐍 Python artifacts: 0 files
   📦 TypeScript/JS artifacts: 0 files
   🦊 Reynard-specific artifacts: 0 files
   📋 Total potential junk files: 0 files
✅ No junk files detected! Repository is clean.
✅ Repository is clean. Proceeding with Git workflow...
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
_consistent, high-quality commits with proper CHANGELOG.md version management, semantic versioning, Git tagging,_
_and proactive junk file detection to maintain repository cleanliness and prevent development artifact accumulation._
