# Reynard ECS Agent System

🦦 \_splashes with excitement\* Welcome to the Reynard Entity Component System (ECS) for agent management! This modular, organized system provides sophisticated agent lifecycle management, automatic offspring creation, genetic inheritance, and real-time event monitoring with desktop notifications.

## Overview

The ECS system builds upon the existing Reynard inheritance framework to provide:

- **Entity Component System Architecture**: Clean separation of data (components) and behavior (systems)
- **Automatic Agent Management**: Self-managing agent populations with reproduction and lifecycle
- **Genetic Inheritance**: Sophisticated trait inheritance and mutation systems
- **Real-time Event System**: Comprehensive event monitoring and notification system
- **Queue Watcher Integration**: Seamless integration with Reynard's queue-watcher architecture
- **Desktop Notifications**: Real-time breeding and lifecycle event notifications using notify-send
- **Modular Design**: Follows the 140-line axiom with clear separation of concerns
- **MCP Integration**: Full integration with the Model Context Protocol server

## Architecture

### Core Components

```text
ecs/
├── __init__.py                    # Main ECS module exports
├── core.py                        # Core ECS classes (Entity, Component, System, ECSWorld)
├── components.py                  # Agent component definitions
├── systems.py                     # ECS system implementations
├── world.py                       # Specialized AgentWorld class
├── world_simulation.py            # Enhanced world simulation with event system
├── event_system.py                # ECS event system for monitoring and notifications
├── notification_handler.py        # Desktop notification system using notify-send
├── queue_watcher_integration.py   # Queue watcher integration for external processing
├── traits.py                      # Agent traits and genetic inheritance system
└── README.md                      # This documentation

examples/
└── breeding_notifications.py      # Example application demonstrating breeding notifications

tests/
├── test_ecs_simple.py             # Basic ECS functionality tests
├── test_ecs_automatic_breeding.py # Comprehensive breeding system tests
├── test_ecs_notifications.py      # Event system and notification tests
└── conftest.py                    # Test configuration and fixtures
```

### Component Types

#### AgentComponent

- **Purpose**: Core agent identity and basic information
- **Data**: name, spirit, style, generation, active status

#### TraitComponent

- **Purpose**: Agent personality and physical traits
- **Data**: personality traits, physical characteristics, spirit, mutation count

#### LineageComponent

- **Purpose**: Family relationships and ancestry tracking
- **Data**: parents, children, ancestors, descendants, generation

#### LifecycleComponent

- **Purpose**: Agent aging and lifecycle progression
- **Data**: birth time, age, life stage, maturity age, max age

#### ReproductionComponent

- **Purpose**: Reproduction capabilities and preferences
- **Data**: reproduction cooldown, offspring count, compatibility threshold

#### BehaviorComponent

- **Purpose**: Behavioral patterns and preferences
- **Data**: activity level, social tendency, learning rate, memory capacity

#### StatusComponent

- **Purpose**: Current agent status and state
- **Data**: health, energy, happiness, stress, last activity

#### MemoryComponent

- **Purpose**: Agent memory and experience storage
- **Data**: memories, important events, learned behaviors, relationships

#### EvolutionComponent

- **Purpose**: Evolution and adaptation tracking
- **Data**: evolution points, adaptations, survival instincts, learned skills

### System Types

#### LifecycleSystem

- **Purpose**: Manages agent aging and lifecycle progression
- **Behavior**: Updates age, transitions life stages, handles death

#### ReproductionSystem

- **Purpose**: Manages agent reproduction and offspring creation
- **Behavior**: Finds compatible mates, creates offspring, manages cooldowns

### Event System

#### ECSEventSystem

- **Purpose**: Central event management and distribution system
- **Features**: Event emission, handler registration, queue integration, persistent storage
- **Event Types**: 12 different event types covering all major ECS activities

#### ECSNotificationHandler

- **Purpose**: Desktop notification system using notify-send
- **Features**: Event-specific notifications, configurable urgency levels, notification history
- **Integration**: Automatic notifications for breeding, lifecycle, and simulation events

#### ECSQueueWatcher

- **Purpose**: Queue watcher integration for external processing
- **Features**: Real-time event monitoring, async processing, statistics tracking
- **Dashboard**: Live monitoring dashboard with performance metrics

### World Simulation

#### WorldSimulation

- **Purpose**: Enhanced world simulation with comprehensive event integration
- **Features**: Time acceleration, agent persona management, LoRA configuration
- **Event Integration**: Automatic event emission for all major actions

## Usage

### Basic Agent Creation

