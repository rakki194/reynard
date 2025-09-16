# MCP Reynard Server

Model Context Protocol server with comprehensive ECS world simulation, agent trait inheritance,
persona management, and complete project linting, formatting, validation, and security

## Overview

This MCP (Model Context Protocol) server provides comprehensive tools for AI agents to manage the entire
Reynard development lifecycle. It combines ECS world simulation with agent trait inheritance, persona management,
LoRA configuration, and a complete suite of linting, formatting, validation, and security tools.
The server follows the Reynard 100-line axiom with clean, modular architecture.

## Agent Integration Guide

Guide for AI agents working within the Reynard ecosystem with ECS world simulation and trait inheritance.

### ECS World Simulation System

The Reynard MCP server includes a comprehensive ECS (Entity Component System) world simulation that provides:

- **🌍 World Simulation**: Time-accelerated virtual world where agents exist and evolve
- **🧬 Trait Inheritance**: Agents can inherit traits from parent agents when created
- **🎭 Dynamic Personas**: Agent personalities generated from traits and behaviors
- **🧠 LoRA Integration**: Automatic LoRA configuration for personality modeling
- **⏰ Time Progression**: Linear time acceleration with MCP action nudging

### Agent Creation with Inheritance

**RECOMMENDED**: Use the complete agent startup sequence for full ECS integration:

```json
{
  "method": "tools/call",
  "params": {
    "name": "agent_startup_sequence",
    "arguments": {
      "agent_id": "current-session",
      "preferred_style": "foundation",
      "force_spirit": "wolf"
    }
  }
}
```

This automatically:

- Randomly selects a specialist (weighted: fox 40%, otter 35%, wolf 25%)
- Creates an ECS entity with full trait inheritance
- Generates a dynamic persona based on traits
- Configures LoRA parameters for personality modeling
- Nudges simulation time forward

### Agent Persona System

Each agent has a comprehensive persona generated from their traits:

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_agent_persona",
    "arguments": { "agent_id": "current-session" }
  }
}
```

Returns:

- **Spirit & Style**: Core identity (fox/wolf/otter + naming style)
- **Dominant Traits**: Key personality characteristics
- **Personality Summary**: Generated personality description
- **Communication Style**: Tone and interaction preferences
- **Specializations**: Areas of expertise and focus

### LoRA Configuration

Agents automatically receive LoRA configurations for personality modeling:

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_lora_config",
    "arguments": { "agent_id": "current-session" }
  }
}
```

Returns:

- **LoRA Rank & Alpha**: Technical LoRA parameters
- **Target Modules**: Which neural network modules to adapt
- **Personality Weights**: Trait-based personality modeling weights
- **Physical Weights**: Physical characteristic modeling weights

### World Simulation Status

Monitor the ECS world simulation:

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_simulation_status",
    "arguments": {}
  }
}
```

Returns:

- **Simulation Time**: Current virtual time
- **Time Acceleration**: Current speed multiplier (default 10x)
- **Total Agents**: Number of agents in the world
- **Mature Agents**: Agents ready for reproduction
- **Real Time Elapsed**: Actual time since simulation start

### Time Management

**Automatic Time Nudging**: Every MCP action automatically nudges simulation time forward by 0.05 units.

**Manual Time Control**:

```json
// Adjust time acceleration
{
  "method": "tools/call",
  "params": {
    "name": "accelerate_time",
    "arguments": {"factor": 20.0}
  }
}

