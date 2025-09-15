# Documentation Word Diffing Guide

_Advanced word-level diffing strategies for documentation files in Git workflows_

## Overview

This guide provides comprehensive strategies for effective word-level diffing of documentation files in Git workflows,
covering various document formats including Markdown, reStructuredText, AsciiDoc, and
binary formats like DOCX. It focuses on semantic change detection, content review optimization, and
AI agent analysis for documentation changes.

## Document Format Support

### Native Git Support (Text Formats)

Git natively supports word-level diffing for plain text formats:

- **Markdown** (`.md`, `.markdown`)
- **reStructuredText** (`.rst`)
- **AsciiDoc** (`.adoc`, `.asciidoc`)
- **Plain Text** (`.txt`)
- **LaTeX** (`.tex`)
- **HTML** (`.html`, `.htm`)

### Binary Format Support

For binary document formats, external tools are required:

- **Microsoft Word** (`.docx`, `.doc`)
- **OpenDocument** (`.odt`)
- **PDF** (`.pdf`)
- **Rich Text Format** (`.rtf`)

## Word Diffing Configuration

### Basic Word Diff Setup

Configure Git for enhanced word-level diffing:

```bash
# Enable word-level diffing globally
git config --global diff.wordRegex '[^[:space:]]'

# Create word diff alias
git config --global alias.wdiff 'diff --word-diff=color --unified=1'

# Enhanced word diff with whitespace handling
git config --global alias.wdiff-clean 'diff --word-diff=color --unified=1 --ignore-space-change'

# Word diff for specific file types
git config --global alias.wdiff-docs 'diff --word-diff=color --unified=1 -- "*.md" "*.rst" "*.adoc"'
```

### Advanced Word Diff Configuration

```bash
# Custom word regex for documentation
git config --global diff.wordRegex '[A-Za-z0-9]+|[^A-Za-z0-9\s]'

# Word diff with context
git config --global alias.wdiff-context 'diff --word-diff=color --unified=3'

# Word diff with line numbers
git config --global alias.wdiff-lines 'diff --word-diff=color --unified=1 --word-diff-regex="[^[:space:]]"'
```

## Binary Document Format Setup

### Pandoc Integration for DOCX Files

Install and configure Pandoc for DOCX document diffing:

```bash
# Install Pandoc
# Arch Linux
sudo pacman -S pandoc

# Ubuntu/Debian
sudo apt install pandoc

# macOS
brew install pandoc

# Windows
choco install pandoc
```

Configure Git to use Pandoc for DOCX files:

```bash
# Set up Pandoc text converter
git config --global diff.docx.textconv "pandoc -t markdown -s"

# Configure DOCX diff filter
git config --global diff.docx.prompt false
```

Create `.gitattributes` file in your repository:

```gitattributes
# Documentation file attributes
*.docx diff=docx
*.odt diff=odt
*.rtf diff=rtf

# Markdown files with enhanced diffing
*.md diff=markdown
*.markdown diff=markdown

# reStructuredText files
*.rst diff=rst

# AsciiDoc files
*.adoc diff=asciidoc
*.asciidoc diff=asciidoc
```

### Custom Diff Filters

Create custom diff filters for specific document types:

```bash
# Markdown diff filter
git config --global diff.markdown.textconv "pandoc -f markdown -t plain"

# reStructuredText diff filter
git config --global diff.rst.textconv "pandoc -f rst -t plain"

# AsciiDoc diff filter
git config --global diff.asciidoc.textconv "pandoc -f asciidoc -t plain"
```

## Documentation-Specific Word Diffing Strategies

### Semantic Change Detection

Focus on meaningful content changes rather than formatting:

```bash
# Ignore whitespace and formatting changes
git wdiff-clean -- "docs/**/*.md"

# Focus on content changes in documentation
git diff --word-diff=color --ignore-space-change --ignore-blank-lines -- "docs/**/*.md"

# Semantic diff for technical documentation
git diff --word-diff=color --word-diff-regex='[A-Za-z0-9]+|[^A-Za-z0-9\s]' -- "docs/**/*.md"
```

### Documentation Review Workflow

```bash
# Review documentation changes before commit
git wdiff-docs

# Compare documentation across branches
git wdiff-context main..feature-branch -- "docs/**/*.md"

# Review specific documentation sections
git wdiff -- "docs/guides/*.md" "docs/api/*.md"

# Check for breaking changes in documentation
git diff --word-diff=color --name-only | grep -E "(breaking|deprecated|removed)" -- "docs/**/*.md"
```

### AI Agent Documentation Analysis

Optimized commands for AI agent analysis of documentation changes:

```bash
# Analyze documentation structure changes
git diff --stat --find-renames --find-copies -- "docs/**/*.md"

# Detect content type changes
git diff --name-only | grep -E "(guide|api|tutorial|reference)" -- "docs/**/*.md"

# Identify cross-reference changes
git diff --word-diff=color | grep -E "\[.*\]\(.*\)" -- "docs/**/*.md"

# Check for metadata changes
git diff --word-diff=color | grep -E "(title:|description:|tags:|author:)" -- "docs/**/*.md"
```

## Advanced Documentation Diffing Techniques

### Cross-Reference Analysis

```bash
# Find broken or changed links
git diff --word-diff=color | grep -E "\[.*\]\([^)]*\)" -- "docs/**/*.md"

# Check for updated references
git diff --word-diff=color | grep -E "(see also|refer to|see|ref:)" -- "docs/**/*.md"

# Analyze table of contents changes
git diff --word-diff=color | grep -E "^#+\s" -- "docs/**/*.md"
```

### Content Quality Analysis

