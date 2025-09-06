# 🦊 Reynard Framework Examples

Welcome to the Reynard framework examples! These practical applications demonstrate the power and flexibility of the Reynard SolidJS framework and UI library.

## 📱 Available Examples

### 🚀 [Basic App](./basic-app/) - Todo Application

A minimal todo application demonstrating core Reynard features.

**What you'll learn:**

- Core SolidJS reactivity with Reynard
- Theme switching and persistence
- Notification system integration
- Responsive design patterns
- Component composition

**Features:**

- ✅ CRUD todo operations
- 🎨 5 beautiful themes with live switching
- 📱 Mobile-responsive design
- 🔔 User feedback notifications
- 💾 Theme persistence

**Bundle size:** ~11 kB total (gzipped)

---

### 🎨 [Multi-Theme Gallery](./multi-theme/) - Advanced Theming Showcase

Comprehensive demonstration of Reynard's theming capabilities.

**What you'll learn:**

- Advanced theme system implementation
- Component library development
- Theme comparison interfaces
- CSS custom properties architecture
- Responsive design patterns

**Features:**

- 🖼️ Interactive theme gallery with previews
- 🧩 Complete component showcase
- ⚖️ Side-by-side theme comparison (up to 3 themes)
- 🎨 Color palette visualization
- 📊 Component adaptation demonstration

**Bundle size:** ~23 kB total (gzipped)

---

### 🌐 [Full-Stack App](./full-stack/) - Complete Application _(Coming Soon)_

A comprehensive example with frontend, backend, and database integration.

**What you'll learn:**

- Full-stack architecture with Reynard
- API integration patterns
- Real-time features
- Authentication and authorization
- Database operations

**Features:**

- 👤 User authentication
- 🔄 Real-time data synchronization
- 📊 Dashboard with charts
- 🔍 Search and filtering
- 📱 Progressive Web App features

---

## 🚀 Quick Start

### Running an Example

```bash
# Navigate to any example directory
cd basic-app  # or multi-theme

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Ports

- **Basic App**: <http://localhost:3001>
- **Multi-Theme Gallery**: <http://localhost:3002>
- **Full-Stack App**: <http://localhost:3003> _(when available)_

## 🏗️ Architecture Overview

All examples follow Reynard's architectural principles:

### 📦 Package Structure

```
example-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── App.tsx             # Main application
│   ├── index.tsx           # Entry point
│   └── styles.css          # Theme-aware styles
├── package.json            # Dependencies (uses reynard-core)
├── vite.config.ts          # Build configuration
├── tsconfig.json           # TypeScript setup
└── README.md               # Example documentation
```

### 🎨 Theming System

- **CSS Custom Properties**: Theme-aware variables
- **Automatic Adaptation**: Components respond to theme changes
- **Persistence**: Themes saved to localStorage
- **5 Built-in Themes**: light, dark, banana, strawberry, peanut

### 🧩 Core Features Used

- **Theme Management**: `useTheme()` composable
- **Notifications**: `useNotifications()` for user feedback
- **Local Storage**: `useLocalStorage()` for persistence
- **Responsive Design**: Mobile-first CSS patterns

## 📚 Learning Path

### 1. Start with Basic App

- Learn fundamental Reynard concepts
- Understand SolidJS reactivity
- Practice theme integration
- Explore component patterns

### 2. Explore Multi-Theme Gallery

- Advanced styling techniques
- Component library development
- Theme comparison interfaces
- Complex state management

### 3. Build Full-Stack App _(when available)_

- Real-world application architecture
- API integration patterns
- Authentication flows
- Advanced features

## 🎯 Use Cases

### Basic App is perfect for

- Learning Reynard fundamentals
- Prototyping simple applications
- Understanding theme systems
- Getting started with SolidJS

### Multi-Theme Gallery is ideal for

- Design system development
- Theme evaluation and comparison
- Component library showcases
- Advanced styling patterns

### Full-Stack App will demonstrate

- Production-ready applications
- Real-time features
- Authentication patterns
- Database integration

## 🔧 Customization

### Adding New Themes

1. Add theme variables to `styles.css`:

```css
:root[data-theme="mytheme"] {
  --accent: hsl(120deg 60% 50%);
  --bg-color: hsl(120deg 20% 95%);
  /* ... other variables */
}
```

2. Update theme lists in components
3. Add theme descriptions and emojis

### Extending Examples

- Add new components to showcase
- Implement additional features
- Integrate with external APIs
- Add animations and transitions

## 📊 Performance

All examples are optimized for:

- **Fast Loading**: Small bundle sizes with code splitting
- **Smooth Interactions**: 60fps animations and transitions
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **SEO Ready**: Semantic HTML and meta tags

## 🤝 Contributing

Found a bug or have an improvement idea?

1. **Issues**: Report bugs or suggest features
2. **Pull Requests**: Submit improvements or new examples
3. **Documentation**: Help improve guides and examples

## 🔗 Links

- **[Reynard Documentation](../../README.md)** - Framework overview
- **[Core Package](../../packages/core/)** - Core functionality
- **[Starter Template](../../templates/starter/)** - Project template
- **[SolidJS Docs](https://solidjs.com)** - SolidJS framework

---

_Built with ❤️ using Reynard framework, SolidJS, and modern web technologies_ 🦊

**Happy coding!** 🚀