// Manual time nudge
{
  "method": "tools/call",
  "params": {
    "name": "nudge_time",
    "arguments": {"amount": 0.2}
  }
}
```

### Agent Naming System

**CRITICAL**: Always use the proper 2-step workflow for agent naming:

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
- `cyberpunk` - Tech-prefixed cyber name
- `mythological` - Divine/mystical references
- `scientific` - Latin scientific classifications

**❌ Common Mistake**: Don't manually assign simple names like "Vulpine" - use the generation system!

## Architecture

### Modular Structure

```text
scripts/mcp/
├── main.py                    # Main orchestrator with ECS integration
├── services/                  # Service layer
│   ├── agent_manager.py       # Agent management with ECS integration
│   ├── linting_service.py     # Core linting orchestration
│   ├── formatting_service.py  # Core formatting operations
│   ├── validation_service.py  # Custom validation scripts
│   └── security_service.py    # Security scanning & auditing
├── ecs/                       # ECS world simulation system
│   ├── __init__.py           # ECS module exports
│   ├── core.py               # Core ECS classes (Entity, Component, System, ECSWorld)
│   ├── components.py         # Agent component definitions
│   ├── systems.py            # ECS system implementations
│   ├── world.py              # Specialized AgentWorld class
│   ├── world_simulation.py   # Comprehensive world simulation with time acceleration
│   └── traits.py             # Agent traits and personality system
├── tools/                     # Tool handlers
│   ├── definitions.py         # Combined tool schemas
│   ├── linting_definitions.py # Linting tool definitions
│   ├── agent_tools.py         # Agent-related tools with ECS integration
│   ├── utility_tools.py       # Utility tools (time, location)
│   └── linting_tools.py       # Comprehensive linting tools
├── protocol/                  # MCP protocol handling
│   ├── mcp_handler.py         # Protocol handler with ECS integration
│   └── tool_router.py         # Tool call routing system
├── utils/                     # Utilities
│   └── logging_config.py      # Structured logging
├── agent-names.json          # Persistent agent name storage
├── agent-lineage.json        # Agent lineage and inheritance data
├── agent-personas.json       # Agent persona configurations
├── lora-configs.json         # LoRA configuration data
└── test-linting-mcp-server.py # Comprehensive test suite
```

### Key Features

- **🦊 Fox's Strategic Architecture**: 100-line axiom compliance, single responsibility principle
- **🦦 Otter's Quality Assurance**: Comprehensive testing, structured logging, error handling
- **🐺 Wolf's Security & Reliability**: Input validation, timeout handling, graceful failures
- **🌍 ECS World Simulation**: Comprehensive entity-component system with time acceleration
- **🧬 Trait Inheritance**: Sophisticated genetic inheritance and mutation systems
- **🎭 Agent Personas**: Dynamic persona generation from traits and behaviors
- **🧠 LoRA Integration**: Automatic LoRA configuration for agent personality modeling
- **⏰ Time Progression**: Linear time acceleration with MCP action nudging

## Usage

### Running the Server

```bash
cd scripts/mcp
python3 main.py
```

### Running with Legendary Startup Banner

```bash
cd scripts/mcp
python3 main.py --banner
# or
python3 main.py -b
```

### Using the Shell Script (with banner)

```bash
./start-mcp-server.sh
```

### Display Banner Only

```bash
cd scripts/mcp
python3 show_banner.py
```

### Testing

```bash
# Run comprehensive tests
python3 test-mcp-server.py

