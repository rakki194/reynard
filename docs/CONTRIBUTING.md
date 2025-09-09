# 🤝 Contributing to Reynard

We welcome contributions to the Reynard framework! This guide will help you get started with development, understand our processes, and contribute effectively.

## 🦊 Development Philosophy

Reynard follows the "cunning fox" philosophy:

- **Smart Solutions** - Elegant solutions over unnecessary complexity
- **Modular Design** - Independent, reusable components
- **Performance First** - Optimized for speed and efficiency
- **Type Safety** - Full TypeScript coverage
- **Accessibility** - WCAG 2.1 compliance
- **Professional Standards** - High expectations for code quality

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and pnpm
- **Git** for version control
- **TypeScript** knowledge
- **SolidJS** experience (helpful but not required)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/rakki194/reynard.git
cd reynard

# Install dependencies
pnpm install

# Start development
pnpm run dev

# Run tests
pnpm test

# Build all packages
pnpm run build

# Type check
pnpm run typecheck
```

### Project Structure

```plaintext
reynard/
├── packages/           # Individual Reynard packages
│   ├── core/          # Core utilities and modules
│   ├── components/    # UI component library
│   ├── chat/          # Chat messaging system
│   ├── rag/           # RAG system components
│   └── ...            # Other packages
├── examples/          # Example applications
├── templates/         # Project templates
├── docs/              # Documentation
├── scripts/           # Development scripts
└── tests/             # Test files
```

## 🛠️ Development Workflow

### Creating a New Package

1. **Create Package Directory**

   ```bash
   mkdir packages/my-new-package
   cd packages/my-new-package
   ```

2. **Initialize Package**

   ```bash
   pnpm init
   ```

3. **Set Up Package Structure**

   ```plaintext
   my-new-package/
   ├── src/
   │   ├── index.ts
   │   ├── components/
   │   └── utils/
   ├── package.json
   ├── tsconfig.json
   └── README.md
   ```

4. **Configure Package.json**

   ```json
   {
     "name": "reynard-my-new-package",
     "version": "0.1.0",
     "description": "Description of your package",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch",
       "test": "vitest"
     },
     "dependencies": {
       "solid-js": "^1.8.0"
     },
     "devDependencies": {
       "typescript": "^5.0.0",
       "vitest": "^1.0.0"
     }
   }
   ```

### Package Development Standards

#### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### Code Style

- **TypeScript** - Full type safety with strict mode
- **ESLint** - Code linting with SolidJS-specific rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality assurance

#### Naming Conventions

- **Packages**: `reynard-*` (unscoped)
- **Components**: PascalCase (`MyComponent`)
- **Functions**: camelCase (`myFunction`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Types**: PascalCase (`MyType`)

### Component Development

#### Component Structure

```tsx
import { Component, createSignal } from "solid-js";
import { useTheme } from "reynard-themes";

interface MyComponentProps {
  title: string;
  variant?: "primary" | "secondary";
  onAction?: () => void;
}

export const MyComponent: Component<MyComponentProps> = (props) => {
  const { theme } = useTheme();
  const [isActive, setIsActive] = createSignal(false);

  return (
    <div
      class={`my-component my-component--${props.variant || "primary"}`}
      data-theme={theme()}
    >
      <h3>{props.title}</h3>
      <button
        onClick={() => {
          setIsActive(!isActive());
          props.onAction?.();
        }}
        aria-pressed={isActive()}
      >
        {isActive() ? "Active" : "Inactive"}
      </button>
    </div>
  );
};
```

#### Component Requirements

1. **TypeScript** - Full type safety
2. **Accessibility** - ARIA labels and keyboard navigation
3. **Theming** - Support for Reynard themes
4. **Responsive** - Mobile-first design
5. **Testing** - Unit and integration tests

### Testing Standards

#### Unit Tests

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "reynard-testing";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders with correct title", () => {
    render(() => <MyComponent title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleAction = vi.fn();
    render(() => <MyComponent title="Test" onAction={handleAction} />);

    await userEvent.click(screen.getByRole("button"));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
```

#### Integration Tests

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "reynard-testing";
import { App } from "./App";

