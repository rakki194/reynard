# 🐺 Workflow Shell Script Validation Toolkit

This toolkit provides comprehensive validation for shell scripts embedded in GitHub Actions workflows, ensuring bulletproof CI/CD security.

## 🎯 Overview

The Workflow Shell Script Validation Toolkit consists of several components that work together to:

1. **Extract** shell scripts from GitHub workflow files
2. **Validate** them using shellcheck with strict rules
3. **Auto-fix** common issues when possible
4. **Integrate** seamlessly with Husky pre-commit hooks
5. **Report** detailed results and recommendations

## 🛠️ Components

### 1. Workflow Shell Extractor (`extract-workflow-shell.js`)

The core extraction engine that:

- Parses GitHub workflow YAML files
- Identifies multi-line shell scripts (`run: |`)
- Extracts and validates each script individually
- Generates detailed reports with fix suggestions

**Usage:**

```bash
# Extract and validate all workflow shell scripts
node .husky/extract-workflow-shell.js

# Extract with verbose output
node .husky/extract-workflow-shell.js --verbose

# Auto-fix common issues
node .husky/extract-workflow-shell.js --fix

# Specify custom workflow directory
node .husky/extract-workflow-shell.js --workflow-dir=.github/workflows
```

### 2. Pre-commit Hook (`pre-commit-workflow-shell-validation`)

Automatically validates workflow shell scripts before commits:

- Runs only when workflow files are staged
- Integrates with existing pre-commit pipeline
- Provides helpful error messages and fix suggestions

### 3. Husky Toolkit Manager (`husky-toolkit-manager.js`)

Centralized management system for all Husky validation tools:

- Lists all available tools and their status
- Runs individual tools or all tools at once
- Checks dependencies and provides installation commands
- Provides unified interface for the entire toolkit

**Usage:**

```bash
# List all tools and their status
node .husky/husky-toolkit-manager.js list

# Run a specific tool
node .husky/husky-toolkit-manager.js run workflow-shell --fix

# Run all available tools
node .husky/husky-toolkit-manager.js run-all

# Check and install missing dependencies
node .husky/husky-toolkit-manager.js install-deps
```

## 📦 Package.json Scripts

The toolkit is integrated into the project's npm scripts for easy access:

```bash
# Workflow shell validation
pnpm run workflow:shell:extract          # Extract and validate
pnpm run workflow:shell:extract:fix      # Extract with auto-fix
pnpm run workflow:shell:validate         # Validate with verbose output

# Husky toolkit management
pnpm run husky:toolkit                   # Show help
pnpm run husky:toolkit:list              # List all tools
pnpm run husky:toolkit:run-all           # Run all tools
pnpm run husky:toolkit:install-deps      # Install missing dependencies
```

## 🔧 Configuration

### ShellCheck Configuration

The toolkit uses the project's `.shellcheckrc` configuration file for consistent validation rules. Key rules include:

- **SC2292**: Prefer `[[ ]]` over `[ ]` for bash tests
- **SC2250**: Prefer putting braces around variable references
- **SC2154**: Variables referenced but not assigned
- **SC2312**: Command substitution masking return values

### Workflow Integration

The toolkit is integrated into the comprehensive linting workflow (`.github/workflows/comprehensive-linting.yml`) as a separate job:

```yaml
workflow-shell-validation:
  name: 🐺 Workflow Shell Script Validation
  runs-on: ubuntu-latest
  if: github.event.inputs.lint_type == '' || github.event.inputs.lint_type == 'all' || github.event.inputs.lint_type == 'workflow-shell'

  steps:
    - name: 🐺 Extract and validate workflow shell scripts
      run: |
        echo "🐺 Extracting and validating shell scripts from GitHub workflows..."
        node .husky/extract-workflow-shell.js --verbose
```

## 🚨 Common Issues and Fixes

### 1. SC2292: Prefer `[[ ]]` over `[ ]`

**Issue:**

```bash
if [ "$VAR" == "value" ]; then
```

**Fix:**

```bash
if [[ "${VAR}" == "value" ]]; then
```

### 2. SC2250: Prefer putting braces around variable references

**Issue:**

```bash
echo "Value: $VAR"
```

**Fix:**

```bash
echo "Value: ${VAR}"
```

### 3. SC2154: Variables referenced but not assigned

**Issue:**

```bash
echo "Output: $GITHUB_OUTPUT"
```

**Fix:**

```bash
echo "Output: ${GITHUB_OUTPUT}"
```

### 4. SC2312: Command substitution masking return values

**Issue:**

```bash
RESULT=$(command)
```

**Fix:**

```bash
RESULT=$(command || echo "fallback")
```

## 🎯 Quality of Life Improvements

### 1. Automated Fixes

The toolkit can automatically fix many common issues:

- Replace `[ ]` with `[[ ]]`
- Add braces around variables
- Fix common variable reference issues

### 2. Detailed Reporting

Provides comprehensive reports including:

- List of all extracted scripts
- Validation results for each script
- Specific error messages and line numbers
- Fix suggestions and examples

### 3. Integration with Existing Tools

Seamlessly integrates with:

- Husky pre-commit hooks
- GitHub Actions workflows
- Package.json scripts
- Existing validation tools

### 4. Dependency Management

Automatically checks for required dependencies:

- Node.js
- shellcheck
- actionlint
- Python tools (for other validators)

## 🔍 Troubleshooting

### Common Issues

1. **"shellcheck not found"**

   ```bash
   sudo pacman -S shellcheck
   ```

2. **"Node.js not found"**

   ```bash
   sudo pacman -S nodejs npm
   ```

3. **"Permission denied"**

   ```bash
   chmod +x .husky/pre-commit-workflow-shell-validation
   ```

### Debug Mode

Run with verbose output to see detailed information:

```bash
node .husky/extract-workflow-shell.js --verbose
```

### Manual Validation

Test individual workflow files:

```bash
shellcheck --rcfile=.shellcheckrc <extracted-script.sh>
```

## 🎉 Benefits

1. **Security**: Catches shell script vulnerabilities before they reach production
2. **Consistency**: Ensures all workflow shell scripts follow the same standards
3. **Automation**: Reduces manual review time with automated validation
4. **Integration**: Works seamlessly with existing development workflows
5. **Maintainability**: Makes it easier to maintain and update workflow scripts

## 🚀 Future Enhancements

- Support for more shell script patterns
- Integration with additional linters
- Custom rule configuration
- Performance optimizations
- Enhanced reporting and analytics

---

_This toolkit is part of the Reynard project's commitment to code quality and security. For questions or contributions, please refer to the main project documentation._