# Test individual components
python3 -c "from main import MCPServer; print('✅ Import successful')"
```

## Available Tools

The server provides **60+ comprehensive MCP tools** across 9 categories:

### 🦊 Agent Tools (19 tools)

1. **`generate_agent_name`** - Generate robot names with animal spirit themes
2. **`assign_agent_name`** - Assign names to agents with persistence
3. **`get_agent_name`** - Retrieve current agent names
4. **`list_agent_names`** - List all assigned agent names
5. **`create_offspring`** - Create offspring agent from two parent agents
6. **`get_agent_lineage`** - Get family tree and lineage information
7. **`analyze_genetic_compatibility`** - Analyze genetic compatibility between agents
8. **`find_compatible_mates`** - Find agents with compatible traits for breeding
9. **`get_current_time`** - Get current date and time with timezone support
10. **`get_current_location`** - Get location based on IP address
11. **`send_desktop_notification`** - Send desktop notifications using libnotify
12. **`restart_mcp_server`** - Restart the MCP server with different methods
13. **`roll_agent_spirit`** - Randomly select animal spirits
14. **`agent_startup_sequence`** - Complete initialization with ECS integration and trait inheritance
15. **`get_agent_persona`** - Get comprehensive agent persona from ECS system
16. **`get_lora_config`** - Get LoRA configuration for agent persona
17. **`get_simulation_status`** - Get comprehensive ECS world simulation status
18. **`accelerate_time`** - Adjust time acceleration factor for world simulation
19. **`nudge_time`** - Nudge simulation time forward (for MCP actions)

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

### 🔍 File Search Tools (4 tools)

1. **`search_files`** - Search for files by name pattern in the project
2. **`list_files`** - List files in a directory with optional filtering
3. **`semantic_search`** - Search for code by semantic meaning using grep patterns
4. **`search_code_patterns`** - Search for specific code patterns (functions, classes, imports, etc.)

### 🧠 Semantic Search Tools (5 tools)

1. **`semantic_search`** - Perform semantic search using vector embeddings and RAG backend
2. **`hybrid_search`** - Perform hybrid search combining semantic and traditional text search
3. **`embed_text`** - Generate vector embedding for text using RAG backend
4. **`index_documents`** - Index documents for semantic search
5. **`get_search_stats`** - Get semantic search service statistics and health status

### 🖼️ Image Viewer Tools (3 tools)

1. **`open_image`** - Open an image file with the imv image viewer
2. **`search_images`** - Search for image files in a directory
3. **`get_image_info`** - Get information about an image file

### 🔍 Enhanced Search Tools (8 tools)

1. **`search_enhanced`** - Enhanced BM25 search with query expansion, filtering, and intelligent suggestions
2. **`get_query_suggestions`** - Get intelligent query suggestions to improve search results
3. **`get_search_analytics`** - Get comprehensive search analytics and statistics
4. **`clear_search_cache`** - Clear the search cache for fresh results
5. **`reindex_project`** - Reindex the project for updated content
6. **`search_by_file_type`** - Search for patterns within specific file types
7. **`search_in_directory`** - Search for patterns within specific directories
8. **`search_needle_in_haystack`** - Search for a specific pattern using BM25 algorithm

### 🦊 Monolith Detection Tools (3 tools)

1. **`detect_monoliths`** - Detect large monolithic files that violate the 140-line axiom
2. **`analyze_file_complexity`** - Deep-dive analysis of a specific file's complexity metrics
3. **`get_code_metrics_summary`** - Comprehensive codebase health report showing overall metrics

### ⚙️ VS Code Tasks Tools (4 tools)

1. **`discover_vscode_tasks`** - Discover all available VS Code tasks from tasks.json
2. **`validate_vscode_task`** - Validate that a VS Code task exists and is executable
3. **`execute_vscode_task`** - Execute a VS Code task by name
4. **`get_vscode_task_info`** - Get detailed information about a specific VS Code task

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

## ECS World Simulation

### Overview

The ECS (Entity Component System) world simulation provides comprehensive agent management with:

- **Time Acceleration**: Linear time progression that's 10x faster than real time by default
- **Trait Inheritance**: Sophisticated genetic inheritance from parent agents
- **Agent Personas**: Dynamic persona generation based on traits and behaviors
- **LoRA Configuration**: Automatic LoRA config generation for personality modeling
- **MCP Action Integration**: Every MCP action nudges simulation time forward

### ECS Components

#### Core Components

- **AgentComponent**: Basic agent identity (name, spirit, style, generation)
- **TraitComponent**: Comprehensive traits (personality, physical, abilities)
- **LineageComponent**: Family relationships and ancestry tracking
- **LifecycleComponent**: Agent aging and lifecycle progression
- **ReproductionComponent**: Reproduction capabilities and preferences
- **BehaviorComponent**: Behavioral patterns and preferences
- **StatusComponent**: Current agent status and state
- **MemoryComponent**: Agent memory and experience storage
- **EvolutionComponent**: Evolution and adaptation tracking

#### Trait System

The trait system includes:

- **Personality Traits**: 16 core personality dimensions (dominance, loyalty, cunning, etc.)
- **Physical Traits**: 12 physical characteristics (size, strength, agility, etc.)
- **Special Abilities**: 10 unique abilities (hunter, healer, scout, etc.)
- **Inheritance**: 50/50 parent inheritance with mutation
- **Compatibility**: Genetic compatibility scoring for breeding

### Time Progression

- **Default Acceleration**: 10x faster than real time
- **MCP Action Nudging**: Each MCP action nudges time forward by 0.05 units
- **Linear Progression**: Time advances linearly with real time
- **Configurable**: Time acceleration can be adjusted from 0.1x to 100x

### Tool Usage Examples

```python
# Agent initialization with ECS integration
{
  "method": "tools/call",
  "params": {
    "name": "agent_startup_sequence",
    "arguments": {"preferred_style": "foundation"}
  }
}

# Get agent persona
{
  "method": "tools/call",
  "params": {
    "name": "get_agent_persona",
    "arguments": {"agent_id": "current-session"}
  }
}

# Get LoRA configuration
{
  "method": "tools/call",
  "params": {
    "name": "get_lora_config",
    "arguments": {"agent_id": "current-session"}
  }
}

# Get simulation status
{
  "method": "tools/call",
  "params": {
    "name": "get_simulation_status",
    "arguments": {}
  }
}

# Adjust time acceleration
{
  "method": "tools/call",
  "params": {
    "name": "accelerate_time",
    "arguments": {"factor": 20.0}
  }
}

# Nudge time forward
{
  "method": "tools/call",
  "params": {
    "name": "nudge_time",
    "arguments": {"amount": 0.2}
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