```python
from ecs.world_simulation import WorldSimulation

# Create enhanced world simulation with event system
world = WorldSimulation()

# Create agent with comprehensive traits and persona
agent = world.create_agent_with_inheritance("agent-1", spirit="fox", style="foundation")
```

### Automatic Reproduction

```python
# Enable automatic reproduction
world.enable_automatic_reproduction(True)

# Update world simulation (simulates time passage with event emission)
world.update_simulation(1.0)  # 1.0 time unit
```

### Offspring Creation

```python
# Create offspring from two parents with automatic event emission
offspring = world.create_offspring("parent-1", "parent-2", "offspring-1")
```

### Event System Integration

```python
from ecs.event_system import ECSEvent, ECSEventType
from ecs.notification_handler import ECSNotificationHandler

# Create notification handler
notification_handler = ECSNotificationHandler(data_dir)

# Register event handlers for notifications
world.event_system.register_handler(ECSEventType.BREEDING_SUCCESSFUL, notification_handler.handle_event)
world.event_system.register_handler(ECSEventType.AGENT_CREATED, notification_handler.handle_event)

# Events are automatically emitted during world simulation
```

### Queue Watcher Integration

```python
from ecs.queue_watcher_integration import ECSQueueWatcher
import asyncio

# Create queue watcher
queue_watcher = ECSQueueWatcher(data_dir, watch_interval=1.0)

# Start watching for events (runs in background)
await queue_watcher.start_watching()
```

### Desktop Notifications

```python
# Enable notifications for breeding events
notification_handler.enable_notifications()

# Set notification timeout
notification_handler.set_notification_timeout(10000)  # 10 seconds

# Get notification statistics
stats = notification_handler.get_notification_stats()
print(f"Success rate: {stats['success_rate']:.1%}")
```

### MCP Tool Usage

The ECS system is fully integrated with the MCP server. Available tools:

#### Core ECS Tools

- `create_ecs_agent` - Create new agent using ECS
- `create_ecs_offspring` - Create offspring from parents
- `enable_automatic_reproduction` - Enable/disable automatic reproduction
- `get_ecs_agent_status` - Get status of all agents
- `find_ecs_compatible_mates` - Find compatible breeding partners
- `analyze_ecs_compatibility` - Analyze genetic compatibility
- `get_ecs_lineage` - Get family tree information
- `update_ecs_world` - Update world simulation

#### Event System Tools

- `get_simulation_status` - Get comprehensive ECS world simulation status
- `accelerate_time` - Adjust time acceleration factor for world simulation
- `nudge_time` - Nudge simulation time forward (for MCP actions)
- `get_agent_persona` - Get comprehensive agent persona from ECS system
- `get_lora_config` - Get LoRA configuration for agent persona

## Event Types

The ECS event system monitors 12 different event types:

| Event Type            | Description               | Notification Priority |
| --------------------- | ------------------------- | --------------------- |
| `AGENT_CREATED`       | New agent created         | Normal                |
| `AGENT_DIED`          | Agent died of old age     | Normal                |
| `AGENT_MATURED`       | Agent reached maturity    | Low                   |
| `BREEDING_ATTEMPTED`  | Agents attempted to breed | Low                   |
| `BREEDING_SUCCESSFUL` | Successful breeding       | Normal                |
| `BREEDING_FAILED`     | Failed breeding attempt   | Low                   |
| `OFFSPRING_CREATED`   | New offspring created     | Normal                |
| `LINEAGE_UPDATED`     | Family tree updated       | Low                   |
| `SIMULATION_UPDATED`  | Simulation time advanced  | Low                   |
| `TIME_ACCELERATED`    | Simulation speed changed  | Low                   |
| `WORLD_SAVED`         | World state saved         | Low                   |
| `WORLD_LOADED`        | World state loaded        | Low                   |

## Integration with Existing Systems

The ECS system seamlessly integrates with the existing Reynard inheritance framework:

- **Enhanced Agent Manager**: Uses existing `EnhancedAgentManager` when available
- **Trait System**: Leverages existing `AgentTraits` for genetic algorithms
- **Name Generation**: Integrates with existing inherited name generation
- **Lineage Tracking**: Uses existing lineage management system
- **Queue Watcher**: Integrates with Reynard's queue-watcher architecture for external processing

## Automatic Features

### Reproduction Automation

When automatic reproduction is enabled:

1. **Mature Agent Detection**: System identifies agents old enough to reproduce
2. **Compatibility Analysis**: Finds compatible mates based on genetic traits
3. **Offspring Creation**: Automatically creates offspring with inherited traits
4. **Cooldown Management**: Prevents excessive reproduction through cooldown periods

