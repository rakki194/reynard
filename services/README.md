# Reynard Services Architecture

🦊 **Enhanced Microservices Architecture with Proper Package Management**

This directory contains the refactored Reynard services, organized as proper Python packages with clean dependencies and no sys.path manipulation.

## 🏗️ **Architecture Overview**

```
services/
├── agent-naming/           # Agent naming system with animal spirit themes
│   ├── reynard_agent_naming/
│   ├── setup.py
│   └── pyproject.toml
├── ecs-world/             # ECS World simulation system
│   ├── reynard_ecs_world/
│   ├── setup.py
│   └── pyproject.toml
├── gatekeeper/            # Authentication and authorization
│   ├── reynard_gatekeeper/
│   ├── setup.py
│   └── pyproject.toml
└── mcp-server/            # MCP server with all tools
    ├── reynard_mcp_server/
    ├── setup.py
    └── pyproject.toml
```

## 🚀 **Quick Start**

### 1. Complete Setup
```bash
# From the Reynard root directory
./setup-dev.sh
```

### 2. Using Makefile
```bash
# Complete development setup
make -f Makefile.dev setup

# Install services only
make -f Makefile.dev services-install

# Run MCP server
make -f Makefile.dev mcp-server

# Run tests
make -f Makefile.dev test

# Format and lint
make -f Makefile.dev format
make -f Makefile.dev lint
```

### 3. Manual Installation
```bash
# Activate virtual environment
source venv/bin/activate

# Install each service in development mode
cd services/agent-naming && pip install -e .
cd services/ecs-world && pip install -e .
cd services/gatekeeper && pip install -e .
cd services/mcp-server && pip install -e .
```

## 📦 **Service Details**

### 🦊 Agent Naming (`reynard-agent-naming`)
- **Purpose**: Agent naming system with animal spirit themes
- **Package**: `reynard_agent_naming`
- **Dependencies**: None (pure Python)
- **Usage**: `from reynard_agent_naming import AgentNameManager`

### 🌍 ECS World (`reynard-ecs-world`)
- **Purpose**: ECS World simulation system for agent management
- **Package**: `reynard_ecs_world`
- **Dependencies**: pydantic, asyncio, typing-extensions
- **Usage**: `from reynard_ecs_world import AgentWorld`

### 🛡️ Gatekeeper (`reynard-gatekeeper`)
- **Purpose**: Authentication and authorization system
- **Package**: `reynard_gatekeeper`
- **Dependencies**: fastapi, pydantic, python-jose, argon2-cffi
- **Usage**: `from reynard_gatekeeper import AuthManager`

### 🔧 MCP Server (`reynard-mcp-server`)
- **Purpose**: MCP server with comprehensive development tools
- **Package**: `reynard_mcp_server`
- **Dependencies**: All other services + aiohttp, PyJWT
- **Usage**: `cd services/mcp-server && python main.py`

## 🔄 **Development Workflow**

### 1. **Setup Environment**
```bash
./setup-dev.sh
```

### 2. **Make Changes**
- Edit code in any service
- Services are installed in development mode, so changes are immediately available

### 3. **Test Changes**
```bash
make -f Makefile.dev test
```

### 4. **Format and Lint**
```bash
make -f Makefile.dev format
make -f Makefile.dev lint
```

### 5. **Run Services**
```bash
# MCP Server
make -f Makefile.dev mcp-server

# ECS World (if running standalone)
make -f Makefile.dev ecs-world
```

## 🧪 **Testing**

Each service has its own test suite:

```bash
# Test all services
make -f Makefile.dev test

# Test specific service
cd services/agent-naming && python -m pytest tests/
cd services/ecs-world && python -m pytest tests/
cd services/gatekeeper && python -m pytest tests/
cd services/mcp-server && python -m pytest tests/
```

## 📋 **Dependencies**

### Root Dependencies
- All tooling (black, isort, mypy, ruff, pytest)
- Development utilities

### Service Dependencies
- **agent-naming**: None (pure Python)
- **ecs-world**: pydantic, asyncio, typing-extensions
- **gatekeeper**: fastapi, pydantic, python-jose, argon2-cffi
- **mcp-server**: All other services + aiohttp, PyJWT

## 🔧 **Configuration**

### Virtual Environment
- **Location**: `venv/` in project root
- **Activation**: `source venv/bin/activate`
- **Python Version**: 3.8+

### Package Installation
- All services installed in **editable mode** (`-e`)
- Changes to source code are immediately available
- No need to reinstall after code changes

## 🚨 **Troubleshooting**

### Import Errors
```bash
# Reinstall services
make -f Makefile.dev services-install

# Check installation
python -c "from reynard_agent_naming import AgentNameManager; print('OK')"
```

### Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
./setup-dev.sh
```

### Dependency Conflicts
```bash
# Clean and reinstall
make -f Makefile.dev clean
./setup-dev.sh
```

## 🎯 **Benefits of This Architecture**

### ✅ **Proper Package Management**
- No more `sys.path` manipulation
- Clean, explicit dependencies
- Proper Python package structure

### ✅ **Development Efficiency**
- Editable installations
- Immediate code changes
- Proper dependency resolution

### ✅ **Maintainability**
- Clear service boundaries
- Independent versioning
- Easy to add new services

### ✅ **Production Ready**
- Proper package metadata
- Build system integration
- Distribution ready

## 🔮 **Future Enhancements**

- **Docker Support**: Containerized services
- **CI/CD Integration**: Automated testing and deployment
- **Service Discovery**: Dynamic service registration
- **Health Checks**: Service monitoring and health endpoints
- **Load Balancing**: Multiple service instances

---

🦊 *whiskers twitch with satisfaction* This architecture provides the foundation for scalable, maintainable development while preserving the Reynard way of excellence!


