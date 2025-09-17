# TypeScript Configuration Troubleshooting Guide

_Comprehensive guide to resolving TypeScript configuration issues, type errors, and compilation problems in modern development environments._

## Overview

TypeScript configuration issues can be complex and frustrating, often involving multiple layers of configuration files, type definitions, and build tools. This guide provides systematic approaches to diagnosing and resolving common TypeScript problems, with a focus on practical solutions and best practices.

## Common TypeScript Errors

### 1. Property Does Not Exist Errors

#### Error: `Property 'X' does not exist on type 'Y'`

**Problem Description:**

```typescript
// ❌ Common error
const memoryUsage = performance.memory.usedJSHeapSize;
// Error: Property 'memory' does not exist on type 'Performance'
```

**Root Cause Analysis:**

- Browser-specific APIs not included in standard type definitions
- Missing type declarations for third-party libraries
- Incorrect type assertions or generic usage
- Outdated type definitions

**Solutions:**

1. **Type Assertion Approach:**

```typescript
// ✅ Type assertion
const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
```

2. **Interface Extension Approach:**

```typescript
// ✅ Interface extension
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

const memoryUsage = (performance as PerformanceWithMemory).memory?.usedJSHeapSize || 0;
```

3. **Declaration Merging Approach:**

```typescript
// ✅ Declaration merging
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

const memoryUsage = performance.memory?.usedJSHeapSize || 0;
```

### 2. Module Resolution Errors

#### Error: `Cannot find module 'X' or its corresponding type declarations`

**Problem Description:**

```typescript
// ❌ Module not found
import { SomeFunction } from "non-existent-module";
```

**Root Cause Analysis:**

- Package not installed
- Incorrect import path
- Missing type definitions
- Module resolution configuration issues

**Solutions:**

1. **Install Missing Package:**

```bash
# Install the package
npm install non-existent-module
# or
pnpm add non-existent-module

# Install type definitions if available
npm install @types/non-existent-module
```

2. **Check Import Path:**

```typescript
// ✅ Correct import path
import { SomeFunction } from "./relative/path/to/module";
// or
import { SomeFunction } from "@scope/package-name";
```

3. **Configure Module Resolution:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

### 3. Generic Type Errors

#### Error: `Type 'X' is not assignable to type 'Y'`

**Problem Description:**

```typescript
// ❌ Type mismatch
interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "John" },
  { id: "2", name: "Jane" }, // Error: string not assignable to number
];
```

**Solutions:**

1. **Fix Data Types:**

```typescript
// ✅ Correct data types
const users: User[] = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
];
```

2. **Use Union Types:**

```typescript
// ✅ Union types for flexibility
interface User {
  id: number | string;
  name: string;
}
```

3. **Type Guards:**

```typescript
// ✅ Type guards for runtime safety
function isUser(obj: any): obj is User {
  return typeof obj.id === "number" && typeof obj.name === "string";
}

const validUsers = users.filter(isUser);
```

### 4. Configuration File Errors

#### Error: `No overload matches this call`

**Problem Description:**

```typescript
// ❌ Invalid configuration
export default defineConfig({
  use: {
    reducedMotion: "reduce", // Property doesn't exist
  },
});
```

**Root Cause Analysis:**

- Using non-existent properties in configuration objects
- Incorrect function signatures
- Missing required parameters
- Type definition mismatches

**Solutions:**

1. **Check Documentation:**

```typescript
// ✅ Use correct properties
export default defineConfig({
  use: {
    // Use documented properties only
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
});
```

2. **Use Proper APIs:**

```typescript
// ✅ Use correct API methods
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
```

3. **Type Assertion for Complex Configs:**

```typescript
// ✅ Type assertion when necessary
const config = {
  use: {
    customProperty: "value", // Custom property
  },
} as any;

export default defineConfig(config);
```

## Systematic Troubleshooting Approach

### Step 1: Verify TypeScript Installation

```bash
# Check TypeScript version
npx tsc --version

# Check if TypeScript is properly installed
npm list typescript

# Verify global installation
npm list -g typescript
```

### Step 2: Validate tsconfig.json

```json
// Basic valid tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### Step 3: Check Type Definitions

```bash
# Check for missing type definitions
npm list @types/node
npm list @types/react
npm list @types/jest

# Install common type definitions
npm install --save-dev @types/node @types/react @types/jest
```

### Step 4: Validate Import/Export Syntax

```typescript
// ✅ Correct import syntax
import { Component } from 'react';
import * as React from 'react';
import React, { useState } from 'react';

// ✅ Correct export syntax
export const MyComponent: React.FC = () => <div>Hello</div>;
export default MyComponent;
export { MyComponent as default };
```

## Advanced Configuration Patterns

### 1. Path Mapping Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"]
    }
  }
}
```

```typescript
// Usage in code
import { Button } from "@components/Button";
import { formatDate } from "@utils/dateUtils";
import { User } from "@types/User";
import { useAuth } from "@hooks/useAuth";
```

### 2. Strict Type Checking Configuration

```json
// tsconfig.json - Strict configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### 3. Build Tool Integration

#### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  build: {
    target: "es2020",
    sourcemap: true,
  },
});
```

#### Webpack Configuration

```typescript
// webpack.config.ts
import path from "path";

export default {
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
```

## Type Definition Management

### 1. Custom Type Definitions

```typescript
// types/global.d.ts
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      REACT_APP_API_URL: string;
      REACT_APP_VERSION: string;
    }
  }
}

export {};
```

