# Agent Self-Naming Toolkit

_whiskers twitch with cunning intelligence_ A comprehensive toolkit for AI agents to generate and assign themselves custom names using the Reynard robot name generator, with both shell script and MCP server implementations.

## 🦊 Overview

This toolkit provides two approaches for agent self-naming:

1. **Shell Script Approach**: Simple command-line tool for immediate use
2. **MCP Server Approach**: Full Model Context Protocol server for integration with AI systems

## 📁 Files

- `robot-name-generator.py` - Core name generation engine
- `agent-self-namer.sh` - Shell script for agent self-naming
- `mcp-agent-namer-server.py` - MCP server implementation
- `test-mcp-server.py` - Test script for MCP functionality
- `AGENT-NAMING-GUIDE.md` - This guide

## 🚀 Quick Start

### Shell Script Usage

```bash
# Generate a random name
./agent-self-namer.sh generate

# Generate fox-themed Foundation name
./agent-self-namer.sh generate fox foundation

# Generate wolf Exo name
./agent-self-namer.sh generate wolf exo

# Assign a specific name
./agent-self-namer.sh assign "Reynard-Orion-Meta"

# Check current name
./agent-self-namer.sh current

# Reset name
./agent-self-namer.sh reset
```

### MCP Server Usage

The MCP server provides these tools via the Model Context Protocol:

1. **generate_agent_name**: Generate new robot names
2. **assign_agent_name**: Assign names to agents
3. **get_agent_name**: Retrieve agent names
4. **list_agent_names**: List all assigned names

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.8+
- Bash shell
- All files in the same directory

### Setup

```bash
# Make scripts executable
chmod +x agent-self-namer.sh
chmod +x mcp-agent-namer-server.py
chmod +x test-mcp-server.py

# Test the shell script
./agent-self-namer.sh generate fox foundation

# Test the MCP server
python3 test-mcp-server.py
```

## 🎯 Usage Examples

### Shell Script Examples

```bash
# Generate a pack of wolf names
./agent-self-namer.sh --spirit wolf --count 5 generate

# Generate otter hybrid names
./agent-self-namer.sh --style hybrid generate otter

# Assign myself a custom name
./agent-self-namer.sh assign "Vulpine-Strategist-7"

# Check what name I have
./agent-self-namer.sh current
```

### MCP Server Integration

The MCP server can be integrated with AI systems that support the Model Context Protocol. Here's how to use it:

```python
# Example MCP client usage
import json

# Generate a name
request = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "generate_agent_name",
        "arguments": {
            "spirit": "fox",
            "style": "foundation"
        }
    }
}

# Assign the name
assign_request = {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
        "name": "assign_agent_name",
        "arguments": {
            "agent_id": "my-agent-001",
            "name": "Generated-Name-Here"
        }
    }
}
```

## 🎨 Naming Conventions

### Animal Spirits

- **Fox**: Cunning, strategic, adaptable
- **Wolf**: Pack coordination, leadership, strength
- **Otter**: Playful, precise, aquatic grace

### Naming Styles

- **Foundation**: Strategic, intellectual, leadership-focused
- **Exo**: Combat, technical, operational
- **Hybrid**: Mythological, historical, technical references

### Number Significance

- **Fox Numbers**: Fibonacci sequence (3, 7, 13, 21, 34, 55, 89)
- **Wolf Numbers**: Pack multiples (8, 16, 24, 32, 40, 48, 56)
- **Otter Numbers**: Water cycles (5, 10, 15, 20, 25, 30, 35)

## 🔧 Advanced Usage

### Custom Agent IDs

When using the MCP server, you can assign custom agent IDs:

```bash
# The MCP server stores names by agent ID
# This allows multiple agents to have different names
```

### Persistence

- **Shell Script**: Names are saved to `.agent-name` file
- **MCP Server**: Names are saved to `agent-names.json` file
- Both approaches maintain persistence across sessions

### Logging

- **Shell Script**: Logs to `agent-naming.log`
- **MCP Server**: Logs to `mcp-agent-namer.log`

## 🧪 Testing

### Test the Shell Script

```bash
# Test basic functionality
./agent-self-namer.sh generate
./agent-self-namer.sh current
./agent-self-namer.sh reset
```

### Test the MCP Server

```bash
# Run the comprehensive test suite
python3 test-mcp-server.py
```

## 🐺 Integration with AI Systems

### Claude Integration

The MCP server can be integrated with Claude by configuring it as an MCP server in your Claude settings.

### Custom AI Systems

Any system that supports the Model Context Protocol can use this server by:

1. Starting the MCP server: `python3 mcp-agent-namer-server.py`
2. Sending JSON-RPC requests via stdin/stdout
3. Processing the JSON-RPC responses

## 🦦 Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all files are in the same directory
2. **Permission Errors**: Make sure scripts are executable (`chmod +x`)
3. **Python Path Issues**: The scripts handle imports automatically

### Debug Mode

Enable verbose logging by checking the log files:

- `agent-naming.log` for shell script
- `mcp-agent-namer.log` for MCP server

## 🎉 Example Names Generated

Here are some example names this toolkit can generate:

- **Fox Foundation**: `Vulpine-Sage-7`, `Reynard-Architect-13`
- **Wolf Exo**: `Lupus-Guard-16`, `Alpha-Sentinel-32`
- **Otter Hybrid**: `Lutra-Prometheus-Alpha`, `Pteronura-Quantum-Ultra`

_three spirits howl in unison_ Every generated name carries the tactical precision of the fox, the pack coordination of the wolf, and the aquatic grace of the otter - perfect for any AI agent in the Reynard ecosystem!

## 📚 API Reference

### Shell Script Commands

- `generate [spirit] [style]` - Generate new name
- `assign [name]` - Assign specific name
- `current` - Show current name
- `reset` - Remove current name
- `help` - Show usage information

### MCP Server Tools

- `generate_agent_name(spirit?, style?)` - Generate name
- `assign_agent_name(agent_id, name)` - Assign name
- `get_agent_name(agent_id)` - Get name
- `list_agent_names()` - List all names

_red fur gleams with satisfaction_ This toolkit provides everything needed for agents to name themselves with the strategic elegance of the Reynard way!
