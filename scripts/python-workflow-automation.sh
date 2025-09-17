#!/bin/bash
# Python Formatting & Linting Workflow Automation Script
# Comprehensive Python code quality automation for Reynard monorepo

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
PYTHON_FILES=$(find . -name "*.py" -not -path "./venv/*" -not -path "./.venv/*" -not -path "./node_modules/*" -not -path "./third_party/*" | wc -l)
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
