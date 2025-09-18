# Resilient MCP Server

A single-file, modular MCP server with graceful backend failure handling.

## Quick Start

```bash
# Start with defaults
python3 main.py

# Custom backend
python3 main.py --backend-host 192.168.1.100 --backend-port 8000

# Dry run
python3 main.py --dry-run
```

## Features

- Graceful degradation when backend unavailable
- Exponential backoff reconnection with jitter
- Tool fallback mechanisms
- Health monitoring
- Single-file architecture

*Built with fox cunning, otter thoroughness, and wolf resilience!* 🦊🦦🐺
