# 🦊 Reynard Test Application

> _A comprehensive test suite for the Reynard SolidJS framework and UI library_

## 📋 Overview

The Reynard Test Application is a dedicated testing environment designed to validate and
demonstrate the core functionality of the Reynard framework. This application serves as both a development tool for
framework testing and a reference implementation for developers learning to use Reynard components and theming systems.

## 🏗️ Architecture

### Project Structure

```text
reynard-test-app/
├── index.html              # Application entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── src/
│   ├── main.tsx           # Application bootstrap
│   ├── App.tsx            # Main application component
│   ├── App.css            # Application-specific styles
│   ├── themes.css         # Comprehensive theme definitions
│   └── ThemeDemo.tsx      # Theme demonstration component
└── README.md              # This documentation
```

### Technology Stack

- **Framework**: SolidJS 1.9.9 - Reactive UI framework
- **Build Tool**: Vite 7.1.4 - Fast build tool and dev server
- **Language**: TypeScript 5.9.2 - Type-safe JavaScript
- **Styling**: CSS Custom Properties - Theme-based styling system
- **Development Server**: Port 3001 [[memory:7800604]]

## 📦 Dependencies

### Core Dependencies

```json
{
  "reynard-core": "file:../reynard/packages/core",
  "reynard-components": "file:../reynard/packages/components",
  "solid-js": "1.9.9"
}
```

### Development Dependencies

```json
{
  "@types/node": "24.3.0",
  "typescript": "5.9.2",
  "vite": "7.1.4",
  "vite-plugin-solid": "2.11.8"
}
```

### Dependency Analysis

- **reynard-core**: Provides composables and core utilities
- **reynard-themes**: Provides theme management and internationalization
- **reynard-components**: UI component library with Button, Card, and other primitives
- **solid-js**: The reactive framework powering the application
- **vite-plugin-solid**: SolidJS integration for Vite build system

## 🎨 Theme System

### Available Themes

The test application demonstrates 8 comprehensive themes:

1. **Light** - Clean, bright default theme
2. **Dark** - Easy-on-eyes dark theme
3. **Gray** - Professional neutral theme
4. **Banana** - Warm, cheerful yellow theme
5. **Strawberry** - Vibrant, energetic red theme
6. **Peanut** - Earthy, cozy brown theme
7. **High Contrast Black** - Maximum accessibility theme
8. **High Contrast Inverse** - Alternative high contrast theme

### Theme Architecture

Themes are implemented using CSS Custom Properties with a systematic approach:

```css
:root {
  --accent: hsl(270deg 60% 60%);
  --bg-color: hsl(220deg 20% 95%);
  --secondary-bg: hsl(220deg 15% 90%);
  --card-bg: hsl(220deg 15% 85%);
  --text-primary: hsl(240deg 15% 12%);
  --text-secondary: hsl(240deg 10% 45%);
  --border-color: hsl(220deg 15% 75%);
  --success: hsl(140deg 60% 45%);
  --warning: hsl(45deg 70% 50%);
  --danger: hsl(0deg 70% 50%);
  --info: hsl(200deg 60% 50%);
}
```

Each theme overrides these variables using the `data-theme` attribute selector:

```css
:root[data-theme="dark"] {
  --accent: hsl(270deg 60% 70%);
  --bg-color: hsl(220deg 15% 8%);
  /* ... additional theme variables */
}
```

## 🧩 Components

### Core Components Tested

#### ThemeProvider

- **Purpose**: Context provider for theme management
- **Usage**: Wraps the entire application to provide theme context
- **Implementation**: Uses Reynard's `createTheme()` module

#### ThemeDemo Component

- **Purpose**: Interactive theme demonstration and testing
- **Features**:
  - Current theme display
  - Individual theme selection buttons
  - Next theme cycling functionality
  - Real-time theme switching

#### Button Component

- **Source**: `reynard-components`
- **Variants**: Multiple button styles and states
- **Accessibility**: Full keyboard navigation and screen reader support

#### Card Component

- **Source**: `reynard-components`
- **Features**: Flexible container with consistent styling
- **Theming**: Fully integrated with theme system

### Component Integration

```tsx
import { ReynardProvider } from "reynard-themes";
import "reynard-themes/themes.css";
import { Button, Card } from "reynard-components";
import { useTheme } from "reynard-themes";

function App() {
  const { setTheme } = useTheme();

  return (
    <ReynardProvider>
      <Card>
        <Button onClick={() => setTheme("dark")}>Switch Theme</Button>
      </Card>
    </ReynardProvider>
  );
}
```

