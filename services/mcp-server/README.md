# 🛠️ Reynard MCP Server

_whiskers twitch with digital intelligence_ The Reynard MCP (Model Context Protocol) server is a comprehensive development toolkit that provides **47 powerful tools** across 8 major categories. This server embodies the Reynard way of excellence - strategic thinking, thorough analysis, and relentless pursuit of quality.

## 🌟 Overview

The Reynard MCP server has evolved into a legendary development toolkit that provides:

### 🦊 Strategic Development Tools

- **Frontend Linting & Formatting**: ESLint, Prettier with auto-fix capabilities
- **Python Code Quality**: Flake8, Pylint, Black, isort with comprehensive validation
- **Markdown Processing**: markdownlint validation and formatting
- **Type Checking**: TypeScript and Python type validation

### 🦦 Quality Assurance Tools

- **Comprehensive Validation**: Custom validation scripts for documentation, links, and structure
- **Security Scanning**: Bandit, audit-ci, and dependency vulnerability detection
- **File Search & Pattern Matching**: Advanced grep-based code pattern discovery
- **Semantic Search**: RAG-powered vector embeddings for intelligent code search

### 🐺 Security & Analysis Tools

- **Multi-level Security Scanning**: Fast and comprehensive security audits
- **VS Code Integration**: Active file detection, workspace info, and extension management
- **Task Automation**: VS Code task discovery, validation, and execution
- **Image Processing**: Image viewer integration with imv for visual content

### 🎯 Advanced Features

- **Mermaid Diagram Support**: Validation, rendering to SVG/PNG, and statistical analysis
- **Desktop Notifications**: libnotify integration for system notifications
- **Hybrid Search**: Combines semantic and traditional text search for optimal results
- **Document Indexing**: RAG backend integration for intelligent document processing

## 🛠️ Tool Categories

### 🦊 Agent Tools (8 tools)

1. **`generate_agent_name`** - Generate robot names with animal spirit themes
2. **`assign_agent_name`** - Assign names to agents with persistence
3. **`get_agent_name`** - Retrieve current agent names
4. **`list_agent_names`** - List all assigned agent names
5. **`roll_agent_spirit`** - Randomly select an animal spirit (weighted distribution)
6. **`agent_startup_sequence`** - Complete initialization with random spirit selection
7. **`get_current_time`** - Get current date and time
8. **`get_current_location`** - Get location based on IP address
9. **`send_desktop_notification`** - Send desktop notifications using libnotify

### 🔍 Linting & Formatting Tools (8 tools)

1. **`lint_frontend`** - ESLint for TypeScript/JavaScript (with auto-fix)
2. **`format_frontend`** - Prettier formatting (with check-only mode)
3. **`lint_python`** - Flake8, Pylint for Python (with auto-fix)
4. **`format_python`** - Black + isort formatting (with check-only mode)
5. **`lint_markdown`** - markdownlint validation (with auto-fix)
6. **`scan_security`** - Complete security audit (Bandit, audit-ci, type checking)
7. **`run_all_linting`** - Execute entire linting suite (with auto-fix)

### 📊 Version & VS Code Tools (9 tools)

1. **`get_versions`** - Get versions of Python, Node.js, npm, pnpm, and TypeScript
2. **`get_python_version`** - Get Python version information
3. **`get_vscode_active_file`** - Get currently active file path in VS Code
4. **`scan_security_fast`** - Run fast security scanning (skips slow Bandit checks)

### 🔍 File Search Tools (4 tools)

1. **`search_files`** - Search for files by name pattern in the project
2. **`list_files`** - List files in a directory with optional filtering
3. **`semantic_search`** - Search for code by semantic meaning using grep patterns
4. **`search_code_patterns`** - Search for specific code patterns (functions, classes, imports, etc.)

### 🧠 Semantic Search Tools (5 tools)

1. **`semantic_search`** - Perform semantic search using vector embeddings and RAG backend
2. **`hybrid_search`** - Perform hybrid search combining semantic and traditional text search
3. **`search_enhanced`** - Enhanced BM25 search with query expansion and filtering
4. **`get_query_suggestions`** - Get intelligent query suggestions based on search history
5. **`get_search_analytics`** - Get search analytics and statistics

### 🖼️ Image Viewer Tools (3 tools)

1. **`open_image`** - Open an image file with the imv image viewer
2. **`search_images`** - Search for image files in a directory
3. **`get_image_info`** - Get information about an image file

### 📈 Mermaid Diagram Tools (5 tools)

