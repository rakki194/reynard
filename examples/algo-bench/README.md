# 🦊 Reynard 3D Demo

Interactive 3D games and visualizations showcasing the power of the Reynard 3D package built on Three.js.

## 🎮 Games & Demos

### 🎲 Cube Collector

- **Objective**: Collect colorful cubes by clicking on them
- **Features**: Physics simulation, score system, progressive difficulty
- **Controls**: Mouse click to collect cubes
- **Difficulty**: Easy

### 🚀 Space Shooter

- **Objective**: Defend against alien invaders in fast-paced space combat
- **Features**: Particle effects, enemy AI, power-ups
- **Controls**: WASD/Arrow Keys to move, SPACE to shoot
- **Difficulty**: Medium

### 🧩 Maze Explorer

- **Objective**: Navigate through procedurally generated 3D mazes
- **Features**: Procedural generation, first-person controls, dynamic lighting
- **Controls**: WASD/Arrow Keys to move, Mouse to look around
- **Difficulty**: Hard

### ✨ Particle Playground

- **Objective**: Create beautiful particle effects and explore WebGL rendering
- **Features**: Interactive particles, real-time effects, visual art
- **Controls**: Click to create effects, mouse movement to aim
- **Difficulty**: Easy

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve
```

### Development

The app runs on `http://localhost:3003` by default.

## 🛠️ Technical Features

### 3D Rendering

- **WebGL**: Hardware-accelerated 3D graphics
- **Three.js**: Industry-standard 3D library
- **Responsive**: Automatic canvas resizing and device pixel ratio optimization
- **Performance**: Optimized rendering with efficient geometry and materials

### Game Engine Features

- **Physics Simulation**: Realistic object interactions and collisions
- **Particle Systems**: Dynamic visual effects and explosions
- **Procedural Generation**: Algorithmic content creation for mazes
- **Input Handling**: Mouse and keyboard controls with smooth responsiveness

### Reynard Integration

- **Theme System**: Dark/light mode support with CSS variables
- **Component Architecture**: Modular, reusable game components
- **State Management**: Reactive state with SolidJS signals
- **Notifications**: User feedback system for game events

## 🎯 Game Mechanics

### Scoring System

- **Cube Collector**: Points based on cube color and collection speed
- **Space Shooter**: Points for destroying enemies, bonus for combos
- **Maze Explorer**: Points for reaching the exit quickly
- **Particle Demo**: Points for creating effects and interactions

### Controls

- **Mouse**: Look around, interact with objects, aim
- **WASD/Arrow Keys**: Movement in applicable games
- **Space**: Shoot, jump, or special actions
- **Scroll**: Zoom in/out (where applicable)

## 🎨 Visual Design

### Theme Support

- **Light Mode**: Clean, bright interface with high contrast
- **Dark Mode**: Easy on the eyes with vibrant accent colors
- **Responsive**: Adapts to different screen sizes and orientations

### UI Components

- **Game Cards**: Interactive selection with hover effects
- **HUD Elements**: Real-time game information display
- **Instructions**: Context-sensitive help and controls
- **Score Display**: Prominent scoring system

## 🔧 Architecture

### Component Structure

```
src/
├── App.tsx                 # Main application component
├── components/             # Reusable UI components
│   ├── GameSelector.tsx   # Game selection interface
│   ├── GameContainer.tsx  # Game wrapper and controls
│   ├── GameInfo.tsx       # Information and help
│   └── ThemeToggle.tsx    # Theme switching
├── games/                 # Individual game implementations
│   ├── CubeCollectorGame.tsx
│   ├── SpaceShooterGame.tsx
│   ├── MazeExplorerGame.tsx
│   └── ParticleDemo.tsx
└── styles.css            # Global styles and theming
```

### Game Loop Architecture

Each game implements a consistent pattern:

1. **Scene Setup**: Initialize Three.js scene, lighting, and objects
2. **Input Handling**: Mouse and keyboard event management
3. **Game Loop**: Update logic, physics, and rendering
4. **State Management**: Score tracking and game state
5. **Cleanup**: Resource management and event cleanup

## 🚀 Performance Optimizations

### Rendering

- **Frustum Culling**: Only render visible objects
- **Level of Detail**: Adjust quality based on distance
- **Efficient Materials**: Reuse materials and geometries
- **Batch Operations**: Group similar rendering operations

### Memory Management

- **Object Pooling**: Reuse particle and bullet objects
- **Garbage Collection**: Minimize object creation in game loops
- **Resource Cleanup**: Proper disposal of Three.js objects
- **Event Cleanup**: Remove event listeners on component unmount

## 🎯 Future Enhancements

### Planned Features

- **Multiplayer Support**: Real-time multiplayer games
- **VR/AR Integration**: Immersive 3D experiences
- **Advanced Physics**: More realistic simulations
- **Audio System**: 3D spatial audio and sound effects
- **Save System**: Progress persistence and high scores

### Technical Improvements

- **Web Workers**: Offload heavy computations
- **WebAssembly**: Performance-critical game logic
- **Progressive Web App**: Offline support and app-like experience
- **Analytics**: Game performance and user behavior tracking

## 🤝 Contributing

This demo serves as a showcase for the Reynard 3D package capabilities. Contributions are welcome for:

- New game implementations
- Performance optimizations
- Visual enhancements
- Bug fixes and improvements

## 📄 License

Part of the Reynard framework ecosystem. See main project for licensing information.

---

Built with 🦊 Reynard Framework • Powered by Three.js • Made with ❤️
