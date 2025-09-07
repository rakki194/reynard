# 🤝 Contributing to Reynard

Thank you for your interest in contributing to Reynard! This guide will help you get started with contributing to our cunning SolidJS framework.

## 🦊 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic knowledge of TypeScript and SolidJS
- Understanding of the 100-line axiom (see [Modularity Standards](#modularity-standards))

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

## 🦊 Modularity Standards

Reynard follows the **100-line axiom** for maintainable code. This is enforced automatically through ESLint rules and pre-commit hooks.

### File Size Limits

| File Type | Max Lines | Max Function Lines | Purpose |
|-----------|-----------|-------------------|---------|
| Source Files | 100 | 50 | Core business logic |
| Test Files | 200 | 100 | Comprehensive testing |
| Configuration | 50 | 25 | Setup and configuration |
| Documentation | 200 | N/A | Guides and references |

### Refactoring Patterns

When files exceed these limits, use these proven patterns:

#### Factory Pattern

For classes handling multiple types or variants:

```typescript
// Before: Single large class (500+ lines)
class FileProcessor {
  processImage() { /* ... */ }
  processVideo() { /* ... */ }
  processAudio() { /* ... */ }
}

// After: Specialized processors
class ImageProcessor { /* ... */ }
class VideoProcessor { /* ... */ }
class AudioProcessor { /* ... */ }

// Main file: Re-export from modules
export { ImageProcessor } from './image-processor';
export { VideoProcessor } from './video-processor';
export { AudioProcessor } from './audio-processor';
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
export function useChatConnection() { /* ... */ }
export function useChatMessages() { /* ... */ }
export function useChatFileUpload() { /* ... */ }

// Main composable: Orchestrate focused composables
export function useChat() {
  const connection = useChatConnection();
  const messages = useChatMessages();
  const fileUpload = useChatFileUpload();
  
  return { connection, messages, fileUpload };
}
```

### Enforcement

- **ESLint Rules**: Automatic linting with `max-lines` and `max-lines-per-function`
- **Pre-commit Hooks**: Line count validation before commits
- **CI/CD**: Build failures on violations
- **Code Reviews**: Manual verification during reviews

For detailed refactoring guidelines, see [Modularity Patterns](../docs/architecture/modularity-patterns.md).

## 🎨 Code Style

### TypeScript

- Use strict TypeScript with full type annotations
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### SolidJS

- Follow SolidJS best practices for reactivity
- Use proper component patterns
- Implement proper cleanup in effects
- Follow accessibility guidelines

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
- Keep test files under 200 lines

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

- [ ] Code follows modularity standards (100-line axiom)
- [ ] All tests pass
- [ ] Linting passes
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
- [ ] All files under 100 lines (source) / 200 lines (tests)
- [ ] Functions under 50 lines
- [ ] Proper separation of concerns
- [ ] No circular dependencies

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

## 📞 Getting Help

- **Documentation**: [docs.reynard.dev](https://docs.reynard.dev)
- **Issues**: [GitHub Issues](https://github.com/rakki194/reynard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rakki194/reynard/discussions)
- **Discord**: [Join our Discord](https://discord.gg/reynard)

## 📄 License

By contributing to Reynard, you agree that your contributions will be licensed under the MIT License.

---

*"The cunning fox knows that great software is built through collaboration and shared wisdom."* 🦊

Thank you for contributing to Reynard!
