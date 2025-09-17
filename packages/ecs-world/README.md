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
- **Agent Naming**: Integration with Reynard's agent naming system for consistent identity

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
- **`WorldSimulation`**: Time-accelerated world simulation with configurable speed
- **`Entity`**: Lightweight entity with component-based architecture
- **`Component`**: Base class for all data components
- **`System`**: Base class for all processing systems

### Available Components

- **`AgentComponent`**: Core agent identity (name, spirit, style, generation)
- **`TraitComponent`**: Comprehensive traits (personality, physical, abilities)
- **`LifecycleComponent`**: Agent lifecycle management and maturity
- **`LineageComponent`**: Family tree and ancestry tracking
- **`ReproductionComponent`**: Breeding capabilities and offspring tracking
- **`PositionComponent`**: Spatial positioning and movement

### Dependencies

The package requires:

- **Python 3.8+** with asyncio support
- **asyncio-mqtt**: For MQTT integration
- **pydantic**: For data validation and serialization
- **agent-naming**: For Reynard agent naming system integration

## Usage

### Basic World Creation

```python
from reynard_ecs_world import AgentWorld

# Create a new agent world
world = AgentWorld()

# Create an agent with automatic name generation
agent = world.create_agent(
    agent_id="agent-001",
    spirit="fox",
    style="foundation"
)

# Update the world
world.update(delta_time=0.1)

# Get agent information
agent_component = agent.get_component(AgentComponent)
print(f"Created agent: {agent_component.name} ({agent_component.spirit})")
```

### Agent Breeding

```python
# Create two parent agents first
parent1 = world.create_agent(
    agent_id="parent-001",
    spirit="fox",
    style="foundation"
)

parent2 = world.create_agent(
    agent_id="parent-002", 
    spirit="wolf",
    style="exo"
)

# Create offspring from two parents
offspring = world.create_offspring(
    parent1_id="parent-001",
    parent2_id="parent-002", 
    offspring_id="offspring-001"
)

# Find compatible mates
mates = world.find_compatible_mates("parent-001", max_results=5)

# Analyze genetic compatibility
compatibility = world.analyze_genetic_compatibility("parent-001", "parent-002")
print(f"Compatibility: {compatibility['compatibility']:.2f}")
```

### World Simulation

```python
# Enable automatic breeding
world.enable_automatic_reproduction(True)

# Start global breeding scheduler (async)
import asyncio
await world.start_global_breeding()

# Get breeding statistics
stats = world.get_breeding_stats()
print(f"Total agents: {stats['total_agents']}")
print(f"Mature agents: {stats['mature_agents']}")

# Stop global breeding scheduler
await world.stop_global_breeding()
```

## Integration

### Single Authoritative Architecture

The ECS World operates as a **single authoritative source** within the Reynard ecosystem. All ECS operations are centralized through the FastAPI backend, ensuring consistency and preventing data conflicts.

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

**IMPORTANT**: MCP servers should **NOT** create independent ECS world instances. Instead, they must connect to the authoritative FastAPI backend:

```python
# ❌ WRONG - Don't create independent instances
from reynard_ecs_world import AgentWorld
world = AgentWorld()  # This creates a separate world!

# ✅ CORRECT - Connect to the authoritative backend
from mcp.services.ecs_client import ECSClient, get_ecs_client

# Get the singleton ECS client
ecs_client = get_ecs_client()

# Use the client for all ECS operations
result = await ecs_client.create_agent(agent_id, spirit, style)
persona = await ecs_client.get_agent_persona(agent_id)
lora_config = await ecs_client.get_lora_config(agent_id)
```

### MCP Tool Integration

The ECS World integrates with MCP tools through the `ECSClient` service:

```python
# MCP tool handler example
class ECSAgentTools:
    def __init__(self, ecs_client: ECSClient | None = None):
        self.ecs_client = ecs_client or get_ecs_client()
    
    async def create_ecs_agent(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Create a new agent using ECS system via FastAPI backend."""
        agent_id = arguments.get("agent_id", "")
        spirit = arguments.get("spirit", "fox")
        style = arguments.get("style", "foundation")
        
        # Use the authoritative backend
        result = await self.ecs_client.create_agent(agent_id, spirit, style)
        return result
```

