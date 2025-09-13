# 🦊 Reynard Git Hooks & Validation Suite

> Comprehensive quality assurance tools for the Reynard framework - where cunning development meets feral precision

This directory contains the complete Git hooks and
validation ecosystem for the Reynard project,
managed by Husky. Every tool embodies the three animal spirits: the fox's strategic cunning,
the otter's thorough testing, and the wolf's adversarial analysis.

## 🛠️ Complete Tool Overview

### 🔧 Core Git Hooks

#### 1. `pre-commit` - The Master Orchestrator

*red fur bristles with intelligence* The pre-commit hook is the apex predator of code quality,
coordinating all validation tools in perfect harmony.

> *What it validates:*

- **Formatting**: Code style consistency (`npm run format:check`)
- **Linting**: Code quality and best practices (`npm run lint`)
- **Type Checking**: TypeScript type safety (`npm run typecheck`)
- **Modularity**: File size limits (100 lines for source, 200 for tests)
- **CSS Variables**: Theme consistency and variable validation
- **Markdown ToC**: Table of contents validation for documentation
- **Markdown Linting**: Documentation quality with markdownlint
- **Sentence Length**: Readability optimization for documentation
- **Markdown Links**: Link validation and integrity checking
- **Python Quality**: Comprehensive Python code validation

#### 2. `commit-msg` - The Message Guardian

*whiskers twitch with precision* Ensures all commit messages follow conventional commit format using commitlint.

```bash
# Validates commit messages like:
feat: add new authentication system
fix: resolve memory leak in cache
docs: update API documentation
```

### 🎨 CSS Variable Validation

#### `validate-css-variables.js` - Theme Consistency Guardian

*sleek fur glistens with precision* A comprehensive CSS variable validator that
ensures theme consistency across the entire Reynard ecosystem.

> *Features:*

- **Cross-file Analysis**: Scans all CSS files in packages, examples, and templates
- **Import Resolution**: Follows CSS imports to validate complete dependency chains
- **Theme Awareness**: Understands Reynard's theme system with `data-theme` attributes
- **Missing Variable Detection**: Finds variables used but not defined
- **Unused Variable Cleanup**: Identifies defined but never-used variables
- **Typo Detection**: Catches common spelling mistakes in variable names
- **Multi-line Support**: Handles complex CSS variable definitions

> *Usage:*

```bash
# Basic validation
node .husky/validate-css-variables.js

# Strict mode (fails on warnings)
node .husky/validate-css-variables.js --strict

# Verbose output with file listing
node .husky/validate-css-variables.js --verbose
```

> *Critical Variables Monitored:*

- `--accent`, `--bg-color`, `--secondary-bg`, `--card-bg`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--border-color`, `--success`, `--error`, `--warning`, `--info`, `--danger`

### 📚 Markdown Documentation Tools

#### `validate-markdown-links.js` - Link Integrity Sentinel

*webbed paws clap with enthusiasm* Comprehensive markdown link validation ensuring all documentation links are
functional and properly formatted.

> *Link Types Supported:*

- **External URLs**: HTTP/HTTPS validation with protocol checking
- **Internal Links**: File existence and path resolution
- **Anchor Links**: In-document heading validation with GitHub-style anchors
- **Image Links**: Markdown image reference validation
- **Auto-links**: Angle-bracket wrapped URLs
- **Reference Links**: Markdown reference-style links

> *Smart Features:*

- **Code Block Awareness**: Skips links inside code blocks
- **Anchor Generation**: GitHub-compatible anchor ID generation
- **Fragment Handling**: Proper URL fragment validation
- **Staged File Support**: Pre-commit integration for efficiency

> *Usage:*

```bash
# Validate staged files (pre-commit default)
node .husky/validate-markdown-links.js --staged

# Validate all markdown files
node .husky/validate-markdown-links.js --all

# Show help
node .husky/validate-markdown-links.js --help
```

#### `validate-markdown-toc.js` - Table of Contents Guardian

*splashes with documentation enthusiasm* Ensures all markdown files have proper, up-to-date Table of Contents sections.

> *Validation Rules:*

- **H2 Requirement**: First H2 heading must exist
- **ToC Placement**: Table of Contents must appear after first H2
- **Content Accuracy**: ToC must match actual document headings
- **Hierarchy Support**: Proper nesting of H2, H3, H4+ headings
- **Auto-fix Capability**: Can automatically generate/update ToCs

> *Usage:*

```bash
# Validate staged files
node .husky/validate-markdown-toc.js

# Auto-fix ToC issues
node .husky/validate-markdown-toc.js --fix

# Validate specific files
node .husky/validate-markdown-toc.js docs/README.md
```

#### `validate-sentence-length.js` - Readability Optimizer

*whiskers quiver with writing precision* Implements 2025 best practices for
technical documentation sentence breaking and line length management.

> *Intelligent Breaking:*

- **Conjunction Priority**: Breaks at "and", "but", "while", "because"
- **Punctuation Awareness**: Uses commas and semicolons as natural breaks
- **Preposition Handling**: Breaks after "in", "on", "at", "by", "for", "with"
- **Relative Pronouns**: Uses "which", "that", "who", "where" as break points
- **Context Preservation**: Maintains proper indentation and formatting

> *Special Element Recognition:*

- **Code Blocks**: Preserves ``` code blocks
- **Tables**: Maintains table formatting
- **Headers**: Preserves markdown headers
- **Lists**: Maintains list structure
- **URLs**: Preserves long URLs

