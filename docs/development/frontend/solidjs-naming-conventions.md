# SolidJS Naming Conventions and Official Documentation Guide

Last updated: January 2025

This document outlines the official SolidJS naming conventions and provides comprehensive guidance on composables, reactive primitives, and component organization based on the latest 2025 documentation and community standards.

## Table of Contents

- [Core Naming Conventions](#core-naming-conventions)
- [Component Naming](#component-naming)
- [Reactive Primitives](#reactive-primitives)
- [Composables and Utilities](#composables-and-utilities)
- [Module Organization](#module-organization)
- [Official Documentation References](#official-documentation-references)
- [Best Practices](#best-practices)
- [Reynard Framework Integration](#reynard-framework-integration)

## Core Naming Conventions

SolidJS follows specific naming patterns that enhance code readability and maintainability. While not strictly enforced, these conventions are widely adopted by the community and recommended in official documentation.

### Function Naming Patterns

#### `create` Prefix

Functions that initialize or create new reactive primitives use the `create` prefix:

```typescript
// Core reactive primitives
const [count, setCount] = createSignal(0);
const doubled = createMemo(() => count() * 2);
const effect = createEffect(() => {
  console.log("Count changed:", count());
});

// Custom reactive resources
const resource = createResource(fetcher);
const context = createContext(defaultValue);
const store = createStore(initialState);
```

**Purpose**: Indicates that the function creates a new reactive entity or resource.

#### `use` Prefix

Functions that operate on existing resources or provide utility functionality use the `use` prefix:

```typescript
// Context consumption
const value = useContext(MyContext);

// Router utilities
const location = useLocation();
const params = useParams();

// Custom composables
const toggle = useToggle(false);
const media = useMedia("(max-width: 768px)");
const listener = useEventListener("click", handler);
```

**Purpose**: Indicates that the function utilizes or consumes existing resources without creating new reactive primitives.

## Component Naming

### PascalCase Convention

Components must use PascalCase to distinguish them from standard HTML elements:

```typescript
// ✅ Correct
function UserProfile() {
  return <div>Profile Content</div>;
}

function NavigationMenu() {
  return <nav>Menu Items</nav>;
}

// ❌ Incorrect
function userProfile() {
  return <div>Profile Content</div>;
}

function navigation_menu() {
  return <nav>Menu Items</nav>;
}
```

### Component Export Patterns

```typescript
// Named export (preferred)
export function UserProfile() {
  return <div>Profile Content</div>;
}

// Default export
export default function UserProfile() {
  return <div>Profile Content</div>;
}

// Index file organization
// components/index.ts
export { UserProfile } from './UserProfile';
export { NavigationMenu } from './NavigationMenu';
export { Button } from './Button';
```

## Reactive Primitives

### Signal Naming

Signals should use descriptive names that indicate their purpose:

```typescript
// ✅ Good signal naming
const [isLoading, setIsLoading] = createSignal(false);
const [userData, setUserData] = createSignal(null);
const [searchQuery, setSearchQuery] = createSignal("");

// ✅ Boolean signals often use 'is' prefix
const [isVisible, setIsVisible] = createSignal(true);
const [isAuthenticated, setIsAuthenticated] = createSignal(false);

// ✅ Derived signals use descriptive names
const filteredItems = createMemo(() => 
  items().filter(item => item.name.includes(searchQuery()))
);
```

### Effect Naming

Effects should be named based on their purpose:

```typescript
// ✅ Descriptive effect names
createEffect(() => {
  // Side effect logic
});

// For complex effects, consider using named functions
const updateDocumentTitle = () => {
  document.title = `${pageTitle()} - My App`;
};

createEffect(updateDocumentTitle);
```

## Composables and Utilities

### Composable Naming Patterns

Composables follow the `use` prefix convention and should be descriptive:

```typescript
// ✅ Good composable names
function useToggle(initialValue: boolean) {
  const [value, setValue] = createSignal(initialValue);
  const toggle = () => setValue(!value());
  return [value, toggle] as const;
}

function useEventListener(
  event: string, 
  handler: EventListener, 
  target: EventTarget = window
) {
  createEffect(() => {
    target.addEventListener(event, handler);
    onCleanup(() => target.removeEventListener(event, handler));
  });
}

function useMedia(query: string) {
  const [matches, setMatches] = createSignal(false);
  
  createEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', handler);
    onCleanup(() => media.removeEventListener('change', handler));
  });
  
  return matches;
}
```

### Return Value Patterns

Composables should return consistent, typed values:

```typescript
// ✅ Signal tuple pattern
function useCounter(initial: number = 0) {
  const [count, setCount] = createSignal(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  
  return [count, { increment, decrement }] as const;
}

// ✅ Object pattern for complex state
function useForm<T>(initialValues: T) {
  const [values, setValues] = createSignal(initialValues);
  const [errors, setErrors] = createSignal({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  
  const setValue = (key: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };
  
  const setError = (key: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  };
  
  return {
    values,
    errors,
    isSubmitting,
    setValue,
    setError,
    setIsSubmitting
  } as const;
}
```

## Module Organization

### Directory Structure

```plaintext
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   └── index.ts
├── composables/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── index.ts
├── stores/
│   ├── userStore.ts
│   ├── appStore.ts
│   └── index.ts
└── utils/
    ├── helpers.ts
    ├── constants.ts
    └── index.ts
```

### Index File Patterns

```typescript
// components/index.ts
export { Button } from './ui/Button';
export { Header } from './layout/Header';
export { Sidebar } from './layout/Sidebar';

// composables/index.ts
export { useAuth } from './useAuth';
export { useApi } from './useApi';
export { useToggle } from './useToggle';

// utils/index.ts
export { formatDate, parseDate } from './helpers';
export { API_ENDPOINTS, ROUTES } from './constants';
```

## Official Documentation References

### Core Documentation

- **Main Documentation**: [docs.solidjs.com](https://docs.solidjs.com)
- **Components**: [docs.solidjs.com/concepts/components/basics](https://docs.solidjs.com/concepts/components/basics)
- **Reactivity**: [docs.solidjs.com/concepts/reactivity](https://docs.solidjs.com/concepts/reactivity)
- **Lifecycle**: [docs.solidjs.com/concepts/lifecycle](https://docs.solidjs.com/concepts/lifecycle)

### Community Resources

- **SolidJS Composables Library**: [github.com/ilasw/solidjs-composables](https://github.com/ilasw/solidjs-composables)
- **SolidJS Examples**: [github.com/solidjs/solid/tree/main/packages/solid/examples](https://github.com/solidjs/solid/tree/main/packages/solid/examples)
- **SolidJS Playground**: [playground.solidjs.com](https://playground.solidjs.com)

### Key Concepts Documentation

- **Signals**: [docs.solidjs.com/concepts/reactivity#signals](https://docs.solidjs.com/concepts/reactivity#signals)
- **Effects**: [docs.solidjs.com/concepts/reactivity#effects](https://docs.solidjs.com/concepts/reactivity#effects)
- **Memos**: [docs.solidjs.com/concepts/reactivity#memos](https://docs.solidjs.com/concepts/reactivity#memos)
- **Resources**: [docs.solidjs.com/concepts/reactivity#resources](https://docs.solidjs.com/concepts/reactivity#resources)
- **Stores**: [docs.solidjs.com/concepts/stores](https://docs.solidjs.com/concepts/stores)
- **Context**: [docs.solidjs.com/concepts/context](https://docs.solidjs.com/concepts/context)

## Best Practices

### 1. Consistent Naming

- Use descriptive names that clearly indicate purpose
- Follow established patterns (`create*`, `use*`)
- Maintain consistency across the codebase

### 2. Type Safety

```typescript
// ✅ Properly typed composables
function useCounter(initial: number = 0) {
  const [count, setCount] = createSignal<number>(initial);
  const increment = () => setCount(c => c + 1);
  
  return [count, { increment }] as const;
}

// ✅ Generic composables
function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = createSignal<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });
  
  const updateValue = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };
  
  return [value, updateValue] as const;
}
```

### 3. Cleanup and Lifecycle

```typescript
// ✅ Proper cleanup
function useEventListener(
  event: string,
  handler: EventListener,
  target: EventTarget = window
) {
  createEffect(() => {
    target.addEventListener(event, handler);
    onCleanup(() => {
      target.removeEventListener(event, handler);
    });
  });
}

// ✅ Resource cleanup
function useWebSocket(url: string) {
  const [socket, setSocket] = createSignal<WebSocket | null>(null);
  const [isConnected, setIsConnected] = createSignal(false);
  
  createEffect(() => {
    const ws = new WebSocket(url);
    setSocket(ws);
    
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    
    onCleanup(() => {
      ws.close();
    });
  });
  
  return { socket, isConnected };
}
```

### 4. Performance Considerations

```typescript
// ✅ Memoized computations
const expensiveValue = createMemo(() => {
  return heavyComputation(data());
});

// ✅ Conditional effects
createEffect(() => {
  if (shouldRun()) {
    performSideEffect();
  }
});

// ✅ Batch updates
batch(() => {
  setValue1(newValue1);
  setValue2(newValue2);
  setValue3(newValue3);
});
```

## Reynard Framework Integration

The Reynard framework follows SolidJS naming conventions with additional patterns specific to our architecture:

### Reynard-Specific Patterns

```typescript
// ✅ Reynard composable naming
function useAuthFetch() {
  // Authentication-aware fetch with token refresh
}

function useServiceManager() {
  // Service status and health monitoring
}

function useUnifiedCaptionGeneration() {
  // Multi-model caption generation
}

function useRAGSearch() {
  // RAG search functionality
}
```

### Package Organization

- **Core composables**: `packages/core/` - Fundamental reactive utilities
- **Feature composables**: `packages/*/` - Feature-specific composables
- **UI composables**: `packages/ui/` - UI interaction composables

### Integration with Existing Documentation

This document complements the existing [composables.md](./composables.md) documentation by providing:

- Official SolidJS naming conventions
- Community best practices
- Integration patterns for the Reynard framework
- Reference to official documentation sources

For specific Reynard composable implementations and patterns, refer to the [composables.md](./composables.md) document.

## Conclusion

Following SolidJS naming conventions ensures:

- **Consistency**: Uniform code patterns across the application
- **Readability**: Clear indication of function purpose and behavior
- **Maintainability**: Easier code navigation and refactoring
- **Community Alignment**: Compatibility with SolidJS ecosystem tools and libraries

The `create` prefix for reactive primitives and `use` prefix for composables provide clear semantic meaning that enhances developer experience and code comprehension.
