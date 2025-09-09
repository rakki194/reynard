# TypeScript Quick Reference Guide

## Common Issues and Solutions

### 1. Function Too Many Lines

**Error**: `Function 'functionName' has too many lines (X). Maximum allowed is 140.`

**Quick Fix**:

1. Extract functionality into separate modules
2. Use factory pattern for composition
3. Separate types from implementation

```typescript
// Before: Monolithic function
export function largeFunction() {
  // 140+ lines of mixed concerns
}

// After: Modular approach
export function createModuleA() {
  /* focused functionality */
}
export function createModuleB() {
  /* focused functionality */
}
export function createMainModule() {
  return {
    ...createModuleA(),
    ...createModuleB(),
  };
}
```

### 2. Type Safety Issues

**Error**: `Unexpected any. Specify a different type.`

**Quick Fix**:

```typescript
// ❌ Bad
function process(data: any) {
  return data.property;
}

// ✅ Good
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "property" in data) {
    return (data as { property: string }).property;
  }
  throw new Error("Invalid data");
}
```

### 3. AbortSignal Type Issues

**Error**: `'AbortSignal' is not defined.`

**Quick Fix**:

```typescript
// ✅ Use globalThis.AbortSignal (2025 best practice)
function fetchData(signal?: globalThis.AbortSignal) {
  return fetch("/api/data", { signal });
}
```

### 4. Missing DOM Types

**Error**: `'RequestInfo' is not defined.`

**Quick Fix**: Ensure DOM library in tsconfig.json:

```json
{
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

### 5. Unused Imports

**Error**: `'importName' is defined but never used.`

**Quick Fix**: Remove unused imports:

```typescript
// Before
import { used, unused1, unused2 } from "module";

// After
import { used } from "module";
```

## Type Safety Patterns

### Generic Constraints

```typescript
// ✅ Proper generic with default
interface Data<T = Record<string, unknown>> {
  id: string;
  payload: T;
}
```

### Type Guards

```typescript
// ✅ Type guard for unknown data
function isUserData(data: unknown): data is { name: string; email: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "email" in data
  );
}
```

### Interface-First Design

```typescript
// ✅ Define interface before implementation
interface ServiceConfig {
  endpoint: string;
  timeout: number;
  retries: number;
}

function createService(config: ServiceConfig) {
  // Implementation
}
```

## Modular Architecture Patterns

### Factory Pattern

```typescript
export function createModule(options: ModuleOptions) {
  const privateState = {};

  return {
    publicMethod: () => {
      /* implementation */
    },
    anotherMethod: () => {
      /* implementation */
    },
  };
}
```

### Composition Pattern

```typescript
export function createMainModule(options: MainOptions) {
  const subModuleA = createSubModuleA(options.a);
  const subModuleB = createSubModuleB(options.b);

  return {
    ...subModuleA,
    ...subModuleB,
    mainMethod: () => {
      /* orchestration */
    },
  };
}
```

### Barrel Exports

```typescript
// index.ts
export * from "./module-a";
export * from "./module-b";
export * from "./module-c";
```

## ESLint Configuration

### Essential Rules

```json
{
  "rules": {
    "max-lines-per-function": ["error", 140],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

## File Organization

### Recommended Structure

```
src/
├── types/           # Type definitions
├── modules/         # Business logic modules
├── composables/     # Reusable composables
├── utils/           # Utility functions
└── index.ts         # Barrel exports
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Interfaces**: `PascalCase`
- **Types**: `PascalCase`

## Performance Considerations

### Lazy Loading

```typescript
// ✅ Lazy load heavy modules
export const loadHeavyModule = async () => {
  const { HeavyModule } = await import("./heavy-module");
  return new HeavyModule();
};
```

### Memory Management

```typescript
// ✅ Clean up resources
export class ResourceManager {
  private resources = new Set<Resource>();

  dispose() {
    this.resources.forEach((resource) => resource.cleanup());
    this.resources.clear();
  }
}
```

## Testing Modular Code

### Unit Testing

```typescript
import { createModule } from "./module";

describe("Module", () => {
  it("should create module with correct interface", () => {
    const module = createModule({ option: "value" });
    expect(module).toHaveProperty("publicMethod");
  });
});
```

### Integration Testing

```typescript
import { createMainModule } from "./main-module";

describe("MainModule Integration", () => {
  it("should compose sub-modules correctly", () => {
    const main = createMainModule({ a: {}, b: {} });
    expect(main.subMethodA).toBeDefined();
    expect(main.subMethodB).toBeDefined();
  });
});
```

## Common Anti-Patterns to Avoid

### ❌ Monolithic Functions

```typescript
// Don't do this
function doEverything() {
  // 140+ lines of mixed concerns
}
```

### ❌ Any Types

```typescript
// Don't do this
function process(data: any) {
  return data.whatever;
}
```

### ❌ Mixed Concerns

```typescript
// Don't do this
class UserService {
  validateUser() {
    /* validation */
  }
  hashPassword() {
    /* security */
  }
  saveUser() {
    /* persistence */
  }
  sendEmail() {
    /* notification */
  }
}
```

### ❌ Tight Coupling

```typescript
// Don't do this
import { SpecificImplementation } from "./specific-impl";

function useService() {
  return new SpecificImplementation(); // Hard to test/mock
}
```

## Resources

- [Full TypeScript Modularity Standards](./typescript-modularity-standards.md)
- [Architecture Decision Record](../architecture/decisions/002-typescript-modularity-refactoring.md)
- [TypeScript Official Docs](https://www.typescriptlang.org/docs/)
- [ESLint TypeScript Rules](https://typescript-eslint.io/rules/)
