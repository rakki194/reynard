# 🚀 Reynard Quick Start Guide

Get up and running with Reynard in minutes! This guide will help you install the framework and create your first application.

## Installation

### Core Package Installation

```bash
# Install core package
npm install reynard-core solid-js

# Install additional packages as needed
npm install reynard-components reynard-chat reynard-rag reynard-auth reynard-charts

# For caption generation workflows
npm install reynard-annotating reynard-caption
```

### Development Dependencies

```bash
# Install development dependencies
npm install -D vite vite-plugin-solid typescript @types/node
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

### Vite Configuration

Create a `vite.config.ts` file:

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

### TypeScript Configuration

Create a `tsconfig.json` file:

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
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### HTML Entry Point

Create an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Reynard App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Application Entry Point

Create `src/main.tsx`:

```tsx
import { render } from "solid-js/web";
import "./themes.css";
import App from "./App";

render(() => <App />, document.getElementById("root")!);
```

### Basic Theme Setup

Create `src/themes.css`:

```css
/* Light Theme (Default) */
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

/* Dark Theme */
:root[data-theme="dark"] {
  --accent: hsl(270deg 60% 70%);
  --bg-color: hsl(220deg 15% 8%);
  --secondary-bg: hsl(220deg 15% 12%);
  --card-bg: hsl(220deg 15% 16%);
  --text-primary: hsl(220deg 20% 95%);
  --text-secondary: hsl(220deg 15% 70%);
  --border-color: hsl(220deg 15% 24%);
}
```

## Running Your Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Common Patterns

### Using Notifications

```tsx
import { useNotifications } from "reynard-core";

function MyComponent() {
  const { notify } = useNotifications();

  const handleSuccess = () => {
    notify("Operation completed successfully!", "success");
  };

  const handleError = () => {
    notify("Something went wrong!", "error");
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
}
```

### Using Local Storage

```tsx
import { useLocalStorage } from "reynard-core";

function MyComponent() {
  const [count, setCount] = useLocalStorage("counter", 0);

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Using Themes

```tsx
import { useTheme } from "reynard-themes";

function ThemeToggle() {
  const { theme, setTheme, nextTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme()}</p>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={nextTheme}>Next Theme</button>
    </div>
  );
}
```

### Using Components

```tsx
import { Button, Card, TextField } from "reynard-components";

function MyForm() {
  return (
    <Card padding="lg">
      <TextField 
        label="Email" 
        type="email" 
        placeholder="Enter your email" 
      />
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Card>
  );
}
```

## Next Steps

Now that you have a basic Reynard application running:

1. **[Complete Tutorial](./tutorial.md)** - Build a comprehensive todo application
2. **[Package Documentation](./packages.md)** - Explore all available packages
3. **[Examples and Templates](./examples.md)** - See real-world applications
4. **[API Reference](./api.md)** - Detailed API documentation

## Troubleshooting

### Common Issues

**Build Errors**: Make sure you have the correct TypeScript configuration and all dependencies installed.

**Theme Not Working**: Ensure you've imported the theme CSS file and are using the `ReynardProvider`.

**Components Not Rendering**: Check that you've installed the required packages and imported them correctly.

### Getting Help

- Check the [API Reference](./api.md) for detailed documentation
- Look at [Examples](./examples.md) for working code samples
- Review the [Contributing Guide](./contributing.md) for development setup

---

*Ready to build something amazing with Reynard? Let's get started!* 🦊
