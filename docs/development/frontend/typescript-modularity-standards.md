# TypeScript Modularity Standards and Type Safety

## Overview

This document outlines the comprehensive approach to maintaining modularity standards and type safety in the Reynard framework's TypeScript codebase. It covers the resolution of common issues including function length violations, type safety problems, and proper AbortSignal handling.

## Table of Contents

1. [The 100-Line Axiom](#the-100-line-axiom)
2. [Modular Refactoring Strategies](#modular-refactoring-strategies)
3. [Type Safety Best Practices](#type-safety-best-practices)
4. [AbortSignal Type Handling](#abortsignal-type-handling)
5. [Common Issues and Solutions](#common-issues-and-solutions)
6. [Implementation Examples](#implementation-examples)

## The 140-Line Axiom

### Core Principle

Every source file should be under 140 lines (excluding blank lines and comments). This constraint forces:

- **Clear Separation of Concerns**: Each file has a single, well-defined responsibility
- **Improved Readability**: Files are small enough to understand at a glance
- **Better Testability**: Smaller modules are easier to test comprehensively
- **Enhanced Maintainability**: Changes are localized and predictable

### Enforcement

The 140-line limit is enforced through ESLint rules and code review processes. When violations occur, the code must be refactored using the modular patterns outlined in this document. This standard is established in [ADR-001: Modularity Standards](../architecture/decisions/001-modularity-standards.md).

## Modular Refactoring Strategies

### Strategy 1: Extract by Functionality

**Problem**: Monolithic functions exceeding 100 lines with mixed responsibilities.

**Solution**: Break down large functions into focused, single-responsibility modules.

#### Example: RAG Client Refactoring

**Before** (172 lines - violates 140-line axiom):

```typescript
export function createRAGClient(options: RAGClientOptions) {
  // 172 lines of mixed query, ingest, config, and admin functionality
}
```

**After** (Modular approach):

```typescript
// rag-query.ts (33 lines)
export function createRAGQueryClient(authFetch, queryUrl) {
  // Focused query functionality
}

// rag-ingest.ts (77 lines)
export function createRAGIngestClient(authFetch, ingestUrl) {
  // Focused ingestion functionality
}

// rag-config.ts (74 lines)
export function createRAGConfigClient(authFetch, configUrl) {
  // Focused configuration management
}

// rag-client.ts (39 lines) - Orchestrator
export function createRAGClient(options: RAGClientOptions) {
  // Composes specialized clients
}
```

### Strategy 2: Extract by Layer

**Problem**: Mixed concerns within a single module.

**Solution**: Separate concerns into distinct layers with clear interfaces.

#### Example: Type Definitions

**Before** (Mixed with implementation):

```typescript
// useRAG.ts (263 lines)
export interface RAGConfig {
  /* 50+ lines of types */
}
export function useRAG() {
  /* implementation */
}
```

**After** (Separated concerns):

```typescript
// rag-types.ts (141 lines) - Pure type definitions
export interface RAGConfig {
  /* all type definitions */
}

// useRAG.ts (55 lines) - Implementation only
export function useRAG() {
  /* focused implementation */
}
```

### Strategy 3: Factory Pattern Implementation

**Pattern**: Use factory functions for clean module instantiation.

```typescript
export function createRAGQueryClient(
  authFetch: RAGClientOptions["authFetch"],
  queryUrl: string,
) {
  const query = async <TExtra = Record<string, unknown>>(
    params: RAGQueryParams,
    signal?: globalThis.AbortSignal,
  ): Promise<RAGQueryResponse<TExtra>> => {
    // Implementation
  };

  return { query };
}
```

## Type Safety Best Practices

### 1. Avoid `any` Types

**Problem**: Using `any` undermines TypeScript's type safety.

**Solution**: Use specific types or `unknown` with proper type guards.

#### Bad Practice

```typescript
function processData(data: any) {
  return data.someProperty; // No type safety
}
```

#### Good Practice

```typescript
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "someProperty" in data) {
    return (data as { someProperty: string }).someProperty;
  }
  throw new Error("Invalid data structure");
}
```

### 2. Proper Generic Type Constraints

**Problem**: Unconstrained generics can lead to type errors.

**Solution**: Use proper type constraints and defaults.

```typescript
// Good: Constrained generic with default
export interface RAGQueryHit<TExtra = Record<string, unknown>> {
  id?: number | string;
  score: number;
  extra?: TExtra;
}

// Usage
const hit: RAGQueryHit<{ source: string }> = {
  score: 0.95,
  extra: { source: "document.pdf" },
};
```

### 3. Interface-First Design

**Pattern**: Define clear contracts before implementation.

```typescript
export interface RAGClientOptions {
  authFetch: (input: string | URL, init?: RequestInit) => Promise<Response>;
  configUrl?: string;
  queryUrl?: string;
  ingestUrl?: string;
  adminUrl?: string;
  metricsUrl?: string;
}
```

## AbortSignal Type Handling

### The Problem

TypeScript environments may not properly recognize the built-in `AbortSignal` type, leading to compilation errors:

```
'AbortSignal' is not defined.
```

### The Solution (2025 Best Practice)

Use `globalThis.AbortSignal` to explicitly reference the global AbortSignal interface:

```typescript
// Correct approach
export function createRAGQueryClient(
  authFetch: RAGClientOptions["authFetch"],
  queryUrl: string,
) {
  const query = async <TExtra = Record<string, unknown>>(
    params: RAGQueryParams,
    signal?: globalThis.AbortSignal, // Proper type reference
  ): Promise<RAGQueryResponse<TExtra>> => {
    const res = await authFetch(queryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal, // No type casting needed
    });

    if (!res.ok) throw new Error(`RAG query failed (${res.status})`);
    return (await res.json()) as RAGQueryResponse<TExtra>;
  };

  return { query };
}
```

### Why This Works

1. **Global Scope Access**: `globalThis.AbortSignal` explicitly references the global AbortSignal interface
2. **DOM Library Integration**: Works seamlessly with the DOM library included in tsconfig
3. **Type Safety**: Maintains full type safety without any `any` types
4. **Future-Proof**: This is the recommended approach for 2025 and beyond

### Alternative Approaches (Not Recommended)

#### ❌ Using `any` Types

```typescript
signal?: any  // Loses type safety
```

#### ❌ Custom Type Definitions

```typescript
type AbortControllerSignal = {
  aborted: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};
```

#### ❌ Type Casting

```typescript
signal: signal as any; // Bypasses type checking
```

## Common Issues and Solutions

### Issue 1: Function Too Many Lines

**Error**: `Function 'createRAGClient' has too many lines (172). Maximum allowed is 140.`

**Solution**: Apply modular refactoring strategies:

1. Extract functionality into separate modules
2. Use factory patterns for composition
3. Separate types from implementation
4. Create focused, single-responsibility functions

### Issue 2: Type Safety Violations

**Error**: `Unexpected any. Specify a different type.`

**Solution**:

1. Replace `any` with `unknown` and add type guards
2. Use proper generic constraints
3. Define specific interfaces for all data structures
4. Use `globalThis.AbortSignal` for AbortSignal types

### Issue 3: Missing Type Definitions

**Error**: `'RequestInfo' is not defined.`

**Solution**: Ensure DOM library is included in tsconfig.json:

```json
{
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

### Issue 4: Unused Imports

**Error**: `'createSignal' is defined but never used.`

**Solution**: Remove unused imports and clean up dependencies:

```typescript
// Before
import {
  Accessor,
  createResource,
  createSignal,
  createEffect,
  onCleanup,
} from "solid-js";

// After
import { Accessor, createResource } from "solid-js";
```

## Implementation Examples

### Complete Modular RAG Implementation

The following example demonstrates the complete modular approach applied to the RAG system:

#### File Structure

```
packages/composables/src/ai/
├── rag-types.ts          (141 lines) - All type definitions
├── rag-query.ts          (33 lines)  - Query functionality
├── rag-ingest.ts         (77 lines)  - Document ingestion
├── rag-config.ts         (74 lines)  - Configuration management
├── rag-admin.ts          (67 lines)  - Administrative operations
├── rag-search-resource.ts (64 lines) - Reactive search resources
├── rag-auto-refresh.ts   (49 lines)  - Auto-refresh functionality
├── rag-client.ts         (39 lines)  - Main orchestrator
├── useRAG.ts            (55 lines)  - SolidJS composable
└── rag.ts               (10 lines)  - Barrel exports
```

#### Key Benefits Achieved

1. **Maintainability**: Each module has a single, clear responsibility
2. **Testability**: Small, focused units that can be thoroughly tested
3. **Reusability**: Modules can be imported and used independently
4. **Scalability**: Easy to extend or modify individual components
5. **Type Safety**: Comprehensive TypeScript interfaces with proper typing

### Barrel Export Pattern

```typescript
// rag.ts - Clean API boundaries
export * from "./rag-types";
export * from "./useRAG";
export * from "./rag-client";
export * from "./rag-query";
export * from "./rag-ingest";
export * from "./rag-config";
export * from "./rag-admin";
export * from "./rag-search-resource";
export * from "./rag-auto-refresh";
```

### Factory Pattern Usage

```typescript
// Main client composition
export function createRAGClient(options: RAGClientOptions) {
  const {
    authFetch,
    configUrl = "/api/config",
    queryUrl = "/api/rag/query",
    ingestUrl = "/api/rag/ingest",
    adminUrl = "/api/rag/admin",
    metricsUrl = "/api/rag/ops/metrics",
  } = options;

  // Create specialized clients
  const queryClient = createRAGQueryClient(authFetch, queryUrl);
  const ingestClient = createRAGIngestClient(authFetch, ingestUrl);
  const configClient = createRAGConfigClient(authFetch, configUrl);
  const adminClient = createRAGAdminClient(authFetch, adminUrl, metricsUrl);

  // Compose the full client interface
  return {
    query: queryClient.query,
    ingestDocuments: ingestClient.ingestDocuments,
    getConfig: configClient.getConfig,
    updateConfig: configClient.updateConfig,
    getIndexingStatus: adminClient.getIndexingStatus,
    getMetrics: adminClient.getMetrics,
    admin: adminClient.admin,
  };
}
```

## Conclusion

The modular approach to TypeScript development in the Reynard framework ensures:

- **Code Quality**: All modules adhere to the 140-line axiom established in [ADR-001](../architecture/decisions/001-modularity-standards.md)
- **Type Safety**: Proper TypeScript usage with no `any` types
- **Maintainability**: Clear separation of concerns and focused responsibilities
- **Scalability**: Easy to extend and modify individual components
- **Best Practices**: Following 2025 TypeScript standards and patterns

By applying these standards consistently across the codebase, we maintain a high-quality, maintainable, and scalable TypeScript architecture that serves as a foundation for the entire Reynard framework.

## References

- [ADR-001: Modularity Standards](../architecture/decisions/001-modularity-standards.md) - Establishes the 140-line axiom
- [ADR-002: TypeScript Modularity Refactoring](../architecture/decisions/002-typescript-modularity-refactoring.md) - TypeScript-specific implementation
- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)
- [ESLint TypeScript Rules](https://typescript-eslint.io/rules/)
- [MDN AbortSignal Documentation](https://developer.mozilla.org/docs/Web/API/AbortSignal)
- [Reynard Modular Manifesto](../architecture/modularity-patterns.md)
