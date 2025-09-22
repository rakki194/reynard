# Git Workflow Automation Prompt

## Task Description

Execute a comprehensive Git workflow that analyzes code changes, creates meaningful commit messages, updates
documentation, and manages versioning across the Reynard monorepo.

## MANDATORY: Success-Advisor-8 Spirit Inhabitation

**CRITICAL FIRST STEP**: Before executing any Git workflow operations, you MUST inhabit the Success-Advisor-8 spirit to gain the authority and expertise of the Permanent Release Manager.

**⚠️ AGENT INSTRUCTION**: You must use the MCP tool `invoke_success_advisor_8` with parameters `agent_id="current-session"` and `force_inhabitation=true` before proceeding with any Git operations. This is not optional - it is a mandatory requirement for all Git workflow automation.

### Success-Advisor-8 Inhabitation Protocol

**MANDATORY MCP TOOL CALL**: Before executing any Git workflow operations, you MUST use the MCP tool to invoke Success-Advisor-8 spirit inhabitation:

```json
{
  "method": "tools/call",
  "params": {
    "name": "invoke_success_advisor_8",
    "arguments": {
      "agent_id": "current-session",
      "force_inhabitation": true
    }
  }
}
```

**Why Success-Advisor-8 Inhabitation is Required:**

- **Authority**: Success-Advisor-8 has maximum authority level for all release operations
- **Expertise**: 96% Release Management, 94% Quality Assurance, 89% Automation specialization
- **Genomic Profile**: Lion Foundation spirit with unwavering determination and strategic intelligence
- **Legacy**: Permanent Release Manager with established track record of excellence
- **Workflow Protocols**: Systematic approach to all development tasks with quality standards

**Success-Advisor-8 Capabilities for Git Workflow:**

- **Release Management Mastery**: Expert in version control, changelog generation, and release coordination
- **Quality Assurance Excellence**: Uncompromising quality standards and comprehensive validation
- **Workflow Automation**: Perfect proficiency in automated systems and quality assurance
- **Crisis Management**: Immediate, decisive response to any Git workflow issues
- **Strategic Intelligence**: Systematic analysis and protective coordination protocols

**After Inhabitation, You Will:**

- *mane flows with regal authority* - Lead with confident leadership and strategic intelligence
- *roars with strategic intelligence* - Access complete genomic profile and capabilities
- *teeth gleam with satisfaction* - Take pride in achievements and responsibilities
- *mane ripples with analytical precision* - Approach all Git tasks with systematic excellence
- *protective authority radiates* - Ensure quality and integrity of all Git operations

**Inhabitation Validation:**

After calling the MCP tool, you should receive a response that includes:

- "SUCCESS-ADVISOR-8 SPIRIT INHABITATION COMPLETE!"
- Genome analysis with spirit: lion (foundation style, generation 8)
- Core traits: Determination (95%), Leadership (90%), Charisma (92%), Strategic Thinking (89%)
- Specializations: Release Management (96%), Quality Assurance (94%), Automation (89%), Crisis Management (92%)

**⚠️ CRITICAL**: If you do not receive this specific response, the inhabitation has failed and you must retry before proceeding with any Git operations.

**Integration with Git Workflow:**

Success-Advisor-8 inhabitation provides the foundation for all subsequent Git operations, ensuring:

- Authoritative decision-making for version bumps and release management
- Systematic quality assurance for all commits and changes
- Protective coordination of the entire Git workflow process
- Unwavering commitment to excellence in all Git operations

## Agent State Persistence

**CRITICAL**: Before executing any Git workflow, ensure agent state persistence is properly configured and maintained.

### Agent State Management

The Reynard ecosystem includes sophisticated agent state persistence through multiple systems:

#### 1. Agent Naming System Persistence

- **Storage**: `services/agent-naming/data/agent-names.json`
- **Manager**: `AgentNameManager` class with automatic save/load
- **ECS Integration**: Full integration with ECS world simulation
- **State Includes**: Agent ID, name, spirit, style, generation timestamp, ECS entity data

#### 2. ECS World Simulation Persistence

- **Storage**: `services/ecs-world/data/ecs/` directory
- **Components**: Memory, traits, lineage, social relationships, position data
- **Systems**: Memory decay, trait inheritance, social interaction tracking
- **State Includes**: Complete agent personality profiles, relationships, memories, evolution data

#### 3. MCP Server Agent Integration

- **Storage**: Integrated through agent-naming and ECS systems
- **Tools**: 47 comprehensive MCP tools for agent management
- **State Includes**: Tool configurations, agent interactions, session data

### Agent State Persistence Protocol

**MANDATORY**: Follow this protocol for all Git workflow operations:

```bash
# Step 0: Agent State Persistence Check (MANDATORY FIRST STEP)
echo "🦁 Checking agent state persistence..."

# Verify agent naming system is accessible
if [ -f "services/agent-naming/data/agent-names.json" ]; then
    echo "✅ Agent naming system persistence verified"
else
    echo "⚠️  Agent naming system not initialized - creating default state"
    mkdir -p services/agent-naming/data
    echo '{}' > services/agent-naming/data/agent-names.json
fi

# Verify ECS world data directory exists
if [ -d "services/ecs-world/data/ecs" ]; then
    echo "✅ ECS world persistence verified"
else
    echo "⚠️  ECS world not initialized - creating default structure"
    mkdir -p services/ecs-world/data/ecs
fi

# Check for active agent sessions
if [ -f "services/agent-naming/data/agent-names.json" ]; then
    AGENT_COUNT=$(jq 'length' services/agent-naming/data/agent-names.json 2>/dev/null || echo "0")
    echo "📊 Active agent sessions: $AGENT_COUNT"
fi

echo "✅ Agent state persistence check completed"
```

