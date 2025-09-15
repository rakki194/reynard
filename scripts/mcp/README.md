# MCP Reynard Linting Server

Model Context Protocol server for AI agent self-naming and complete project linting, formatting, validation, and security\_

## Overview

This enhanced MCP (Model Context Protocol) server provides comprehensive tools for AI agents to manage the entire
Reynard development lifecycle. It combines the original agent naming capabilities with a complete suite of linting,
formatting, validation, and security tools. The server follows the Reynard 100-line axiom with clean, modular architecture.

## Architecture

### Modular Structure

```text
scripts/mcp/
├── main.py                    # Main orchestrator (enhanced)
├── services/                  # Service layer
│   ├── agent_manager.py       # Agent name management
│   ├── linting_service.py     # Core linting orchestration
│   ├── formatting_service.py  # Core formatting operations
│   ├── validation_service.py  # Custom validation scripts
│   └── security_service.py    # Security scanning & auditing
├── tools/                     # Tool handlers
│   ├── definitions.py         # Combined tool schemas
│   ├── linting_definitions.py # Linting tool definitions
│   ├── agent_tools.py         # Agent-related tools
│   ├── utility_tools.py       # Utility tools (time, location)
│   └── linting_tools.py       # Comprehensive linting tools
├── protocol/                  # MCP protocol handling
│   ├── mcp_handler.py         # Enhanced protocol handler
│   └── tool_router.py         # Tool call routing system
├── utils/                     # Utilities
│   └── logging_config.py      # Structured logging
├── agent-names.json          # Persistent agent name storage
└── test-linting-mcp-server.py # Comprehensive test suite
```

### Key Features

- **🦊 Fox's Strategic Architecture**: 100-line axiom compliance, single responsibility principle
- **🦦 Otter's Quality Assurance**: Comprehensive testing, structured logging, error handling
- **🐺 Wolf's Security & Reliability**: Input validation, timeout handling, graceful failures

## Usage

### Running the Server

```bash
cd scripts/mcp
python3 main.py
```

### Using the Shell Script

```bash
./start-mcp-server.sh
```

### Testing

```bash
# Run comprehensive tests
python3 test-mcp-server.py

# Test individual components
python3 -c "from main import MCPServer; print('✅ Import successful')"
```

## Available Tools

The server provides **30 comprehensive MCP tools** across 6 categories:

### 🦊 Agent Tools (6 tools)

1. **`generate_agent_name`** - Generate robot names with animal spirit themes
2. **`assign_agent_name`** - Assign names to agents with persistence
3. **`get_agent_name`** - Retrieve current agent names
4. **`list_agent_names`** - List all assigned agent names
5. **`roll_agent_spirit`** - Randomly select animal spirits
6. **`agent_startup_sequence`** - Complete initialization with random selection

### 🔍 Linting & Formatting Tools (8 tools)

1. **`lint_frontend`** - ESLint for TypeScript/JavaScript (with auto-fix)
2. **`format_frontend`** - Prettier formatting (with check-only mode)
3. **`lint_python`** - Flake8, Pylint for Python (with auto-fix)
4. **`format_python`** - Black + isort formatting (with check-only mode)
5. **`lint_markdown`** - markdownlint validation (with auto-fix)
6. **`validate_comprehensive`** - Run all custom validation scripts
7. **`scan_security`** - Complete security audit (Bandit, audit-ci, type checking)
8. **`run_all_linting`** - Execute entire linting suite (with auto-fix)

### 📊 Mermaid Diagram Tools (5 tools)

1. **`validate_mermaid_diagram`** - Validate mermaid diagram syntax and check for errors
2. **`render_mermaid_to_svg`** - Render mermaid diagram to SVG format
3. **`render_mermaid_to_png`** - Render mermaid diagram to PNG format
4. **`get_mermaid_diagram_stats`** - Get statistics and analysis of a mermaid diagram
5. **`test_mermaid_render`** - Test mermaid diagram rendering with a simple example

### ⏰ Utility Tools (2 tools)

1. **`get_current_time`** - Get current date and time
2. **`get_current_location`** - Get location based on IP address

## Configuration

### Cursor MCP Integration

The server is configured for Cursor IDE integration via `cursor-mcp-config.json`:

```json
{
  "mcpServers": {
    "reynard-linting-server": {
      "command": "bash",
      "args": ["-c", "source ~/venv/bin/activate && cd /home/kade/runeset/reynard/scripts/mcp && python3 main.py"],
      "env": {
        "PYTHONPATH": "/home/kade/runeset/reynard/scripts/mcp"
      }
    }
  }
}
```

