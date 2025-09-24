# 🦊 Reynard Games Demo

Interactive Games and Visualizations Showcase powered by the Reynard Framework.

## 🎮 Games Included

### Rogue-like Dungeon Crawler

- **ECS Architecture**: Built with Reynard's Entity-Component-System for high performance
- **Procedural Generation**: Each dungeon is uniquely generated with rooms and corridors
- **AI Systems**: Multiple enemy types with different behaviors (wander, aggressive, guard)
- **Pixel Art Rendering**: Crisp, retro-style graphics with pixel-perfect rendering
- **Line of Sight**: Realistic vision system with exploration mechanics
- **Combat & Items**: Turn-based combat with item collection and inventory

### 3D Interactive Games Collection

- **Cube Collector**: Collect falling cubes in a 3D environment
- **Space Shooter**: Classic space shooter with 3D graphics
- **Maze Explorer**: Navigate through procedurally generated 3D mazes
- **Particle Demo**: Interactive particle system visualization

## 🛠️ Technical Features

- **ECS System**: Entity-Component-System architecture for high-performance game logic
- **3D Rendering**: WebGL-powered 3D graphics with Three.js integration
- **Procedural Generation**: Algorithmic content generation for infinite replayability
- **AI Systems**: Intelligent NPCs with various behavior patterns
- **SolidJS**: Reactive UI framework for smooth interactions
- **TypeScript**: Full type safety and excellent developer experience

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm serve
```

### Development

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
pnpm format:check

# Testing
pnpm test
pnpm test:coverage
```

## 🎯 Usage

1. **Start the development server**: `pnpm dev`
2. **Open your browser**: Navigate to `http://localhost:3002`
3. **Select a game**: Choose from the main menu
4. **Play and explore**: Experience the different games and features

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── GameContainer.tsx
│   ├── GameInfo.tsx
│   ├── GameSelector.tsx
│   └── ThemeToggle.tsx
├── games/              # 3D games and components
│   ├── components/     # Game-specific components
│   ├── composables/    # Game logic and state management
│   ├── types/          # TypeScript type definitions
│   └── *.tsx           # Individual game implementations
├── pages/              # Main application pages
│   ├── RoguelikeGamePage.tsx
│   └── ThreeDGamesPage.tsx
├── styles/             # CSS stylesheets
│   ├── global.css
│   ├── game-selector.css
│   ├── roguelike-game.css
│   └── 3d-games.css
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🎨 Theming

The games demo supports both light and dark themes. Use the theme toggle in the header to switch between themes. All games automatically adapt to the selected theme.

## 🔧 Customization

### Adding New Games

1. Create a new game component in `src/games/`
2. Add the game type to the `GameType` union in `src/pages/ThreeDGamesPage.tsx`
3. Update the `GameContainer` component to handle the new game
4. Add game selection logic to the `GameSelector`

### Styling

- Global styles: `src/styles/global.css`
- Component-specific styles: `src/styles/[component].css`
- CSS custom properties for theming and consistency

## 📦 Dependencies

### Core Framework

- `reynard-core`: Core utilities and notifications
- `reynard-themes`: Theme system and providers
- `reynard-fluent-icons`: Icon library
- `reynard-games`: Games package with ECS system
- `reynard-3d`: 3D rendering utilities

### UI Components

- `reynard-components-core`: Core UI components
- `reynard-components-charts`: Chart components
- `reynard-components-dashboard`: Dashboard components
- `reynard-components-themes`: Theme components
- `reynard-components-utils`: Utility components

### 3D Graphics

- `three`: 3D graphics library
- `@types/three`: TypeScript definitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-game`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit your changes: `git commit -m 'Add new game'`
6. Push to the branch: `git push origin feature/new-game`
7. Submit a pull request

## 📄 License

This project is part of the Reynard Framework and is licensed under the MIT License.

## 🔗 Links

- [Reynard Framework](https://github.com/rakki194/reynard)
- [Documentation](https://reynard.dev)
- [Examples](https://github.com/rakki194/reynard/tree/main/examples)

---

Built with 🦊 Reynard Framework