````bash
# Check for spelling and grammar changes
git diff --word-diff=color | grep -E "(typo|grammar|spelling)" -- "docs/**/*.md"

# Analyze code example changes
git diff --word-diff=color | grep -E "```" -- "docs/**/*.md"

# Check for formatting consistency
git diff --word-diff=color | grep -E "(bold|italic|code|link)" -- "docs/**/*.md"
````

### Documentation Structure Analysis

```bash
# Analyze heading structure changes
git diff --word-diff=color | grep -E "^#+\s" -- "docs/**/*.md"

# Check for section reorganization
git diff --stat --find-renames -- "docs/**/*.md"

# Analyze file organization changes
git diff --name-status -- "docs/**/*.md"
```

## Integration with Documentation Workflows

### Pre-commit Documentation Validation

```bash
#!/bin/bash
# Documentation pre-commit validation script

echo "🔍 Validating documentation changes..."

# Check for broken links
if git diff --staged --name-only | grep -E "\.md$"; then
    echo "📝 Checking documentation links..."
    git diff --staged --word-diff=color | grep -E "\[.*\]\([^)]*\)" || echo "✅ No link changes detected"
fi

# Check for content quality
if git diff --staged --word-diff=color | grep -E "(TODO|FIXME|XXX)"; then
    echo "⚠️  TODO/FIXME items found in documentation"
fi

# Validate documentation structure
if git diff --staged --name-only | grep -E "docs/.*\.md$"; then
    echo "📚 Validating documentation structure..."
    git diff --staged --stat -- "docs/**/*.md"
fi

echo "✅ Documentation validation complete"
```

### Documentation Review Automation

```bash
#!/bin/bash
# Automated documentation review script

echo "📖 Generating documentation review report..."

# Generate word diff report
git diff --word-diff=color -- "docs/**/*.md" > /tmp/doc-word-diff.txt

# Analyze content changes
git diff --stat --find-renames --find-copies -- "docs/**/*.md" > /tmp/doc-structure-changes.txt

# Check for cross-references
git diff --word-diff=color | grep -E "\[.*\]\([^)]*\)" -- "docs/**/*.md" > /tmp/doc-link-changes.txt

# Generate summary
echo "📊 Documentation Change Summary:"
echo "Word-level changes: $(wc -l < /tmp/doc-word-diff.txt) lines"
echo "Structural changes: $(wc -l < /tmp/doc-structure-changes.txt) files"
echo "Link changes: $(wc -l < /tmp/doc-link-changes.txt) references"
```

## Troubleshooting

### Common Issues and Solutions

#### Word diff not working for Markdown files

```bash
# Check Git configuration
git config --list | grep diff

# Reset word diff configuration
git config --global --unset diff.wordRegex
git config --global diff.wordRegex '[^[:space:]]'

# Test word diff
git wdiff -- "docs/**/*.md"
```

#### Pandoc conversion issues

```bash
# Check Pandoc installation
pandoc --version

# Test Pandoc conversion
pandoc -t markdown -s document.docx

# Verify Git textconv configuration
git config --list | grep textconv
```

#### Performance issues with large documentation

```bash
# Use minimal word diff for large files
git diff --word-diff=color --unified=1 -- "docs/**/*.md"

# Limit diff context
git diff --word-diff=color --unified=0 -- "docs/**/*.md"

# Use file-specific diffing
git diff --word-diff=color -- "docs/guides/specific-guide.md"
```

## Best Practices

### For Documentation Writers

1. **Use semantic commits** - Write commit messages that describe content changes
2. **Review word diffs** - Always review word-level changes before committing
3. **Maintain consistency** - Use consistent formatting and terminology
4. **Test links** - Verify that all links work after changes
5. **Update cross-references** - Keep related documentation in sync

### For AI Agents

1. **Focus on content changes** - Ignore formatting-only changes
2. **Analyze semantic impact** - Understand the meaning of content changes
3. **Check consistency** - Ensure terminology and style consistency
4. **Validate structure** - Verify documentation organization
5. **Monitor cross-references** - Track changes to linked content

### For Reviewers

1. **Use word diffs** - Leverage word-level diffing for precise reviews
2. **Check context** - Review changes in the context of surrounding content
3. **Validate accuracy** - Ensure technical accuracy of changes
4. **Maintain style** - Enforce documentation style guidelines
5. **Test examples** - Verify that code examples work correctly

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Documentation Review
on: [pull_request]
jobs:
  doc-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Pandoc
        run: sudo apt install pandoc
      - name: Check documentation changes
        run: |
          git diff --word-diff=color -- "docs/**/*.md" > doc-changes.txt
          git diff --stat --find-renames -- "docs/**/*.md" > doc-structure.txt
      - name: Validate documentation
        run: |
          if [ -s doc-changes.txt ]; then
            echo "Documentation changes detected"
            cat doc-changes.txt
          fi
```

## Conclusion

_Effective word diffing for documentation files enhances collaboration, improves content quality, and
enables precise change tracking in Git workflows._

By implementing these strategies, documentation teams can:

- **Improve review efficiency** with precise word-level change detection
- **Maintain content quality** through systematic change analysis
- **Enable AI agent optimization** for automated documentation review
- **Streamline collaboration** with clear change visualization
- **Ensure consistency** across documentation sets

The combination of native Git word diffing, external tool integration, and
automated workflows creates a comprehensive solution for documentation change management in the Reynard framework.

---

_This guide is part of the Reynard development documentation. For more information,
see the main [Git Development Setup Guide](git-development-setup.md) and [CONTRIBUTING.md](../CONTRIBUTING.md)._