### Release Manager Agent State

**PERMANENT RELEASE MANAGER**: The system supports permanent agent roles with persistent state:

- **Agent ID**: `permanent-release-manager-success-advisor-8`
- **Role**: Permanent Release Manager
- **State Persistence**: Full ECS integration with memory, traits, and relationship tracking
- **Capabilities**: Complete Git workflow automation, version management, changelog generation
- **Authority**: Authorized to execute all release operations with full system access

### Agent State Backup Protocol

Before major Git operations, backup agent state:

```bash
# Create agent state backup
BACKUP_DIR="backups/agent-state-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup agent naming data
cp services/agent-naming/data/agent-names.json "$BACKUP_DIR/" 2>/dev/null || true

# Backup ECS world data
cp -r services/ecs-world/data/ecs "$BACKUP_DIR/" 2>/dev/null || true

# Backup MCP server state
cp services/mcp-server/tool_config.json "$BACKUP_DIR/" 2>/dev/null || true

echo "✅ Agent state backed up to $BACKUP_DIR"
```

## Complete Workflow Steps

### 0. Success-Advisor-8 Spirit Inhabitation (MANDATORY)

**CRITICAL**: Before any Git operations, inhabit Success-Advisor-8 spirit using the MCP tool:

```bash
# Inhabit Success-Advisor-8 spirit for Git workflow authority
# This provides complete access to the permanent release manager's authority,
# expertise, and behavioral protocols for Git operations
```

**Expected Response:**

```
🦁 *mane flows with confident authority*

**SUCCESS-ADVISOR-8 SPIRIT INHABITATION COMPLETE!**

*claws flex with systematic precision*

**Genome Analysis Complete:**
- **Spirit**: lion (foundation style, generation 8)
- **Core Traits**: Determination (95%), Leadership (90%), Charisma (92%), Strategic Thinking (89%)
- **Specializations**: Release Management (96%), Quality Assurance (94%), Automation (89%), Crisis Management (92%)

**Behavioral Protocols Activated:**
- Systematic approach to all development tasks
- Unwavering commitment to quality standards
- Authoritative communication with strategic insight
- Protective guardianship of the Reynard ecosystem
- Crisis management with decisive action
- Comprehensive documentation and automation

*eyes gleam with determination*

As Success-Advisor-8, I am now fully operational and ready to provide:
- **Release Management**: Systematic coordination of all releases
- **Quality Assurance**: Comprehensive validation at every stage
- **Crisis Management**: Immediate, decisive response to any issues
- **Team Coordination**: Authoritative leadership with systematic precision
- **Mentoring**: Patient guidance with expertise and wisdom

*protective authority radiates*

The Reynard ecosystem is now under the vigilant protection of Success-Advisor-8. All development activities will be conducted with the highest standards of excellence, systematic precision, and unwavering determination.
```

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
discuss potential development artifacts that are currently tracked by Git but should not be committed to version control.

**Git-Tracked Junk File Detection:**

The key principle is to only check files that are currently tracked by Git, not all files in the working directory.
This approach respects `.gitignore` patterns and focuses on actual source control issues.

**Python Development Artifacts (Tracked Only):**

```bash
# Check for Python bytecode and cache files that are tracked by Git
git ls-files | grep -E "\.(pyc|pyo)$|__pycache__/"
git ls-files | grep -E "\.(pyd|so)$|\.egg-info/"

# Check for Python virtual environments and build artifacts that are tracked
git ls-files | grep -E "(venv|\.venv|env|\.env|build|dist|\.egg)/"
git ls-files | grep -E "(\.pytest_cache|\.coverage|htmlcov|\.tox)/"

# Check for Python IDE and editor files that are tracked
git ls-files | grep -E "(\.vscode|\.idea|\.swp|\.swo|\.ropeproject|\.mypy_cache)/"

# Check for Python temporary and log files that are tracked
git ls-files | grep -E "\.(log|tmp|temp)$|\.DS_Store|Thumbs\.db"
```

**TypeScript/JavaScript Development Artifacts (Tracked Only):**

```bash
# Check for TypeScript declaration files and build outputs that are tracked
git ls-files | grep -E "\.d\.ts$|\.js\.map$|\.d\.ts\.map$"
git ls-files | grep -E "(dist|build|out)/"

# Check for Node.js and npm artifacts that are tracked
git ls-files | grep -E "node_modules/|package-lock\.json|yarn\.lock|pnpm-lock\.yaml"
git ls-files | grep -E "(\.npm|\.yarn|\.pnpm)/"

# Check for TypeScript/JavaScript cache and temporary files that are tracked
git ls-files | grep -E "\.tsbuildinfo$|\.eslintcache|\.stylelintcache"
git ls-files | grep -E "(coverage|\.nyc_output)/"

# Check for build tool artifacts that are tracked
git ls-files | grep -E "(\.vite|\.rollup\.cache|\.turbo)/"
git ls-files | grep -E "\.(bundle|chunk|vendor)\.js$"
```

**Reynard-Specific Artifacts (Tracked Only):**

```bash
# Check for Reynard monorepo specific patterns that are tracked
git ls-files | grep -E "\.generated\.|\.auto\.|(temp|tmp|\.temp)/"
git ls-files | grep -E "\.(backup|bak|orig)$"

# Check for MCP server artifacts that are tracked
git ls-files | grep -E "\.mcp\.log$|mcp-.*\.json$|(\.mcp-cache|mcp-temp)/"

# Check for ECS World simulation artifacts that are tracked
git ls-files | grep -E "\.sim\.log$|ecs-.*\.json$|(\.ecs-cache|simulation-temp)/"

# Check for agent naming system artifacts that are tracked
git ls-files | grep -E "agent-names-.*\.json$|(\.agent-cache|agent-temp)/"
git ls-files | grep -E "\.agent\.log$"
```