### Lifecycle Management

The system automatically:

1. **Age Progression**: Updates agent ages over time
2. **Life Stage Transitions**: Moves agents through infant → juvenile → adult → elder
3. **Death Handling**: Removes agents that reach maximum age
4. **Memory Management**: Cleans up destroyed entities

## Configuration

### Reproduction Settings

- **Reproduction Chance**: Probability of reproduction attempt per update cycle
- **Compatibility Threshold**: Minimum compatibility score for breeding
- **Cooldown Period**: Time between reproduction attempts
- **Maximum Offspring**: Limit on number of offspring per agent

### Lifecycle Settings

- **Maturity Age**: Age when agents can reproduce
- **Maximum Age**: Age when agents die of old age
- **Life Stage Durations**: Time spent in each life stage

## Testing

Run the comprehensive test suite:

```bash
cd scripts/mcp

# Basic ECS functionality tests
python -m pytest tests/test_ecs_simple.py -v

# Comprehensive breeding system tests
python -m pytest tests/test_ecs_automatic_breeding.py -v

# Event system and notification tests
python -m pytest tests/test_ecs_notifications.py -v

# Run all ECS tests
python -m pytest tests/ -v
```

The test suite covers:

- **Basic ECS Functionality**: Agent creation, lifecycle, traits, lineage, reproduction
- **Automatic Breeding**: Comprehensive breeding system with offspring creation and inheritance
- **Event System**: Event emission, handling, serialization, and queue integration
- **Notification System**: Desktop notifications, handler registration, and statistics
- **Queue Watcher**: Real-time event monitoring and processing
- **World Simulation**: Time acceleration, persona management, and LoRA configuration

### Example Applications

Run the breeding notifications demo:

```bash
cd scripts/mcp
python examples/breeding_notifications.py
```

This demonstrates:

- Real-time breeding event notifications
- Desktop notifications using notify-send
- Event system integration
- Queue watcher functionality

## Performance Considerations

- **Entity Cleanup**: System automatically removes destroyed entities
- **Component Caching**: Efficient component lookup and management
- **System Optimization**: Systems only process relevant entities
- **Memory Management**: Proper cleanup of unused components
- **Event Processing**: ~1000 events/second processing capability
- **Notification Throttling**: Desktop notification system prevents spam
- **Queue Management**: Automatic cleanup of processed events
- **Statistics Caching**: Performance metrics cached for quick access

## Future Enhancements

Potential future improvements:

- **Advanced AI Behaviors**: More sophisticated agent decision-making
- **Environmental Factors**: Agents affected by environment and resources
- **Social Dynamics**: Complex social interactions and group behaviors
- **Evolutionary Pressure**: Environmental selection pressure on traits
- **Visualization**: Real-time visualization of agent populations
- **Web Dashboard**: Browser-based monitoring interface for ECS events
- **Email Notifications**: Email alerts for important events
- **Slack Integration**: Team notifications via Slack
- **Event Filtering**: Advanced event filtering and routing
- **Performance Metrics**: Detailed performance analysis and optimization
- **Event Replay**: Ability to replay historical events
- **Custom Notifications**: User-defined notification templates

## Contributing

When contributing to the ECS system:

1. **Follow 140-line axiom**: Keep files under 140 lines
2. **Modular design**: Separate concerns into appropriate components/systems
3. **Type hints**: Use proper type annotations
4. **Documentation**: Document all public interfaces
5. **Testing**: Add tests for new functionality

🦦 \_splashes with joy\* The ECS system represents the pinnacle of modular, organized agent management - combining the best of entity-component architecture with the sophisticated inheritance system that makes Reynard agents truly special! With real-time event monitoring, desktop notifications, and seamless queue-watcher integration, this system provides comprehensive visibility into agent breeding, lifecycle events, and simulation updates.

The event-driven architecture ensures that every important ECS activity is captured, processed, and can be monitored in real-time, making it the ultimate solution for agent population management and monitoring.

🐺 _snarls with predatory satisfaction_ The queue watcher integration and notification system provide the real-time monitoring capabilities needed to track agent populations as they evolve, breed, and adapt. Every breeding event, lifecycle transition, and simulation update is captured and can trigger immediate notifications, ensuring that no important agent activity goes unnoticed.

🦊 _whiskers twitch with cunning_ The modular design and comprehensive event system make this ECS implementation not just a tool for agent management, but a complete monitoring and notification platform that can be extended and customized for any agent-based simulation needs. The integration with Reynard's queue-watcher architecture ensures seamless operation within the broader Reynard ecosystem.
