# 🚀 Reynard Quick Start Guide

Get up and running with Reynard in minutes! This guide will help you install the framework and create your first application.

## Installation

See [Shared Installation Guides](./shared/installation-guides.md) for detailed setup instructions.

### Quick Install

```bash
# Install core packages
pnpm install reynard-core reynard-components solid-js

# Install development dependencies
pnpm install -D vite vite-plugin-solid typescript @types/node
```

## Basic Usage

### Simple Application Setup

Create a basic Reynard application with just a few lines of code:

```tsx
import { createSignal } from "solid-js";
import { useNotifications } from "reynard-core";
import { useTheme } from "reynard-themes";
import { Button, Card } from "reynard-components";

function App() {
  const { theme, setTheme } = useTheme();
  const { notify } = useNotifications();

  const handleClick = () => {
    notify("Hello from Reynard!", "success");
    setTheme(theme() === "light" ? "dark" : "light");
  };

  return (
    <Card padding="lg">
      <h1>Welcome to Reynard!</h1>
      <Button variant="primary" onClick={handleClick}>
        Toggle Theme
      </Button>
    </Card>
  );
}
```

### Configuration Files

See [Shared Configuration Examples](./shared/configuration-examples.md) for complete configuration templates.

**Required files:**

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration  
- `index.html` - HTML entry point
- `src/main.tsx` - Application entry point
- `src/themes.css` - Theme variables

## Running Your Application

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Common Patterns

See [Complete Tutorial](./tutorial.md) for comprehensive examples and patterns.

### Quick Examples

```tsx
// Notifications
const { notify } = useNotifications();
notify("Hello from Reynard!", "success");

// Local Storage
const [count, setCount] = useLocalStorage("counter", 0);

// Themes
const { theme, setTheme, nextTheme } = useTheme();
```

## Next Steps

1. **[Complete Tutorial](./tutorial.md)** - Build a comprehensive application
2. **[Package Documentation](./packages.md)** - Explore all available packages
3. **[Examples and Templates](./examples.md)** - See real-world applications
4. **[Framework Overview](./README.md)** - Learn about Reynard's architecture

## Troubleshooting

See [Shared Installation Guides](./shared/installation-guides.md) for common issues and solutions.

---

_Ready to build something amazing with Reynard? Let's get started!_ 🦊