> *Usage:*

```bash
# Validate staged files (120 char limit)
node .husky/validate-sentence-length.js

# Auto-fix sentence lengths
node .husky/validate-sentence-length.js --fix

# Custom line length
node .husky/validate-sentence-length.js --length 100

# Process all markdown files
node .husky/validate-sentence-length.js --fix --all
```

### 🐍 Python Quality Assurance

#### `validate_python.py` - Python Code Guardian

*snarls with Python precision* Comprehensive Python validation ensuring code quality, security, and
modularity standards.

> *Validation Checks:*

- **Formatting**: Black code formatting validation
- **Import Sorting**: isort import organization
- **Linting**: Flake8 code quality checks
- **Type Hints**: MyPy type checking (non-blocking)
- **Security**: Bandit security vulnerability scanning (non-blocking)
- **Modularity**: File length limits (250 lines source, 300 lines tests)

> *Smart Features:*

- **Virtual Environment**: Automatically sources `~/venv/bin/activate`
- **Staged Files**: Only validates files being committed
- **Type Detection**: Identifies files likely to contain type hints
- **Non-blocking Checks**: Type hints and security warnings don't block commits

> *Usage:*

```bash
# Run validation (called by pre-commit hook)
python3 .husky/validate_python.py

# Manual formatting fixes
black .
isort .
flake8 .
```

### 🧪 Testing Infrastructure

#### `vitest.config.js` - Test Configuration

*otter enthusiasm bubbles* Vitest configuration for running validation script tests.

> *Features:*

- **Node Environment**: Tests run in Node.js environment
- **Global Test Access**: Globals enabled for test utilities
- **Pattern Matching**: Includes all `*.test.js` files
- **Exclusion Rules**: Skips node_modules and dist directories

## 🚀 Usage Patterns

### 🔄 Automatic Integration

> *Pre-commit Hook (Default Behavior):*

```bash
# All validations run automatically on commit
git add .
git commit -m "feat: add new feature"
# → Runs all validation tools on staged files
```

> *Manual Validation:*

```bash
# CSS validation
node .husky/validate-css-variables.js --strict

# Markdown link checking
node .husky/validate-markdown-links.js --all

# Documentation quality
node .husky/validate-markdown-toc.js --fix
node .husky/validate-sentence-length.js --fix --all

# Python quality
python3 .husky/validate_python.py
```

### 📦 Package Scripts Integration

Add to your project's `package.json`:

```json
{
  "scripts": {
    "validate:css": "node .husky/validate-css-variables.js",
    "validate:css:strict": "node .husky/validate-css-variables.js --strict",
    "validate:markdown:links": "node .husky/validate-markdown-links.js --all",
    "validate:markdown:toc": "node .husky/validate-markdown-toc.js --fix",
    "validate:markdown:length": "node .husky/validate-sentence-length.js --fix --all",
    "validate:python": "python3 .husky/validate_python.py",
    "validate:all": "npm run validate:css && npm run validate:markdown:links && npm run validate:markdown:toc && npm run validate:python"
  }
}
```

### 🔧 CI/CD Integration

> *GitHub Actions Example:*

```yaml
- name: Validate CSS Variables
  run: node .husky/validate-css-variables.js --strict

- name: Validate Markdown Links
  run: node .husky/validate-markdown-links.js --all

- name: Validate Python Code
  run: python3 .husky/validate_python.py
```

## 📊 Exit Codes & Integration

### Exit Code Meanings

| Code | Meaning | Action |
|------|---------|--------|
| `0` | Success | All validations passed |
| `1` | Errors | Block commit/deployment |
| `2` | Warnings | Allow but notify (CSS only) |

### Pre-commit Integration

The pre-commit hook automatically:

1. **Detects File Types**: Only runs relevant validators for staged files
2. **Provides Context**: Shows which files are being validated
3. **Gives Guidance**: Offers specific fix suggestions for each tool
4. **Maintains Performance**: Skips unnecessary validations

## 🎯 Validation Rules & Standards

### 📏 File Size Limits

> *TypeScript/JavaScript:*

- Source files: 100 lines maximum
- Test files: 200 lines maximum

> *Python:*

- Source files: 250 lines maximum  
- Test files: 300 lines maximum

### 🎨 CSS Variable Standards

> *Critical Variables (Must Be Consistent):*

- Theme colors: `--accent`, `--bg-color`, `--secondary-bg`, `--card-bg`
- Text colors: `--text-primary`, `--text-secondary`, `--text-tertiary`
- UI elements: `--border-color`, `--success`, `--error`, `--warning`, `--info`, `--danger`

> *Theme Variables (Should Differ Per Theme):*

- All critical variables should have different values across themes
- Values are validated for consistency within each theme