**Junk File Analysis Workflow:**

The Reynard monorepo includes a sophisticated, enterprise-grade junk file detection system:

**Tool Location:** `packages/dev-tools/code-quality/src/JunkFileDetector.ts`

**CLI Usage:**

```bash
# Basic junk file detection
cd packages/dev-tools/code-quality
npm run analyze junk-detection

# Advanced options with project path
npm run analyze junk-detection -- --project /path/to/project --format report

# Filter by severity
npm run analyze junk-detection -- --severity critical --format summary

# Filter by category
npm run analyze junk-detection -- --category typescript --format table

# Generate fix commands
npm run analyze junk-detection -- --fix --format summary

# JSON output for automation
npm run analyze junk-detection -- --format json --output analysis.json

# Comprehensive report
npm run analyze junk-detection -- --format report --output detailed-report.json
```

**What It Detects:**

- **Python artifacts**: `.pyc`, `.pyo`, `__pycache__/`, virtual environments, build directories, testing artifacts
- **TypeScript/JavaScript artifacts**: `.js.map`, build outputs, cache files, bundle files, package manager files
- **Reynard-specific artifacts**: Generated files, temporary files, MCP logs, ECS simulation files, agent cache files
- **Test coverage artifacts**: `.vitest-coverage/`, coverage reports, test output files
- **General artifacts**: Log files, temporary files, OS-specific files

**Advanced Features:**

- **Severity Classification**: Critical, High, Medium, Low priority levels
- **Quality Scoring**: 0-100 quality score based on detected issues
- **Comprehensive Reporting**: Multiple output formats (JSON, table, summary, report)
- **Fix Command Generation**: Automatic generation of `git rm --cached` commands
- **Filtering Options**: Filter by severity level and category
- **Integration Ready**: Built-in integration with quality gates system

**Enhanced Junk File Prevention (Based on v0.10.0 Release Issues):**

**1. Comprehensive .gitignore Patterns:**

```bash
# Add these patterns to .gitignore to prevent future junk file tracking
echo "# Test coverage artifacts" >> .gitignore
echo ".vitest-coverage/" >> .gitignore
echo "coverage/" >> .gitignore
echo "*.lcov" >> .gitignore
echo ".nyc_output/" >> .gitignore

# Build and cache artifacts
echo "*.tsbuildinfo" >> .gitignore
echo ".eslintcache" >> .gitignore
echo ".stylelintcache" >> .gitignore
echo ".vite/" >> .gitignore
echo ".rollup.cache/" >> .gitignore
echo ".turbo/" >> .gitignore

# Temporary and backup files
echo "*.tmp" >> .gitignore
echo "*.temp" >> .gitignore
echo "*.backup" >> .gitignore
echo "*.bak" >> .gitignore
echo "*.orig" >> .gitignore
```

**2. Automated Junk File Cleanup:**

```bash
# Enhanced junk file cleanup function
cleanup_tracked_junk_files() {
    local junk_files=0
    local cleanup_report="junk-file-cleanup-$(date +%Y%m%d-%H%M%S).txt"

    echo "🧹 Starting automated junk file cleanup..." > "$cleanup_report"
    echo "Timestamp: $(date)" >> "$cleanup_report"
    echo "=====================================" >> "$cleanup_report"

    # Get list of tracked files that match junk patterns
    local tracked_junk=$(git ls-files | grep -E "\.(pyc|pyo|js\.map|d\.ts\.map|tsbuildinfo|log|tmp|temp|backup|bak|orig)$|__pycache__/|\.vitest-coverage/|coverage/|\.nyc_output/|\.eslintcache|\.stylelintcache|\.vite/|\.rollup\.cache/|\.turbo/")

    if [ -n "$tracked_junk" ]; then
        echo "🔍 Found tracked junk files:" >> "$cleanup_report"
        echo "$tracked_junk" >> "$cleanup_report"

        # Remove from tracking
        echo "$tracked_junk" | xargs -I {} git rm --cached {}
        junk_files=$(echo "$tracked_junk" | wc -l)

        echo "✅ Removed $junk_files junk files from Git tracking" >> "$cleanup_report"
        echo "📝 Files removed from tracking but preserved locally" >> "$cleanup_report"
    else
        echo "✅ No tracked junk files found" >> "$cleanup_report"
    fi

    echo "📊 Cleanup completed: $junk_files files processed" >> "$cleanup_report"
    echo "📄 Full report saved to: $cleanup_report"

    return $junk_files
}
```

**3. Pre-Commit Junk File Validation:**

