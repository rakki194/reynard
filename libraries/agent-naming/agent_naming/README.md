# Agent Naming System

A clean, modular agent naming system for the Reynard MCP server that generates robot names with animal spirit themes and sci-fi conventions.

## Overview

The agent naming system provides comprehensive robot name generation inspired by:

- **Asimov's Foundation** - Strategic, intellectual naming
- **Destiny's Exo** - Combat, technical naming  
- **Cyberpunk** - Tech-prefixed cyber naming
- **Mythological** - Divine/mystical references
- **Scientific** - Latin scientific classifications
- **Hybrid** - Mythological/historical references

## Architecture

### Core Components

- **`types.py`** - Type definitions and enums
- **`generator.py`** - Core name generation logic
- **`manager.py`** - Agent management and persistence
- **`__init__.py`** - Module exports

### Key Features

- **Type Safety** - Full enum-based type system
- **Modular Design** - Clean separation of concerns
- **ECS Integration** - Works with the ECS world simulation
- **Persistence** - Agent names stored in JSON
- **Extensible** - Easy to add new spirits and styles

## Usage

### Basic Name Generation

```python
from agent_naming import ReynardRobotNamer, AnimalSpirit, NamingStyle, NamingConfig

# Create generator
namer = ReynardRobotNamer()

# Generate a single name
config = NamingConfig(
    spirit=AnimalSpirit.FOX,
    style=NamingStyle.FOUNDATION,
    count=1
)
names = namer.generate_batch(config)
print(names[0].name)  # e.g., "Vulpine-Sage-13"
```

### Agent Management

```python
from agent_naming import AgentNameManager, AnimalSpirit, NamingStyle

# Create manager
manager = AgentNameManager()

# Generate and assign name
name = manager.generate_name(AnimalSpirit.OTTER, NamingStyle.EXO)
manager.assign_name("agent-123", name)

# Retrieve name
retrieved_name = manager.get_name("agent-123")
```

### Random Spirit Selection

```python
# Weighted distribution (fox 40%, otter 35%, wolf 25%)
spirit = manager.roll_agent_spirit(weighted=True)

# Equal distribution
spirit = manager.roll_agent_spirit(weighted=False)
```

## Available Spirits

### Canines and Foxes

- `FOX` - Cunning, strategic thinking
- `WOLF` - Pack coordination, loyalty
- `COYOTE` - Trickster, adaptability
- `JACKAL` - Stealth, resourcefulness

### Aquatic and Marine

- `OTTER` - Playful, thorough testing
- `DOLPHIN` - Intelligence, communication
- `WHALE` - Wisdom, depth
- `SHARK` - Predator efficiency
- `OCTOPUS` - Intelligence, camouflage
- `AXOLOTL` - Regeneration, uniqueness

### Birds of Prey

- `EAGLE` - Vision, leadership
- `FALCON` - Speed, precision
- `RAVEN` - Intelligence, mystery
- `OWL` - Wisdom, night vision
- `HAWK` - Focus, hunting

### Big Cats

- `LION` - Leadership, pride
- `TIGER` - Power, stripes
- `LEOPARD` - Stealth, spots
- `JAGUAR` - Amazon power
- `CHEETAH` - Speed, grace
- `LYNX` - Mountain stealth

### Mythical Creatures

- `DRAGON` - Ancient power
- `PHOENIX` - Rebirth, renewal
- `GRIFFIN` - Noble majesty
- `UNICORN` - Purity, magic
- `KRAKEN` - Deep power
- `BASILISK` - Deadly gaze

### And many more

## Available Styles

### Foundation Style

Strategic, intellectual naming: `[Spirit] + [Suffix] + [Generation]`

- Example: `Vulpine-Sage-13`
- Suffixes: Prime, Sage, Oracle, Prophet, Architect, Strategist

### Exo Style  

Combat, technical naming: `[Spirit] + [Suffix] + [Model]`

- Example: `Lupus-Strike-8`
- Suffixes: Strike, Guard, Sentinel, Hunter, Protocol, System

### Cyberpunk Style

Tech-prefixed naming: `[Tech Prefix] + [Spirit] + [Cyber Suffix]`

- Example: `Cyber-Fox-Nexus`
- Prefixes: Cyber, Neo, Mega, Ultra, Quantum, Neural
- Suffixes: Nexus, Grid, Web, Core, Power, Energy

### Mythological Style

Divine naming: `[Mythological] + [Spirit] + [Divine Suffix]`

- Example: `Apollo-Fox-Divine`
- References: Atlas, Prometheus, Vulcan, Minerva, Apollo, Artemis
- Suffixes: Divine, Sacred, Holy, Blessed, Chosen, Eternal

### Scientific Style

Latin naming: `[Scientific] + [Technical] + [Classification]`

- Example: `Panthera-Leo-Alpha`
- Prefixes: Panthera, Canis, Felis, Ursus, Elephas
- Suffixes: Leo, Tigris, Pardus, Onca, Jubatus
- Classifications: Alpha, Beta, Gamma, Type-A, Class-1

### Hybrid Style

Mixed references: `[Spirit] + [Reference] + [Designation]`

- Example: `Fox-Atlas-Prime`
- References: Atlas, Prometheus, Nexus, Quantum, Neural
- Designations: Alpha, Beta, Prime, Ultra, Mega, Super

## ECS Integration

The agent naming system integrates with the ECS world simulation:

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

## Migration from Legacy System

The old `robot_name_generator.py` and deprecated `services/agent_manager.py` have been completely removed and replaced with this modular system.

### Key Improvements

1. **Type Safety** - Full enum-based type system
2. **Modular Architecture** - Clean separation of concerns
3. **Better Organization** - Logical file structure
4. **Enhanced Features** - More spirits, styles, and options
5. **ECS Integration** - Seamless world simulation integration
6. **Persistence** - Reliable agent name storage

## Testing

```bash
# Test the naming system
cd scripts/mcp
python3 -c "
from agent_naming import ReynardRobotNamer, AnimalSpirit, NamingStyle, NamingConfig

namer = ReynardRobotNamer()
config = NamingConfig(spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=3)
names = namer.generate_batch(config)

for name in names:
    print(f'{name.name} (Spirit: {name.spirit.value}, Style: {name.style.value})')
"
```

## Contributing

To add new animal spirits or naming styles:

1. Add the spirit to `AnimalSpirit` enum in `types.py`
2. Add spirit names to `animal_spirits` dict in `generator.py`
3. Add generation numbers to `generation_numbers` dict
4. Test the new spirit with different styles

The system is designed to be easily extensible while maintaining type safety and clean architecture.