### 2. Module Declaration Files

```typescript
// types/modules.d.ts
declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
```

### 3. Third-Party Library Extensions

```typescript
// types/extensions.d.ts
declare module "some-library" {
  interface SomeLibraryOptions {
    customOption?: string;
  }

  function someFunction(options: SomeLibraryOptions): void;
  export = someFunction;
}
```

## Error Handling Patterns

### 1. Type-Safe Error Handling

```typescript
// Error handling utilities
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

async function safeAsyncOperation<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// Usage
const result = await safeAsyncOperation(async () => {
  const response = await fetch("/api/data");
  return response.json();
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### 2. Type Guards and Assertions

```typescript
// Type guard functions
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    typeof (obj as any).id === "number" &&
    typeof (obj as any).name === "string"
  );
}

// Usage
function processUserData(data: unknown) {
  if (isUser(data)) {
    // TypeScript knows data is User here
    console.log(data.name);
  }
}
```

### 3. Discriminated Unions

```typescript
// Discriminated union types
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: any;
};

type ErrorState = {
  status: "error";
  error: string;
};

type AsyncState = LoadingState | SuccessState | ErrorState;

function handleAsyncState(state: AsyncState) {
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      return `Data: ${state.data}`;
    case "error":
      return `Error: ${state.error}`;
    default:
      // TypeScript ensures all cases are handled
      const _exhaustive: never = state;
      return _exhaustive;
  }
}
```

## Performance Optimization

### 1. Incremental Compilation

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

### 2. Project References

```json
// tsconfig.json - Root configuration
{
  "files": [],
  "references": [{ "path": "./packages/core" }, { "path": "./packages/components" }, { "path": "./packages/utils" }]
}
```

```json
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Skip Library Checking

```json
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## Debugging Techniques

### 1. Type Inspection

```typescript
// Type inspection utilities
type InspectType<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

// Usage
type UserType = InspectType<User>;
// Shows the exact structure of User type
```

### 2. Conditional Types for Debugging

```typescript
// Debug conditional types
type DebugType<T> = T extends any ? { type: T } : never;

// Usage
type DebugResult = DebugType<string | number>;
// Result: { type: string } | { type: number }
```

### 3. Compiler Diagnostics

```bash
# Enable detailed compiler output
npx tsc --listFiles
npx tsc --showConfig
npx tsc --traceResolution
```

## Integration with Reynard Framework

### 1. Reynard-Specific Type Definitions

```typescript
// types/reynard.d.ts
declare module "reynard-core" {
  export interface ReynardConfig {
    theme: "light" | "dark" | "auto";
    animations: boolean;
    performance: {
      enableMetrics: boolean;
      sampleRate: number;
    };
  }

  export function createReynardApp(config: ReynardConfig): ReynardApp;
}

declare module "reynard-components" {
  import { ComponentType } from "react";

  export interface ButtonProps {
    variant: "primary" | "secondary" | "danger";
    size: "small" | "medium" | "large";
    disabled?: boolean;
    onClick?: () => void;
  }

  export const Button: ComponentType<ButtonProps>;
}
```

### 2. Reynard Build Configuration

```typescript
// reynard.config.ts
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      "@reynard/core": path.resolve(__dirname, "packages/core/src"),
      "@reynard/components": path.resolve(__dirname, "packages/components/src"),
      "@reynard/utils": path.resolve(__dirname, "packages/utils/src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "packages/core/src/index.ts"),
      name: "Reynard",
      fileName: "reynard",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
```

### 3. Reynard Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@reynard/core": path.resolve(__dirname, "packages/core/src"),
    },
  },
});
```

## Best Practices Summary

### 1. Configuration Management

- **Use Strict Mode**: Enable strict type checking for better code quality
- **Path Mapping**: Use path aliases for cleaner imports
- **Incremental Compilation**: Enable for faster builds
- **Project References**: Use for monorepo setups

### 2. Type Safety

- **Avoid `any`**: Use specific types or `unknown` instead
- **Type Guards**: Implement runtime type checking
- **Discriminated Unions**: Use for state management
- **Generic Constraints**: Apply appropriate type constraints

### 3. Error Handling

- **Result Types**: Use Result<T, E> pattern for error handling
- **Type Guards**: Implement proper type checking
- **Never Types**: Use for exhaustive checking
- **Error Boundaries**: Implement proper error boundaries

### 4. Performance

- **Skip Library Check**: Use for faster compilation
- **Incremental Builds**: Enable for development efficiency
- **Project References**: Use for large codebases
- **Tree Shaking**: Configure for optimal bundle sizes

## Conclusion

🦊 _whiskers twitch with strategic satisfaction_ TypeScript configuration issues can be complex, but with systematic troubleshooting approaches and proper understanding of type systems, they can be resolved effectively. The key is to understand the root causes, use appropriate solutions, and maintain consistent configuration patterns.

Key principles to remember:

- **Understand the Error**: Always read error messages carefully and understand the root cause
- **Use Proper Types**: Avoid `any` and use specific, well-defined types
- **Configure Correctly**: Set up TypeScript configuration for your specific use case
- **Debug Systematically**: Use debugging techniques to understand type issues
- **Maintain Consistency**: Keep configuration and type definitions consistent across the project

The patterns and solutions provided here form a comprehensive foundation for resolving TypeScript configuration issues and maintaining type safety in modern development environments.

_Strategic type safety leads to robust code - the fox's way of ensuring every line is precisely defined._ 🦊