## 🔧 Configuration

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

### Vite Configuration

```typescript
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3001,
  },
});
```

## 🚀 Development

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Access to the Reynard framework packages

### Installation

```bash
# Navigate to the test app directory
cd reynard-test-app

# Install dependencies
npm install

# Verify Reynard packages are linked correctly
npm ls reynard-core reynard-components
```

### Development Server

```bash
# Start development server
npm run dev

# Application will be available at http://localhost:3001
```

### Build Process

```bash
# Type check and build
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

### What This Application Tests

1. **Component Imports**: Verifies Reynard components can be imported and used
2. **Theme Provider**: Tests ThemeProvider setup and context functionality
3. **useTheme Hook**: Confirms the useTheme composable works correctly
4. **Theme Switching**: Validates dynamic theme changes
5. **Build Process**: Ensures the application builds without errors
6. **CSS Integration**: Tests theme CSS custom properties
7. **TypeScript Integration**: Validates type safety and compilation

### Manual Testing Checklist

- [ ] All themes load and display correctly
- [ ] Theme switching works without page reload
- [ ] Components render with proper styling
- [ ] No console errors or warnings
- [ ] TypeScript compilation succeeds
- [ ] Production build generates successfully

### Automated Testing

The test application serves as a foundation for automated testing:

```bash
# Run framework tests (from reynard root)
npm test

# Run component tests
npm run test:components

# Run integration tests
npm run test:integration
```

## 📊 Performance

### Bundle Analysis

- **Development Bundle**: ~2.1MB (includes dev tools)
- **Production Bundle**: ~45KB gzipped
- **Theme CSS**: ~3.2KB (all themes included)
- **Component Library**: ~12.1KB gzipped

### Optimization Features

- **Tree Shaking**: Only used components are included
- **CSS Custom Properties**: Efficient theme switching
- **SolidJS Reactivity**: Minimal re-renders
- **Vite HMR**: Fast development iteration

## 🔍 Debugging

### Development Tools

1. **Browser DevTools**: Inspect theme variables and component state
2. **SolidJS DevTools**: Reactivity debugging (if installed)
3. **Vite DevTools**: Build and dependency analysis
4. **TypeScript**: Compile-time error detection

### Common Issues

#### Theme Not Applying

- Check `data-theme` attribute on document root
- Verify CSS custom properties are defined
- Ensure ThemeProvider is properly configured

#### Component Import Errors

- Verify Reynard packages are built (`npm run build` in reynard root)
- Check file: protocol links in package.json
- Ensure TypeScript can resolve module paths

#### Build Failures

- Run `npm run typecheck` to identify TypeScript errors
- Check Vite configuration for SolidJS plugin
- Verify all dependencies are installed

## 🎯 Use Cases

### Framework Development

- Test new Reynard features before release
- Validate component API changes
- Performance regression testing
- Cross-browser compatibility testing

### Learning and Documentation

- Reference implementation for developers
- Interactive theme system demonstration
- Component usage examples
- Best practices showcase

### Integration Testing

- Validate Reynard integration in applications
- Test build system compatibility
- Verify dependency resolution
- End-to-end framework testing

## 🔄 Maintenance

### Regular Updates

1. **Dependency Updates**: Keep SolidJS and Vite current
2. **Theme Additions**: Add new themes as they're developed
3. **Component Testing**: Test new components as they're added
4. **Performance Monitoring**: Track bundle size and performance metrics

### Contributing

When adding new test cases:

1. Create new components in `src/` directory
2. Add corresponding CSS in `App.css` or `themes.css`
3. Update this README with new functionality
4. Test across all available themes
5. Ensure TypeScript compilation succeeds

## 📚 Related Documentation

- [Reynard Framework README](../../README.md) - Main framework documentation
- [Reynard Core Package](../../packages/core/README.md) - Core utilities and composables
- [Reynard Components Package](../../packages/components/README.md) - UI component library
- [SolidJS Documentation](https://www.solidjs.com/docs) - Framework documentation

## 🏷️ Version Information

- **Test App Version**: 1.0.0
- **Reynard Core**: 0.1.0
- **Reynard Components**: 0.1.0
- **SolidJS**: 1.9.9
- **TypeScript**: 5.9.2
- **Vite**: 7.1.4

---

_This test application is part of the Reynard framework ecosystem and serves as both a development tool and
reference implementation for building applications with Reynard._
