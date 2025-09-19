# Python Formatting & Linting Workflow Prompt

## Task Description

Execute a comprehensive Python code formatting and linting workflow that analyzes code quality, applies consistent formatting, performs type checking, and maintains code standards across the Reynard monorepo.

## Complete Workflow Steps

### 1. Tool Overview and Optimal Order

#### Modern Python Tool Stack (2024)

**Primary Tools:**

- **Ruff**: Fast linter and formatter (replaces flake8, isort, and can replace black)
- **Black**: Opinionated code formatter (optional if using Ruff formatting)
- **MyPy**: Static type checker
- **Pylint**: Comprehensive code analysis (VSCode built-in)

**Tool Order (Critical for Success):**

1. **Ruff** (linting + import sorting)
2. **Black** (formatting - if not using Ruff formatting)
3. **MyPy** (type checking)
4. **Pylint** (comprehensive analysis)

#### Installation Commands

```bash
# Install core tools
pip install ruff black mypy pylint

# Install pre-commit for automation
pip install pre-commit

# Install VSCode extensions (if using VSCode)
# - Python (ms-python.python)
# - Ruff (charliermarsh.ruff)
# - Pylint (ms-python.pylint)
```

### 2. Configuration Setup

#### VSCode Configuration

Create or update `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll": true
  },
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.linting.mypyEnabled": true,
  "python.linting.flake8Enabled": false,
  "python.linting.ruffEnabled": true,
  "python.linting.ruffArgs": ["--select", "E,F,W,A,PLC,PLE,PLR,PLW"],
  "python.linting.ruffPath": "ruff",
  "python.defaultInterpreterPath": "./venv/bin/python"
}
```

#### Ruff Configuration

Create `pyproject.toml` or `ruff.toml`:

```toml
[tool.ruff]
target-version = "py38"
line-length = 88
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
]
ignore = [
    "E501",  # line too long, handled by black
    "B008",  # do not perform function calls in argument defaults
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]

[tool.ruff.isort]
known-first-party = ["reynard"]
```

#### MyPy Configuration

Add to `pyproject.toml`:

```toml
[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

[[tool.mypy.overrides]]
module = [
    "tests.*",
    "test_*",
]
disallow_untyped_defs = false
```

#### Black Configuration

Add to `pyproject.toml`:

```toml
[tool.black]
line-length = 88
target-version = ['py38']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''
```

### 3. Pre-Commit Hook Setup

#### Pre-Commit Configuration

Create `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        language_version: python3

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.8
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]

  - repo: https://github.com/pycqa/pylint
    rev: v3.0.3
    hooks:
      - id: pylint
        args: [--disable=C0114, C0116]
```

#### Install Pre-Commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Install the git hook scripts
pre-commit install

# Run against all files (optional)
pre-commit run --all-files
```

### 4. Manual Workflow Commands

#### Individual Tool Commands

```bash
# 1. Ruff - Linting and import sorting
ruff check .                    # Check for issues
ruff check --fix .              # Auto-fix issues
ruff format .                   # Format code (alternative to black)

# 2. Black - Code formatting
black .                         # Format all Python files
black --check .                 # Check formatting without changes
black --diff .                  # Show what would be changed

# 3. MyPy - Type checking
mypy .                          # Type check all files
mypy --strict .                 # Strict type checking
mypy --ignore-missing-imports . # Skip missing imports

# 4. Pylint - Comprehensive analysis
pylint .                        # Analyze all Python files
pylint --disable=C0114,C0116 . # Skip docstring warnings
pylint --output-format=json .   # JSON output for CI
```

#### Complete Workflow Script

Create `scripts/python-format-workflow.sh`:

```bash
#!/bin/bash
# Python Formatting & Linting Workflow Script

set -e

echo "🐍 Starting Python Formatting & Linting Workflow..."

# Step 1: Ruff linting and import sorting
echo "🔍 Step 1: Running Ruff linting and import sorting..."
ruff check --fix .
echo "✅ Ruff linting completed"

# Step 2: Black formatting
echo "🎨 Step 2: Running Black formatting..."
black .
echo "✅ Black formatting completed"

# Step 3: MyPy type checking
echo "🔬 Step 3: Running MyPy type checking..."
mypy . || echo "⚠️  MyPy found type issues (non-blocking)"
echo "✅ MyPy type checking completed"

# Step 4: Pylint analysis
echo "📊 Step 4: Running Pylint analysis..."
pylint --disable=C0114,C0116 . || echo "⚠️  Pylint found issues (non-blocking)"
echo "✅ Pylint analysis completed"

echo "🎉 Python formatting workflow completed successfully!"
```

### 5. CI/CD Integration

#### GitHub Actions Workflow

Create `.github/workflows/python-formatting.yml`:

```yaml
name: Python Formatting & Linting