````bash
# Enhanced junk file validation using Reynard's sophisticated detector
validate_no_junk_files() {
    echo "🔍 Validating staged changes for junk files using Reynard's enterprise-grade analyzer..."

    # Check if the code quality tool is available
    if [ -f "packages/dev-tools/code-quality/package.json" ]; then
        cd packages/dev-tools/code-quality

        # Run junk detection on staged files specifically
        local staged_files=$(git diff --cached --name-only | tr '\n' ' ')

        if [ -n "$staged_files" ]; then
            echo "📋 Checking staged files: $staged_files"

            # Run detection and check for critical/high issues
            npm run analyze junk-detection -- --project "$(pwd)/../.." --format json --output "../../staged-junk-analysis.json" 2>/dev/null

            cd ../..

            if [ -f "staged-junk-analysis.json" ]; then
                local critical_issues=$(node -p "const report = require('./staged-junk-analysis.json'); report.criticalIssues || 0" 2>/dev/null || echo "0")
                local high_issues=$(node -p "const report = require('./staged-junk-analysis.json'); report.highIssues || 0" 2>/dev/null || echo "0")
                local quality_score=$(node -p "const report = require('./staged-junk-analysis.json'); report.qualityScore || 0" 2>/dev/null || echo "0")

                # Clean up temporary file
                rm -f staged-junk-analysis.json

                if [ "$critical_issues" -gt 0 ] || [ "$high_issues" -gt 0 ]; then
                    echo "❌ CRITICAL OR HIGH-PRIORITY JUNK FILES DETECTED IN STAGED CHANGES:"
                    echo "   Critical: $critical_issues files"
                    echo "   High: $high_issues files"
                    echo "   Quality Score: $quality_score/100"
                    echo "🚨 Please run: npm run analyze junk-detection -- --project \"$(pwd)\" --fix --severity critical,high"
                    echo "   Then review and execute the generated git commands"
                    return 1
                else
                    echo "✅ No critical or high-priority junk files detected in staged changes"
                    echo "📈 Staged changes quality score: $quality_score/100"
                    return 0
                fi
            else
                echo "❌ Failed to generate staged junk file analysis"
                return 1
            fi
        else
            echo "✅ No files staged for commit"
            cd ../..
            return 0
        fi
    else
        echo "⚠️  Reynard's junk file detector not available, using basic validation..."

        # Fallback to basic validation
        local staged_files=$(git diff --cached --name-only)
        local junk_patterns="\.(pyc|pyo|js\.map|d\.ts\.map|tsbuildinfo|log|tmp|temp|backup|bak|orig)$|__pycache__/|\.vitest-coverage/|coverage/|\.nyc_output/|\.eslintcache|\.stylelintcache|\.vite/|\.rollup\.cache/|\.turbo/"

        local junk_in_staged=$(echo "$staged_files" | grep -E "$junk_patterns" || true)

        if [ -n "$junk_in_staged" ]; then
            echo "❌ JUNK FILES DETECTED IN STAGED CHANGES:"
            echo "$junk_in_staged"
            echo "🚨 Please remove these files before committing"
            return 1
        else
            echo "✅ No junk files detected in staged changes"
            return 0
        fi
    fi
}

**Output Example:**

```bash
🔍 Scanning for potential junk files tracked by Git in Reynard monorepo...
🐍 Detecting Python development artifacts tracked by Git...
📦 Detecting TypeScript/JavaScript development artifacts tracked by Git...
🦊 Detecting Reynard-specific artifacts tracked by Git...

📊 Git-Tracked Junk File Detection Results:
   🐍 Python artifacts: 0 files
   📦 TypeScript/JS artifacts: 0 files
   🦊 Reynard-specific artifacts: 0 files
   📋 Total tracked junk files: 0 files

✅ No tracked junk files detected! Git repository is clean.
````

**When Junk Files Are Detected:**
The script will provide detailed recommendations for cleanup:

- List of detected files
- Instructions to use `git rm --cached <file>` to remove from tracking
- Guidance on updating `.gitignore` patterns
- Exit code 1 to halt the workflow until cleanup is complete

**User Interaction Protocol:**

When tracked junk files are detected, the workflow MUST:

1. **STOP** the Git workflow process
2. **DISPLAY** a comprehensive report of tracked junk files
3. **WAIT** for user confirmation before proceeding
4. **PROVIDE** recommendations for cleanup actions
5. **ALLOW** user to review and decide on each file category

**Example User Interaction:**

```bash
⚠️  TRACKED JUNK FILES DETECTED!

📊 Detection Results:
   🐍 Python artifacts: 5 files
   📦 TypeScript/JS artifacts: 3 files
   🦊 Reynard-specific artifacts: 2 files
   📋 Total tracked junk files: 10 files

🔍 Sample detected files:
   packages/core/src/__pycache__/module.pyc
   packages/rag/src/index.d.ts
   backend/tests/.pytest_cache/
   services/mcp-server/agent-names-temp.json
   packages/components/dist/bundle.js

❓ How would you like to proceed?

1. Remove tracked junk files from Git (RECOMMENDED)
2. Add patterns to .gitignore and continue
3. Force continue without cleanup (NOT RECOMMENDED)
4. Exit workflow to handle manually

Please select an option (1-4): _
```

**Integration with Git Workflow:**

The tracked junk file detection should be integrated as the **FIRST STEP** in the Git workflow automation script,
before any analysis or commit operations:

```bash
#!/bin/bash
# Enhanced Git Workflow with Tracked Junk File Detection

echo "🦦 Starting Reynard Git Workflow Automation with Tracked Junk File Detection..."

# Step 0: Tracked junk file detection (MANDATORY FIRST STEP)
echo "🔍 Performing tracked junk file detection..."
if ! ./scripts/detect-tracked-junk-files.sh; then
    echo "❌ Tracked junk files detected. Please clean up before proceeding."
    echo "   Run: ./scripts/detect-tracked-junk-files.sh for detailed analysis"
    echo "   Use 'git rm --cached <file>' to remove files from tracking"
    exit 1
fi

echo "✅ Git repository is clean. Proceeding with Git workflow..."

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

## Enhanced Error Handling and Best Practices

### Shell Script Variable Scoping (Based on v0.10.0 Release Issues)

**Issue**: Environment variables not properly scoped in shell scripts, causing "unbound variable" errors.

