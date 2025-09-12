# TypeScript/JavaScript Quick Reference

_Essential templates and patterns for rapid development_

## Module Templates

### Basic Module Template

```typescript
// modules/example-module.ts
export interface ExampleModule {
  readonly data: SomeType[];
  addItem: (item: SomeType) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
}

export const createExampleModule = (): ExampleModule => {
  const data: SomeType[] = [];

  const addItem = (item: SomeType) => {
    data.push(item);
  };

  const removeItem = (id: string) => {
    const index = data.findIndex((item) => item.id === id);
    if (index > -1) {
      data.splice(index, 1);
    }
  };

  const clearItems = () => {
    data.length = 0;
  };

  return {
    get data() {
      return [...data];
    },
    addItem,
    removeItem,
    clearItems,
  };
};
```

### Service Module Template

```typescript
// services/example-service.ts
export interface ServiceConfig {
  host: string;
  port: number;
  timeout: number;
}

export interface ExampleService {
  readonly isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendData: (data: any) => Promise<any>;
}

export const createExampleService = (config: ServiceConfig): ExampleService => {
  let isConnected = false;

  const connect = async () => {
    // Connection logic
    isConnected = true;
  };

  const disconnect = async () => {
    // Disconnection logic
    isConnected = false;
  };

  const sendData = async (data: any) => {
    if (!isConnected) {
      throw new Error("Service not connected");
    }
    // Send data logic
    return { success: true };
  };

  return {
    get isConnected() {
      return isConnected;
    },
    connect,
    disconnect,
    sendData,
  };
};
```

### Utility Module Template

```typescript
// utils/example-utils.ts
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  if (!email) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
```

## TypeScript Patterns

### Generic Types

```typescript
// Generic result type
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Generic async function wrapper
export const asyncWrapper = async <T>(
  fn: () => Promise<T>,
): Promise<Result<T>> => {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};

// Generic module factory
export const createTypedModule = <T extends Record<string, any>>(
  initialState: T,
) => {
  let state = { ...initialState };

  return {
    getState: () => ({ ...state }),
    setState: (updates: Partial<T>) => {
      state = { ...state, ...updates };
    },
    resetState: () => {
      state = { ...initialState };
    },
  };
};
```

### Utility Types

```typescript
// Make all properties optional except specified ones
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Make all properties required except specified ones
export type RequiredExcept<T, K extends keyof T> = Required<T> &
  Partial<Pick<T, K>>;

// Extract function parameters
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// Extract function return type
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Deep readonly
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

### Interface Patterns

```typescript
// Builder pattern interface
export interface QueryBuilder {
  select(fields: string[]): QueryBuilder;
  where(condition: string): QueryBuilder;
  orderBy(field: string, direction: "asc" | "desc"): QueryBuilder;
  build(): string;
}

// Observer pattern interface
export interface Observer<T> {
  update(data: T): void;
}

export interface Observable<T> {
  subscribe(observer: Observer<T>): () => void;
  unsubscribe(observer: Observer<T>): void;
  notify(data: T): void;
}

// Command pattern interface
export interface Command {
  execute(): void;
  undo(): void;
}
```

## JavaScript Patterns

### Module Pattern with Closures

```javascript
// counter.js
export const createCounter = (initialValue = 0) => {
  let count = initialValue;

  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count,
    reset: () => {
      count = initialValue;
    },
  };
};

// calculator.js
export const createCalculator = () => {
  let history = [];

  const add = (a, b) => {
    const result = a + b;
    history.push({ operation: "add", a, b, result });
    return result;
  };

  const subtract = (a, b) => {
    const result = a - b;
    history.push({ operation: "subtract", a, b, result });
    return result;
  };

  const getHistory = () => [...history];
  const clearHistory = () => {
    history = [];
  };

  return { add, subtract, getHistory, clearHistory };
};
```

### Event-Driven Patterns

```javascript
// pub-sub.js
export const createPubSub = () => {
  const subscribers = new Map();

  const subscribe = (event, callback) => {
    if (!subscribers.has(event)) {
      subscribers.set(event, []);
    }
    subscribers.get(event).push(callback);

    return () => {
      const callbacks = subscribers.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  };

  const publish = (event, data) => {
    const callbacks = subscribers.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  };

  return { subscribe, publish };
};

// mediator.js
export const createMediator = () => {
  const channels = new Map();

  const channel = (name) => {
    if (!channels.has(name)) {
      channels.set(name, createPubSub());
    }
    return channels.get(name);
  };

  return { channel };
};
```

## Testing Templates

### Unit Test Template

```typescript
// tests/modules/example.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createExampleModule,
  type ExampleModule,
} from "../../src/modules/example-module";

