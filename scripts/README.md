# Reynard CSS Variable Validation Tools

This directory contains tools for maintaining CSS variable consistency across all Reynard projects.

## 🛠️ Tools Overview

### 1. `validate-css-variables.js`

A comprehensive CSS variable validator that checks for:

- **Inconsistent variable definitions** across files
- **Missing variable definitions** (used but not defined)
- **Unused variable definitions** (defined but never used)
- **Potential typos** in variable names
- **Theme-specific inconsistencies**

### 2. `pre-commit-hook`

A Git pre-commit hook that automatically runs CSS validation before commits.

### 3. `setup-git-hooks.sh`

A setup script that installs the pre-commit hook across all Reynard projects.

## 🚀 Quick Start

### Install Hooks for All Reynard Projects

```bash
# From the reynard/scripts directory
./setup-git-hooks.sh

# Or from any Reynard project directory
../../reynard/scripts/setup-git-hooks.sh
```

### Manual Validation

```bash
# Run validation in any Reynard project
node scripts/validate-css-variables.js

# Run with strict mode (fails on warnings)
node scripts/validate-css-variables.js --strict

# Run with verbose output
node scripts/validate-css-variables.js --verbose
```

## 📋 What Gets Validated

### Critical Variables (Must Be Consistent)

- `--accent`
- `--bg-color`
- `--secondary-bg`
- `--card-bg`
- `--text-primary`
- `--text-secondary`
- `--text-tertiary`
- `--border-color`
- `--success`
- `--error`
- `--warning`
- `--info`
- `--danger`

### Theme Variables (Should Have Different Values Per Theme)

- `--accent`
- `--bg-color`
- `--secondary-bg`
- `--card-bg`
- `--text-primary`
- `--text-secondary`
- `--border-color`

## 🔍 Validation Rules

### ✅ What's Allowed

- Different values for theme variables across different themes
- Variables used only in specific components
- Variables with consistent definitions across files

### ❌ What's Blocked

- Variables used but not defined anywhere
- Inconsistent values for non-theme variables
- Critical variables with different values in the same theme

### ⚠️ What's Warned About

- Unused variable definitions
- Potential typos in variable names
- Non-critical variables with inconsistencies

## 📁 File Structure

```
reynard/scripts/
├── validate-css-variables.js    # Main validation script
├── pre-commit-hook              # Git pre-commit hook
├── setup-git-hooks.sh          # Hook installation script
└── README.md                   # This file
```

## 🎯 Usage Examples

### Check a Specific Project

```bash
cd reynard-test-app
node ../reynard/scripts/validate-css-variables.js
```

### Install Hooks for Specific Projects

```bash
./setup-git-hooks.sh /path/to/reynard-test-app /path/to/reynard-auth-app
```

### Run Validation in CI/CD

```bash
# In your CI pipeline
node scripts/validate-css-variables.js --strict
# Exit code 1 = errors (block deployment)
# Exit code 2 = warnings (allow deployment)
# Exit code 0 = clean
```

## 🔧 Configuration

The validator can be configured by modifying the `CONFIG` object in `validate-css-variables.js`:

```javascript
const CONFIG = {
  // Directories to scan for CSS files
  scanDirs: ['packages', 'examples', 'templates', 'src', 'styles'],
  
  // Files to ignore
  ignorePatterns: [/node_modules/, /dist/, /build/, /\.git/],
  
  // Critical variables that must be consistent
  criticalVariables: ['accent', 'bg-color', 'text-primary', ...],
  
  // Theme-specific variables
  themeVariables: ['accent', 'bg-color', 'secondary-bg', ...]
};
```

## 📊 Output

The validator generates:

1. **Console output** with colored status messages
2. **css-validation-report.md** with detailed analysis
3. **Exit codes** for CI/CD integration:
   - `0` = Success
   - `1` = Errors found (block commit/deployment)
   - `2` = Warnings found (allow but notify)

## 🐛 Troubleshooting

### Hook Not Running

```bash
# Check if hook is installed
ls -la .git/hooks/pre-commit

# Reinstall hooks
./setup-git-hooks.sh
```

### Validation Failing

```bash
# Check the detailed report
cat css-validation-report.md

# Run with verbose output
node scripts/validate-css-variables.js --verbose
```

### Skip Validation (Not Recommended)

```bash
# Skip pre-commit hook for one commit
git commit --no-verify -m "Emergency fix"
```

## 🤝 Contributing

When adding new CSS variables:

1. Use consistent naming conventions
2. Add to the appropriate theme files
3. Update the `criticalVariables` list if needed
4. Test with the validator before committing

## 📝 Best Practices

1. **Always run validation** before committing CSS changes
2. **Fix errors immediately** - they block commits
3. **Address warnings** when possible - they indicate potential issues
4. **Use consistent naming** - follow the established patterns
5. **Document new variables** - add comments explaining their purpose

## 🔗 Integration

### VS Code

Add to your workspace settings:

```json
{
  "scripts": {
    "validate-css": "node scripts/validate-css-variables.js"
  }
}
```

### Package.json

Add to your project's package.json:

```json
{
  "scripts": {
    "validate-css": "node scripts/validate-css-variables.js",
    "validate-css:strict": "node scripts/validate-css-variables.js --strict"
  }
}
```

### GitHub Actions

```yaml
- name: Validate CSS Variables
  run: node scripts/validate-css-variables.js --strict
```