### Tool Usage Examples

```python
# Agent initialization
{
  "method": "tools/call",
  "params": {
    "name": "agent_startup_sequence",
    "arguments": {"preferred_style": "foundation"}
  }
}

# Frontend linting with auto-fix
{
  "method": "tools/call",
  "params": {
    "name": "lint_frontend",
    "arguments": {"fix": true}
  }
}

# Complete project validation
{
  "method": "tools/call",
  "params": {
    "name": "run_all_linting",
    "arguments": {"fix": false}
  }
}

# Security scanning
{
  "method": "tools/call",
  "params": {
    "name": "scan_security",
    "arguments": {}
  }
}

# Mermaid diagram validation
{
  "method": "tools/call",
  "params": {
    "name": "validate_mermaid_diagram",
    "arguments": {
      "diagram_content": "graph TD\n    A[Start] --> B[End]"
    }
  }
}

# Mermaid diagram rendering to SVG
{
  "method": "tools/call",
  "params": {
    "name": "render_mermaid_to_svg",
    "arguments": {
      "diagram_content": "%%{init: {'theme': 'neutral'}}%%\ngraph TD\n    A[Start] --> B[End]"
    }
  }
}
```

## Development

### Architecture Principles

- **100-Line Axiom**: Every module under 110 lines
- **Single Responsibility**: Each module has one clear purpose
- **Dependency Injection**: Clean service composition
- **Error Boundaries**: Graceful failure handling
- **Type Safety**: Full type annotations

### Module Responsibilities

#### Core Infrastructure

- **`main.py`**: Enhanced server orchestrator with async tool routing
- **`protocol/mcp_handler.py`**: MCP protocol request/response handling
- **`protocol/tool_router.py`**: Intelligent tool call routing system
- **`utils/logging_config.py`**: Structured logging with color-coded status messages

#### Service Layer

- **`services/agent_manager.py`**: Agent name persistence and robot name generation
- **`services/linting_service.py`**: Core linting orchestration (ESLint, Flake8, markdownlint)
- **`services/formatting_service.py`**: Code formatting operations (Prettier, Black, isort)
- **`services/validation_service.py`**: Custom validation scripts (ToC, links, sentences)
- **`services/security_service.py`**: Security scanning & auditing (Bandit, audit-ci)

#### Tool Handlers

- **`tools/definitions.py`**: Combined MCP tool schema definitions
- **`tools/linting_definitions.py`**: Linting-specific tool schemas
- **`tools/agent_tools.py`**: Agent naming and spirit selection tools
- **`tools/utility_tools.py`**: Time and location utility tools
- **`tools/linting_tools.py`**: Comprehensive linting and formatting tools

## Benefits of Enhancement

1. **Comprehensive Coverage**: All Reynard linting/formatting tools exposed via MCP
2. **Maintainability**: Each module remains focused and under 100 lines
3. **Testability**: Individual components can be tested in isolation
4. **Extensibility**: New tools and services can be added easily
5. **Debugging**: Clear separation makes issues easier to trace
6. **Performance**: Async operations and efficient command execution
7. **Developer Experience**: One-stop shop for all quality tools
8. **Code Quality**: Follows Python best practices and Reynard standards

### New Capabilities

- **🦊 Strategic Development**: Frontend linting, formatting, type checking
- **🦦 Quality Assurance**: Python validation, markdown processing, comprehensive testing
- **🐺 Security Analysis**: Dependency auditing, security scanning, vulnerability detection
- **🎯 Unified Interface**: Single MCP server for entire development lifecycle

## Logging

The server uses structured logging with color-coded status messages:

- **INFO**: Bright blue `[INFO]`
- **OK**: Green `[OK]`
- **WARNING**: Yellow `[WARN]`
- **ERROR/FAIL**: Red `[FAIL]`

Logs are written to both console (with colors) and `mcp-agent-namer.log` file.

## Dependencies

- Python 3.8+
- `requests` for location API calls
- Reynard robot name generator (from `../utils/agent-naming/`)

## License

Part of the Reynard framework - see main project license.

---

_This enhancement demonstrates the legendary power of the Reynard way - strategic fox cunning, otter quality assurance,_
_and wolf security dominance, all unified in one comprehensive MCP server._ 🦊🦦🐺
