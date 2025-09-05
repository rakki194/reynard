# Reynard Architecture Overview

A comprehensive guide to the Reynard framework architecture, including the new theming and icon systems.

## Table of Contents

- [Reynard Architecture Overview](#reynard-architecture-overview)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Key Principles](#key-principles)
  - [Package Structure](#package-structure)
  - [Core Packages](#core-packages)
    - [@reynard/core](#reynardcore)
    - [@reynard/themes](#reynardthemes)
    - [@reynard/fluent-icons](#reynardfluent-icons)
    - [@reynard/components](#reynardcomponents)
  - [Theming System](#theming-system)
    - [Architecture Overview](#architecture-overview)
    - [Theme Structure](#theme-structure)
    - [CSS Custom Properties](#css-custom-properties)
    - [Theme Utilities](#theme-utilities)
  - [Icon System](#icon-system)
    - [Architecture Overview](#architecture-overview-1)
    - [Registry System](#registry-system)
    - [Icon Categories](#icon-categories)
    - [Usage Patterns](#usage-patterns)
  - [Demo Applications](#demo-applications)
    - [reynard-icons-demo](#reynard-icons-demo)
    - [Basic App Example](#basic-app-example)
    - [Chat Demo](#chat-demo)
    - [Multi-Theme Example](#multi-theme-example)
  - [Development Workflow](#development-workflow)
    - [Package Development](#package-development)
    - [Testing Strategy](#testing-strategy)
    - [Build Process](#build-process)
  - [Performance Considerations](#performance-considerations)
    - [Bundle Optimization](#bundle-optimization)
    - [Runtime Performance](#runtime-performance)
    - [Development Performance](#development-performance)
  - [Migration Guide](#migration-guide)
    - [From yipyap](#from-yipyap)
    - [From Other Frameworks](#from-other-frameworks)
  - [Future Roadmap](#future-roadmap)
    - [Planned Features](#planned-features)
    - [Performance Improvements](#performance-improvements)
  - [Contributing](#contributing)
    - [Development Setup](#development-setup)
    - [Contribution Guidelines](#contribution-guidelines)
  - [License](#license)

## Overview

Reynard is a modern SolidJS framework designed with a modular, package-based architecture. The framework provides a comprehensive set of tools for building modern web applications with consistent theming, internationalization, and icon systems.

### Key Principles

- **Modularity**: Each package has a single responsibility
- **Type Safety**: Full TypeScript support throughout
- **Performance**: Optimized for modern browsers and devices
- **Accessibility**: WCAG compliant with built-in accessibility features
- **Developer Experience**: Excellent tooling and documentation

## Package Structure

```plaintext
reynard/
├── packages/
│   ├── core/                 # Core utilities and modules
│   ├── themes/               # Theming and i18n system
│   ├── fluent-icons/         # Icon system and registry
│   └── components/           # UI components and primitives
├── examples/
│   ├── basic-app/            # Basic application example
│   ├── chat-demo/            # Chat application demo
│   ├── multi-theme/          # Multi-theme showcase
│   └── icons-demo/           # Icon system demo
├── templates/
│   └── starter/              # Starter template
└── docs/                     # Documentation
```

## Core Packages

### @reynard/core

The foundation package providing essential utilities and modules.

**Key Features:**

- **Modules**: Theme, notifications, i18n, async utilities
- **Composables**: useTheme, useNotifications, useI18n, useDebounce
- **Utilities**: Formatters, validators, date utilities, language utilities
- **Type Safety**: Comprehensive TypeScript definitions

**Architecture:**

```typescript
// Modular design with clear separation of concerns
export * from "./modules"; // Core functionality
export * from "./composables"; // SolidJS hooks
export * from "./utils"; // Utility functions
```

**Dependencies:**

- `solid-js`: Core reactive framework
- No external dependencies for maximum compatibility

### @reynard/themes

Comprehensive theming and internationalization system.

**Key Features:**

- **8 Built-in Themes**: Light, dark, gray, banana, strawberry, peanut, high contrast variants
- **30+ Languages**: Full internationalization support
- **LCH Color Space**: Consistent color generation
- **CSS Custom Properties**: Dynamic theme switching
- **Accessibility**: Reduced motion and high contrast support

**Architecture:**

```typescript
// Unified provider for both theming and i18n
<ReynardProvider defaultTheme="light" defaultLocale="en">
  <App />
</ReynardProvider>

// Separate hooks for different concerns
const { theme, setTheme } = useTheme();
const { t, locale } = useTranslation();
const { formatDate, formatNumber } = useI18n();
```

**Dependencies:**

- `solid-js`: Reactive framework
- Self-contained with no external dependencies

### @reynard/fluent-icons

Professional icon system with Fluent UI icons and custom assets.

**Key Features:**

- **150+ Icons**: Fluent UI icons organized by category
- **Custom Icons**: Reynard-specific icons including favicon
- **Registry System**: Centralized icon management
- **Type Safety**: Full TypeScript support with autocomplete
- **Performance**: Lazy loading and caching

**Architecture:**

```typescript
// Category-based organization
import { actionsIcons, navigationIcons } from "@reynard/fluent-icons";

// Registry system for extensibility
import { registerIconPackage, getIcon } from "@reynard/fluent-icons";

// Dynamic icon loading
const iconSvg = getIcon("save");
```

**Dependencies:**

- `@fluentui/svg-icons`: Microsoft's Fluent UI icon set
- `solid-js`: Reactive framework

### @reynard/components

UI components and primitives (existing package).

**Integration:**

- Uses `@reynard/themes` for consistent theming
- Uses `@reynard/fluent-icons` for icon integration
- Provides higher-level components for common use cases

## Theming System

### Architecture Overview

The theming system is built on three core principles:

1. **CSS Custom Properties**: Dynamic theme switching
2. **LCH Color Space**: Consistent color generation
3. **Unified Provider**: Single provider for both theming and i18n

### Theme Structure

```typescript
interface Theme {
  name: ThemeName;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    // ... more colors
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontSize: {
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}
```

### CSS Custom Properties

Each theme generates a comprehensive set of CSS custom properties:

```css
:root {
  /* Colors */
  --color-primary: lch(60% 0.15 250);
  --color-secondary: lch(70% 0.1 200);
  --color-background: lch(98% 0.01 250);
  --color-surface: lch(100% 0 0);
  --color-text: lch(20% 0.01 250);

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### Theme Utilities

The system provides utility functions for theme-specific calculations:

```typescript
// Tag colors based on theme
const bgColor = computeTagBackground("primary", "light");
const textColor = computeTagColor("primary", "light");

// Hover styles
const hoverStyles = computeHoverStyles("primary", "light");

// Animation properties
const animation = computeAnimation("fadeIn");
```

## Icon System

### Architecture Overview

The icon system is built on a registry-based architecture that supports:

1. **Multiple Icon Packages**: Fluent UI, custom icons, third-party packages
2. **Category Organization**: Icons grouped by purpose
3. **Dynamic Loading**: Icons loaded on demand
4. **Type Safety**: Full TypeScript support

### Registry System

```typescript
interface IconPackage {
  name: string;
  getIcon: (name: string) => string | undefined;
  getIconMetadata?: (name: string) => IconMetadata | undefined;
  getAllIcons?: () => string[];
}

interface IconMetadata {
  name: string;
  category: string;
  description?: string;
  tags?: string[];
  keywords?: string[];
}
```

### Icon Categories

Icons are organized into logical categories:

- **Actions**: Common actions (save, delete, edit)
- **Navigation**: UI navigation (home, back, forward)
- **Files**: File operations (upload, download, folder)
- **Status**: Status indicators (success, error, warning)
- **Media**: Media controls (play, pause, volume)
- **Interface**: UI elements (menu, settings, search)
- **Development**: Developer tools (code, debug, build)
- **Theme**: Theme-related icons (light, dark, color)
- **Animals**: Animal icons (including Reynard's fox)
- **Security**: Security-related icons (lock, shield, key)
- **Custom**: Reynard-specific custom icons

### Usage Patterns

```typescript
// Direct icon access
import { getIcon } from "@reynard/fluent-icons";
const saveIcon = getIcon("save");

// Category-based access
import { actionsIcons } from "@reynard/fluent-icons";
const saveIcon = actionsIcons.save;

// Metadata access
import { getIconMetadata } from "@reynard/fluent-icons";
const metadata = getIconMetadata("save");

// Package registration
import { registerIconPackage } from "@reynard/fluent-icons";
registerIconPackage(myIconPackage);
```

## Demo Applications

### reynard-icons-demo

A comprehensive demonstration of the icon system featuring:

- **Tab Navigation**: Browse, Search, Categories, and Stats tabs
- **Interactive Components**: Search, filtering, and statistics
- **Theme Integration**: Light/dark theme switching
- **Responsive Design**: Mobile-first approach

**Key Components:**

- `App.tsx`: Main application with tab navigation
- `BrowseSection.tsx`: Icon browsing interface
- `SearchSection.tsx`: Search functionality
- `CategoryStats.tsx`: Statistics display
- `ThemeToggle.tsx`: Theme switching

### Basic App Example

Demonstrates basic usage of the Reynard framework:

- **Unified Provider**: Single provider for theming and i18n
- **Icon Integration**: Fluent UI icons throughout
- **Theme Switching**: Light/dark mode toggle
- **Language Selection**: Multi-language support

### Chat Demo

Showcases advanced features in a chat application:

- **Real-time Updates**: WebSocket integration
- **Icon Reactions**: Fluent UI icons for reactions
- **Theme Consistency**: Consistent theming throughout
- **Responsive Design**: Mobile-friendly interface

### Multi-Theme Example

Demonstrates all available themes:

- **Theme Showcase**: All 8 built-in themes
- **Theme Cards**: Visual theme previews
- **Theme Switching**: Dynamic theme changes
- **Accessibility**: High contrast and reduced motion support

## Development Workflow

### Package Development

1. **Create Package**: Use the established package structure
2. **Configure Build**: Set up Vite, TypeScript, and Vitest
3. **Write Tests**: Comprehensive test coverage
4. **Document**: Clear README and API documentation
5. **Integrate**: Add to workspace and update dependencies

### Testing Strategy

Each package includes comprehensive tests:

- **Unit Tests**: Individual function testing
- **Integration Tests**: Component interaction testing
- **Coverage**: 80%+ code coverage requirement
- **E2E Tests**: End-to-end functionality testing

### Build Process

1. **Type Checking**: TypeScript compilation
2. **Testing**: Run all tests
3. **Building**: Vite build with optimization
4. **Documentation**: Generate API documentation
5. **Publishing**: Package publishing (when ready)

## Performance Considerations

### Bundle Optimization

- **Tree Shaking**: Only import used code
- **Code Splitting**: Separate chunks for different features
- **Lazy Loading**: Load resources on demand
- **Caching**: Efficient caching strategies

### Runtime Performance

- **SolidJS Signals**: Efficient reactivity
- **CSS Custom Properties**: Fast theme switching
- **Icon Caching**: Cached icon loading
- **Memoization**: Optimized re-renders

### Development Performance

- **Hot Reload**: Fast development iteration
- **TypeScript**: Fast type checking
- **Vite**: Fast build and dev server
- **ESLint**: Fast linting

## Migration Guide

### From yipyap

If migrating from yipyap:

1. **Replace Providers**: Use `ReynardProvider` instead of separate providers
2. **Update Imports**: Change import paths to `@reynard/*`
3. **Icon Migration**: Replace emoji icons with Fluent UI icons
4. **Theme Updates**: Update theme usage to new API
5. **Testing**: Update tests for new APIs

### From Other Frameworks

If migrating from other frameworks:

1. **Install Packages**: Add Reynard packages to dependencies
2. **Setup Provider**: Wrap app with `ReynardProvider`
3. **Update Components**: Use Reynard components and hooks
4. **Theme Migration**: Convert existing themes to Reynard format
5. **Icon Migration**: Replace existing icons with Fluent UI icons

## Future Roadmap

### Planned Features

- **Component Library**: Expanded UI component set
- **Animation System**: Advanced animation utilities
- **Form System**: Comprehensive form handling
- **Data Visualization**: Chart and graph components
- **Mobile Components**: Mobile-specific UI components

### Performance Improvements

- **Bundle Size**: Further optimization
- **Runtime Performance**: Enhanced reactivity
- **Development Experience**: Better tooling
- **Documentation**: Expanded guides and examples

## Contributing

### Development Setup

1. **Clone Repository**: Get the latest code
2. **Install Dependencies**: Run `npm install`
3. **Build Packages**: Run `npm run build`
4. **Run Tests**: Run `npm test`
5. **Start Development**: Run `npm run dev`

### Contribution Guidelines

1. **Follow Architecture**: Maintain established patterns
2. **Write Tests**: Add tests for new features
3. **Update Documentation**: Keep docs current
4. **Performance**: Consider performance impact
5. **Accessibility**: Ensure accessibility compliance

## License

MIT License - see LICENSE file for details.