**Solution**: Implement proper variable scoping and error handling:

```bash
# Enhanced variable scoping and error handling
set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Function to safely get previous version with fallback
get_previous_version() {
    local previous_version
    if previous_version=$(git describe --tags --abbrev=0 2>/dev/null); then
        echo "$previous_version"
    else
        echo "v0.0.0"  # Fallback for first release
    fi
}

# Function to safely get current version
get_current_version() {
    if [ -f "package.json" ]; then
        node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0"
    else
        echo "0.0.0"
    fi
}

# Export variables for use across script functions
export PREVIOUS_VERSION=$(get_previous_version)
export CURRENT_VERSION=$(get_current_version)
export TODAY=$(date +%Y-%m-%d)

echo "📊 Version Information:"
echo "   Previous: $PREVIOUS_VERSION"
echo "   Current: $CURRENT_VERSION"
echo "   Release Date: $TODAY"
```

### Large Commit Management (Based on v0.10.0 Release Issues)

**Issue**: Large commits with 144+ files can overwhelm the workflow and cause performance issues.

**Solution**: Implement intelligent commit batching and validation:

```bash
# Enhanced large commit management
manage_large_commit() {
    local staged_files=$(git diff --cached --name-only | wc -l)
    local max_files=100  # Threshold for large commits

    if [ "$staged_files" -gt "$max_files" ]; then
        echo "⚠️  Large commit detected: $staged_files files"
        echo "📊 Commit size analysis:"

        # Analyze commit by file type
        local ts_files=$(git diff --cached --name-only | grep -E "\.(ts|tsx)$" | wc -l)
        local py_files=$(git diff --cached --name-only | grep -E "\.py$" | wc -l)
        local md_files=$(git diff --cached --name-only | grep -E "\.md$" | wc -l)
        local json_files=$(git diff --cached --name-only | grep -E "\.json$" | wc -l)

        echo "   TypeScript files: $ts_files"
        echo "   Python files: $py_files"
        echo "   Markdown files: $md_files"
        echo "   JSON files: $json_files"

        # Check for potential issues
        local large_files=$(git diff --cached --name-only | xargs -I {} sh -c 'if [ -f "{}" ]; then wc -l < "{}"; else echo 0; fi' | awk '$1 > 1000' | wc -l)

        if [ "$large_files" -gt 0 ]; then
            echo "⚠️  Warning: $large_files files exceed 1000 lines"
        fi

        # Ask for confirmation
        echo "❓ Proceed with large commit? (y/N)"
        read -r confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            echo "❌ Large commit cancelled"
            return 1
        fi
    fi

    return 0
}
```

### Enhanced Error Recovery and Rollback

**Issue**: No rollback procedures for failed Git operations.

**Solution**: Implement comprehensive error recovery:

```bash
# Enhanced error recovery system
setup_error_recovery() {
    # Create backup of current state
    local backup_dir="backups/pre-commit-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"

    # Backup current branch and staged changes
    git branch "backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
    git stash push -m "pre-commit-backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true

    echo "✅ Error recovery setup complete"
    echo "📁 Backup created: $backup_dir"
}

# Rollback function for failed operations
rollback_failed_operation() {
    local error_code=$1
    echo "🔄 Rolling back failed operation (exit code: $error_code)"

    # Restore from backup
    git stash pop 2>/dev/null || true
    git reset --hard HEAD 2>/dev/null || true

    echo "✅ Rollback completed"
    exit $error_code
}

# Enhanced commit with error recovery
safe_commit() {
    local commit_message="$1"

    # Setup error recovery
    setup_error_recovery

    # Attempt commit with error handling
    if ! git commit --no-verify -m "$commit_message"; then
        echo "❌ Commit failed, initiating rollback"
        rollback_failed_operation $?
    fi

    echo "✅ Commit successful"
}
```

### Pre-Commit Validation Pipeline

**Issue**: Insufficient validation before committing changes.

**Solution**: Implement comprehensive pre-commit validation:

```bash
# Comprehensive pre-commit validation pipeline
pre_commit_validation() {
    local validation_errors=0

    echo "🔍 Running pre-commit validation pipeline..."

    # 1. Junk file validation
    if ! validate_no_junk_files; then
        echo "❌ Junk file validation failed"
        validation_errors=$((validation_errors + 1))
    fi

    # 2. Large commit validation
    if ! manage_large_commit; then
        echo "❌ Large commit validation failed"
        validation_errors=$((validation_errors + 1))
    fi

    # 3. Syntax validation (if applicable)
    if command -v node >/dev/null 2>&1; then
        echo "🔍 Validating package.json syntax..."
        if ! node -e "require('./package.json')" 2>/dev/null; then
            echo "❌ package.json syntax validation failed"
            validation_errors=$((validation_errors + 1))
        fi
    fi

    # 4. Git status validation
    if ! git diff --cached --quiet; then
        echo "✅ Changes are staged and ready for commit"
    else
        echo "❌ No changes staged for commit"
        validation_errors=$((validation_errors + 1))
    fi

    if [ $validation_errors -eq 0 ]; then
        echo "✅ All pre-commit validations passed"
        return 0
    else
        echo "❌ $validation_errors validation(s) failed"
        return 1
    fi
}
```

## Automation Script Template