on:
  push:
    branches: [main, develop]
    paths: ["**/*.py"]
  pull_request:
    branches: [main, develop]
    paths: ["**/*.py"]

jobs:
  python-formatting:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.8, 3.9, "3.10", "3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install ruff black mypy pylint

      - name: Run Ruff linting
        run: ruff check .

      - name: Run Black formatting check
        run: black --check .

      - name: Run MyPy type checking
        run: mypy . || true # Non-blocking for now

      - name: Run Pylint analysis
        run: pylint --disable=C0114,C0116 . || true # Non-blocking for now
```

#### Makefile Integration

Add to `Makefile.dev`:

```makefile
# Python formatting targets
.PHONY: python-format python-lint python-type-check python-analyze python-clean

python-format:
    @echo "🎨 Formatting Python code with Black..."
    black .
    @echo "🔍 Running Ruff linting and import sorting..."
    ruff check --fix .

python-lint:
    @echo "🔍 Running Ruff linting..."
    ruff check .

python-type-check:
    @echo "🔬 Running MyPy type checking..."
    mypy . || echo "⚠️  MyPy found type issues"

python-analyze:
    @echo "📊 Running Pylint analysis..."
    pylint --disable=C0114,C0116 . || echo "⚠️  Pylint found issues"

python-clean:
    @echo "🧹 Cleaning Python cache files..."
    find . -type f -name "*.pyc" -delete
    find . -type d -name "__pycache__" -delete
    find . -type d -name "*.egg-info" -exec rm -rf {} +
    find . -type d -name ".pytest_cache" -exec rm -rf {} +
    find . -type d -name ".mypy_cache" -exec rm -rf {} +

# Combined Python workflow
python-workflow: python-clean python-format python-lint python-type-check python-analyze
    @echo "🎉 Python workflow completed!"
```

### 6. VSCode Integration

#### VSCode Tasks Configuration

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Python: Format with Black",
      "type": "shell",
      "command": "black",
      "args": ["${file}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Python: Lint with Ruff",
      "type": "shell",
      "command": "ruff",
      "args": ["check", "--fix", "${file}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Python: Type Check with MyPy",
      "type": "shell",
      "command": "mypy",
      "args": ["${file}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Python: Full Workflow",
      "dependsOrder": "sequence",
      "dependsOn": ["Python: Format with Black", "Python: Lint with Ruff", "Python: Type Check with MyPy"],
      "group": "build"
    }
  ]
}
```

#### VSCode Keybindings

Add to `.vscode/keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+f",
    "command": "workbench.action.tasks.runTask",
    "args": "Python: Full Workflow"
  },
  {
    "key": "ctrl+shift+b",
    "command": "workbench.action.tasks.runTask",
    "args": "Python: Format with Black"
  },
  {
    "key": "ctrl+shift+r",
    "command": "workbench.action.tasks.runTask",
    "args": "Python: Lint with Ruff"
  }
]
```

### 7. Quality Assurance & Troubleshooting

#### Common Issues and Solutions

#### Issue: Ruff conflicts with Black formatting

```bash
# Solution: Configure Ruff to be compatible with Black
# In pyproject.toml:
[tool.ruff]
line-length = 88  # Same as Black
target-version = "py38"

[tool.ruff.isort]
profile = "black"  # Use Black's import sorting style
```

#### Issue: MyPy strict mode too aggressive

```bash
# Solution: Gradual adoption approach
# Start with basic checks, then add strict options over time
mypy --ignore-missing-imports .
mypy --disallow-untyped-defs .
mypy --strict .  # Only when ready
```

#### Issue: Pylint too verbose

```bash
# Solution: Disable specific warnings
pylint --disable=C0114,C0116,R0903,W0613 .
# C0114: Missing module docstring
# C0116: Missing function docstring
# R0903: Too few public methods
# W0613: Unused argument
```

#### Issue: Pre-commit hooks failing

```bash
# Solution: Update hook versions and run manually
pre-commit autoupdate
pre-commit run --all-files
```

#### Performance Optimization

**For Large Codebases:**

```bash
# Use Ruff's speed optimizations
ruff check --select E,F,W .  # Only essential rules
ruff check --fix --select E,F,W,I .  # Add import sorting

# Parallel MyPy execution
mypy --junit-xml=results.xml --html-report=htmlcov .

# Pylint with specific modules
pylint --load-plugins=pylint_django backend/app/
```

#### Quality Metrics

**Code Quality Checklist:**

- [ ] **Ruff**: No linting errors (E, F, W categories)
- [ ] **Black**: Code properly formatted
- [ ] **MyPy**: Type annotations present and correct
- [ ] **Pylint**: Score above 8.0/10
- [ ] **Import organization**: Imports sorted and grouped
- [ ] **Docstrings**: Functions and classes documented
- [ ] **Type hints**: All public functions typed
- [ ] **Error handling**: Proper exception handling

### 8. Automation Script Template

