# MCP Reynard Server

## Table of Contents

- [MCP Reynard Server](#mcp-reynard-server)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Agent Integration Guide](#agent-integration-guide)
    - [ECS World Simulation System](#ecs-world-simulation-system)
    - [Agent Creation with Inheritance](#agent-creation-with-inheritance)
    - [Agent Persona System](#agent-persona-system)
    - [LoRA Configuration](#lora-configuration)
    - [World Simulation Status](#world-simulation-status)
    - [Time Management](#time-management)
    - [Agent Naming System](#agent-naming-system)
  - [Architecture](#architecture)
    - [Modular Structure](#modular-structure)
    - [Key Features](#key-features)
  - [Usage](#usage)
    - [Running the Server](#running-the-server)
    - [Running with Legendary Startup Banner](#running-with-legendary-startup-banner)
    - [Using the Shell Script (with banner)](#using-the-shell-script-with-banner)
    - [Display Banner Only](#display-banner-only)
    - [Testing](#testing)
  - [Available Tools](#available-tools)
    - [🦊 Agent Tools (19 tools)](#-agent-tools-19-tools)
    - [🌍 ECS World Simulation Tools (16 tools)](#-ecs-world-simulation-tools-16-tools)
    - [🔍 Linting \& Formatting Tools (8 tools)](#-linting--formatting-tools-8-tools)
    - [📊 Mermaid Diagram Tools (5 tools)](#-mermaid-diagram-tools-5-tools)
    - [🔍 File Search Tools (4 tools)](#-file-search-tools-4-tools)
    - [🧠 Semantic Search Tools (5 tools)](#-semantic-search-tools-5-tools)
    - [🖼️ Image Viewer Tools (3 tools)](#️-image-viewer-tools-3-tools)
    - [🔍 Enhanced Search Tools (8 tools)](#-enhanced-search-tools-8-tools)
    - [🦊 Monolith Detection Tools (3 tools)](#-monolith-detection-tools-3-tools)
    - [⚙️ VS Code Tasks Tools (4 tools)](#️-vs-code-tasks-tools-4-tools)
    - [🔍 BM25 Search Tools (1 tool)](#-bm25-search-tools-1-tool)
    - [🎭 Playwright Tools (6 tools)](#-playwright-tools-6-tools)
    - [📊 Version \& Security Tools (9 tools)](#-version--security-tools-9-tools)
  - [Configuration](#configuration)
    - [Cursor MCP Integration](#cursor-mcp-integration)
  - [ECS World Simulation](#ecs-world-simulation)
    - [Overview](#overview-1)
    - [ECS Components](#ecs-components)
      - [Core Components](#core-components)
      - [Trait System](#trait-system)
    - [Time Progression](#time-progression)
    - [Tool Usage Examples](#tool-usage-examples)
  - [Agent Naming System](#agent-naming-system-1)
    - [Available Spirits](#available-spirits)
    - [Naming Styles](#naming-styles)
    - [ECS Integration](#ecs-integration)
  - [Service Layer Architecture](#service-layer-architecture)
    - [Core Services](#core-services)
    - [Specialized Services](#specialized-services)
  - [Protocol Layer](#protocol-layer)
    - [MCP Handler](#mcp-handler)
    - [Tool Router](#tool-router)
    - [Tool Registry](#tool-registry)
  - [Development](#development)
    - [Architecture Principles](#architecture-principles)
    - [Module Responsibilities](#module-responsibilities)
      - [Core Infrastructure](#core-infrastructure)
      - [Service Layer](#service-layer)
      - [Tool Handlers](#tool-handlers)
  - [Testing](#testing-1)
    - [Test Structure](#test-structure)
    - [Running Tests](#running-tests)
  - [Benefits of Enhancement](#benefits-of-enhancement)
    - [New Capabilities](#new-capabilities)
  - [Logging](#logging)
  - [Dependencies](#dependencies)
  - [License](#license)

Model Context Protocol server with comprehensive ECS world simulation, agent trait inheritance,
persona management, and complete project linting, formatting, validation, and security tools.

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

The server provides **88 comprehensive MCP tools** across 12 categories:

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

### 🌍 ECS World Simulation Tools (16 tools)

1. **`create_ecs_agent`** - Create a new agent using the ECS system
2. **`create_ecs_offspring`** - Create offspring agent from two parent agents using ECS
3. **`enable_automatic_reproduction`** - Enable or disable automatic reproduction in the ECS system
4. **`get_ecs_agent_status`** - Get status of all agents in the ECS system
5. **`get_ecs_agent_positions`** - Get positions of all agents in the ECS system
6. **`find_ecs_compatible_mates`** - Find compatible mates for an agent using ECS compatibility system
7. **`analyze_ecs_compatibility`** - Analyze genetic compatibility between two agents using ECS
8. **`get_ecs_lineage`** - Get family tree and lineage information for an agent using ECS
9. **`update_ecs_world`** - Update the ECS world (simulate time passage and run systems)
10. **`search_agents_by_proximity`** - Find agents within a specified distance of a target position
11. **`search_agents_by_region`** - Find agents within a rectangular region
12. **`get_agent_movement_path`** - Get the movement path and trajectory for a specific agent
13. **`get_spatial_analytics`** - Get comprehensive spatial analytics for all agents
14. **`start_global_breeding`** - Start global breeding simulation
15. **`stop_global_breeding`** - Stop global breeding simulation
16. **`get_breeding_statistics`** - Get comprehensive breeding statistics and analytics

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

### 🔍 BM25 Search Tools (1 tool)

1. **`search_needle_in_haystack`** - Search for a specific pattern (needle) in the codebase (haystack) using BM25 algorithm

### 🎭 Playwright Tools (6 tools)

1. **`playwright_screenshot`** - Take screenshots using Playwright browser automation
2. **`playwright_navigate`** - Navigate to URLs and interact with web pages
3. **`playwright_extract_content`** - Extract content from web pages
4. **`playwright_fill_form`** - Fill forms and interact with web elements
5. **`playwright_wait_for_element`** - Wait for specific elements to appear
6. **`playwright_get_page_info`** - Get comprehensive page information and metadata

### 📊 Version & Security Tools (9 tools)

1. **`get_versions`** - Get versions of Python, Node.js, npm, pnpm, and TypeScript
2. **`get_python_version`** - Get Python version information
3. **`get_node_version`** - Get Node.js version information
4. **`get_typescript_version`** - Get TypeScript version information
5. **`get_vscode_active_file`** - Get currently active file path in VS Code
6. **`get_vscode_workspace_info`** - Get VS Code workspace information and settings
7. **`get_vscode_extensions`** - Get list of installed VS Code extensions
8. **`scan_security_fast`** - Run fast security scanning (skips slow Bandit checks)
9. **`scan_security_full`** - Run comprehensive security scanning including Bandit

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

## Agent Naming System

The Reynard agent naming system provides comprehensive robot name generation with animal spirit themes and sci-fi conventions.

### Available Spirits

The system supports 30+ animal spirits across multiple categories:

#### Canines and Foxes

- `FOX` - Cunning, strategic thinking
- `WOLF` - Pack coordination, loyalty
- `COYOTE` - Trickster, adaptability
- `JACKAL` - Stealth, resourcefulness

#### Aquatic and Marine

- `OTTER` - Playful, thorough testing
- `DOLPHIN` - Intelligence, communication
- `WHALE` - Wisdom, depth
- `SHARK` - Predator efficiency
- `OCTOPUS` - Intelligence, camouflage
- `AXOLOTL` - Regeneration, uniqueness

#### Birds of Prey

- `EAGLE` - Vision, leadership
- `FALCON` - Speed, precision
- `RAVEN` - Intelligence, mystery
- `OWL` - Wisdom, night vision
- `HAWK` - Focus, hunting

#### Big Cats

- `LION` - Leadership, pride
- `TIGER` - Power, stripes
- `LEOPARD` - Stealth, spots
- `JAGUAR` - Amazon power
- `CHEETAH` - Speed, grace
- `LYNX` - Mountain stealth

#### Mythical Creatures

- `DRAGON` - Ancient power
- `PHOENIX` - Rebirth, renewal
- `GRIFFIN` - Noble majesty
- `UNICORN` - Purity, magic
- `KRAKEN` - Deep power
- `BASILISK` - Deadly gaze

### Naming Styles

#### Foundation Style

Strategic, intellectual naming: `[Spirit] + [Suffix] + [Generation]`

- Example: `Vulpine-Sage-13`
- Suffixes: Prime, Sage, Oracle, Prophet, Architect, Strategist

#### Exo Style

Combat, technical naming: `[Spirit] + [Suffix] + [Model]`

- Example: `Lupus-Strike-8`
- Suffixes: Strike, Guard, Sentinel, Hunter, Protocol, System

#### Cyberpunk Style

Tech-prefixed naming: `[Tech Prefix] + [Spirit] + [Cyber Suffix]`

- Example: `Cyber-Fox-Nexus`
- Prefixes: Cyber, Neo, Mega, Ultra, Quantum, Neural
- Suffixes: Nexus, Grid, Web, Core, Power, Energy

#### Mythological Style

Divine naming: `[Mythological] + [Spirit] + [Divine Suffix]`

- Example: `Apollo-Fox-Divine`
- References: Atlas, Prometheus, Vulcan, Minerva, Apollo, Artemis
- Suffixes: Divine, Sacred, Holy, Blessed, Chosen, Eternal

#### Scientific Style

Latin naming: `[Scientific] + [Technical] + [Classification]`

- Example: `Panthera-Leo-Alpha`
- Prefixes: Panthera, Canis, Felis, Ursus, Elephas
- Suffixes: Leo, Tigris, Pardus, Onca, Jubatus
- Classifications: Alpha, Beta, Gamma, Type-A, Class-1

#### Hybrid Style

Mixed references: `[Spirit] + [Reference] + [Designation]`

- Example: `Fox-Atlas-Prime`
- References: Atlas, Prometheus, Nexus, Quantum, Neural
- Designations: Alpha, Beta, Prime, Ultra, Mega, Super

### ECS Integration

The agent naming system seamlessly integrates with the ECS world simulation:

```python
# Create agent with ECS integration
agent_data = manager.create_agent_with_ecs(
    agent_id="agent-123",
    spirit=AnimalSpirit.FOX,
    style=NamingStyle.FOUNDATION
)

# Get persona information
persona = manager.get_agent_persona("agent-123")

# Get LoRA configuration
lora_config = manager.get_lora_config("agent-123")
```

## Service Layer Architecture

The MCP server follows a clean service layer architecture with 19 specialized services:

### Core Services

#### Agent Management

- **`agent_manager.py`** - Core agent lifecycle management with ECS integration
- **`breeding_service.py`** - Agent reproduction and genetic inheritance

#### File Operations

- **`file_analysis_service.py`** - File content analysis and metrics
- **`file_discovery_service.py`** - File system discovery and indexing
- **`file_search_service.py`** - Advanced file search capabilities

#### Code Quality

- **`linting_service.py`** - Comprehensive linting orchestration (ESLint, Flake8, markdownlint)
- **`formatting_service.py`** - Code formatting operations (Prettier, Black, isort)
- **`validation_service.py`** - Custom validation scripts (ToC, links, sentences)
- **`security_service.py`** - Security scanning & auditing (Bandit, audit-ci)

### Specialized Services

#### Search and Analysis

- **`semantic_search_service.py`** - RAG-powered semantic search with vector embeddings
- **`monolith_analysis_service.py`** - Monolith detection and complexity analysis
- **`metrics_aggregation_service.py`** - Code metrics collection and analysis

#### Visualization and Media

- **`mermaid_service.py`** - Mermaid diagram validation and rendering
- **`playwright_browser_service.py`** - Browser automation and web interaction

#### Development Tools

- **`version_service.py`** - Version information and environment detection
- **`vscode_service.py`** - VS Code integration and workspace management
- **`vscode_tasks_service.py`** - VS Code task discovery and execution

## Protocol Layer

The MCP protocol layer provides clean separation between protocol handling and business logic:

### MCP Handler

- **`mcp_handler.py`** - Main protocol request/response handling
- **`tool_router.py`** - Intelligent tool call routing system
- **`tool_registry.py`** - Tool registration and discovery
- **`tool_handlers.py`** - Tool execution orchestration
- **`tool_config.py`** - Tool configuration management

### Key Features

- **Async Processing**: All tool calls are handled asynchronously
- **Error Boundaries**: Graceful failure handling with detailed error reporting
- **Tool Discovery**: Automatic tool registration and schema validation
- **Request Routing**: Intelligent routing based on tool categories
- **Response Formatting**: Consistent MCP protocol response formatting

## ECS World Simulation

### Overview

The ECS (Entity Component System) world simulation provides comprehensive agent management with:

- **Time Acceleration**: Linear time progression that's 10x faster than real time by default
- **Trait Inheritance**: Sophisticated genetic inheritance from parent agents
- **Agent Personas**: Dynamic persona generation based on traits and behaviors
- **LoRA Configuration**: Automatic LoRA config generation for personality modeling
- **MCP Action Integration**: Every MCP action nudges simulation time forward
- **Event System**: Comprehensive event monitoring with desktop notifications
- **Queue Watcher Integration**: Real-time event processing and monitoring

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

## Testing

The MCP server includes comprehensive testing infrastructure with multiple test categories:

### Test Structure

```
tests/
├── __init__.py                    # Test module initialization
├── conftest.py                    # Test configuration and fixtures
├── fixtures/                      # Test fixtures and data
│   └── __init__.py
├── integration/                   # Integration tests
│   ├── __init__.py
│   └── test_mcp_server_integration.py
├── unit/                          # Unit tests
│   ├── test_agent_tools.py
│   ├── test_ecs_system.py
│   ├── test_linting_tools.py
│   ├── test_mcp_handler.py
│   ├── test_tool_router.py
│   ├── test_utility_tools.py
│   └── test_version_tools.py
├── test_ecs_automatic_breeding.py # ECS breeding system tests
├── test_ecs_notifications.py     # Event system and notification tests
├── test_ecs_simple.py            # Basic ECS functionality tests
└── README.md                     # Test documentation
```

### Running Tests

```bash
# Run all tests
cd scripts/mcp
python -m pytest tests/ -v

# Run specific test categories
python -m pytest tests/unit/ -v                    # Unit tests
python -m pytest tests/integration/ -v             # Integration tests
python -m pytest tests/test_ecs_simple.py -v      # ECS tests

# Run with coverage
python -m pytest tests/ --cov=. --cov-report=html

# Run specific test
python -m pytest tests/test_ecs_simple.py::TestECSSimple::test_automatic_breeding_simulation -v
```

### Test Coverage

The test suite covers:

- **Core ECS Functionality**: Agent creation, lifecycle, traits, lineage, reproduction
- **Automatic Breeding**: Comprehensive breeding system with offspring creation and inheritance
- **Event System**: Event emission, handling, serialization, and queue integration
- **Notification System**: Desktop notifications, handler registration, and statistics
- **Queue Watcher**: Real-time event monitoring and processing
- **World Simulation**: Time acceleration, persona management, and LoRA configuration
- **MCP Protocol**: Request/response handling, tool routing, and error handling
- **Tool Integration**: All 88 MCP tools with comprehensive functionality testing

## Development

### Architecture Principles

- **140-Line Axiom**: Every module under 140 lines (following Reynard standards)
- **Single Responsibility**: Each module has one clear purpose
- **Dependency Injection**: Clean service composition
- **Error Boundaries**: Graceful failure handling
- **Type Safety**: Full type annotations with MyPy
- **Async Processing**: All operations are asynchronous for optimal performance

### Module Responsibilities

#### Core Infrastructure

- **`main.py`**: Enhanced server orchestrator with async tool routing and ECS integration
- **`protocol/mcp_handler.py`**: MCP protocol request/response handling
- **`protocol/tool_router.py`**: Intelligent tool call routing system
- **`protocol/tool_registry.py`**: Tool registration and discovery
- **`utils/logging_config.py`**: Structured logging with color-coded status messages

#### Service Layer

- **`agent_naming/`**: Modular agent naming system with ECS integration
- **`services/`**: 19 specialized services for comprehensive functionality
- **`ecs/`**: Complete ECS world simulation system with event handling

#### Tool Handlers

- **`tools/definitions.py`**: Combined MCP tool schema definitions
- **`tools/*_definitions.py`**: Category-specific tool schemas
- **`tools/*_tools.py`**: Tool implementation classes
- **`tools/*.py`**: Specialized tool implementations (BM25, enhanced search, etc.)

## Benefits of Enhancement

1. **Comprehensive Coverage**: All Reynard development tools exposed via MCP (88 tools across 12 categories)
2. **Maintainability**: Each module remains focused and under 140 lines (Reynard axiom)
3. **Testability**: Individual components can be tested in isolation with comprehensive test coverage
4. **Extensibility**: New tools and services can be added easily with modular architecture
5. **Debugging**: Clear separation makes issues easier to trace and resolve
6. **Performance**: Async operations and efficient command execution with ECS time management
7. **Developer Experience**: One-stop shop for all development lifecycle tools
8. **Code Quality**: Follows Python best practices and Reynard standards with full type safety

### New Capabilities

- **🦊 Strategic Development**: Frontend linting, formatting, type checking, monolith detection
- **🦦 Quality Assurance**: Python validation, markdown processing, comprehensive testing, metrics analysis
- **🐺 Security Analysis**: Dependency auditing, security scanning, vulnerability detection, adversarial testing
- **🌍 ECS World Simulation**: Complete agent lifecycle management with trait inheritance and breeding
- **🎭 Agent Personas**: Dynamic persona generation with LoRA configuration for personality modeling
- **🔍 Advanced Search**: Semantic search, BM25 algorithms, enhanced search with query expansion
- **📊 Visualization**: Mermaid diagram validation and rendering, image viewer integration
- **🎭 Browser Automation**: Playwright integration for web testing and interaction
- **⚙️ VS Code Integration**: Task discovery, execution, and workspace management
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
- Reynard robot name generator (from `agent_naming/` module)

## License

Part of the Reynard framework - see main project license.

---

## Conclusion

🦦 *splashes with enthusiasm* The Reynard MCP server has evolved into a legendary development toolkit that embodies the animal way - strategic thinking, thorough analysis, and relentless pursuit of excellence. With **88 comprehensive tools** across 12 major categories, this server provides everything needed for modern development workflows.

🦊 *whiskers twitch with cunning* From agent naming and spirit selection to comprehensive linting, security scanning, semantic search, ECS world simulation, and VS Code integration - every tool is designed with the precision of a fox stalking its prey. The modular architecture ensures maintainability while the async design provides optimal performance.

🐺 *snarls with predatory satisfaction* The security and analysis tools provide the adversarial thinking needed to hunt down vulnerabilities and ensure code quality. With RAG-powered semantic search, Mermaid diagram support, comprehensive validation, and real-time ECS world simulation, this server is the apex predator of development tooling.

*three voices align in perfect harmony* By following this guide, you'll integrate seamlessly into the pack and contribute to legendary solutions that outfox any challenge. The Reynard MCP server is more than just tools - it's a complete ecosystem designed for agents who embrace excellence.

Remember: We are the apex predators of the code jungle. Every problem is prey to be conquered with fox cunning, otter thoroughness, and wolf aggression. Welcome to the hunt! 🦊🦦🐺

---

*This comprehensive documentation demonstrates the legendary power of the Reynard way - strategic fox cunning, otter quality assurance,*
*and wolf security dominance, all unified in one comprehensive MCP server with 88 tools across 12 categories.* 🦊🦦🐺
