# 🔍 Workflow Linting Setup

Comprehensive GitHub Actions workflow validation system for the Reynard project.

## 🎯 Overview

This setup provides enterprise-grade workflow validation using `actionlint`, the industry-standard linter for GitHub Actions workflows.

## 🛠️ Installation

### Arch Linux (Recommended)

```bash
sudo pacman -S actionlint
```

### Other Systems

- **macOS**: `brew install actionlint`
- **Windows**: `choco install actionlint`
- **Manual**: Download from [GitHub Releases](https://github.com/rhysd/actionlint/releases)

## 🚀 Usage

### Command Line

```bash
# Validate all workflows
pnpm run workflow:validate

# Quick lint check
pnpm run workflow:lint

# Direct actionlint usage
actionlint .github/workflows/*.yml
```

### Pre-commit Hook

The system includes a pre-commit hook that automatically validates workflow files:

```bash
# Enable the hook
chmod +x .husky/pre-commit-workflow-validation

# The hook runs automatically on commit
git commit -m "Update workflows"
```

## 📁 File Structure

```
.github/
├── workflows/                    # GitHub Actions workflows
│   ├── i18n-comprehensive.yml   # Comprehensive i18n testing
│   ├── i18n-checks.yml          # Basic i18n validation
│   ├── i18n-ci.yml              # i18n CI testing
│   ├── comprehensive-linting.yml # Full linting pipeline
│   └── workflow-linting.yml     # Workflow validation
├── actionlint.yaml              # Actionlint configuration
scripts/
├── validate-workflows.sh        # Validation script
.husky/
└── pre-commit-workflow-validation # Pre-commit hook
```

## ⚙️ Configuration

### Actionlint Configuration

The `.github/actionlint.yaml` file provides comprehensive validation settings:

- **Shellcheck integration**: Validates shell scripts in workflows
- **Pyflakes integration**: Validates Python scripts
- **Expression validation**: Checks GitHub Actions expressions
- **Action validation**: Ensures valid action versions
- **Runner validation**: Validates runner configurations

### Validation Rules

The system validates:

- ✅ **Syntax**: YAML syntax and structure
- ✅ **Actions**: Valid action versions and references
- ✅ **Expressions**: GitHub Actions expression syntax
- ✅ **Shell Scripts**: Shell script best practices
- ✅ **Python Scripts**: Python code quality
- ✅ **Security**: Potential security issues
- ✅ **Performance**: Workflow optimization opportunities

## 🔧 Available Scripts

| Script                       | Description                          |
| ---------------------------- | ------------------------------------ |
| `pnpm run workflow:validate` | Full validation with detailed report |
| `pnpm run workflow:lint`     | Quick lint check                     |
| `pnpm run workflow:check`    | Alias for validate                   |

## 🐛 Troubleshooting

### Common Issues

1. **actionlint not found**

   ```bash
   sudo pacman -S actionlint
   ```

2. **Shellcheck warnings**
   - The system automatically fixes common shellcheck issues
   - Use `{ cmd1; cmd2; } >> file` instead of multiple redirects
   - Quote variables to prevent globbing

3. **Python script issues**
   - Install pyflakes: `sudo pacman -S python-pyflakes`
   - Fix unused imports and variables

### Validation Failures

If validation fails:

1. **Check the error output** for specific issues
2. **Fix syntax errors** in YAML files
3. **Update action versions** to latest
4. **Fix shell script issues** using shellcheck recommendations
5. **Re-run validation** to confirm fixes

## 🚀 CI/CD Integration

### GitHub Actions

The `workflow-linting.yml` workflow automatically:

- ✅ Validates all workflows on push/PR
- ✅ Generates detailed reports
- ✅ Comments on PRs with results
- ✅ Uploads validation artifacts

### Local Development

```bash
# Validate before committing
pnpm run workflow:validate

# Quick check during development
pnpm run workflow:lint

# Fix common issues automatically
actionlint .github/workflows/*.yml --fix
```

## 📊 Validation Report

The system generates comprehensive reports including:

- **Workflow Status**: Valid/Invalid for each workflow
- **Issue Details**: Specific problems found
- **Fix Suggestions**: Recommended solutions
- **Performance Metrics**: Workflow optimization tips

## 🔒 Security Features

- **Action Validation**: Ensures only trusted actions are used
- **Secret Scanning**: Detects potential secret leaks
- **Permission Auditing**: Validates workflow permissions
- **Dependency Checking**: Monitors action dependencies

## 🎯 Best Practices

1. **Always validate** workflows before committing
2. **Use latest action versions** for security
3. **Minimize permissions** to least required
4. **Cache dependencies** for performance
5. **Use matrix strategies** for parallel execution
6. **Include proper error handling** in scripts

## 📚 Resources

- [Actionlint Documentation](https://github.com/rhysd/actionlint)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/learn-github-actions)
- [Shellcheck Documentation](https://www.shellcheck.net/)
- [Pyflakes Documentation](https://github.com/PyCQA/pyflakes)

## 🦊 Reynard Integration

This workflow linting system is fully integrated with the Reynard project's:

- **i18n Testing**: Validates internationalization workflows
- **Comprehensive Linting**: Ensures code quality across all languages
- **Security Scanning**: Maintains security standards
- **Performance Monitoring**: Optimizes CI/CD performance

The system follows the Reynard coding standards and integrates seamlessly with the existing development workflow.