describe("App Integration", () => {
  it("renders complete application", () => {
    render(() => <App />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
```

### Documentation Standards

#### Package Documentation

Each package should include:

1. **README.md** - Package overview and usage
2. **API Documentation** - Complete API reference
3. **Examples** - Working code examples
4. **Changelog** - Version history

#### Documentation Format

````markdown
# Package Name

Brief description of the package.

## Installation

```bash
pnpm install reynard-package-name
```
````

## Usage

```tsx
import { Component } from "reynard-package-name";

function App() {
  return <Component prop="value" />;
}
```

## API Reference

### Component

| Prop | Type   | Default | Description         |
| ---- | ------ | ------- | ------------------- |
| prop | string | -       | Description of prop |

## Examples

[Link to examples]

## Changelog

### 0.1.0

- Initial release

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in UI mode
pnpm test:ui

# Run specific test file
pnpm test MyComponent.test.tsx

# Run tests in watch mode
pnpm test:watch
```

### Test Coverage

- **Minimum Coverage**: 80%
- **Critical Paths**: 95%
- **New Code**: 90%

### Testing Tools

- **Vitest** - Test runner and framework
- **@testing-library/solid** - Component testing utilities
- **Playwright** - End-to-end testing
- **MSW** - API mocking

## 📦 Package Management

### Adding Dependencies

```bash
# Add production dependency
pnpm install package-name

# Add development dependency
pnpm install -D package-name

# Add peer dependency
pnpm install -P package-name
```

### Version Management

- **Semantic Versioning** - Follow semver principles
- **Changelog** - Document all changes
- **Breaking Changes** - Clearly mark breaking changes

### Publishing

```bash
# Build package
pnpm run build

# Run tests
pnpm test

# Publish to npm
pnpm publish
```

## 🔄 Pull Request Process

### Before Submitting

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests for new functionality
5. **Update** documentation
6. **Run** all tests and linting

### Pull Request Template

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks** - CI/CD pipeline runs
2. **Code Review** - Team members review code
3. **Testing** - Manual testing if needed
4. **Approval** - Maintainer approval required
5. **Merge** - Changes merged to main branch

## 🐛 Bug Reports

### Bug Report Template

```markdown
## Bug Description

Clear description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Environment

- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Reynard Version: [e.g. 0.1.0]

## Additional Context

Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description

Clear description of the feature.

## Use Case

Why is this feature needed?

## Proposed Solution

How should this feature work?

## Alternatives Considered

What other solutions have you considered?

## Additional Context

Any other context about the feature request.
```

## 📚 Learning Resources

### SolidJS

- [SolidJS Documentation](https://www.solidjs.com/)
- [SolidJS Tutorial](https://www.solidjs.com/tutorial)
- [SolidJS Examples](https://github.com/solidjs/solid-examples)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Testing

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)

## 🏗️ Architecture Guidelines

### Package Design

1. **Single Responsibility** - Each package has one clear purpose
2. **Minimal Dependencies** - Keep dependencies to a minimum
3. **Type Safety** - Full TypeScript coverage
4. **Tree Shaking** - Support for tree shaking
5. **Accessibility** - WCAG 2.1 compliance

### Component Design

1. **Composition** - Prefer composition over inheritance
2. **Props Interface** - Clear, typed prop interfaces
3. **Default Values** - Sensible defaults for all props
4. **Event Handling** - Consistent event handling patterns
5. **Styling** - CSS custom properties for theming

### State Management

1. **Signals** - Use SolidJS signals for reactive state
2. **Context** - Use context for shared state
3. **Local Storage** - Persist user preferences
4. **Cleanup** - Proper cleanup of resources

## 🎯 Contribution Areas

### High Priority

- **Bug Fixes** - Fix existing issues
- **Documentation** - Improve documentation
- **Tests** - Add missing tests
- **Performance** - Optimize performance

### Medium Priority

- **New Components** - Add useful components
- **Examples** - Create example applications
- **Templates** - Add project templates
- **Tools** - Development tools

### Low Priority

- **Experimental Features** - Proof of concepts
- **Nice-to-Have** - Quality of life improvements
- **Refactoring** - Code improvements

## 📞 Getting Help

### Community

- **GitHub Discussions** - Ask questions and discuss ideas
- **Discord** - Real-time chat and support
- **GitHub Issues** - Bug reports and feature requests

### Documentation

- **[Overview](./overview.md)** - Framework overview
- **[Quick Start](./quickstart.md)** - Getting started guide
- **[Tutorial](./tutorial.md)** - Complete tutorial
- **[API Reference](./api.md)** - Complete API documentation

## 🏆 Recognition

Contributors are recognized in:

- **README** - Contributor list
- **Changelog** - Contribution credits
- **Release Notes** - Feature acknowledgments
- **Documentation** - Contributor profiles

## 📄 License

By contributing to Reynard, you agree that your contributions will be licensed under the MIT License.

---

_Thank you for contributing to Reynard! Together, we're building something amazing._ 🦊