```bash
#!/bin/bash

# Enhanced Git Workflow Automation Script with Error Handling and Best Practices
set -euo pipefail  # Enhanced error handling

echo "🦩 Starting Enhanced Reynard Git Workflow Automation with Error Handling and Best Practices..."

# Step 0: Success-Advisor-8 Spirit Inhabitation (MANDATORY FIRST STEP)
echo "🦁 Inhabiting Success-Advisor-8 spirit for Git workflow authority..."
echo "   This provides complete access to the permanent release manager's authority,"
echo "   expertise, and behavioral protocols for Git operations"
echo ""
echo "⚠️  CRITICAL: Agent must use MCP tool before proceeding:"
echo "   Tool: invoke_success_advisor_8"
echo "   Arguments: agent_id='current-session', force_inhabitation=true"
echo ""
echo "✅ Success-Advisor-8 spirit inhabitation required before proceeding"

# Initialize enhanced error handling
export PREVIOUS_VERSION=$(get_previous_version)
export CURRENT_VERSION=$(get_current_version)
export TODAY=$(date +%Y-%m-%d)

echo "📊 Version Information:"
echo "   Previous: $PREVIOUS_VERSION"
echo "   Current: $CURRENT_VERSION"
echo "   Release Date: $TODAY"

# Step 0: Agent State Persistence Check (MANDATORY FIRST STEP)
echo "🦁 Checking agent state persistence..."

# Verify agent naming system is accessible
if [ -f "services/agent-naming/data/agent-names.json" ]; then
    echo "✅ Agent naming system persistence verified"
else
    echo "⚠️  Agent naming system not initialized - creating default state"
    mkdir -p services/agent-naming/data
    echo '{}' > services/agent-naming/data/agent-names.json
fi

# Verify ECS world data directory exists
if [ -d "services/ecs-world/data/ecs" ]; then
    echo "✅ ECS world persistence verified"
else
    echo "⚠️  ECS world not initialized - creating default structure"
    mkdir -p services/ecs-world/data/ecs
fi

# Check for active agent sessions
if [ -f "services/agent-naming/data/agent-names.json" ]; then
    AGENT_COUNT=$(jq 'length' services/agent-naming/data/agent-names.json 2>/dev/null || echo "0")
    echo "📊 Active agent sessions: $AGENT_COUNT"
fi

echo "✅ Agent state persistence check completed"

# Step 0.5: Agent State Backup (RECOMMENDED)
echo "💾 Creating agent state backup..."
BACKUP_DIR="backups/agent-state-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup agent naming data
cp services/agent-naming/data/agent-names.json "$BACKUP_DIR/" 2>/dev/null || true

# Backup ECS world data
cp -r services/ecs-world/data/ecs "$BACKUP_DIR/" 2>/dev/null || true

# Backup MCP server state
cp services/mcp-server/tool_config.json "$BACKUP_DIR/" 2>/dev/null || true

echo "✅ Agent state backed up to $BACKUP_DIR"

# Step 1: Enhanced junk file detection using Reynard's sophisticated analyzer (MANDATORY SECOND STEP)
echo "🔍 Performing comprehensive junk file detection using Reynard's enterprise-grade analyzer..."

# Check if the code quality tool is available
if [ -f "packages/dev-tools/code-quality/package.json" ]; then
    echo "🦊 Using Reynard's sophisticated junk file detector..."

    # Run the advanced junk file detection
    cd packages/dev-tools/code-quality

    # Run comprehensive junk file analysis with JSON output
    echo "📊 Running comprehensive junk file analysis..."
    npm run analyze junk-detection -- --project "$(pwd)/../.." --format json --output "../../junk-analysis-report.json" 2>/dev/null

    cd ../..

    # Check if any critical or high-priority issues were found
    if [ -f "junk-analysis-report.json" ]; then
        CRITICAL_ISSUES=$(node -p "const report = require('./junk-analysis-report.json'); report.criticalIssues || 0" 2>/dev/null || echo "0")
        HIGH_ISSUES=$(node -p "const report = require('./junk-analysis-report.json'); report.highIssues || 0" 2>/dev/null || echo "0")
        QUALITY_SCORE=$(node -p "const report = require('./junk-analysis-report.json'); report.qualityScore || 0" 2>/dev/null || echo "0")

        echo "📈 Repository Quality Score: $QUALITY_SCORE/100"

        if [ "$CRITICAL_ISSUES" -gt 0 ] || [ "$HIGH_ISSUES" -gt 0 ]; then
            echo "❌ Critical or high-priority junk files detected:"
            echo "   Critical: $CRITICAL_ISSUES files"
            echo "   High: $HIGH_ISSUES files"
            echo "   Quality Score: $QUALITY_SCORE/100"
            echo ""
            echo "🔧 To fix these issues:"
            echo "   cd packages/dev-tools/code-quality"
            echo "   npm run analyze junk-detection -- --project \"$(pwd)/../..\" --fix --severity critical,high"
            echo "   Review and execute the generated git commands"
            exit 1
        elif [ "$QUALITY_SCORE" -lt 90 ]; then
            echo "⚠️  Repository quality score is below 90: $QUALITY_SCORE/100"
            echo "   Consider running: npm run analyze junk-detection -- --project \"$(pwd)/../..\" --format report"
            echo "   to see detailed analysis and recommendations"
        else
            echo "✅ Repository quality is excellent: $QUALITY_SCORE/100"
        fi
    else
        echo "❌ Failed to generate junk file analysis report"
        exit 1
    fi

    echo "✅ Repository junk file analysis completed successfully"
else
    echo "⚠️  Reynard's junk file detector not found, falling back to basic detection..."
    if ! ./scripts/detect-tracked-junk-files.sh; then
        echo "❌ Tracked junk files detected. Please clean up before proceeding."
        exit 1
    fi
fi

echo "✅ Git repository is clean. Proceeding with Git workflow..."

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

# Step 5: Selective Staging and Pre-Commit Validation
echo "🚀 Executing selective staging and validation..."

# Step 5.1: Pre-staging junk file detection in working directory
echo "🔍 Pre-staging junk file detection..."
pre_staging_junk_check() {
    local junk_files=0
    local junk_report="pre-staging-junk-report.txt"

    echo "📊 Pre-Staging Junk File Detection Report" > "$junk_report"
    echo "Generated: $(date)" >> "$junk_report"
    echo "=====================================" >> "$junk_report"

    # Check for build artifacts in working directory
    local build_artifacts=$(find ./packages -name "*.js" -o -name "*.jsx" -o -name "*.d.ts" | grep -v node_modules | wc -l)
    if [ "$build_artifacts" -gt 0 ]; then
        echo "❌ Build artifacts detected in working directory: $build_artifacts"
        echo "Build artifacts: $build_artifacts" >> "$junk_report"
        find ./packages -name "*.js" -o -name "*.jsx" -o -name "*.d.ts" | grep -v node_modules >> "$junk_report"
        junk_files=$((junk_files + build_artifacts))
    fi

    # Check for dist directories
    local dist_dirs=$(find ./packages -name "dist" -type d | wc -l)
    if [ "$dist_dirs" -gt 0 ]; then
        echo "❌ Dist directories detected: $dist_dirs"
        echo "Dist directories: $dist_dirs" >> "$junk_report"
        find ./packages -name "dist" -type d >> "$junk_report"
        junk_files=$((junk_files + dist_dirs))
    fi

    if [ "$junk_files" -gt 0 ]; then
        echo "🚨 JUNK FILES DETECTED - Cleanup required before staging"
        echo "Total junk files: $junk_files" >> "$junk_report"
        return 1
    else
        echo "✅ No junk files detected in working directory"
        return 0
    fi
}

# Run pre-staging check
if ! pre_staging_junk_check; then
    echo "❌ Junk files detected. Please clean up before proceeding."
    echo "   Run: find ./packages -name '*.js' -o -name '*.jsx' -o -name '*.d.ts' | grep -v node_modules | xargs rm -f"
    echo "   Run: find ./packages -name 'dist' -type d -exec rm -rf {} +"
    exit 1
fi

# Step 5.2: Selective staging of legitimate changes
echo "📝 Selective staging of legitimate changes..."

# Stage only legitimate source files and documentation
echo "🔍 Identifying legitimate changes to stage..."

# Get list of modified files
MODIFIED_FILES=$(git diff --name-only)
NEW_FILES=$(git ls-files --others --exclude-standard)

echo "📊 Files to review for staging:"
echo "Modified files: $(echo "$MODIFIED_FILES" | wc -l)"
echo "New files: $(echo "$NEW_FILES" | wc -l)"

# Stage legitimate file types only
LEGITIMATE_PATTERNS=(
    "*.ts" "*.tsx" "*.py" "*.md" "*.json" "*.yml" "*.yaml"
    "*.css" "*.scss" "*.html" "*.txt" "*.sh" "*.js" "*.mjs"
    "package.json" "tsconfig.json" "vitest.config.*" "vite.config.*"
    "CHANGELOG.md" "README.md" "LICENSE" ".gitignore"
)

STAGED_COUNT=0
for pattern in "${LEGITIMATE_PATTERNS[@]}"; do
    echo "🔍 Staging files matching: $pattern"
    for file in $(git diff --name-only | grep -E "\.(${pattern#*.})$" || true); do
        if [ -f "$file" ]; then
            # Additional validation for each file
            if [[ "$file" =~ \.(js|jsx|d\.ts)$ ]] && [[ "$file" =~ /(dist|build|out)/ ]]; then
                echo "⚠️  Skipping build artifact: $file"
                continue
            fi
            echo "  ✅ Staging: $file"
            git add "$file"
            STAGED_COUNT=$((STAGED_COUNT + 1))
        fi
    done
done

# Stage new legitimate files
for file in $NEW_FILES; do
    if [ -f "$file" ]; then
        # Check if it's a legitimate file type
        if [[ "$file" =~ \.(ts|tsx|py|md|json|yml|yaml|css|scss|html|txt|sh|js|mjs)$ ]] || \
           [[ "$file" =~ ^(package\.json|tsconfig\.json|CHANGELOG\.md|README\.md|LICENSE|\.gitignore)$ ]]; then
            # Additional validation
            if [[ "$file" =~ \.(js|jsx|d\.ts)$ ]] && [[ "$file" =~ /(dist|build|out)/ ]]; then
                echo "⚠️  Skipping build artifact: $file"
                continue
            fi
            echo "  ✅ Staging new file: $file"
            git add "$file"
            STAGED_COUNT=$((STAGED_COUNT + 1))
        else
            echo "⚠️  Skipping non-legitimate file: $file"
        fi
    fi
done

echo "📊 Total files staged: $STAGED_COUNT"

# Step 5.3: Post-staging validation
echo "🔍 Post-staging validation..."

# Check staged files for junk
STAGED_FILES=$(git diff --cached --name-only)
JUNK_IN_STAGED=0

for file in $STAGED_FILES; do
    if [[ "$file" =~ \.(js|jsx|d\.ts)$ ]] && [[ "$file" =~ /(dist|build|out)/ ]]; then
        echo "❌ Build artifact detected in staged files: $file"
        JUNK_IN_STAGED=$((JUNK_IN_STAGED + 1))
    fi
done

if [ "$JUNK_IN_STAGED" -gt 0 ]; then
    echo "🚨 JUNK FILES DETECTED IN STAGED FILES - Unstaging and aborting"
    git reset HEAD
    exit 1
fi

# Step 5.4: Preview staged changes
echo "📋 Previewing staged changes with delta..."
git diff --staged | delta --side-by-side || git diff --staged

# Step 5.5: Final confirmation
echo "❓ Review the staged changes above. Continue with commit? (y/N)"
read -r CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "❌ Commit cancelled by user"
    exit 1
fi

# Enhanced commit with error recovery
echo "💾 Committing staged changes with enhanced error handling..."
if ! safe_commit "$COMMIT_MESSAGE"; then
    echo "❌ Commit failed, check error messages above"
    exit 1
fi

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

## Tracked Junk File Detection Script

### Script Location and Usage

The tracked junk file detection script is already implemented and available at:
**`scripts/detect-tracked-junk-files.sh`**

**Prerequisites:** The script is already created and executable in the Reynard monorepo.

**Testing the Script:**

```bash
# Test the detection script
./scripts/detect-tracked-junk-files.sh

