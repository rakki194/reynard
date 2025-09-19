# Pylint Troubleshooting Guide

**Date:** 2025-09-19
**Agent:** Snuggles-Grandmaster-35 (Otter Specialist)
**Purpose:** Comprehensive guide for diagnosing and resolving Pylint configuration issues

## Overview

This guide provides systematic approaches to diagnosing and resolving common Pylint configuration issues, with a focus on the `E0015: Unrecognized option` error and related configuration problems.

## Common Pylint Errors

### E0015: Unrecognized Option

**Error Message:**

```
E0015: Unrecognized option found: [option-name] (unrecognized-option)
```

**Common Causes:**

1. **Invalid Configuration Syntax**: Incorrect TOML syntax in `pyproject.toml`
2. **Deprecated Options**: Using options removed in newer Pylint versions
3. **Typographical Errors**: Misspelled option names
4. **Version Incompatibility**: Using options not available in current Pylint version

**Diagnostic Steps:**

1. **Identify the Problematic Option**

   ```bash
   pylint --help-msg=E0015
   ```

2. **Check Pylint Version**

   ```bash
   pylint --version
   ```

3. **Validate Configuration Syntax**

   ```bash
   # Test with minimal configuration
   pylint --disable=all .
   ```

4. **Isolate the Problem**
   ```bash
   # Test specific configuration sections
   pylint --rcfile=.pylintrc .
   ```

### E0014: Bad Option Value

**Error Message:**

```
E0014: Bad option value [value] for [option] (bad-option-value)
```

**Common Causes:**

1. **Invalid Values**: Using values not supported by the option
2. **Type Mismatches**: Providing wrong data type for option
3. **Format Errors**: Incorrect formatting of option values

### E0013: Bad Option Value

**Error Message:**

```
E0013: Bad option value [value] for [option] (bad-option-value)
```

**Common Causes:**

1. **Invalid File Paths**: Non-existent files or directories
2. **Permission Issues**: Files not accessible to Pylint
3. **Path Format Errors**: Incorrect path syntax

## Configuration File Locations

### Primary Configuration Files

1. **`pyproject.toml`** - Modern Python project configuration
2. **`.pylintrc`** - Traditional Pylint configuration file
3. **`setup.cfg`** - Alternative configuration location
4. **`tox.ini`** - Test environment configuration

### Configuration Priority

Pylint searches for configuration in this order:

1. Command-line options
2. `pyproject.toml` (in current directory and parent directories)
3. `.pylintrc` (in current directory and parent directories)
4. `setup.cfg` (in current directory and parent directories)
5. `tox.ini` (in current directory and parent directories)

## Diagnostic Commands

### Basic Diagnostics

```bash
# Check Pylint version and basic info
pylint --version

# List all available options
pylint --help

# Get help for specific error code
pylint --help-msg=E0015

# Test with minimal configuration
pylint --disable=all --enable=all .

# Test specific configuration file
pylint --rcfile=.pylintrc .
```

### Configuration Validation

```bash
# Validate pyproject.toml syntax
python -c "import tomllib; tomllib.load(open('pyproject.toml', 'rb'))"

# Check for configuration conflicts
pylint --list-msgs | grep -i "unrecognized"

# Test configuration loading
pylint --generate-rcfile > test_config.rc
```

### File-Specific Testing

```bash
# Test single file
pylint specific_file.py

# Test with specific options
pylint --disable=C0114,C0116,R0903,W0613 .

# Test with verbose output
pylint --verbose .
```

## Common Configuration Issues

### Invalid TOML Syntax

**Problem:**

```toml
[tool.pylint."messages_control.overrides"]  # Invalid syntax
"*.pyi" = ["undefined-variable"]
```

**Solution:**

```toml
[tool.pylint.messages_control]  # Valid syntax
disable = []
```

### Deprecated Options

**Problem:**

```toml
[tool.pylint.master]
no-space-check = true  # Deprecated in Pylint 2.6+
```

**Solution:**

```toml
[tool.pylint.format]
# Use modern formatting options instead
```

### Version-Specific Options

**Problem:**

```toml
[tool.pylint.messages_control]
# Using options not available in current version
```

**Solution:**

```bash
# Check available options for current version
pylint --help | grep -i "option-name"
```

## Step-by-Step Troubleshooting Process

### Step 1: Gather Information

