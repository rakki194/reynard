#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🦊 Setting up Python development environment for Reynard...${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install Python 3.13${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "${GREEN}✅ Found Python ${PYTHON_VERSION}${NC}"

# Check if Python version is 3.13
PYTHON_MAJOR_MINOR=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
if [ "$PYTHON_MAJOR_MINOR" != "3.13" ]; then
    echo -e "${RED}❌ Python 3.13 is required, but found Python ${PYTHON_MAJOR_MINOR}${NC}"
    echo -e "${YELLOW}Please install Python 3.13${NC}"
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}❌ pip3 is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install pip3${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found pip3${NC}"

# Use the user's existing virtual environment
if [ -d "$HOME/venv" ]; then
    echo -e "${GREEN}✅ Found existing virtual environment at ~/venv${NC}"
    VENV_PATH="$HOME/venv"
elif [ -d "venv" ]; then
    echo -e "${GREEN}✅ Found local virtual environment${NC}"
    VENV_PATH="venv"
else
    echo -e "${BLUE}🐍 Creating Python virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
    VENV_PATH="venv"
fi

# Activate virtual environment
echo -e "${BLUE}🔄 Activating virtual environment...${NC}"
source "$VENV_PATH/bin/activate"

# Upgrade pip
echo -e "${BLUE}⬆️  Upgrading pip...${NC}"
pip install --upgrade pip

# Install development dependencies
echo -e "${BLUE}📦 Installing Python development dependencies...${NC}"
if [ -f "requirements-dev.txt" ]; then
    pip install -r requirements-dev.txt
    echo -e "${GREEN}✅ Development dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  requirements-dev.txt not found, installing basic tools...${NC}"
    pip install black flake8 isort mypy pylint bandit safety pre-commit pytest pytest-cov
    echo -e "${GREEN}✅ Basic development tools installed${NC}"
fi

# Install project dependencies if they exist
if [ -f "requirements.txt" ]; then
    echo -e "${BLUE}📦 Installing project dependencies...${NC}"
    pip install -r requirements.txt
    echo -e "${GREEN}✅ Project dependencies installed${NC}"
fi

# Install backend dependencies if they exist
if [ -f "backend/requirements.txt" ]; then
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    pip install -r backend/requirements.txt
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
fi

# Verify installations
echo -e "${BLUE}🔍 Verifying installations...${NC}"

TOOLS=("black" "flake8" "isort" "mypy" "pylint" "bandit" "pytest")
for tool in "${TOOLS[@]}"; do
    if command -v "$tool" &> /dev/null; then
        VERSION=$($tool --version 2>/dev/null | head -n1 || echo "unknown")
        echo -e "${GREEN}✅ $tool: $VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️  $tool not found${NC}"
    fi
done

# Test the Python validation script
echo -e "${BLUE}🧪 Testing Python validation script...${NC}"
if [ -f ".husky/validate-python.py" ]; then
    python3 .husky/validate-python.py --help 2>/dev/null || echo -e "${GREEN}✅ Python validation script is ready${NC}"
else
    echo -e "${YELLOW}⚠️  Python validation script not found${NC}"
fi

echo -e "${PURPLE}🎉 Python development environment setup complete!${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}Available commands:${NC}"
echo -e "  ${YELLOW}black .${NC}                    - Format Python code"
echo -e "  ${YELLOW}isort .${NC}                    - Sort imports"
echo -e "  ${YELLOW}flake8 .${NC}                   - Lint Python code"
echo -e "  ${YELLOW}mypy .${NC}                     - Type check Python code"
echo -e "  ${YELLOW}bandit -r .${NC}                - Security check"
echo -e "  ${YELLOW}pytest${NC}                     - Run tests"
echo -e "  ${YELLOW}pnpm run python:format${NC}      - Format all Python files"
echo -e "  ${YELLOW}pnpm run python:lint${NC}        - Lint all Python files"
echo -e "  ${YELLOW}pnpm run python:check${NC}       - Run all Python checks"
echo ""
echo -e "${BLUE}To activate the virtual environment in the future:${NC}"
echo -e "  ${YELLOW}source venv/bin/activate${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🦊${NC}"
