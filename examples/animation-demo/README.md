# 🎬 Reynard Animation System Demo

A comprehensive showcase of Reynard's unified animation system, demonstrating all the powerful animation features and capabilities.

## 🚀 Features

### 🎭 Staggered Animations

- Sequential animation effects with customizable timing
- Multiple direction options (forward, reverse, center-out)
- Real-time delay calculation and animation status
- Interactive controls for timing and easing

### 🪟 Floating Panels

- Smooth panel transitions and animations
- Drag-and-drop functionality
- Smart positioning and z-index management
- Backdrop and draggable options

### 🎨 Color Animations

- Beautiful color transitions and hue shifting
- Real-time color palette generation
- Customizable animation duration and easing
- Interactive color showcase

### 🎪 3D Animations

- Three.js integration with WebGL rendering
- Multiple animation types (rotation, cluster, particles)
- Real-time camera controls
- Particle system animations

### ⚡ Performance Monitoring

- Real-time performance metrics (FPS, memory, load time)
- Performance mode controls (normal, high, low)
- System health monitoring
- Performance optimization tips

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start development server:**

   ```bash
   pnpm dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm serve` - Preview production build
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint

## 🎯 Demo Pages

### 📊 Dashboard

Overview of all animation features with system status and performance metrics.

### 🎭 Staggered Animations

Interactive demo of sequential animation effects with customizable timing and direction.

### 🪟 Floating Panels

Showcase of panel animations, transitions, and interactive controls.

### 🎨 Color Animations

Beautiful color transitions and hue shifting effects with real-time controls.

### 🎪 3D Animations

Three.js-powered 3D animations with WebGL rendering and particle systems.

### ⚡ Performance

Real-time performance monitoring, optimization controls, and system health metrics.

## 🎛️ Animation Controls

The demo includes global animation controls that allow you to:

- **Toggle animations** on/off globally
- **Set performance mode** (normal, high, low)
- **Monitor real-time metrics** (FPS, memory, load time)
- **Reset all animations** to initial state

## 🏗️ Architecture

The demo is built using:

- **SolidJS** - Reactive UI framework
- **Reynard Framework** - Unified animation system
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe development
- **CSS Custom Properties** - Theme-aware styling

## 📦 Packages Used

- `reynard-core` - Core animation utilities
- `reynard-themes` - Theme system and styling
- `reynard-floating-panel` - Floating panel components
- `reynard-colors` - Color animation utilities
- `reynard-3d` - Three.js integration
- `reynard-fluent-icons` - Icon components

## 🎨 Styling

The demo uses a comprehensive CSS system with:

- **CSS Custom Properties** for theming
- **Responsive design** for all screen sizes
- **Animation utilities** for smooth transitions
- **Component-scoped styles** for maintainability

## 🔧 Customization

### Adding New Animation Types

1. Create a new page component in `src/pages/`
2. Add navigation item in `src/components/Navigation.tsx`
3. Update the main App component to include the new page
4. Add any necessary styles to `src/styles/global.css`

### Modifying Animation Parameters

Each demo page includes interactive controls for customizing animation parameters. You can modify:

- Animation duration and timing
- Easing functions
- Direction and behavior
- Performance settings

## 📊 Performance

The demo includes comprehensive performance monitoring:

- **Real-time FPS tracking**
- **Memory usage monitoring**
- **Load time measurement**
- **Active animation counting**
- **Performance mode switching**

## 🐛 Troubleshooting

### Common Issues

1. **Animations not working:**
   - Check if animations are enabled in the global controls
   - Verify browser supports the required features
   - Check console for any error messages

2. **Performance issues:**
   - Try switching to "High Performance" mode
   - Reduce particle count or animation complexity
   - Check system resources and browser performance

3. **Build errors:**
   - Ensure all dependencies are installed
   - Check TypeScript configuration
   - Verify all imports are correct

## 🤝 Contributing

This demo is part of the Reynard framework. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This demo is part of the Reynard framework and follows the same license terms.

---

**Built with 🦊 Reynard Framework** - The unified animation system for modern web applications.
