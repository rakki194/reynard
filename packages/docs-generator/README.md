# reynard-docs-generator

> **Automated documentation generator for Reynard packages** 🦊

Automatically generate beautiful documentation from your Reynard packages with TypeScript analysis, API extraction, and interactive examples.

## ✨ Features

### 🎯 **Core Capabilities**

- **Automatic Package Discovery**: Find and analyze all packages in your workspace
- **TypeScript Analysis**: Extract API documentation from TypeScript source code
- **Markdown Processing**: Process existing markdown documentation
- **Example Generation**: Create interactive code examples
- **Watch Mode**: Live regeneration on file changes
- **CLI Interface**: Easy-to-use command line tool

### 🔍 **Analysis Features**

- **Package Analysis**: Extract metadata from package.json files
- **API Documentation**: Generate comprehensive API docs from TypeScript
- **JSDoc Support**: Extract documentation from JSDoc comments
- **Type Information**: Full TypeScript type analysis
- **Dependency Tracking**: Analyze package dependencies

### 🎨 **Output Features**

- **Structured Data**: Generate JSON documentation data
- **Template System**: Customizable documentation templates
- **Multiple Formats**: Support for various output formats
- **Search Integration**: Generate searchable documentation
- **Navigation**: Automatic navigation structure generation

## 📦 Installation

```bash
npm install reynard-docs-generator
```

## 🚀 Quick Start

### Basic Usage

```bash
# Generate documentation once
npx reynard-docs-generator

# Watch for changes and regenerate
npx reynard-docs-generator --watch

# Use custom config file
npx reynard-docs-generator --config ./my-config.js
```

### Configuration

Create a `reynard-docs.config.js` file in your project root:

```javascript
export default {
  rootPath: process.cwd(),
  outputPath: "docs-generated",
  packages: [
    {
      name: "core",
      path: "./packages/core",
      category: "Core",
    },
    {
      name: "components",
      path: "./packages/components",
      category: "UI",
    },
    {
      name: "themes",
      path: "./packages/themes",
      category: "Styling",
    },
  ],
  site: {
    title: "My Reynard Documentation",
    description: "Beautiful documentation for my Reynard packages",
    baseUrl: "/",
  },
  theme: {
    name: "custom",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    accentColor: "#f59e0b",
  },
  navigation: {
    main: [
      { label: "Getting Started", href: "/getting-started" },
      { label: "Packages", href: "/packages" },
      { label: "API Reference", href: "/api" },
    ],
    breadcrumbs: true,
    sidebar: true,
  },
  search: {
    enabled: true,
    provider: "local",
    placeholder: "Search documentation...",
  },
};
```

### Programmatic Usage

```typescript
import { createDocGenerator } from "reynard-docs-generator";

const generator = createDocGenerator({
  rootPath: process.cwd(),
  outputPath: "docs-generated",
  packages: [
    {
      name: "my-package",
      path: "./packages/my-package",
      category: "Core",
    },
  ],
  site: {
    title: "My Documentation",
    description: "Generated documentation",
    baseUrl: "/",
  },
  theme: {
    name: "default",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    accentColor: "#f59e0b",
  },
  navigation: {
    main: [],
    breadcrumbs: true,
    sidebar: true,
  },
});

// Generate documentation
await generator.generate();

// Watch for changes
await generator.watch();
```

## 🔧 Configuration Options

### Package Configuration

```typescript
interface PackageConfig {
  name: string; // Package name
  path?: string; // Path to package directory
  pattern?: string; // Glob pattern to find packages
  category?: string; // Documentation category
  priority?: number; // Display priority
  include?: string[]; // Files to include
  exclude?: string[]; // Files to exclude
}
```

### Site Configuration

```typescript
interface SiteConfig {
  title: string; // Site title
  description: string; // Site description
  baseUrl: string; // Base URL for the site
  logo?: string; // Logo URL
  favicon?: string; // Favicon URL
}
```

### Theme Configuration

```typescript
interface ThemeConfig {
  name: string; // Theme name
  primaryColor: string; // Primary color
  secondaryColor: string; // Secondary color
  backgroundColor: string; // Background color
  textColor: string; // Text color
  accentColor: string; // Accent color
  fontFamily?: string; // Font family
  customCSS?: string; // Custom CSS
}
```

### Navigation Configuration

```typescript
interface NavigationConfig {
  main: NavItem[]; // Main navigation items
  footer?: NavItem[]; // Footer navigation items
  breadcrumbs?: boolean; // Show breadcrumbs
  sidebar?: boolean; // Show sidebar
}

interface NavItem {
  label: string; // Navigation label
  href?: string; // Navigation URL
  icon?: string; // Icon
  children?: NavItem[]; // Sub-navigation
  external?: boolean; // External link
  badge?: string; // Badge text
  color?: string; // Badge color
}
```

## 📚 Generated Documentation Structure

The generator creates a structured documentation site with:

```
docs-generated/
├── docs-config.json          # Main configuration
├── pages/                    # Individual pages
│   ├── package-name.json
│   ├── package-name-api.json
│   └── package-name-examples.json
├── sections/                 # Documentation sections
│   ├── core.json
│   ├── ui.json
│   └── styling.json
├── examples/                 # Code examples
│   ├── example-1.json
│   └── example-2.json
└── api/                      # API documentation
    ├── function-name.json
    └── class-name.json
```

## 🎯 API Documentation

The generator automatically extracts API documentation from TypeScript source code:

### Function Documentation

````typescript
/**
 * Creates a new notification
 * @param message - The notification message
 * @param type - The notification type
 * @param options - Additional options
 * @returns The notification ID
 * @example
 * ```typescript
 * const id = createNotification('Hello!', 'success');
 * ```
 * @since 1.0.0
 */
export function createNotification(
  message: string,
  type: "success" | "error" | "warning" | "info",
  options?: NotificationOptions,
): string {
  // Implementation
}
````

### Class Documentation

````typescript
/**
 * Manages application state
 * @example
 * ```typescript
 * const store = new StateManager();
 * store.set('user', { name: 'John' });
 * ```
 */
export class StateManager {
  /**
   * Set a value in the store
   * @param key - The key to set
   * @param value - The value to store
   */
  set<T>(key: string, value: T): void {
    // Implementation
  }
}
````

## 🔍 Search Integration

The generator creates searchable documentation with:

- **Full-text search** across all documentation
- **API search** for functions, classes, and types
- **Example search** for code examples
- **Tag-based filtering** for categorized content

## 🎨 Customization

### Custom Templates

Create custom templates for different documentation types:

```typescript
const generator = createDocGenerator({
  // ... other config
  templates: [
    {
      name: "custom-overview",
      path: "./templates/overview.hbs",
      type: "package-overview",
    },
    {
      name: "custom-api",
      path: "./templates/api.hbs",
      type: "api",
    },
  ],
});
```

### Custom Components

Register custom components for documentation:

```typescript
const generator = createDocGenerator({
  // ... other config
  customComponents: {
    MyCustomComponent: MyCustomComponent,
    InteractiveDemo: InteractiveDemo,
  },
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Bundle Size

- **Core generator**: ~45 kB (gzipped)
- **CLI tool**: ~35 kB (gzipped)
- **TypeScript analyzer**: ~25 kB (gzipped)
- **Total**: ~105 kB (gzipped)

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using TypeScript and modern web standards** 🦊