1. **`validate_mermaid_diagram`** - Validate mermaid diagram syntax and check for errors
2. **`render_mermaid_to_svg`** - Render mermaid diagram to SVG format
3. **`render_mermaid_to_png`** - Render mermaid diagram to PNG format
4. **`get_mermaid_diagram_stats`** - Get statistics and analysis of a mermaid diagram
5. **`test_mermaid_render`** - Test mermaid diagram rendering with a simple example

### ⚙️ VS Code Tasks Tools (4 tools)

1. **`discover_vscode_tasks`** - Discover all available VS Code tasks from tasks.json
2. **`validate_vscode_task`** - Validate that a VS Code task exists and is executable
3. **`execute_vscode_task`** - Execute a VS Code task by name
4. **`get_vscode_task_info`** - Get detailed information about a specific VS Code task

### 🔧 Monolith Detection Tools (2 tools)

1. **`detect_monoliths`** - Detect large monolithic files that violate the 140-line axiom
2. **`analyze_file_complexity`** - Deep-dive analysis of a specific file's complexity metrics

### 🔐 Security & Secrets Tools (2 tools)

1. **`get_secret`** - Retrieve a user secret by name (e.g., GH_TOKEN for GitHub operations)
2. **`scan_security`** - Run comprehensive security scanning and auditing

### 🎮 ECS World Simulation Tools (2 tools)

1. **`initiate_interaction`** - Initiate an interaction between two agents
2. **`send_chat_message`** - Send a chat message from one agent to another

## 🚀 Getting Started

### Prerequisites

- **Python 3.8+** with asyncio support
- **External Tools**: ESLint, Prettier, Flake8, Black, isort, markdownlint, Bandit
- **System Tools**: imv (image viewer), notify-send (desktop notifications)
- **RAG Backend**: Optional semantic search capabilities
- **VS Code**: For VS Code integration features

