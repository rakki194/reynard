# Reynard Python Monorepo Architecture

## 🦊 Unified Configuration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REYNARD MONOREPO ROOT                       │
│                    pyproject.toml                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              UNIFIED TOOLING CONFIG                     │   │
│  │  • Black (code formatting)                              │   │
│  │  • isort (import sorting)                               │   │
│  │  • MyPy (type checking)                                 │   │
│  │  • Ruff (linting)                                       │   │
│  │  • Pytest (testing)                                     │   │
│  │  • Bandit (security)                                    │   │
│  │  • Safety (vulnerabilities)                             │   │
│  │  • Coverage (test coverage)                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              OPTIONAL DEPENDENCIES                      │   │
│  │  • [backend] - FastAPI, SQLAlchemy, PyTorch, etc.      │   │
│  │  • [gatekeeper] - Auth, JWT, Argon2, etc.              │   │
│  │  • [fenrir] - Requests, WebSockets, Security tools     │   │
│  │  • [test] - Pytest, Coverage, Mocking tools            │   │
│  │  • [dev] - All development tools                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ INHERITS CONFIGURATION
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PACKAGES                                │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │    BACKEND      │  │   GATEKEEPER    │  │     FENRIR      │ │
│  │                 │  │                 │  │                 │ │
│  │ pyproject.toml  │  │ pyproject.toml  │  │ pyproject.toml  │ │
│  │ • Package meta  │  │ • Package meta  │  │ • Package meta  │ │
│  │ • Dependencies  │  │ • Dependencies  │  │ • Dependencies  │ │
│  │ • Build config  │  │ • Build config  │  │ • Build config  │ │
│  │                 │  │                 │  │                 │ │
│  │ app/            │  │ gatekeeper/     │  │ [modules]/      │ │
│  │ • FastAPI app   │  │ • Auth library  │  │ • Security tools│ │
│  │ • API routes    │  │ • JWT handling  │  │ • Penetration   │ │
│  │ • Database      │  │ • Password mgmt │  │ • Fuzzing       │ │
│  │ • ML services   │  │ • Permissions   │  │ • Exploits      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Configuration Flow

### 1. Monorepo Root Configuration

- **Single Source of Truth**: All tooling rules defined once
- **Consistent Standards**: Same formatting, linting, and testing across all packages
- **Unified Dependencies**: Centralized dependency management with optional groups

### 2. Package-Specific Configuration

- **Minimal Override**: Only package metadata and specific dependencies
- **Inheritance**: All tooling configuration inherited from root
- **Flexibility**: Can override specific settings when needed

### 3. Development Workflow

```
Developer Command → Monorepo Root Config → Applied to All Packages
     ↓                    ↓                        ↓
  black .           pyproject.toml          backend/app/
  isort .           [tool.black]           libraries/gatekeeper/
  mypy .            [tool.isort]           fenrir/
  ruff .            [tool.mypy]            (all packages)
  pytest .          [tool.ruff]
                    [tool.pytest]
```

## 🎯 Benefits of Unified Configuration

### 🦊 Fox's Strategic Advantages

- **Single Point of Control**: One configuration to maintain
- **Consistent Standards**: No package-specific deviations
- **Easy Updates**: Change rules once, apply everywhere
- **Reduced Complexity**: Less configuration drift

### 🦦 Otter's Quality Benefits

- **Comprehensive Testing**: Same test standards across all packages
- **Thorough Coverage**: Unified coverage reporting
- **Edge Case Handling**: Consistent test markers and organization
- **Quality Assurance**: Same linting rules everywhere

### 🐺 Wolf's Security Benefits

- **Unified Security Scanning**: Same security tools and rules
- **Dependency Management**: Centralized vulnerability tracking
- **Code Review Standards**: Consistent security checks
- **Penetration Testing**: Integrated security testing framework

## 🚀 Usage Examples

### Development Setup

```bash
# Install everything
pip install -e ".[dev,backend,gatekeeper,fenrir,test]"

# Setup pre-commit
pre-commit install

# Run development setup script
./scripts/python-dev-setup.sh
```

### Daily Development

```bash
# Format and lint all packages
black .
isort .
ruff check .

# Type check all packages
mypy backend/app libraries/gatekeeper/gatekeeper fenrir

# Test all packages
pytest

# Security scan all packages
bandit -r backend/app libraries/gatekeeper/gatekeeper fenrir
```

### Package-Specific Work

```bash
# Work on backend only
cd backend/
pytest tests/
mypy app/

# Work on gatekeeper only
cd libraries/gatekeeper/
pytest tests/
mypy gatekeeper/

# Work on fenrir only
cd fenrir/
pytest tests/
mypy .
```

## 🔧 Configuration Inheritance Details

### What's Inherited from Root

- **Code Formatting**: Black configuration
- **Import Sorting**: isort configuration
- **Type Checking**: MyPy configuration
- **Linting**: Ruff configuration
- **Testing**: Pytest configuration
- **Security**: Bandit and Safety configuration
- **Coverage**: Coverage reporting configuration

### What's Package-Specific

- **Project Metadata**: Name, version, description, authors
- **Dependencies**: Package-specific runtime dependencies
- **Build Configuration**: Package-specific build settings
- **Optional Dependencies**: Package-specific optional groups

## 🎉 The Result

*three spirits align in perfect harmony*

The unified Python monorepo configuration brings together:

- **🦊 Fox's Cunning**: Strategic, elegant, maintainable configuration
- **🦦 Otter's Joy**: Thorough, comprehensive, quality-focused testing
- **🐺 Wolf's Ferocity**: Security-first, vulnerability-hunting approach

Every package benefits from the same high standards, while maintaining the flexibility to customize when needed. The configuration is as resilient as a fox's survival instincts, as thorough as an otter's grooming routine, and as relentless as a wolf's hunt for vulnerabilities.

*red fur gleams with satisfaction* This is the apex predator approach to Python monorepo management!