describe("ExampleModule", () => {
  let module: ExampleModule;

  beforeEach(() => {
    module = createExampleModule();
    vi.clearAllMocks();
  });

  it("should initialize with empty data", () => {
    expect(module.data).toHaveLength(0);
  });

  it("should add item", () => {
    const item = { id: "1", name: "Test" };
    module.addItem(item);

    expect(module.data).toHaveLength(1);
    expect(module.data[0]).toEqual(item);
  });

  it("should remove item by id", () => {
    const item = { id: "1", name: "Test" };
    module.addItem(item);

    module.removeItem("1");

    expect(module.data).toHaveLength(0);
  });

  it("should clear all items", () => {
    module.addItem({ id: "1", name: "Test 1" });
    module.addItem({ id: "2", name: "Test 2" });

    module.clearItems();

    expect(module.data).toHaveLength(0);
  });
});
```

### Integration Test Template

```typescript
// tests/integration/example.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createExampleModule } from "../../src/modules/example-module";
import { createExampleService } from "../../src/services/example-service";

describe("Module Integration", () => {
  let module: ReturnType<typeof createExampleModule>;
  let service: ReturnType<typeof createExampleService>;

  beforeEach(() => {
    module = createExampleModule();
    service = createExampleService({
      host: "localhost",
      port: 8080,
      timeout: 5000,
    });
  });

  it("should integrate module with service", async () => {
    await service.connect();

    const result = await service.sendData({ test: "data" });

    expect(result.success).toBe(true);
    expect(service.isConnected).toBe(true);
  });
});
```

## Performance Patterns

### Lazy Loading

```typescript
// Lazy load heavy modules
export const loadHeavyModule = async () => {
  const { HeavyModule } = await import("./heavy-module");
  return new HeavyModule();
};

// Lazy initialization
export const createLazyService = () => {
  let service: any = null;

  return {
    getService: async () => {
      if (!service) {
        service = await loadHeavyModule();
      }
      return service;
    },
  };
};
```

### Caching Patterns

```typescript
// Simple cache
export const createCache = <T>(maxSize = 100) => {
  const cache = new Map<string, T>();

  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: T) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    clear: () => cache.clear(),
    size: () => cache.size,
  };
};

// Memoization
export const memoize = <T extends (...args: any[]) => any>(fn: T) => {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};
```

### Debouncing and Throttling

```typescript
// Debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};
```

## Common Utilities

### Error Handling

```typescript
// Error wrapper
export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: Error) => void,
) => {
  return (...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error);
      } else {
        console.error("Error:", error);
      }
      throw error;
    }
  };
};

// Async error wrapper
export const withAsyncErrorHandling = <
  T extends (...args: any[]) => Promise<any>,
>(
  fn: T,
  errorHandler?: (error: Error) => void,
) => {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error);
      } else {
        console.error("Async error:", error);
      }
      throw error;
    }
  };
};
```

### Validation Utilities

```typescript
// Simple validator
export const createValidator = <T>(
  schema: Record<keyof T, (value: any) => boolean>,
) => {
  return (data: T): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    Object.entries(schema).forEach(([key, validator]) => {
      if (!validator(data[key as keyof T])) {
        errors.push(`Invalid ${key}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };
};

// Usage
const userValidator = createValidator({
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  age: (value) => typeof value === "number" && value >= 0,
  name: (value) => typeof value === "string" && value.length > 0,
});
```

### Formatting Utilities

```typescript
// Date formatting
export const formatDate = (
  date: Date,
  format: "short" | "long" | "iso" = "short",
) => {
  switch (format) {
    case "short":
      return date.toLocaleDateString();
    case "long":
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "iso":
      return date.toISOString();
  }
};

// Number formatting
export const formatNumber = (num: number, decimals = 2) => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// String utilities
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str: string, length: number) => {
  return str.length > length ? str.substring(0, length) + "..." : str;
};
```

This quick reference provides templates and patterns for common development tasks in modular TypeScript/JavaScript applications.