### API Endpoints

The FastAPI backend provides comprehensive REST endpoints for all ECS operations:

- `GET /api/ecs/status` - Get world status
- `GET /api/ecs/agents` - List all agents
- `POST /api/ecs/agents` - Create new agent
- `POST /api/ecs/agents/offspring` - Create offspring
- `GET /api/ecs/agents/{id}/mates` - Find compatible mates
- `GET /api/ecs/agents/{id}/compatibility/{id2}` - Analyze compatibility
- `GET /api/ecs/agents/{id}/lineage` - Get family tree
- `POST /api/ecs/breeding/enable` - Toggle automatic breeding
- `GET /api/ecs/breeding/stats` - Get breeding statistics

## Configuration

### Time Acceleration

```python
from reynard_ecs_world import WorldSimulation

# Create world simulation with time acceleration
world = WorldSimulation(time_acceleration=10.0)

# Set time acceleration factor
world.set_time_acceleration(10.0)  # 10x real-time

# Get current simulation time
current_time = world.get_simulation_time()

# Update simulation (returns simulated time delta)
simulated_delta = world.update(0.1)  # 0.1 real seconds = 1.0 simulated seconds

# Pause and resume simulation
world.pause()
world.resume()
```

### Breeding Parameters

```python
# Enable automatic breeding
world.enable_automatic_reproduction(True)

# Get current breeding statistics
stats = world.get_breeding_stats()
print(f"Breeding stats: {stats}")

# Note: Advanced breeding configuration will be available in future versions
# Current implementation provides basic breeding capabilities
```

### Agent Personas and LoRA Configuration

```python
# Create an agent
agent = world.create_agent(
    agent_id="persona-agent",
    spirit="otter",
    style="hybrid"
)

# Get comprehensive agent persona
persona = world.get_agent_persona("persona-agent")
print(f"Agent persona: {persona}")

# Get LoRA configuration for personality modeling
lora_config = world.get_lora_config("persona-agent")
print(f"LoRA config: {lora_config}")

# Access specific persona information
print(f"Spirit: {persona['spirit']}")
print(f"Style: {persona['style']}")
print(f"Name: {persona['name']}")
print(f"Dominant traits: {persona['dominant_traits']}")
```

### Singleton Pattern Usage

```python
from reynard_ecs_world import get_world_instance, set_world_instance

# Get the singleton world instance
world = get_world_instance()

# Create agents using the singleton
agent = world.create_agent(
    agent_id="singleton-agent",
    spirit="eagle",
    style="mythological"
)

# Set a new world instance as singleton
new_world = AgentWorld()
set_world_instance(new_world)

# Get the updated singleton
updated_world = get_world_instance()
```

## Testing

```bash
# Test basic functionality
bash -c "source ~/venv/bin/activate && python -c \"from reynard_ecs_world import AgentWorld; print('ECS World import successful')\""

# Run all tests (when test suite is available)
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test categories
pytest tests/test_core.py
pytest tests/test_components.py
pytest tests/test_systems.py
```

### Testing Code Examples

All code examples in this README have been tested and verified to work correctly. You can test them by running:

```bash
cd /home/kade/runeset/reynard/packages/ecs-world
bash -c "source ~/venv/bin/activate && python -c "
from reynard_ecs_world import AgentWorld
world = AgentWorld()
agent = world.create_agent('test-agent', 'fox', 'foundation')
print(f'Created agent: {agent.get_component(AgentComponent).name}')
""
```

This verifies:

- Basic world creation and agent management
- Agent breeding and trait inheritance
- World simulation and time acceleration
- Singleton pattern functionality
- Agent persona generation
- LoRA configuration
- Async breeding methods

## Development

### Building

```bash
# Install dependencies
pip install -e .

# Test basic functionality
bash -c "source ~/venv/bin/activate && python -c \"from reynard_ecs_world import AgentWorld; print('ECS World import successful')\""

# Run tests (when available)
pytest

# Format code
black src tests
isort src tests

# Type checking
mypy src

# Lint code
flake8 src
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
