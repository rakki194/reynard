# Git Development Setup Guide

_Enhanced Git workflow with Delta for superior code diff analysis and review_

## Overview

This guide provides comprehensive setup instructions for Git development in the Reynard framework,
including Delta integration for enhanced diff viewing, AI agent optimization, and best practices for code analysis.

## Delta Installation and Configuration

### Installation

Delta is a syntax-highlighting pager for Git that significantly enhances diff readability and analysis capabilities.

#### Arch Linux

```bash
sudo pacman -S git-delta
```

#### Ubuntu/Debian

```bash
sudo apt install git-delta
```

#### macOS

```bash
brew install git-delta
```

#### Windows

```bash
choco install delta
```

### Basic Configuration

Configure Delta as your default Git pager:

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

### Advanced Configuration for AI Agents

For optimal AI agent analysis and automated workflows:

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

    # Performance optimization
    max-line-distance = 0.6
    max-line-length = 1000
```

## Enhanced Git Commands for Development

### Advanced Diff Analysis

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

### Change Impact Assessment

```bash
# High-impact changes (breaking, security, architecture)
git diff --name-only | grep -E "(package\.json|tsconfig|config|schema)"

# Medium-impact changes (features, APIs)
git diff --name-only | grep -E "(api|service|component|util)"

# Low-impact changes (docs, tests, styling)
git diff --name-only | grep -E "(\.md$|\.test\.|\.spec\.|\.css$)"
```

### Branch and Commit Analysis

```bash
# Compare branches with detailed statistics
git diff --stat main..feature-branch
git diff --name-status main..feature-branch

# Analyze commit history with enhanced output
git log --oneline --graph --decorate
git log --stat --find-renames --find-copies

# Review specific file changes across commits
git log -p --follow path/to/file
```

## AI Agent Optimization

### Semantic Change Detection

```bash
# Ignore whitespace changes for cleaner analysis
git diff -w
git diff --ignore-space-change
git diff --ignore-all-space

# Word-level diff for precise change detection
git diff --word-diff
git diff --word-diff-regex='[^[:space:]]'

# Compare specific file types
git diff --name-only -- '*.ts' '*.tsx' '*.py'
```

### Automated Analysis Scripts

```bash
#!/bin/bash
# Enhanced change analysis for AI agents

# Semantic change analysis
git diff -w --word-diff > /tmp/git-changes-semantic.txt

# Security and impact analysis
git diff --name-only | grep -E "(auth|security|password|token|key)" > /tmp/git-changes-security.txt || true
git diff --name-only | grep -E "(package\.json|tsconfig|config|schema)" > /tmp/git-changes-high-impact.txt || true

# Test coverage analysis
git diff --stat | grep -E "(test|spec|__tests__)" > /tmp/git-changes-tests.txt || true

# Detailed change statistics
git diff --stat --find-renames --find-copies > /tmp/git-changes-detailed.txt
```

## Troubleshooting

### Common Delta Issues

#### Delta not displaying properly

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

#### Performance issues with large diffs

```bash
# Configure delta for better performance
git config --global delta.max-line-distance 0.6
git config --global delta.max-line-length 1000

# Use minimal delta configuration for large repos
git config --global delta.minus-style "red"
git config --global delta.plus-style "green"
git config --global delta.side-by-side false
```

#### Syntax highlighting not working

```bash
# Check available themes
delta --list-syntax-themes

# Set a different theme
git config --global delta.syntax-theme "GitHub"

# Disable syntax highlighting if problematic
git config --global delta.syntax-theme "none"
```

## Best Practices

### For Developers

1. **Use Delta consistently** - Configure it globally for all repositories
2. **Leverage side-by-side view** - Especially useful for complex changes
3. **Utilize navigation controls** - Use n/N keys to navigate large diffs
4. **Focus on semantic changes** - Use `-w` flag to ignore whitespace
5. **Analyze by impact** - Categorize changes by their potential impact

### For AI Agents

1. **Semantic analysis first** - Use word-level diffs for precise change detection
2. **Security scanning** - Always check for security-sensitive file changes
3. **Impact assessment** - Categorize changes by potential breaking impact
4. **Test coverage tracking** - Monitor test file changes for coverage analysis
5. **Performance optimization** - Use appropriate delta settings for large repositories

## Integration with Reynard Workflow

### Pre-commit Hooks

```bash
# Enhanced pre-commit analysis with delta
#!/bin/bash
echo "🔍 Analyzing changes with delta..."
git diff --staged | delta --side-by-side

# Security check
if git diff --staged --name-only | grep -E "(auth|security|password|token|key)"; then
    echo "⚠️  Security-sensitive files detected"
fi

# Impact assessment
if git diff --staged --name-only | grep -E "(package\.json|tsconfig|config|schema)"; then
    echo "🚨 High-impact changes detected"
fi
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Enhanced Diff Analysis
  run: |
    git diff --stat --find-renames --find-copies
    git diff --name-only | grep -E "(package\.json|tsconfig)" || echo "No high-impact changes"
    git diff --stat | grep -E "(test|spec)" || echo "No test changes"
```

## Conclusion

_Enhanced Git development with Delta provides superior code analysis capabilities,
making it easier to understand changes, identify potential issues, and maintain code quality in the Reynard framework._

By following this guide, developers and
AI agents can leverage Delta's powerful features for more effective code review, change analysis, and
automated workflows. The combination of syntax highlighting, side-by-side diffs, and
advanced navigation controls creates an optimal environment for understanding and analyzing code changes.

---

_This guide is part of the Reynard development documentation. For more information,
see the main [CONTRIBUTING.md](../CONTRIBUTING.md) guide._
