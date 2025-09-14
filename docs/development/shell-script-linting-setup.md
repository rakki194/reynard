# 🔍 Shell Script Linting Setup

Comprehensive shell script validation system for the Reynard project using ShellCheck.

## 🎯 Overview

This setup provides enterprise-grade shell script validation using ShellCheck, the industry-standard linter for shell scripts. It ensures all shell scripts in the Reynard project follow best practices and are free from common errors.

## 🛠️ Installation

### Arch Linux (Recommended)

```bash
sudo pacman -S shellcheck
```

### Other Systems

- **macOS**: `brew install shellcheck`
- **Windows**: `choco install shellcheck`
- **Manual**: Download from [GitHub Releases](https://github.com/koalaman/shellcheck/releases)

## 🚀 Usage

### Command Line

```bash
# Validate all shell scripts
pnpm run shell:validate

# Quick lint check
pnpm run shell:lint

# Direct shellcheck usage
shellcheck --rcfile=.shellcheckrc scripts/*.sh
```

### Pre-commit Hook

The system includes a pre-commit hook that automatically validates shell scripts:

```bash
# Enable the hook
chmod +x .husky/pre-commit-shell-validation

# The hook runs automatically on commit
git commit -m "Update shell scripts"
```

## 📁 File Structure

```
.github/
├── workflows/
│   └── shell-linting.yml          # Shell script linting workflow
.shellcheckrc                      # ShellCheck configuration
scripts/
├── validate-shell-scripts.sh      # Validation script
.husky/
└── pre-commit-shell-validation    # Pre-commit hook
```

## ⚙️ Configuration

### ShellCheck Configuration

The `.shellcheckrc` file provides comprehensive validation settings:

- **Shell dialect**: `bash` (primary shell for Reynard)
- **Severity level**: `error` (focus on critical issues)
- **Output format**: `tty` (human-readable)
- **Disabled checks**: Common false positives for the project
- **Excluded directories**: `node_modules`, `venv`, `third_party`

### Validation Rules

The system validates:

- ✅ **Syntax**: Shell script syntax and structure
- ✅ **Security**: Potential security vulnerabilities
- ✅ **Best Practices**: Shell scripting best practices
- ✅ **Performance**: Script optimization opportunities
- ✅ **Portability**: Cross-platform compatibility

## 🔧 Available Scripts

| Script                    | Description                          |
| ------------------------- | ------------------------------------ |
| `pnpm run shell:validate` | Full validation with detailed report |
| `pnpm run shell:lint`     | Quick lint check                     |
| `pnpm run shell:check`    | Alias for validate                   |

## 🐛 Troubleshooting

### Common Issues

1. **shellcheck not found**

   ```bash
   sudo pacman -S shellcheck
   ```

2. **Configuration errors**
   - Check `.shellcheckrc` syntax
   - Ensure proper file permissions

3. **False positives**
   - Adjust disabled checks in `.shellcheckrc`
   - Use `# shellcheck disable=SCXXXX` for specific lines

### Validation Failures

If validation fails:

1. **Check the error output** for specific issues
2. **Fix syntax errors** in shell scripts
3. **Address security warnings** immediately
4. **Update script practices** using ShellCheck suggestions
5. **Re-run validation** to confirm fixes

## 🚀 CI/CD Integration

### GitHub Actions

The `shell-linting.yml` workflow automatically:

- ✅ Validates all shell scripts on push/PR
- ✅ Generates detailed reports
- ✅ Comments on PRs with results
- ✅ Uploads validation artifacts
- ✅ Uses differential ShellCheck for PRs

### Local Development

```bash
# Validate before committing
pnpm run shell:validate

# Quick check during development
pnpm run shell:lint

# Fix common issues automatically
shellcheck --rcfile=.shellcheckrc scripts/*.sh
```

## 📊 Validation Report

The system generates comprehensive reports including:

- **Script Status**: Valid/Invalid for each script
- **Issue Details**: Specific problems found
- **Fix Suggestions**: Recommended solutions
- **Security Alerts**: Potential vulnerabilities

## 🔒 Security Features

- **Command Injection**: Detects potential command injection vulnerabilities
- **Path Traversal**: Identifies path traversal risks
- **Variable Expansion**: Catches unsafe variable expansions
- **Permission Issues**: Flags permission-related problems

## 🎯 Best Practices

1. **Always validate** shell scripts before committing
2. **Use proper quoting** to prevent word splitting
3. **Handle errors** with `set -e` and proper error checking
4. **Avoid eval** unless absolutely necessary
5. **Use arrays** for multiple values
6. **Quote variables** to prevent globbing

## 📚 Resources

- [ShellCheck Documentation](https://www.shellcheck.net/)
- [Shell Scripting Best Practices](https://www.shellcheck.net/wiki/)
- [Bash Guide](https://mywiki.wooledge.org/BashGuide)
- [Advanced Bash Scripting Guide](https://tldp.org/LDP/abs/html/)

## 🦊 Reynard Integration

This shell script linting system is fully integrated with the Reynard project's:

- **Development Workflow**: Pre-commit hooks and CI/CD
- **Quality Assurance**: Comprehensive validation
- **Security Standards**: Vulnerability detection
- **Performance Monitoring**: Script optimization

The system follows the Reynard coding standards and integrates seamlessly with the existing development workflow.

## 📋 Shell Scripts Validated

The system validates all shell scripts in the project:

- **Development Scripts**: `scripts/*.sh`
- **Backend Scripts**: `backend/scripts/*.sh`
- **Example Scripts**: `examples/*/start.sh`
- **Build Scripts**: `packages/*/build-*.sh`
- **Test Scripts**: `e2e/backend/start.sh`
- **Husky Hooks**: `.husky/_/husky.sh`

## 🔄 Continuous Improvement

The shell script linting system is designed to evolve with the project:

- **Regular Updates**: ShellCheck version updates
- **Rule Refinement**: Configuration adjustments based on project needs
- **Best Practice Integration**: Adoption of new shell scripting standards
- **Performance Optimization**: Continuous improvement of validation speed

This ensures that the Reynard project maintains the highest standards of shell script quality and security.
