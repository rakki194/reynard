# Reynard ECS World

## Overview

The Reynard ECS World is a comprehensive Entity Component System (ECS) implementation designed for agent simulation, trait inheritance, and world management. This package provides a modular, scalable foundation for creating complex agent-based simulations with genetic inheritance, behavioral systems, and real-time world progression.

## Features

### 🌍 Core ECS Architecture

- **Entity Management**: Lightweight entity system with component-based architecture
- **Component System**: Modular components for traits, lifecycle, reproduction, and positioning
- **System Processing**: Specialized systems for lifecycle, reproduction, movement, and breeding
- **World Simulation**: Time-accelerated world progression with configurable speed

### 🧬 Agent Management

- **Trait Inheritance**: Sophisticated genetic inheritance from parent agents
- **Dynamic Personas**: AI-generated personality profiles based on traits and behaviors
- **LoRA Integration**: Automatic LoRA configuration for personality modeling
- **Lineage Tracking**: Complete family tree and ancestry management

### ⏰ Time Management

- **Time Acceleration**: Configurable time progression (0.1x to 100x real-time)
- **MCP Integration**: Automatic time nudging with MCP actions
- **Event System**: Comprehensive event monitoring and processing
- **Queue Integration**: Real-time event processing with queue watcher

### 🔄 Breeding & Reproduction

- **Genetic Compatibility**: Advanced compatibility analysis between agents
- **Automatic Breeding**: Global breeding scheduler with configurable parameters
- **Offspring Creation**: Sophisticated trait inheritance and mutation
- **Population Management**: Dynamic population growth and management

## Architecture

### Core Components

```
packages/ecs-world/
├── src/
│   ├── core/           # Core ECS classes (Entity, Component, System, World)
│   ├── components/     # Specialized components (Agent, Traits, Lifecycle, etc.)
│   ├── systems/        # Processing systems (Lifecycle, Reproduction, Movement)
│   ├── traits/         # Trait system and inheritance logic
│   ├── events/         # Event system and notifications
│   ├── world/          # World management and simulation
│   └── utils/          # Utilities and persistence
```

### Key Classes

- **`ECSWorld`**: Main world container managing entities and systems
- **`AgentWorld`**: Specialized world for agent management with breeding
- **`Entity`**: Lightweight entity with component-based architecture
- **`Component`**: Base class for all data components
- **`System`**: Base class for all processing systems

## Usage

### Basic World Creation

```python
from reynard_ecs_world import AgentWorld

# Create a new agent world
world = AgentWorld()

# Create an agent
agent = world.create_agent(
    agent_id="agent-001",
    spirit="fox",
    style="foundation"
)

# Update the world
world.update(delta_time=0.1)
```

### Agent Breeding

```python
# Create offspring from two parents
offspring = world.create_offspring(
    parent1_id="agent-001",
    parent2_id="agent-002", 
    offspring_id="agent-003"
)

# Find compatible mates
mates = world.find_compatible_mates("agent-001", max_results=5)

# Analyze genetic compatibility
compatibility = world.analyze_genetic_compatibility("agent-001", "agent-002")
```

### World Simulation

```python
# Enable automatic breeding
world.enable_automatic_reproduction(True)

# Start global breeding scheduler
await world.start_global_breeding()

# Get breeding statistics
stats = world.get_breeding_stats()
```

## Integration

### FastAPI Backend Integration

The ECS World integrates seamlessly with the Reynard FastAPI backend as a singleton service:

```python
from backend.app.ecs.service import get_ecs_world

# Get the singleton world instance
world = get_ecs_world()

# Use the world in your endpoints
@app.get("/api/ecs/agents")
async def get_agents():
    return world.get_agent_entities()
```

### MCP Server Integration

The ECS World can be used independently in MCP servers or other applications:

```python
from reynard_ecs_world import AgentWorld

# Create independent world instance
world = AgentWorld()

# Use in MCP tools
def create_agent_tool(agent_id: str, spirit: str):
    return world.create_agent(agent_id, spirit)
```

## Configuration

### Time Acceleration

```python
# Set time acceleration factor
world.set_time_acceleration(10.0)  # 10x real-time

# Get current simulation time
current_time = world.get_simulation_time()
```

### Breeding Parameters

```python
# Configure breeding parameters
world.configure_breeding(
    compatibility_threshold=0.7,
    breeding_interval=3600,  # 1 hour
    max_offspring_per_pair=3
)
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test categories
pytest tests/test_core.py
pytest tests/test_components.py
pytest tests/test_systems.py
```

## Development

### Building

```bash
# Install dependencies
pip install -e .

# Run tests
pytest

# Format code
black src tests
isort src tests

# Type checking
mypy src
```

### Contributing

1. Follow the 140-line axiom for all modules
2. Maintain comprehensive test coverage
3. Use type hints throughout
4. Follow the Reynard coding standards
5. Update documentation for new features

## License

MIT License - Part of the Reynard Framework

---

*The Reynard ECS World embodies the animal way - strategic fox architecture, otter quality assurance, and wolf system reliability. Every component is designed with the precision of a master craftsman and the reliability of a pack hunter.* 🦊🦦🐺