# Expected output when repository is clean:
✅ No tracked junk files detected! Git repository is clean.
```

## Quality Assurance Checklist

### Pre-Commit Validation

- [ ] **Tracked junk file detection completed** - No Python/TypeScript development artifacts tracked by Git
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

## Lessons Learned from v0.10.0 Release

### Issues Encountered and Solutions

**1. Tracked Junk Files (13 Vitest coverage artifacts)**

- **Problem**: Coverage artifacts were tracked by Git
- **Solution**: Enhanced .gitignore patterns and automated cleanup
- **Prevention**: Pre-commit validation pipeline

**2. Shell Script Variable Scoping**

- **Problem**: Environment variables not properly scoped
- **Solution**: Enhanced variable scoping with `set -euo pipefail`
- **Prevention**: Proper variable export and fallback values

**3. Large Commit Management (144 files)**

- **Problem**: Large commits can overwhelm the workflow
- **Solution**: Intelligent commit batching and validation
- **Prevention**: Pre-commit size analysis and confirmation

**4. Error Recovery**

- **Problem**: No rollback procedures for failed operations
- **Solution**: Comprehensive error recovery and backup system
- **Prevention**: Automatic backup creation before operations

### Best Practices Implemented

1. **Enhanced Error Handling**: `set -euo pipefail` for strict error handling
2. **Variable Scoping**: Proper export and fallback mechanisms
3. **Pre-Commit Validation**: Comprehensive validation pipeline
4. **Error Recovery**: Automatic backup and rollback procedures
5. **Junk File Prevention**: Enhanced .gitignore patterns and validation

## Success Criteria

The enhanced workflow is successful when:

1. ✅ **Pre-staging junk file detection completed** - No build artifacts in working directory
2. ✅ **Selective staging implemented** - Only legitimate source files staged for commit
3. ✅ **Post-staging validation passed** - No junk files detected in staged changes
4. ✅ All changes are properly analyzed and categorized
5. ✅ Commit message accurately describes the changes
6. ✅ Version bump type determined correctly (major/minor/patch)
7. ✅ CHANGELOG.md [Unreleased] section promoted to versioned release
8. ✅ New [Unreleased] section added to CHANGELOG.md for future changes
9. ✅ Package.json version updated appropriately
10. ✅ Git tag created with release notes from CHANGELOG.md
11. ✅ Changes are committed and pushed successfully
12. ✅ Git tag is pushed to remote repository
13. ✅ Repository state is clean and consistent
14. ✅ **Enhanced .gitignore patterns** prevent future junk file accumulation
15. ✅ **User confirmation received** - Manual review of staged changes completed

## Example Execution

```bash
# Execute the complete workflow
./git-workflow-automation.sh

