# 🦊 ECS Agent Tracker Demo

## Quick Start

```bash
# Navigate to the example directory
cd examples/ecs-agent-tracker

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The application will be available at `http://localhost:3001`

## Features Demonstration

### 1. Visual Agent Grid

- **Interactive Grid**: Click on any agent to view detailed information
- **Real-time Movement**: Agents move randomly around the grid
- **Spirit Colors**: Each agent spirit has a distinct color and emoji
- **Lineage Lines**: Dashed lines show parent-child relationships

### 2. Agent Creation

- **Select Spirit**: Choose from fox 🦊, wolf 🐺, otter 🦦, eagle 🦅, lion 🦁, or dolphin 🐬
- **Choose Style**: Pick from foundation, exo, hybrid, cyberpunk, mythological, or scientific
- **Create Agent**: Click "Create Agent" to add to the simulation

### 3. Breeding System

- **Select Parents**: Choose two mature agents (age ≥ 18)
- **Create Offspring**: Generate children with inherited traits
- **View Lineage**: See family relationships in the grid and sidebar

### 4. Simulation Controls

- **Time Speed**: Adjust from 0.1x to 10x speed
- **Auto-Breeding**: Toggle automatic reproduction
- **Manual Step**: Step through simulation manually
- **Live Stats**: Monitor population and maturity levels

### 5. Agent Information

- **Comprehensive Traits**: View 44 different traits across 3 categories
- **Top Traits**: See the highest-rated personality, physical, and ability traits
- **Compatibility**: Find compatible mates for breeding
- **Lineage Tree**: View family history and relationships

## MCP Server Integration

The example demonstrates integration with the Reynard MCP server's ECS system:

### Available MCP Tools

- `get_ecs_agent_status` - Get current agent population
- `create_ecs_agent` - Create new agents with traits
- `create_ecs_offspring` - Generate offspring from parents
- `accelerate_time` - Control simulation speed
- `enable_automatic_reproduction` - Toggle breeding automation
- `update_ecs_world` - Step simulation forward

### Real Implementation

In a real implementation, the `MCPServer` class would communicate with the actual MCP server running in the background. The current version simulates responses for demonstration purposes.

## Technical Architecture

### Component Structure

```
App.tsx
├── Header.tsx (simulation controls)
├── AgentGrid.tsx (2D visualization)
└── AgentSidebar.tsx (agent management)
```

### Composables

```
useECSAgentTracker.ts
├── mcpServer.ts (MCP communication)
└── agentGenerator.ts (mock data generation)
```

### Key Features

- **SolidJS**: Reactive UI framework
- **TypeScript**: Full type safety
- **SVG Graphics**: Scalable vector graphics for grid
- **Real-time Updates**: Live agent tracking
- **Responsive Design**: Works on desktop and mobile

## Customization

### Adding New Spirits

1. Update the `spirits` array in `agentGenerator.ts`
2. Add emoji mapping in `AgentGrid.tsx`
3. Add color mapping in `AgentGrid.tsx`

### Adding New Traits

1. Update the `AgentTraits` interface in `types.ts`
2. Modify the trait generation in `agentGenerator.ts`
3. Update the trait display in `AgentSidebar.tsx`

### Styling

- Modify `styles.css` for visual customization
- Update color schemes in component files
- Adjust grid size and spacing

## Performance Considerations

- **Agent Limit**: Currently supports up to 100 agents efficiently
- **Update Frequency**: Agents refresh every 2 seconds
- **Memory Usage**: Each agent stores 44 traits + lineage data
- **Rendering**: SVG-based rendering for smooth performance

## Future Enhancements

- **3D Visualization**: Upgrade to Three.js 3D grid
- **Advanced AI**: Implement agent decision-making
- **Multiplayer**: Real-time collaborative editing
- **Data Export**: Export agent data and lineage trees
- **Performance Metrics**: Detailed simulation analytics
