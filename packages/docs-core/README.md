# reynard-docs-core

> **Core documentation rendering engine for Reynard framework** 🦊

The foundational package that powers beautiful documentation rendering using the Reynard framework itself. This package
provides the core parsing, rendering, and engine capabilities for building stunning documentation sites.

## ✨ Features

### 🎯 **Core Capabilities**

- **Markdown Parsing**: Advanced markdown parsing with syntax highlighting
- **MDX Support**: React/SolidJS components in markdown
- **API Documentation**: Automatic API documentation generation
- **Code Examples**: Interactive code examples with live editing
- **Search Engine**: Built-in search functionality
- **Plugin System**: Extensible plugin architecture

### 🎨 **Rendering Features**

- **Custom Renderers**: Pluggable renderer system
- **Theme Integration**: Seamless integration with Reynard themes
- **Responsive Design**: Mobile-first documentation layouts
- **Accessibility**: WCAG 2.1 compliant documentation
- **Performance**: Optimized rendering with lazy loading

### ⚡ **Developer Experience**

- **TypeScript First**: Complete type safety
- **Hot Reloading**: Live documentation updates
- **Component Integration**: Use Reynard components in docs
- **Custom Components**: Register custom documentation components

## 📦 Installation

```bash
npm install reynard-docs-core solid-js
```

## 🚀 Quick Start

### Basic Documentation Engine

```tsx
import { createDocEngine, defaultDocConfig } from "reynard-docs-core";
import { DocRenderer } from "reynard-docs-core/renderer";

// Create documentation engine
const docEngine = createDocEngine({
  ...defaultDocConfig,
  site: {
    title: "My Documentation",
    description: "Beautiful docs with Reynard",
    baseUrl: "/",
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
        { label: "API Reference", href: "/api" },
      ],
    },
  },
  pages: [
    {
      id: "getting-started",
      slug: "getting-started",
      title: "Getting Started",
      content: "# Welcome to Reynard\n\nThis is your documentation!",
      metadata: {
        title: "Getting Started",
        description: "Learn how to get started with Reynard",
      },
      type: "markdown",
    },
  ],
});

// Render documentation
function MyDocs() {
  const page = docEngine.getPage("getting-started");
  const Renderer = docEngine.render(page!);

  return <Renderer />;
}
```

### Markdown Parsing

```tsx
import { ContentParser } from "reynard-docs-core/parser";

const parser = new ContentParser();

// Parse markdown content
const page = parser.parse(
  `
---
title: "My Page"
description: "A sample page"
tags: ["tutorial", "beginner"]
---

# Hello World

This is a **markdown** page with frontmatter.

\`\`\`tsx
function MyComponent() {
  return <div>Hello from Reynard!</div>;
}
\`\`\`
`,
  "markdown"
);

console.log(page.title); // "My Page"
console.log(page.metadata.tags); // ["tutorial", "beginner"]
```

### Custom Renderer

```tsx
import { DocRenderer } from "reynard-docs-core/renderer";

function CustomDocRenderer(props) {
  return (
    <div class="my-custom-docs">
      <DocRenderer
        content={props.content}
        metadata={props.metadata}
        type={props.type}
        onNavigate={path => {
          // Handle navigation
          console.log("Navigate to:", path);
        }}
        onCodeRun={code => {
          // Handle code execution
          console.log("Run code:", code);
        }}
      />
    </div>
  );
}
```

### Code Examples

```tsx
import { CodeExampleRenderer } from "reynard-docs-core/renderer";

const example = {
  id: "button-example",
  title: "Button Component",
  description: "A simple button example",
  code: `
import { Button } from 'reynard-components';

function App() {
  return (
    <Button variant="primary" onClick={() => alert('Hello!')}>
      Click me
    </Button>
  );
}
  `,
  language: "tsx",
  live: true,
  editable: true,
};

function ExamplePage() {
  return (
    <CodeExampleRenderer
      example={example}
      onRun={code => {
        // Execute the code
        eval(code);
      }}
    />
  );
}
```

### API Documentation

```tsx
import { ApiDocRenderer } from "reynard-docs-core/renderer";

const apiDoc = {
  name: "useNotifications",
  type: "function",
  description: "Hook for managing toast notifications",
  parameters: [
    {
      name: "options",
      type: "NotificationOptions",
      description: "Configuration options for notifications",
      required: false,
      default: "{}",
    },
  ],
  returns: {
    type: "NotificationManager",
    description: "Object with notification methods",
  },
  examples: [
    {
      id: "basic-usage",
      title: "Basic Usage",
      code: `
const { notify } = useNotifications();

notify('Hello World!', 'success');
      `,
      language: "tsx",
    },
  ],
};

function ApiPage() {
  return <ApiDocRenderer api={apiDoc} />;
}
```

### Search Functionality

```tsx
import { createDocEngine } from "reynard-docs-core";

const docEngine = createDocEngine(config);

// Search documentation
const results = docEngine.search("button component");

console.log(results); // Array of matching pages

// Get related pages
const related = docEngine.getRelatedPages("button-example", 3);

// Get breadcrumbs
const breadcrumbs = docEngine.getBreadcrumbs("button-example");
```

### Plugin System

```tsx
import { DocPlugin } from "reynard-docs-core";

const customPlugin: DocPlugin = {
  name: "custom-plugin",
  version: "1.0.0",
  install: engine => {
    // Add custom functionality
    console.log("Custom plugin installed!");
  },
  uninstall: engine => {
    // Cleanup
    console.log("Custom plugin uninstalled!");
  },
};

// Add plugin to engine
docEngine.addPlugin(customPlugin);
```

## 🎨 Theming

The documentation engine integrates seamlessly with Reynard's theming system:

```tsx
import { useTheme } from "reynard-themes";

function ThemedDocs() {
  const { theme } = useTheme();

  return (
    <div class={`docs docs--${theme()}`}>
      <DocRenderer {...props} />
    </div>
  );
}
```

## 🔧 Advanced Configuration

### Custom Components

```tsx
const config = {
  // ... other config
  customComponents: {
    MyCustomComponent: MyCustomComponent,
    InteractiveDemo: InteractiveDemo,
  },
};
```

### Custom Parsers

```tsx
import { ContentParser } from "reynard-docs-core/parser";

class CustomParser extends ContentParser {
  parse(content: string, type: DocContentType): DocPage {
    if (type === "custom") {
      // Handle custom content type
      return this.parseCustomContent(content);
    }
    return super.parse(content, type);
  }
}
```

## 🧪 Testing

```bash
npm test
npm run test:coverage
```

## 📦 Bundle Size

- **Core engine**: ~25 kB (gzipped)
- **Parser**: ~15 kB (gzipped)
- **Renderer**: ~20 kB (gzipped)
- **Total**: ~60 kB (gzipped)

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

---

**Built with ❤️ using SolidJS and modern web standards** 🦊
