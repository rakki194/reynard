# 🦊 Python Development Setup for Reynard

This document describes the professional Python development environment setup for the Reynard framework, including linting, formatting, and validation tools integrated with Husky git hooks.

## 🚀 Quick Setup

Run the automated setup script to get started:

```bash
npm run python:setup
```

This will:

- Create a Python virtual environment
- Install all development dependencies
- Set up linting and formatting tools
- Configure git hooks for Python validation

## 🛠️ Tools Included

### Code Formatting

- **Black**: Opinionated Python code formatter
- **isort**: Import statement organizer

### Linting & Code Quality

- **Flake8**: Style guide enforcement
- **Pylint**: Advanced static analysis
- **MyPy**: Static type checking
- **Bandit**: Security vulnerability scanner

### Testing

- **Pytest**: Testing framework
- **pytest-cov**: Coverage reporting

### Pre-commit Hooks

- **Husky**: Git hooks management
- **Custom Python validator**: Comprehensive Python file validation

## 📋 Available Commands

### Setup & Installation

```bash
# Set up Python development environment
npm run python:setup

# Activate virtual environment (after setup)
source venv/bin/activate
```

### Code Formatting

```bash
# Format all Python files
npm run python:format

# Check formatting without making changes
npm run python:format:check

# Format specific files
black path/to/file.py
isort path/to/file.py
```

### Linting & Analysis

```bash
# Run all linting checks
npm run python:lint

# Run type checking
npm run python:typecheck

# Run security checks
npm run python:security

# Run all checks (format, lint, typecheck)
npm run python:check
```

### Testing

```bash
# Run tests
npm run python:test

# Run tests with coverage
npm run python:test:coverage
```

## 🔧 Configuration Files

### `pyproject.toml`

Central configuration for all Python tools:

- Black formatting settings
- isort import sorting rules
- MyPy type checking configuration
- Pytest testing configuration
- Bandit security settings

### `.flake8`

Flake8 linting configuration:

- Line length: 88 characters (Black compatible)
- Ignored error codes
- Per-file ignore rules
- Complexity settings

### `requirements-dev.txt`

Development dependencies including:

- Code quality tools
- Testing frameworks
- Documentation tools
- Type checking utilities

## 🎯 Git Hooks Integration

### Pre-commit Hook

The pre-commit hook automatically runs when you commit Python files:

1. **Black formatting check** - Ensures consistent code formatting
2. **isort import check** - Verifies import statement organization
3. **Flake8 linting** - Checks for style and syntax issues
4. **MyPy type checking** - Validates type hints (non-blocking)
5. **Bandit security check** - Scans for security issues (non-blocking)

### Bypassing Hooks

If you need to bypass the pre-commit hooks (not recommended):

```bash
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

The setup includes whimsical fox-themed messages and emojis throughout the development workflow, maintaining the Reynard brand personality.

## 📁 Project Structure

```
reynard/
├── .husky/
│   ├── pre-commit              # Enhanced with Python validation
│   └── validate-python.py      # Custom Python validator
├── scripts/
│   └── setup-python-dev.sh     # Automated setup script
├── pyproject.toml              # Python tool configuration
├── .flake8                     # Flake8 configuration
├── requirements-dev.txt        # Development dependencies
└── PYTHON_DEV_SETUP.md         # This file
```

## 🔍 Troubleshooting

### Common Issues

**Virtual Environment Not Found**

```bash
# Recreate virtual environment
rm -rf venv
npm run python:setup
```

**Tools Not Found**

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements-dev.txt
```

**Pre-commit Hook Failing**

```bash
# Check Python validation script
python3 .husky/validate-python.py

# Fix formatting issues
npm run python:format

# Fix import sorting
isort .

# Check linting issues
npm run python:lint
```

### Getting Help

1. Check the tool-specific documentation
2. Run individual tools to isolate issues
3. Use `--help` flag with any tool for usage information
4. Check the Reynard project documentation

## 🎉 Best Practices

### Development Workflow

1. **Before coding**: Activate virtual environment (`source venv/bin/activate`)
2. **During coding**: Use your IDE's Python extension for real-time feedback
3. **Before committing**: Run `npm run python:check` to verify everything
4. **After committing**: The pre-commit hook will catch any remaining issues

### Code Style

- Follow Black's formatting rules (88 character line length)
- Use type hints where appropriate
- Keep functions small and focused
- Write comprehensive docstrings
- Use meaningful variable names

### Testing

- Write tests for new functionality
- Aim for high test coverage
- Use descriptive test names
- Test edge cases and error conditions

## Happy Coding

The Reynard Python development environment is designed to help you write clean, secure, and maintainable Python code while maintaining the framework's playful and professional character. The fox is always watching, so make sure your code is as cunning as it is clean! 🦊✨