```bash
# Collect system information
pylint --version
python --version
ls -la | grep -E "(pylint|pyproject|setup)"

# Check configuration files
find . -name "*.pylintrc" -o -name "pyproject.toml" -o -name "setup.cfg"
```

### Step 2: Isolate the Problem

```bash
# Test with no configuration
pylint --disable=all .

# Test with minimal configuration
echo "[tool.pylint.messages_control]" > test_pyproject.toml
echo "disable = []" >> test_pyproject.toml
pylint --rcfile=test_pyproject.toml .
```

### Step 3: Validate Configuration

```bash
# Check TOML syntax
python -c "import tomllib; print('TOML syntax OK')" < pyproject.toml

# Validate Pylint configuration
pylint --generate-rcfile > reference.rc
diff reference.rc .pylintrc
```

### Step 4: Test Incrementally

```bash
# Add configuration options one by one
pylint --disable=all --enable=E .
pylint --disable=all --enable=E,W .
pylint --disable=all --enable=E,W,F .
```

## Prevention Strategies

### Configuration Management

1. **Version Control**: Keep configuration files in version control
2. **Documentation**: Document configuration decisions and rationale
3. **Testing**: Test configuration changes in isolated environments
4. **Validation**: Use automated tools to validate configuration syntax

### Best Practices

1. **Minimal Configuration**: Start with minimal configuration and add options as needed
2. **Version Pinning**: Pin Pylint version to avoid compatibility issues
3. **Regular Updates**: Keep Pylint and configuration up to date
4. **Error Monitoring**: Monitor for configuration-related errors in CI/CD

### Automated Validation

```bash
#!/bin/bash
# Configuration validation script

echo "Validating Pylint configuration..."

# Check TOML syntax
if python -c "import tomllib; tomllib.load(open('pyproject.toml', 'rb'))" 2>/dev/null; then
    echo "✅ TOML syntax is valid"
else
    echo "❌ TOML syntax error"
    exit 1
fi

# Test Pylint configuration
if pylint --disable=all . >/dev/null 2>&1; then
    echo "✅ Pylint configuration is valid"
else
    echo "❌ Pylint configuration error"
    exit 1
fi

echo "✅ All configuration checks passed"
```

## Recovery Procedures

### When Configuration is Completely Broken

1. **Backup Current Configuration**

   ```bash
   cp pyproject.toml pyproject.toml.backup
   cp .pylintrc .pylintrc.backup
   ```

2. **Reset to Default Configuration**

   ```bash
   pylint --generate-rcfile > .pylintrc
   ```

3. **Test Basic Functionality**

   ```bash
   pylint --disable=all .
   ```

4. **Restore Configuration Incrementally**
   ```bash
   # Add options one by one, testing after each addition
   ```

### When Specific Options Cause Issues

1. **Identify Problematic Options**

   ```bash
   pylint --help | grep -i "problematic-option"
   ```

2. **Check Option Documentation**

   ```bash
   pylint --help-msg=ERROR_CODE
   ```

3. **Find Alternative Options**
   ```bash
   pylint --help | grep -i "alternative-option"
   ```

## Advanced Troubleshooting

### Debug Mode

```bash
# Enable debug output
pylint --verbose --debug .

# Check configuration loading
pylint --verbose --debug --rcfile=.pylintrc .
```

### Configuration Merging Issues

```bash
# Check for conflicting configurations
find . -name "*.pylintrc" -o -name "pyproject.toml" | xargs grep -l "pylint"

# Test configuration precedence
pylint --rcfile=.pylintrc --verbose .
```

### Plugin-Related Issues

```bash
# List available plugins
pylint --list-msgs

# Test without plugins
pylint --load-plugins= .
```

## Conclusion

This troubleshooting guide provides systematic approaches to diagnosing and resolving Pylint configuration issues. The key to successful troubleshooting is:

1. **Systematic Approach**: Follow the diagnostic steps in order
2. **Isolation**: Test components separately to identify the root cause
3. **Documentation**: Keep records of configuration changes and their effects
4. **Prevention**: Implement best practices to avoid future issues

Remember that most Pylint configuration issues stem from:

- Invalid syntax in configuration files
- Version incompatibilities
- Deprecated or removed options
- Conflicting configurations

By following this guide, you should be able to resolve most Pylint configuration issues efficiently and prevent them from recurring.