### 📚 Documentation Standards

> *Markdown Requirements:*

- **Table of Contents**: Required after first H2 heading
- **Link Integrity**: All links must be valid and functional
- **Sentence Length**: Maximum 120 characters per line
- **Structure**: Proper heading hierarchy (H2 → H3 → H4)

> *Link Validation:*

- **Internal Links**: Must point to existing files
- **Anchor Links**: Must match actual headings
- **External Links**: Must have valid URL format
- **Image Links**: Must point to existing image files

### 🐍 Python Standards

> *Code Quality:*

- **Formatting**: Black code formatting required
- **Imports**: isort import organization required
- **Linting**: Flake8 compliance required
- **Type Hints**: MyPy validation (warnings only)
- **Security**: Bandit security scanning (warnings only)

## 🐛 Troubleshooting

### Common Issues

> *Hook Not Running:*

```bash
# Check if hook is installed
ls -la .git/hooks/pre-commit

# Reinstall hooks
npx husky install
```

> *Validation Failing:*

```bash
# Check detailed reports
cat css-validation-report.md

# Run with verbose output
node .husky/validate-css-variables.js --verbose
```

> *Skip Validation (Not Recommended):*

```bash
# Skip pre-commit hook for one commit
git commit --no-verify -m "Emergency fix"
```

### Debug Mode

> *CSS Variables:*

```bash
node .husky/validate-css-variables.js --verbose --list-files
```

> *Markdown Links:*

```bash
node .husky/validate-markdown-links.js --all
```

> *Python Validation:*

```bash
# Check individual tools
black --check --diff .
isort --check-only --diff .
flake8 .
```

## 🤝 Contributing

### Adding New Validators

1. **Create Script**: Add new validation script to `.husky/`
2. **Update Pre-commit**: Integrate into `pre-commit` hook
3. **Add Tests**: Create corresponding `.test.js` file
4. **Document**: Update this README with usage instructions

### Extending Existing Tools

1. **Modify Script**: Update validation logic
2. **Update Tests**: Ensure test coverage
3. **Test Integration**: Verify pre-commit hook integration
4. **Update Documentation**: Reflect changes in this README

## 📁 File Structure

```text
reynard/.husky/
├── _/                          # Husky internal files
├── __pycache__/               # Python cache
├── node_modules/              # Node dependencies
├── validate-css-variables.js   # CSS variable validation
├── validate-css-variables.test.js
├── validate-markdown-links.js  # Markdown link validation  
├── validate-markdown-links.test.js
├── validate-markdown-toc.js    # Table of contents validation
├── validate-markdown-toc.test.js
├── validate-sentence-length.js # Sentence length validation
├── validate-sentence-length.test.js
├── validate_python.py          # Python code validation
├── validate-python.test.py
├── test_validate_python.py     # Python test runner
├── vitest.config.js           # Test configuration
├── pre-commit                  # Main pre-commit hook
├── commit-msg                  # Commit message validation
├── README.md                   # This comprehensive guide
└── README-markdown-links.md    # Detailed link validator docs
```

## 🔄 Migration & History

### From `scripts/` to `.husky/`

The validation tools were previously located in `scripts/` but
have been consolidated into `.husky/` for better integration with Husky's hook management system. This provides:

- **Automatic Installation**: Hooks install with `npm install`
- **Better Organization**: All Git-related tools in one location
- **Improved Integration**: Seamless pre-commit hook coordination
- **Enhanced Performance**: Optimized for staged file validation

## 🎯 Best Practices

### 🦊 The Fox's Strategic Approach

1. **Always run validation** before committing changes
2. **Fix errors immediately** - they block commits for good reason
3. **Address warnings** when possible - they indicate potential issues
4. **Use consistent naming** - follow established patterns
5. **Document new variables** - add comments explaining their purpose

### 🦦 The Otter's Thorough Testing

1. **Test all validators** when making changes
2. **Verify integration** with pre-commit hooks
3. **Check edge cases** with various file types
4. **Validate performance** with large codebases
5. **Ensure accessibility** of error messages

### 🐺 The Wolf's Adversarial Analysis

1. **Challenge assumptions** about validation rules
2. **Test failure modes** with malformed input
3. **Verify security** of validation processes
4. **Stress test** with large file sets
5. **Hunt down edge cases** that might break validation

## 🔗 Integration with Reynard

### Framework Integration

All tools are fully integrated with the Reynard framework:

- **Follows Reynard coding standards** with animal spirit personality
- **Uses Reynard color scheme** for consistent terminal output
- **Integrates with existing Husky hooks** seamlessly
- **Compatible with Reynard's monorepo structure** across packages

### Documentation Standards

The validators enforce Reynard's documentation standards:

- **Consistent link formatting** across all documentation
- **Proper relative path usage** for internal references
- **Valid anchor references** with GitHub-compatible IDs
- **External link best practices** with protocol validation

---

> 🦊 Built with the cunning of a fox, the thoroughness of an otter, and the precision of a wolf - the Reynard way!

> Three spirits, one mission: ensuring code quality that would make even the most demanding predator proud.
