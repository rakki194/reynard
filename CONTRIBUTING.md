# 🤝 Contributing to Reynard

Thank you for your interest in contributing to Reynard! This guide will help you get started with contributing to
our cunning SolidJS framework.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic knowledge of TypeScript and SolidJS
- Understanding of the 140-line axiom (see [Modularity Standards](#-modularity-standards))

### Development Setup

```bash
# Clone the repository
git clone https://github.com/rakki194/reynard.git
cd reynard

# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test
```

## 📋 Development Workflow

### 1. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-description
```

### 2. Make Changes

Follow our coding standards and modularity guidelines (see below).

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run formatting check
npm run format:check
```

### 4. Commit Your Changes

```bash
# Add your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add new component for user authentication"
```

### 5. Push and Create PR

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

## Modularity Standards

Reynard follows the **140-line axiom** for maintainable code. This is enforced automatically through ESLint rules and
pre-commit hooks.

### File Size Limits

| File Type            | Max Lines | Max Function Lines | Purpose                 | ESLint Pattern                                                              |
| -------------------- | --------- | ------------------ | ----------------------- | --------------------------------------------------------------------------- |
| **TypeScript (.ts)** | 140       | 50                 | Core business logic     | `**/*.{ts,tsx}`                                                             |
| **SolidJS (.tsx)**   | 140       | 50                 | React components        | `**/*.{tsx,jsx}`                                                            |
| **Test Files**       | 200       | 100                | Comprehensive testing   | `**/*.test.{ts,tsx}`, `**/__tests__/**/*.{ts,tsx}`, `**/test/**/*.{ts,tsx}` |
| **JavaScript (.js)** | None      | None               | Legacy/config files     | Base config only                                                            |
| **Config Files**     | None      | None               | Setup and configuration | `**/*.config.js`, `**/*.config.mjs`                                         |
| **Documentation**    | 200       | N/A                | Guides and references   | Not enforced by ESLint                                                      |

### Refactoring Patterns

When files exceed these limits, use these proven patterns:

#### Factory Pattern

For classes handling multiple types or variants:

```typescript
// Before: Single large class (500+ lines)
class FileProcessor {
  processImage() {
    /* ... */
  }
  processVideo() {
    /* ... */
  }
  processAudio() {
    /* ... */
  }
}

// After: Specialized processors
class ImageProcessor {
  /* ... */
}
class VideoProcessor {
  /* ... */
}
class AudioProcessor {
  /* ... */
}

// Main file: Re-export from modules
export { ImageProcessor } from "./image-processor";
export { VideoProcessor } from "./video-processor";
export { AudioProcessor } from "./audio-processor";
```

#### Composable Pattern

For composables with multiple concerns:

```typescript
// Before: Single large composable (500+ lines)
export function useChat() {
  // Connection logic (200 lines)
  // Message handling (200 lines)
  // File upload (100 lines)
}

// After: Focused composables
export function useChatConnection() {
  /* ... */
}
export function useChatMessages() {
  /* ... */
}
export function useChatFileUpload() {
  /* ... */
}

// Main composable: Orchestrate focused composables
export function useChat() {
  const connection = useChatConnection();
  const messages = useChatMessages();
  const fileUpload = useChatFileUpload();

  return { connection, messages, fileUpload };
}
```

### ESLint Configuration Details

The max-lines rules are configured differently for each file type:

**TypeScript/SolidJS Files**:

```javascript
"max-lines": ["error", {
  max: 140,
  skipBlankLines: true,
  skipComments: true
}],
"max-lines-per-function": ["error", {
  max: 50,
  skipBlankLines: true,
  skipComments: true
}]
```

**Test Files**:

```javascript
"max-lines": ["error", {
  max: 200,
  skipBlankLines: true,
  skipComments: true
}],
"max-lines-per-function": ["error", {
  max: 100,
  skipBlankLines: true,
  skipComments: true
}]
```

**JavaScript Files**: No max-lines enforcement (legacy support)

**Config Files**: No max-lines enforcement (Node.js environment)

### Enforcement

- **ESLint Rules**: Automatic linting with `max-lines` and `max-lines-per-function`
- **Pre-commit Hooks**: Line count validation before commits (100 lines for source, 200 for tests)
- **CI/CD**: Build failures on violations
- **Code Reviews**: Manual verification during reviews

### Line Counting Logic

ESLint counts lines using this logic:

- ✅ **Counts**: Actual code lines
- ❌ **Excludes**: Blank lines (`^\s*$`)
- ❌ **Excludes**: Single-line comments (`^\s*//`)
- ❌ **Excludes**: Multi-line comments (`^\s*/\*`, `^\s*\*`)

For detailed refactoring guidelines, see [Modularity Patterns](../docs/architecture/modularity-patterns.md).

## 🎨 Code Style

### TypeScript

- Use strict TypeScript with full type annotations
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Use underscore prefix for unused variables (`_unusedVar`)

### SolidJS

- Follow SolidJS best practices for reactivity
- Use proper component patterns
- Implement proper cleanup in effects
- Follow accessibility guidelines
- Use array destructuring for signals: `const [count, setCount] = createSignal(0)`
- Avoid destructuring reactive objects (triggers `solid/no-destructure` warning)
- Wrap event handlers in functions for reactivity

### ESLint Rules

**TypeScript Rules**:

- `@typescript-eslint/no-unused-vars`: Error (with underscore prefix pattern)
- `@typescript-eslint/no-explicit-any`: Warning
- `@typescript-eslint/no-require-imports`: Off (allows require() in some cases)

**SolidJS Rules**:

- `solid/reactivity`: Warning (reactive variable usage)
- `solid/no-destructure`: Warning (destructuring reactive objects)
- `solid/jsx-no-undef`: Error (undefined JSX elements)
- `solid/no-innerhtml`: Warning (innerHTML usage)
- `solid/self-closing-comp`: Warning (self-closing components)

**Accessibility Rules**:

- `jsx-a11y/aria-role`: Error (valid ARIA roles)
- `jsx-a11y/aria-props`: Error (valid ARIA properties)
- `jsx-a11y/aria-proptypes`: Error (valid ARIA prop types)
- `jsx-a11y/role-has-required-aria-props`: Error (required ARIA props)
- `jsx-a11y/role-supports-aria-props`: Error (ARIA prop compatibility)

### Formatting

- Use Prettier for consistent formatting
- Follow ESLint rules
- Use meaningful commit messages
- Add proper documentation

## 🧪 Testing

### Test Structure

- Write tests for all new functionality
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Keep test files under 200 lines (ESLint enforced)
- Keep test functions under 100 lines (ESLint enforced)

### Test File Patterns

ESLint recognizes these test file patterns:

- `**/*.test.{ts,tsx}` - Standard test files
- `**/__tests__/**/*.{ts,tsx}` - Jest-style test directories
- `**/test/**/*.{ts,tsx}` - Custom test directories

### Test-Specific ESLint Rules

Test files have relaxed rules:

- `@typescript-eslint/no-unused-vars`: Off (allows unused variables)
- `@typescript-eslint/no-explicit-any`: Off (allows `any` type)
- `max-lines`: 200 (vs 140 for source files)
- `max-lines-per-function`: 100 (vs 50 for source files)

### Test Types

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows

### Test Files

```typescript
// component.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(() => <MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

## 📝 Documentation

### Code Documentation

- Add JSDoc comments for all public APIs
- Include examples in documentation
- Document complex algorithms and patterns
- Keep documentation up to date

### Architecture Documentation

- Update architecture docs for significant changes
- Document new patterns and conventions
- Include decision records for major changes
- Maintain refactoring guidelines

## 🚀 Pull Request Process

### Before Submitting

- [ ] Code follows modularity standards (140-line axiom)
- [ ] All tests pass
- [ ] Linting passes (ESLint with max-lines rules)
- [ ] Type checking passes
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Modularity Compliance

- [ ] All TypeScript/SolidJS files under 140 lines
- [ ] All test files under 200 lines
- [ ] All functions under 50 lines (100 for tests)
- [ ] Proper separation of concerns
- [ ] No circular dependencies
- [ ] ESLint max-lines rules pass

## ESLint Compliance

- [ ] TypeScript rules pass
- [ ] SolidJS rules pass
- [ ] Accessibility rules pass
- [ ] No unused variables (or prefixed with `_`)
- [ ] No explicit `any` types (or justified)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. **Automated Checks**: CI/CD runs all checks
2. **Code Review**: Team members review code
3. **Testing**: Verify functionality works
4. **Documentation**: Ensure docs are updated
5. **Approval**: Maintainer approves and merges

## 🐛 Bug Reports

### Before Reporting

- Check existing issues
- Verify the bug exists in the latest version
- Try to reproduce the issue

### Bug Report Template

```markdown
## Bug Description

Clear description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS: [e.g., Windows 10]
- Node.js: [e.g., 18.17.0]
- Browser: [e.g., Chrome 91]

## Additional Context

Any other relevant information
```

## ✨ Feature Requests

### Before Requesting

- Check existing feature requests
- Consider if it aligns with Reynard's goals
- Think about implementation complexity

### Feature Request Template

```markdown
## Feature Description

Clear description of the feature

## Use Case

Why is this feature needed?

## Proposed Solution

How should this feature work?

## Alternatives Considered

What other approaches were considered?

## Additional Context

Any other relevant information
```

## 🏆 Recognition

Contributors are recognized in:

- GitHub contributors list
- Release notes
- Documentation acknowledgments
- Community highlights

## 🔧 ESLint Configuration

### Understanding ESLint Rules

Reynard uses a sophisticated ESLint configuration that applies different rules based on file patterns:

**File Pattern Matching**:

- `**/*.{ts,tsx}` - TypeScript and SolidJS files
- `**/*.{tsx,jsx}` - SolidJS component files (additional rules)
- `**/*.test.{ts,tsx}` - Test files (relaxed rules)
- `**/__tests__/**/*.{ts,tsx}` - Jest-style test directories
- `**/test/**/*.{ts,tsx}` - Custom test directories
- `**/*.config.js`, `**/*.config.mjs` - Configuration files (Node.js environment)

### Common ESLint Issues

**Max-Lines Violations**:

```bash
# Check line count manually
grep -v '^\s*$' your-file.ts | grep -v '^\s*//' | grep -v '^\s*/\*' | grep -v '^\s*\*' | wc -l
```

**SolidJS Reactivity Warnings**:

```typescript
// ❌ Bad: Destructuring reactive object
const { value } = props;

// ✅ Good: Access directly
props.value;
```

**Unused Variable Errors**:

```typescript
// ❌ Bad: Unused variable
const unusedVar = "test";

// ✅ Good: Prefix with underscore
const _unusedVar = "test";
```

### ESLint Commands

```bash
# Check specific file
npx eslint your-file.ts

# Check with specific format
npx eslint your-file.ts --format=compact

# Check configuration for file
npx eslint --print-config your-file.ts

# Fix auto-fixable issues
npx eslint your-file.ts --fix
```

### Ignore Patterns

ESLint automatically ignores:

- `**/node_modules/**` - Dependencies
- `**/dist/**`, `**/build/**` - Build outputs
- `**/coverage/**` - Test coverage
- `**/*.min.js` - Minified files
- `**/vite.config.ts`, `**/vitest.config.ts` - Config files
- `**/debug-scan.js` - Debug scripts
- `**/pkg/**/*.js` - Generated WebAssembly files

## 📞 Getting Help

- **Documentation**: [(TBD)](<https://(TBD)>)
- **Issues**: [GitHub Issues](https://github.com/rakki194/reynard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rakki194/reynard/discussions)
- **Discord**: [Join our Discord](https://discord.gg/reynard)

## 📄 License

By contributing to Reynard, you agree that your contributions will be licensed under the MIT License.

---

_"The cunning fox knows that great software is built through collaboration and shared wisdom."_ 🦊

Thank you for contributing to Reynard!
