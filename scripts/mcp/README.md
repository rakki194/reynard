# MCP Agent Namer Server

_Modular Model Context Protocol server for AI agent self-naming with Reynard robot name generator_

## Overview

This MCP (Model Context Protocol) server provides tools for AI agents to generate and assign themselves custom names using the Reynard robot name generator. The server has been refactored from a monolithic 467-line file into a clean, modular architecture following the Reynard 100-line axiom.

## Architecture

### Modular Structure

```
scripts/mcp/
├── main.py                    # Main orchestrator (110 lines)
├── services/                  # Service layer
│   └── agent_manager.py       # Agent name management (91 lines)
├── tools/                     # Tool handlers
│   ├── definitions.py         # Tool schemas (100 lines)
│   ├── agent_tools.py         # Agent-related tools (72 lines)
│   └── utility_tools.py       # Utility tools (104 lines)
├── protocol/                  # MCP protocol handling
│   └── mcp_handler.py         # Protocol handler (103 lines)
├── utils/                     # Utilities
│   └── logging_config.py      # Structured logging (71 lines)
└── agent-names.json          # Persistent agent name storage
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

The server provides 6 MCP tools:

1. **`generate_agent_name`** - Generate robot names with animal spirit themes
2. **`assign_agent_name`** - Assign names to agents with persistence
3. **`get_agent_name`** - Retrieve current agent names
4. **`list_agent_names`** - List all assigned agent names
5. **`get_current_time`** - Get current date and time
6. **`get_current_location`** - Get location based on IP address

## Configuration

### Cursor MCP Integration

The server is configured for Cursor IDE integration via `cursor-mcp-config.json`:

```json
{
  "mcpServers": {
    "reynard-agent-namer": {
      "command": "bash",
      "args": ["-c", "source ~/venv/bin/activate && cd /home/kade/runeset/reynard/scripts/mcp && python3 main.py"],
      "env": {
        "PYTHONPATH": "/home/kade/runeset/reynard/scripts/mcp"
      }
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

- **`main.py`**: Server orchestrator and request routing
- **`services/agent_manager.py`**: Agent name persistence and robot name generation
- **`tools/definitions.py`**: MCP tool schema definitions
- **`tools/agent_tools.py`**: Agent-related tool implementations
- **`tools/utility_tools.py`**: Time and location utility tools
- **`protocol/mcp_handler.py`**: MCP protocol request/response handling
- **`utils/logging_config.py`**: Structured logging with color-coded status messages

## Benefits of Refactoring

1. **Maintainability**: Each module is focused and easy to understand
2. **Testability**: Individual components can be tested in isolation
3. **Extensibility**: New tools and services can be added easily
4. **Debugging**: Clear separation makes issues easier to trace
5. **Performance**: Modular loading and better resource management
6. **Code Quality**: Follows Python best practices and Reynard standards

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

_This refactoring demonstrates the power of the Reynard way - strategic thinking, thorough quality assurance, and relentless pursuit of excellence._ 🦊
