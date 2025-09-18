# 🦊 Reynard ECS World

ECS (Entity Component System) World simulation system for agent management and breeding in the Reynard ecosystem.

## Overview

The Reynard ECS World provides a sophisticated simulation environment where agents can interact, evolve, and reproduce through trait inheritance. This system enables dynamic personality generation, genetic compatibility analysis, and real-time agent progression.

## Features

### 🌍 World Simulation

- **Real-time progression** with configurable time acceleration
- **Entity Component System** architecture for flexible agent modeling
- **Trait inheritance** and genetic compatibility analysis
- **Dynamic persona generation** based on agent traits

### 🧬 Agent Management

- **Trait systems** for personality, physical, and ability characteristics
- **Breeding mechanics** with compatibility scoring
- **Lineage tracking** and ancestry management
- **LoRA configuration** for personality modeling

### ⚡ Performance

- **Async operations** for non-blocking simulation
- **Configurable time acceleration** (0.1x to 100x real-time)
- **Efficient trait inheritance** algorithms
- **Memory-optimized** entity management

## Installation

```bash
pip install reynard-ecs-world
```

## Quick Start

```python
from reynard_ecs_world import AgentWorld, create_agent

# Create a new world
world = AgentWorld()

# Create an agent with traits
agent = create_agent(
    spirit="fox",
    style="foundation",
    traits={
        "personality": {"dominance": 0.8, "intelligence": 0.9},
        "physical": {"agility": 0.7, "strength": 0.6},
        "abilities": {"strategist": 0.9, "hunter": 0.8}
    }
)

# Add agent to world
world.add_agent(agent)

# Start simulation
world.start_simulation()
```

## License

MIT License - see LICENSE file for details.
