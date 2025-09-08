# ADR-002: TypeScript Modularity Refactoring Standards

## Status

**Accepted** - 2025-01-27

## Context

The Reynard framework's TypeScript codebase was experiencing several critical issues that violated our modularity standards and type safety principles:

### Problems Identified

1. **Function Length Violations**: The `createRAGClient` function exceeded 172 lines, violating our 140-line axiom
2. **Type Safety Issues**: Use of `any` types and undefined type references (`AbortSignal`, `RequestInfo`)
3. **Monolithic Architecture**: Mixed concerns within single files, making maintenance difficult
4. **Poor Testability**: Large functions were difficult to test comprehensively
5. **Code Reusability**: Tightly coupled code prevented independent module usage

### Impact Assessment

- **Maintainability**: High - Large functions were difficult to understand and modify
- **Type Safety**: Critical - Type errors could lead to runtime failures
- **Developer Experience**: Medium - Linting errors and type issues slowed development
- **Code Quality**: High - Violations of established architectural principles

## Decision

We will implement a comprehensive modular refactoring strategy that addresses all identified issues while maintaining backward compatibility and improving overall code quality.

### Core Principles

1. **140-Line Axiom Enforcement**: All source files must be under 140 lines
2. **Type Safety First**: Eliminate all `any` types and ensure proper TypeScript usage
3. **Single Responsibility**: Each module has one clear, well-defined purpose
4. **Factory Pattern**: Use factory functions for clean module instantiation
5. **Interface-First Design**: Define clear contracts before implementation

### Refactoring Strategy

#### 1. Extract by Functionality

Break down monolithic functions into focused, single-responsibility modules:

```plaintext
Before: createRAGClient (172 lines)
After: 
├── rag-query.ts (33 lines)
├── rag-ingest.ts (77 lines) 
├── rag-config.ts (74 lines)
├── rag-admin.ts (67 lines)
└── rag-client.ts (39 lines) - Orchestrator
```

#### 2. Extract by Layer

Separate concerns into distinct layers:

```plaintext
Before: useRAG.ts (263 lines) - Mixed types and implementation
After:
├── rag-types.ts (141 lines) - Pure type definitions
└── useRAG.ts (55 lines) - Implementation only
```

#### 3. Type Safety Improvements

- Replace `any` types with `unknown` and proper type guards
- Use `globalThis.AbortSignal` for proper AbortSignal typing
- Ensure DOM library inclusion in TypeScript configuration
- Implement proper generic constraints with defaults

## Implementation Details

### Module Structure

The refactored RAG system follows this modular architecture:

```plaintext
packages/composables/src/ai/
├── rag-types.ts          # Type definitions and interfaces
├── rag-query.ts          # Query functionality
├── rag-ingest.ts         # Document ingestion
├── rag-config.ts         # Configuration management
├── rag-admin.ts          # Administrative operations
├── rag-search-resource.ts # Reactive search resources
├── rag-auto-refresh.ts   # Auto-refresh functionality
├── rag-client.ts         # Main orchestrator
├── useRAG.ts            # SolidJS composable
└── rag.ts               # Barrel exports
```

### Type Safety Standards

#### AbortSignal Handling

**Problem**: `'AbortSignal' is not defined` errors

**Solution**: Use `globalThis.AbortSignal` for proper type reference:

```typescript
// Correct approach (2025 best practice)
const query = async (
  params: RAGQueryParams,
  signal?: globalThis.AbortSignal
): Promise<RAGQueryResponse<TExtra>> => {
  // Implementation with full type safety
};
```

#### Generic Type Constraints

```typescript
// Proper generic with default constraint
export interface RAGQueryHit<TExtra = Record<string, unknown>> {
  id?: number | string;
  score: number;
  extra?: TExtra;
}
```

#### Interface-First Design

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

### Factory Pattern Implementation

Each module exports a factory function for clean instantiation:

```typescript
export function createRAGQueryClient(
  authFetch: RAGClientOptions['authFetch'], 
  queryUrl: string
) {
  const query = async <TExtra = Record<string, unknown>>(
    params: RAGQueryParams,
    signal?: globalThis.AbortSignal
  ): Promise<RAGQueryResponse<TExtra>> => {
    // Focused implementation
  };

  return { query };
}
```

### Composition Pattern

The main client composes specialized clients:

```typescript
export function createRAGClient(options: RAGClientOptions) {
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

## Consequences

### Positive

1. **Improved Maintainability**: Each module has a single, clear responsibility
2. **Enhanced Testability**: Small, focused units that can be thoroughly tested
3. **Better Reusability**: Modules can be imported and used independently
4. **Type Safety**: Comprehensive TypeScript interfaces with proper typing
5. **Developer Experience**: Clear, readable code that's easy to understand
6. **Scalability**: Easy to extend or modify individual components
7. **Code Quality**: Adherence to established architectural principles

### Negative

1. **Initial Refactoring Effort**: Significant upfront work to break down monolithic code
2. **File Count Increase**: More files to manage (mitigated by clear organization)
3. **Learning Curve**: Developers need to understand the new modular patterns

### Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking Changes | High | Maintain backward compatibility through proper exports |
| Performance Impact | Low | Factory pattern has minimal overhead |
| Developer Confusion | Medium | Comprehensive documentation and examples |
| Type Complexity | Low | Clear interfaces and proper generic constraints |

## Compliance

### ESLint Rules

The following rules ensure compliance with this decision:

- `max-lines-per-function`: Enforces 140-line limit
- `@typescript-eslint/no-explicit-any`: Prevents `any` type usage
- `@typescript-eslint/no-unused-vars`: Ensures clean imports

### Code Review Checklist

- [ ] All functions are under 140 lines
- [ ] No `any` types used (except where explicitly documented)
- [ ] Proper TypeScript types for all parameters and return values
- [ ] Single responsibility per module
- [ ] Clear interfaces defined before implementation
- [ ] Factory pattern used for module creation
- [ ] Proper error handling and type guards

### Monitoring

- **Linting Errors**: Zero tolerance for type safety violations
- **Function Length**: Continuous monitoring via ESLint
- **Test Coverage**: Maintain high coverage for all modules
- **Performance**: Monitor for any performance regressions

## References

- [ADR-001: Modularity Standards](./001-modularity-standards.md)
- [TypeScript Modularity Standards](../development/frontend/typescript-modularity-standards.md)
- [Reynard Modular Manifesto](./modularity-patterns.md)
- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)

## Implementation Timeline

- **Phase 1**: Core RAG system refactoring (Completed)
- **Phase 2**: Apply patterns to other large modules (In Progress)
- **Phase 3**: Documentation and training (Completed)
- **Phase 4**: Monitoring and optimization (Ongoing)

## Review Date

This ADR will be reviewed on 2025-07-27 to assess effectiveness and identify any necessary adjustments.
