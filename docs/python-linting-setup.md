# 🦊 Python Linting Setup with 250-Line Limits

This document describes the comprehensive Python linting setup for the Reynard framework,
including 250-line file limits, similar to the elaborate ESLint configuration for TypeScript.

## 🎯 Overview

The Python linting system enforces:

- **250 lines maximum** for source files
- **300 lines maximum** for test files
- **88 characters** per line (Black standard)
- **Comprehensive code quality** checks via multiple tools
- **Pre-commit hooks** for automatic validation
- **VS Code integration** for real-time feedback

## 🛠️ Tools & Configuration

### Core Linting Tools

1. **Flake8** - Style guide enforcement with file length checking
2. **Pylint** - Advanced static analysis with module line limits
3. **Black** - Opinionated code formatting
4. **isort** - Import statement organization
5. **MyPy** - Static type checking
6. **Bandit** - Security vulnerability scanning

### Configuration Files

#### `.flake8`

```ini
[flake8]
max-line-length = 88
max-file-length = 250
max-complexity = 10
select = C,E,W,F,B,N,D,S,T,I
```

#### `pyproject.toml`

```toml
[tool.pylint.master]
max-module-lines = 250

[tool.pylint.format]
max-line-length = 88

[tool.black]
line-length = 88
```

## 🚀 Available Commands

### Line Count Checking

```bash
# Check Python file line counts only
npm run python:linecheck

# Full validation including line counts
npm run python:validate

# All Python checks (format, lint, type, line counts)
npm run python:check
```

### Individual Tools

```bash
# Formatting
npm run python:format
npm run python:format:check

# Linting
npm run python:lint

# Type checking
npm run python:typecheck

# Security scanning
npm run python:security
```

## 📏 Line Count Logic

The line counting system mirrors the TypeScript setup:

### What Counts as Code Lines

- ✅ **Actual code** (function definitions, class definitions, statements)
- ❌ **Blank lines** (empty or whitespace-only)
- ❌ **Single-line comments** (`# comment`)
- ❌ **Multi-line comments** (`"""docstring"""` or `'''docstring'''`)

### File Type Limits

- **Source files**: 250 lines maximum
- **Test files**: 300 lines maximum (more lenient for comprehensive tests)
- **Test file detection**: Files containing `test_`, `_test.py`, or in `/test/` or `/tests/` directories

### Example Line Counting

```python
# This comment line is NOT counted
"""This docstring is NOT counted"""

def example_function():  # This line IS counted
    """This docstring is NOT counted"""
    return "hello"  # This line IS counted

# Another comment - NOT counted
```

## 🔧 VS Code Integration

### Settings (`.vscode/settings.json`)

- **Real-time linting** with Pylint, Flake8, and MyPy
- **Automatic formatting** with Black on save
- **Import organization** with isort
- **Visual rulers** at 88 and 250 characters
- **Python path configuration** for Reynard modules

### Recommended Extensions

- `ms-python.python` - Core Python support
- `ms-python.flake8` - Flake8 integration
- `ms-python.pylint` - Pylint integration
- `ms-python.black-formatter` - Black formatting
- `ms-python.isort` - Import sorting
- `charliermarsh.ruff` - Fast Python linter (alternative)

## 🎣 Pre-commit Hooks

The pre-commit hook automatically runs when you commit Python files:

1. **Black formatting check** - Ensures consistent code formatting
2. **isort import check** - Verifies import statement organization
3. **Flake8 linting** - Checks for style and syntax issues
4. **File line count validation** - Enforces 250/300 line limits
5. **MyPy type checking** - Validates type hints (non-blocking)
6. **Bandit security check** - Scans for security issues (non-blocking)

### Bypassing Hooks

```bash
# Skip all pre-commit checks (not recommended)
git commit --no-verify -m "your commit message"
```

## Reynard-Specific Features

### Color-coded Output

All tools use the Reynard color scheme:

- 🔵 **Blue**: Information and progress
- 🟢 **Green**: Success messages
- 🟡 **Yellow**: Warnings and tips
- 🔴 **Red**: Errors and failures
- 🟣 **Purple**: Reynard branding

### Furry Flair

The setup includes whimsical fox-themed messages and
emojis throughout the development workflow, maintaining the Reynard brand personality.

## 📁 Project Structure

```
reynard/
├── .husky/
│   ├── pre-commit              # Enhanced with Python validation
│   └── validate-python.py      # Custom Python validator with line counts
├── .vscode/
│   ├── settings.json           # VS Code Python configuration
│   └── extensions.json         # Recommended Python extensions
├── pyproject.toml              # Python tool configuration
├── .flake8                     # Flake8 configuration
└── docs/
    └── python-linting-setup.md # This documentation
```

## 🔍 Troubleshooting

### Common Issues

**Line Count Violations**

```bash
# Check specific file line count
python3 scripts/validate_python.py

# See detailed line count breakdown
npm run python:linecheck
```

**Formatting Issues**

```bash
# Auto-fix formatting
npm run python:format

# Check formatting without fixing
npm run python:format:check
```

**Import Sorting Issues**

```bash
# Auto-fix import sorting
isort .

# Check import sorting
isort --check-only .
```

**Linting Issues**

```bash
# See all linting issues
npm run python:lint

# Run specific linter
flake8 .
pylint .
```

### Virtual Environment Issues

```bash
# Ensure virtual environment is activated
source ~/venv/bin/activate

# Install missing dependencies
pip install -r requirements-dev.txt
```

## 🎯 Best Practices

### File Organization

- Keep source files under 250 lines
- Keep test files under 300 lines
- Split large files into focused modules
- Use clear, descriptive module names

### Code Quality

- Run `npm run python:validate` before committing
- Fix formatting issues with `npm run python:format`
- Address linting warnings promptly
- Use type hints for better code documentation

### Team Collaboration

- Ensure all team members have the same VS Code extensions
- Run pre-commit hooks consistently
- Document any exceptions to line limits
- Use meaningful commit messages

## 📞 Getting Help

- **Documentation**: [TBD](https://docs.reynard.dev)
- **Issues**: [GitHub Issues](https://github.com/rakki194/reynard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rakki194/reynard/discussions)
- **Discord**: [Join our Discord](https://discord.gg/reynard)

---

_🦊 Happy coding with Reynard's Python linting system!_