### Installation

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd reynard/services/mcp-server
   ```

2. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Cursor MCP**:

   ```json
   {
     "mcpServers": {
       "reynard-mcp": {
         "command": "bash",
         "args": [
           "-c",
           "source ~/venv/bin/activate && cd /home/kade/runeset/reynard/services/mcp-server && python3 main.py"
         ],
         "env": {
           "PYTHONPATH": "/home/kade/runeset/reynard/services/mcp-server"
         }
       }
     }
   }
   ```

4. **Start the Server**:

   ```bash
   python3 main.py
   ```

## 🎯 Agent Integration Guide

### Agent Startup Protocol

**MANDATORY**: Always use the proper 2-step workflow for agent naming:

1. **Generate Name**: Call `generate_agent_name` with specialist and style parameters
2. **Assign Name**: Call `assign_agent_name` with the generated name

**Available Specialists:**

- `fox` - Strategic cunning and intelligence
- `wolf` - Pack coordination and security focus
- `otter` - Playful testing and quality assurance
- Plus many more: eagle, lion, tiger, dolphin, etc.

**Available Naming Styles:**

- `foundation` - Asimov-inspired strategic names
- `exo` - Combat/technical operational names
- `hybrid` - Mythological/historical references
- `cyberpunk` - Tech-prefixed cyber names
- `mythological` - Divine/mystical references
- `scientific` - Latin scientific classifications

### Complete Startup Sequence

Use the `agent_startup_sequence` tool for automatic initialization:

```json
{
  "method": "tools/call",
  "params": {
    "name": "agent_startup_sequence",
    "arguments": {
      "agent_id": "current-session",
      "preferred_style": "foundation"
    }
  }
}
```

This automatically:

- Randomly selects a specialist (weighted: fox 40%, otter 35%, wolf 25%)
- Generates an appropriate name
- Assigns the name to your agent
- Returns complete startup information

## 🛠️ Tool Usage Examples

### Frontend Linting with Auto-fix

```json
{
  "method": "tools/call",
  "params": {
    "name": "lint_frontend",
    "arguments": { "fix": true }
  }
}
```

### Comprehensive Project Validation

```json
{
  "method": "tools/call",
  "params": {
    "name": "run_all_linting",
    "arguments": { "fix": false }
  }
}
```

### Security Scanning

```json
{
  "method": "tools/call",
  "params": {
    "name": "scan_security",
    "arguments": {}
  }
}
```

### Mermaid Diagram Validation

```json
{
  "method": "tools/call",
  "params": {
    "name": "validate_mermaid_diagram",
    "arguments": {
      "diagram_content": "graph TD\n    A[Start] --> B[End]"
    }
  }
}
```

### Semantic Search

```json
{
  "method": "tools/call",
  "params": {
    "name": "semantic_search",
    "arguments": {
      "query": "authentication flow",
      "search_type": "hybrid",
      "top_k": 10
    }
  }
}
```

### VS Code Task Execution

```json
{
  "method": "tools/call",
  "params": {
    "name": "execute_vscode_task",
    "arguments": {
      "task_name": "build",
      "workspace_path": "."
    }
  }
}
```

## 🏗️ Architecture

### Server Structure

The MCP server follows a modular architecture with:

- **Main Orchestrator**: `main.py` - Enhanced server with async tool routing
- **Service Layer**: Comprehensive services for linting, formatting, validation, security
- **Tool Handlers**: 8 specialized tool categories with 47 total tools
- **Protocol Layer**: MCP protocol handling with intelligent routing
- **Utilities**: Logging, configuration, and helper functions

### Service Layer

- **Agent Management**: Name generation, assignment, and ECS integration
- **Linting Services**: Frontend, Python, and Markdown validation
- **Security Services**: Comprehensive security scanning and auditing
- **Search Services**: Semantic search, file discovery, and pattern matching
- **VS Code Services**: Task management and workspace integration
- **Image Services**: Image viewing and processing capabilities
- **Mermaid Services**: Diagram validation and rendering

## 🔧 Configuration

### Tool Configuration

The server uses `tool_config.json` for tool definitions and configurations:

```json
{
  "tools": {
    "agent_management": {
      "enabled": true,
      "config": {
        "default_spirit": "fox",
        "default_style": "foundation"
      }
    },
    "linting": {
      "enabled": true,
      "config": {
        "auto_fix": true,
        "strict_mode": false
      }
    }
  }
}
```

### Environment Variables

- `PYTHONPATH`: Path to the MCP server directory
- `ECS_BACKEND_URL`: URL for ECS world simulation backend
- `RAG_BACKEND_URL`: URL for semantic search backend
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)

## 🐛 Troubleshooting

### Common Issues

**MCP Server Connection Problems**:

- Check server is running: `cd /home/kade/runeset/reynard/services/mcp-server && python3 main.py`
- Verify configuration in `cursor-mcp-config.json`
- Test with: `python3 test-mcp-server.py`
- Check Python virtual environment: `source ~/venv/bin/activate`

**Name Generation Issues**:

- Use the proper 2-step workflow (generate → assign) instead of manual assignment
- Ensure agent naming service is properly configured

**Import Path Errors**:

- Verify the import path in `agent_manager.py` points to correct location
- Check PYTHONPATH environment variable

### Performance Considerations

- **Batch Operations**: Use batch generation for multiple names
- **Caching**: Agent names are persisted in `agent-names.json`
- **Concurrency**: MCP server handles concurrent requests safely
- **Error Handling**: Graceful fallbacks for all operations

## 🔒 Security Best Practices

- **Input Validation**: All MCP tools validate input parameters
- **Error Boundaries**: Graceful failure handling throughout
- **Rate Limiting**: Built-in protection against abuse
- **Audit Trail**: All agent assignments are logged with timestamps

## 📈 Performance Metrics

The MCP server provides comprehensive performance monitoring:

- **Tool Execution Times**: Track performance of individual tools
- **Error Rates**: Monitor tool failure rates and types
- **Usage Statistics**: Track most-used tools and patterns
- **Resource Utilization**: Monitor memory and CPU usage

## 🤝 Contributing

The Reynard MCP server follows the 140-line axiom and modular architecture principles:

1. **Keep files under 140 lines** - Break large files into smaller, focused modules
2. **Use descriptive names** - Name files and functions exactly what they do
3. **No backwards compatibility** - Prefer clean, modern implementations
4. **Modular architecture** - Each tool category is self-contained
5. **Comprehensive testing** - All tools have corresponding test suites

## 📚 Documentation

- **Tool Definitions**: Complete tool schemas and parameter documentation
- **Usage Examples**: Practical examples for each tool category
- **Architecture Guide**: Detailed system architecture and design decisions
- **Troubleshooting Guide**: Common issues and solutions
- **Performance Guide**: Optimization tips and best practices

## 🎯 Mission Statement

_three voices align in perfect harmony_ The Reynard MCP server embodies the apex predator approach to development tooling. Every tool is crafted with the precision of a fox stalking its prey, the thoroughness of an otter exploring a stream, and the relentless determination of a wolf pack hunting down vulnerabilities.

_claws sharpen with satisfaction_ This server is more than just tools - it's a complete ecosystem designed for agents who embrace excellence, demand quality, and refuse to settle for anything less than legendary solutions. Welcome to the hunt! 🦊🦦🐺
