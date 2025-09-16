# 🦊 ECS Agent Tracker

A visual 2D grid system for tracking Reynard agents using the **real** ECS (Entity Component System) world simulation. This example demonstrates how to integrate with the Reynard MCP server's ECS system to create an interactive agent management interface with **actual position tracking and time progression**.

## Features

### 🎯 Visual Agent Tracking

- **2D Grid Visualization**: Interactive grid showing **real** agent positions and movements from the ECS system
- **Real-time Updates**: Live tracking of agent positions and status changes with **actual time progression**
- **Spirit-based Colors**: Each agent spirit (fox, wolf, otter, etc.) has distinct visual representation
- **Lineage Visualization**: Connection lines showing parent-child relationships
- **Position Simulation**: Agents move autonomously based on their traits and behavior patterns

### 🧬 Agent Management

- **Create Agents**: Generate new agents with different spirits and styles
- **Breeding System**: Create offspring from compatible parent agents
- **Trait Visualization**: View detailed personality, physical, and ability traits
- **Lineage Tracking**: Family tree and ancestry information

### ⚡ Simulation Controls

- **Time Acceleration**: Control simulation speed (0.1x to 10x)
- **Automatic Reproduction**: Toggle automatic breeding on/off
- **Manual Stepping**: Step through simulation manually
- **Real-time Stats**: Live statistics on agent population and maturity

### 🎭 Agent Information

- **Comprehensive Traits**: 44 different traits across 3 categories
- **Compatibility Analysis**: Find compatible mates for breeding
- **Age and Maturity**: Track agent lifecycle and reproduction readiness
- **Spirit and Style**: Visual representation of agent archetypes

## Architecture

### Core Components

#### `useECSAgentTracker` Composable

- **MCP Integration**: Communicates with Reynard MCP server
- **Agent Management**: CRUD operations for agents and offspring
- **Simulation Control**: Time acceleration and reproduction settings
- **Real-time Updates**: Periodic refresh of agent data

#### `AgentGrid` Component

- **2D Visualization**: SVG-based grid with agent entities
- **Interactive Selection**: Click agents to view details
- **Movement Animation**: Smooth transitions for agent movement
- **Relationship Lines**: Visual connections between related agents

#### `AgentSidebar` Component

- **Agent Creation**: Form for creating new agents
- **Breeding Interface**: Parent selection and offspring creation
- **Trait Display**: Comprehensive trait visualization
- **Lineage Information**: Family tree and relationship data

### ECS Integration

The application integrates with the **real** Reynard ECS system through MCP tools:

- **`get_ecs_agent_status`**: Retrieve current agent population
- **`get_ecs_agent_positions`**: Get real-time agent positions and movement data
- **`create_ecs_agent`**: Create new agents with traits and position components
- **`create_ecs_offspring`**: Generate offspring from parents with inherited traits
- **`accelerate_time`**: Control simulation speed (0.1x to 100x)
- **`enable_automatic_reproduction`**: Toggle breeding automation
- **`update_ecs_world`**: Step simulation forward with **real time progression**

### Position System

The ECS system now includes:

- **PositionComponent**: Tracks agent x/y coordinates, velocity, and movement targets
- **MovementSystem**: Handles autonomous agent movement based on behavior traits
- **Time-based Updates**: Agents move and age in real-time as the simulation progresses
- **Boundary Enforcement**: Agents stay within the 900x700 grid boundaries
- **Behavior-driven Movement**: More active agents move more frequently and over longer distances

## Usage

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Agent Creation

1. **Select Spirit**: Choose from fox, wolf, otter, eagle, lion, or dolphin
2. **Choose Style**: Pick from foundation, exo, hybrid, cyberpunk, mythological, or scientific
3. **Create Agent**: Click "Create Agent" to add to the simulation

### Breeding

1. **Select Parents**: Choose two mature agents (age ≥ 18)
2. **Create Offspring**: Click "Create Offspring" to generate child
3. **View Lineage**: See parent-child relationships in the grid

### Simulation Control

- **Time Speed**: Adjust simulation speed with the slider
- **Auto-Breeding**: Toggle automatic reproduction on/off
- **Manual Step**: Step through simulation manually
- **Real-time Stats**: Monitor population and maturity levels

## Technical Details

### Dependencies

- **SolidJS**: Reactive UI framework
- **Reynard Games**: ECS and game systems
- **Reynard Animation**: Smooth animations and transitions
- **Reynard Components**: UI component library
- **Reynard Charts**: Data visualization
- **Reynard Themes**: Consistent theming

### Agent Traits System

Each agent has 44 traits across three categories:

#### Personality Traits (16)

- Dominance, Independence, Patience, Aggression
- Charisma, Creativity, Perfectionism, Adaptability
- Playfulness, Intelligence, Loyalty, Curiosity
- Courage, Empathy, Determination, Spontaneity

#### Physical Traits (12)

- Size, Strength, Agility, Endurance
- Appearance, Grace, Speed, Coordination
- Stamina, Flexibility, Reflexes, Vitality

#### Ability Traits (16)

- Strategist, Hunter, Teacher, Artist
- Healer, Inventor, Explorer, Guardian
- Diplomat, Warrior, Scholar, Performer
- Builder, Navigator, Communicator, Leader

### Spirit Archetypes

- **🦊 Fox**: Strategic cunning and intelligence
- **🐺 Wolf**: Pack coordination and security focus
- **🦦 Otter**: Playful testing and quality assurance
- **🦅 Eagle**: Visionary leadership and high-level strategy
- **🦁 Lion**: Bold leadership and confident decisions
- **🐬 Dolphin**: Intelligent communication and social coordination

## Future Enhancements

- **3D Visualization**: Upgrade to 3D grid system
- **Advanced AI**: Implement agent decision-making systems
- **Multiplayer**: Real-time collaborative agent management
- **Data Export**: Export agent data and lineage trees
- **Performance Metrics**: Detailed simulation performance analysis
- **Custom Traits**: User-defined trait categories
- **Visual Effects**: Particle systems and advanced animations

## Contributing

This example demonstrates best practices for:

- ECS system integration
- Real-time data visualization
- Interactive UI design
- MCP server communication
- Agent trait systems
- Lineage tracking

Feel free to extend and modify for your own agent simulation needs!