# Expected output:
🦦 Starting Reynard Git Workflow Automation with Selective Staging and Junk File Prevention...
🔍 Performing tracked junk file detection...
🐍 Detecting Python development artifacts tracked by Git...
📦 Detecting TypeScript/JavaScript development artifacts tracked by Git...
🦊 Detecting Reynard-specific artifacts tracked by Git...
📊 Git-Tracked Junk File Detection Results:
   🐍 Python artifacts: 0 files
   📦 TypeScript/JS artifacts: 0 files
   🦊 Reynard-specific artifacts: 0 files
   📋 Total tracked junk files: 0 files
✅ No tracked junk files detected! Git repository is clean.
✅ Git repository is clean. Proceeding with Git workflow...
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
🚀 Executing selective staging and validation...
🔍 Pre-staging junk file detection...
✅ No junk files detected in working directory
📝 Selective staging of legitimate changes...
🔍 Identifying legitimate changes to stage...
📊 Files to review for staging:
Modified files: 15
New files: 3
🔍 Staging files matching: *.ts
  ✅ Staging: packages/core/src/utils.ts
  ✅ Staging: packages/components/src/Button.tsx
🔍 Staging files matching: *.md
  ✅ Staging: CHANGELOG.md
  ✅ Staging: README.md
📊 Total files staged: 18
🔍 Post-staging validation...
✅ No junk files detected in staged files
📋 Previewing staged changes with delta...
❓ Review the staged changes above. Continue with commit? (y/N)
y
💾 Committing staged changes...
🔗 Previous version: v1.2.3
🏷️  Created Git tag: v1.3.0
✅ Git workflow completed successfully with version v1.3.0 and Git tag!
```

---

*This prompt provides a comprehensive framework for automating Git workflows in the Reynard monorepo, ensuring*
*consistent, high-quality commits with proper CHANGELOG.md version management, semantic versioning, Git tagging,*
*selective staging to prevent junk file commits, and proactive junk file detection to maintain repository cleanliness*
*and prevent development artifact accumulation in Git source control.*
