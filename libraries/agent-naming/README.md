# Agent Naming Library

A comprehensive agent naming system with animal spirit themes and sci-fi conventions for the Reynard ecosystem.

## Features

- **Animal Spirit Themes**: Fox, Wolf, Otter, Dragon, Phoenix, and many more
- **Naming Styles**: Foundation, Exo, Hybrid, Cyberpunk, Mythological, Scientific
- **Rich Name Generation**: Thousands of unique combinations with proper formatting
- **ECS Integration**: Designed to work with Entity Component Systems
- **Persistent Storage**: Agent name management with JSON persistence
- **Type Safety**: Full type hints and dataclass support

## Quick Start

```python
from agent_naming import ReynardRobotNamer, AnimalSpirit, NamingStyle, NamingConfig

# Create a name generator
namer = ReynardRobotNamer()

# Generate a single name
config = NamingConfig(spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION)
names = namer.generate_batch(config)
print(names[0].name)  # e.g., "Spry-Strategist-55"

# Generate multiple names
config = NamingConfig(spirit=AnimalSpirit.OTTER, style=NamingStyle.EXO, count=5)
names = namer.generate_batch(config)
for name in names:
    print(name.name)  # e.g., "Lutra-Sage-10", "Pteronura-Counselor-5", etc.
```

## Naming Styles

### Foundation Style

Strategic, intellectual names inspired by Asimov's Foundation series:

- `Spry-Strategist-55`
- `Cunning-Analyst-21`
- `Swift-Architect-13`

### Exo Style

Combat and technical names inspired by Destiny's Exo:

- `Lutra-Sentinel-8`
- `Vulpine-Guard-16`
- `Timber-Protocol-24`

### Hybrid Style

Mythological and historical references:

- `Atlas-Fox-Prime`
- `Prometheus-Wolf-Alpha`
- `Vulcan-Otter-Beta`

### Cyberpunk Style

Tech-prefixed cyber names:

- `Cyber-Fox-Nexus`
- `Neural-Wolf-Grid`
- `Quantum-Otter-Core`

### Mythological Style

Divine and mystical references:

- `Apollo-Fox-Divine`
- `Thor-Wolf-Sacred`
- `Artemis-Otter-Blessed`

### Scientific Style

Latin scientific classifications:

- `Panthera-Leo-Alpha`
- `Canis-Lupus-Beta`
- `Lutra-Lutra-Gamma`

## Animal Spirits

The library supports a wide variety of animal spirits:

### Canines and Foxes

- Fox, Wolf, Coyote, Jackal

### Aquatic and Marine

- Otter, Dolphin, Whale, Shark, Octopus, Axolotl

### Birds of Prey and Flight

- Eagle, Falcon, Raven, Owl, Hawk

### Big Cats and Predators

- Lion, Tiger, Leopard, Jaguar, Cheetah, Lynx

### Mythical and Legendary

- Dragon, Phoenix, Griffin, Unicorn, Kraken, Basilisk

### And many more

## Installation

This library is part of the Reynard monorepo. To use it in your project:

```bash
# From the monorepo root
cd libraries/agent-naming
pip install -e .
```

## Development

```bash
# Run tests
pytest

# Format code
black agent_naming/
isort agent_naming/

# Type checking
mypy agent_naming/
```

## License

MIT License - see LICENSE file for details.
