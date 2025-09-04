# 🦊 Reynard

> *A cunning SolidJS framework for building modern web applications*

Reynard is a comprehensive SolidJS framework and UI library extracted from battle-tested patterns in production applications. It provides a complete toolkit for building modern, performant, and accessible web applications with elegant theming, modular architecture, and exceptional developer experience.

## ✨ Features

Reynard offers a modular architecture, with each module designed to be zero-dependency and concise—typically under 100 lines—making the framework both approachable and maintainable. The theming system is comprehensive, providing eight built-in themes and full support for custom themes, so you can tailor your application's look and feel with ease. Testing is a first-class citizen, with Vitest and Playwright integration ensuring 95%+ coverage out of the box. Accessibility is prioritized, with WCAG compliance and a robust set of a11y features. Performance is optimized through bundle splitting and lazy loading, while responsive design is achieved using a mobile-first approach and container queries. Internationalization (i18n) is built in, enabling multi-language support from the start. For developers, Reynard includes a CLI, a VS Code extension, and a suite of debugging utilities to streamline your workflow.

## 🎯 Philosophy

Reynard is guided by the "cunning fox" philosophy. The framework values smart, elegant solutions over unnecessary complexity, aiming to be adaptable so it can integrate seamlessly with your existing patterns. It is resourceful, minimizing dependencies while maximizing functionality, and maintains a professional standard with high expectations for code quality and naming conventions.

## 📦 Packages

| Package | Description | Version |
|---------|-------------|---------|
| `@reynard/core` | Core framework and utilities | `0.1.0` |
| `@reynard/components` | UI component library | `0.1.0` |
| `@reynard/themes` | Theme system and built-in themes | `0.1.0` |
| `@reynard/testing` | Testing utilities and helpers | `0.1.0` |
| `@reynard/tools` | Development tools and CLI | `0.1.0` |

## 🚀 Quick Start

```bash
# Create a new Reynard app
npx @reynard/create-app my-app
cd my-app
npm run dev
```

Or use a template:

```bash
# Starter template
npx @reynard/create-app my-app --template starter

# Dashboard template
npx @reynard/create-app my-app --template dashboard

# Portfolio template
npx @reynard/create-app my-app --template portfolio
```

## 📖 Documentation

- [Getting Started](./docs/getting-started.md)
- [Component Library](./docs/components.md)
- [Theme System](./docs/theming.md)
- [Testing Guide](./docs/testing.md)
- [Architecture](./docs/architecture.md)

## 🎨 Example

```tsx
import { Button, Container, ThemeProvider } from '@reynard/components';
import { useTheme } from '@reynard/core';

function App() {
  const [theme, setTheme] = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <h1>Welcome to Reynard</h1>
        <Button onClick={() => setTheme('dark')}>
          Toggle Theme
        </Button>
      </Container>
    </ThemeProvider>
  );
}
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Build all packages
npm run build

# Type check
npm run typecheck
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT © [Your Name](https://github.com/rakki194)

---