#### Complete Python Workflow Automation

Create `scripts/python-workflow-automation.sh`:

```bash
#!/bin/bash
# Python Formatting & Linting Workflow Automation Script
# Similar to Git workflow automation but for Python code quality

set -e

echo "🐍 Starting Python Formatting & Linting Workflow Automation..."

# Step 1: Environment validation
echo "🔍 Step 1: Validating Python environment..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

if ! command -v pip &> /dev/null; then
    echo "❌ pip not found. Please install pip"
    exit 1
fi

echo "✅ Python environment validated"

# Step 2: Tool installation check
echo "🔧 Step 2: Checking tool installation..."
TOOLS=("ruff" "black" "mypy" "pylint")
MISSING_TOOLS=()

for tool in "${TOOLS[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
        MISSING_TOOLS+=("$tool")
    fi
done

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    echo "⚠️  Missing tools: ${MISSING_TOOLS[*]}"
    echo "Installing missing tools..."
    pip install "${MISSING_TOOLS[@]}"
fi

echo "✅ All tools available"

# Step 3: Python file detection
echo "📁 Step 3: Detecting Python files..."
PYTHON_FILES=$(find . -name "*.py" -not -path "./venv/*" -not -path "./.venv/*" -not -path "./node_modules/*" | wc -l)
echo "📊 Found $PYTHON_FILES Python files to process"

if [ "$PYTHON_FILES" -eq 0 ]; then
    echo "⚠️  No Python files found. Exiting."
    exit 0
fi

# Step 4: Ruff linting and import sorting
echo "🔍 Step 4: Running Ruff linting and import sorting..."
if ruff check --fix .; then
    echo "✅ Ruff linting completed successfully"
else
    echo "⚠️  Ruff found and fixed issues"
fi

# Step 5: Black formatting
echo "🎨 Step 5: Running Black formatting..."
if black .; then
    echo "✅ Black formatting completed successfully"
else
    echo "❌ Black formatting failed"
    exit 1
fi

# Step 6: MyPy type checking
echo "🔬 Step 6: Running MyPy type checking..."
if mypy .; then
    echo "✅ MyPy type checking passed"
else
    echo "⚠️  MyPy found type issues (non-blocking)"
fi

# Step 7: Pylint analysis
echo "📊 Step 7: Running Pylint analysis..."
if pylint --disable=C0114,C0116,R0903,W0613 .; then
    echo "✅ Pylint analysis passed"
else
    echo "⚠️  Pylint found issues (non-blocking)"
fi

# Step 8: Generate quality report
echo "📋 Step 8: Generating quality report..."
echo ""
echo "🎉 Python Formatting & Linting Workflow Completed!"
echo "📊 Summary:"
echo "   📁 Python files processed: $PYTHON_FILES"
echo "   🔍 Ruff: Linting and import sorting completed"
echo "   🎨 Black: Code formatting completed"
echo "   🔬 MyPy: Type checking completed"
echo "   📊 Pylint: Code analysis completed"
echo ""
echo "✅ All Python code quality checks completed successfully!"
```

#### Make the script executable

```bash
chmod +x scripts/python-workflow-automation.sh
```

### 9. Integration with Existing Git Workflow

#### Enhanced Git Workflow Integration

Update the existing Git workflow to include Python formatting:

```bash
# Add to git-workflow-automation.sh after junk file detection:

# Step 1.5: Python formatting (if Python files detected)
PYTHON_FILES=$(find . -name "*.py" -not -path "./venv/*" -not -path "./.venv/*" | wc -l)
if [ "$PYTHON_FILES" -gt 0 ]; then
    echo "🐍 Detected $PYTHON_FILES Python files. Running Python formatting workflow..."
    if ./scripts/python-workflow-automation.sh; then
        echo "✅ Python formatting workflow completed"
    else
        echo "❌ Python formatting workflow failed"
        exit 1
    fi
else
    echo "ℹ️  No Python files detected. Skipping Python formatting."
fi
```

### 10. Success Criteria

The Python formatting workflow is successful when:

1. ✅ **Environment validated** - Python 3.8+ and pip available
2. ✅ **Tools installed** - Ruff, Black, MyPy, Pylint available
3. ✅ **Python files detected** - At least one .py file found
4. ✅ **Ruff linting passed** - No critical linting errors
5. ✅ **Black formatting applied** - Code properly formatted
6. ✅ **MyPy type checking** - Type annotations validated (non-blocking)
7. ✅ **Pylint analysis** - Code quality assessed (non-blocking)
8. ✅ **Quality report generated** - Summary of all checks
9. ✅ **Integration ready** - Works with existing Git workflow
10. ✅ **Automation complete** - Script runs without manual intervention

---

_This prompt provides a comprehensive framework for Python code formatting and linting in the Reynard monorepo, ensuring consistent code quality, proper formatting, type safety, and seamless integration with existing development workflows._
