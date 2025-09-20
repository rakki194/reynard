# Reynard ECS Test Suite

This directory contains comprehensive tests for
the Reynard ECS (Entity-Component-System) implementation. The tests are organized by system component and
cover all aspects of the ECS architecture.

## Test Structure

### Core Tests

- **`core-types.test.ts`** - Tests for fundamental ECS types (Entity, Component, Resource)
- **`world.test.ts`** - Tests for World system (entity management, component operations, resources)
- **`query.test.ts`** - Tests for Query system (component filtering, iteration, performance)
- **`system.test.ts`** - Tests for System scheduling, execution, and dependency management
- **`archetype.test.ts`** - Tests for Archetype system (entity storage optimization)
- **`change-detection.test.ts`** - Tests for Change Detection system (component modification tracking)

### Integration Tests

- **`integration.test.ts`** - End-to-end tests with complete game scenarios
- **`index.test.ts`** - Test suite index and utilities

## Test Categories

### 1. Core Types (`core-types.test.ts`)

Tests the fundamental building blocks of the ECS:

- **Entity System**: Entity creation, comparison, serialization
- **Component Interface**: Component implementation and type safety
- **Resource Interface**: Resource implementation and type safety
- **Type Safety**: Prevention of type mixing and immutability

### 2. World System (`world.test.ts`)

Tests the central ECS container:

- **Entity Management**: Spawning, despawning, lifecycle
- **Component Management**: Adding, removing, updating components
- **Resource Management**: Global state management
- **Query System**: Basic query functionality
- **Commands System**: Deferred operations
- **Error Handling**: Graceful error handling

### 3. Query System (`query.test.ts`)

Tests the component filtering and iteration system:

- **Basic Queries**: Single and multiple component queries
- **Query Filters**: `with`, `without`, `added`, `changed` filters
- **Change Detection Queries**: Change-based filtering
- **Query Iteration**: Efficient iteration over results
- **Performance**: Large-scale query performance
- **Query State Management**: State consistency across iterations

### 4. System System (`system.test.ts`)

Tests the system scheduling and execution:

- **Basic System Execution**: Simple system execution
- **System Dependencies**: Dependency-based execution order
- **System Conditions**: Conditional system execution
- **System Sets**: Grouped system execution
- **Performance**: Many systems and entities
- **Error Handling**: System error handling

### 5. Archetype System (`archetype.test.ts`)

Tests the entity storage optimization:

- **Archetype Creation**: Different component combinations
- **Component Layout**: Component type tracking and ordering
- **Entity Management**: Entity tracking in archetypes
- **Performance**: Large-scale archetype operations
- **Storage**: Component data integrity
- **Edge Cases**: Empty archetypes, rapid changes

### 6. Change Detection (`change-detection.test.ts`)

Tests the component modification tracking:

- **Tick System**: Time-based change tracking
- **Component Change Tracking**: Add, modify, remove tracking
- **Change-Based Queries**: Change detection in queries
- **Performance**: Large-scale change tracking
- **Edge Cases**: Rapid changes, tick overflow
- **Integration**: Change detection with other systems

### 7. Integration Tests (`integration.test.ts`)

Tests complete ECS scenarios:

- **Complete Game Loop**: Full game loop with all systems
- **System Dependencies**: Complex dependency chains
- **Resource Management**: Resource sharing between systems
- **Performance**: Large-scale scenarios
- **Error Handling**: System error recovery
- **Real-World Scenarios**: Complete shooter game simulation

## Running Tests

### Prerequisites

- Node.js 18+
- npm or yarn
- Vitest test runner

### Installation

```bash
npm install
```

### Running All Tests

```bash
npm test
```

### Running Specific Test Files

```bash
# Run core types tests
npm test core-types.test.ts

# Run world system tests
npm test world.test.ts

# Run query system tests
npm test query.test.ts

# Run system tests
npm test system.test.ts

# Run archetype tests
npm test archetype.test.ts

# Run change detection tests
npm test change-detection.test.ts

# Run integration tests
npm test integration.test.ts
```

### Running Tests with Coverage

```bash
npm run test:coverage
```

## Test Utilities

The test suite includes utilities for common testing patterns:

- **`TestUtils.createTestWorld()`** - Creates a test world with common types
- **`TestUtils.createTestEntities()`** - Creates test entities with various components
- **`TestUtils.measurePerformance()`** - Measures function execution time
- **`TestUtils.assertPerformance()`** - Asserts performance within limits

## Performance Benchmarks

The tests include performance benchmarks to ensure the ECS system can handle:

- **1000+ entities** with multiple components
- **100+ systems** with complex dependencies
- **10,000+ queries** per second
- **Rapid component changes** without performance degradation

## Test Data

### Common Test Components

- **`Position`** - 2D position (x, y)
- **`Velocity`** - 2D velocity (x, y)
- **`Health`** - Health points (current, maximum)
- **`Player`** - Player marker component
- **`Enemy`** - Enemy marker component
- **`Bullet`** - Bullet marker component
- **`Renderable`** - Rendering information

### Common Test Resources

- **`GameTime`** - Game timing information
- **`GameState`** - Global game state
- **`InputState`** - Input handling state

## Best Practices

### Writing Tests

1. **Use descriptive test names** that explain what is being tested
2. **Test both success and failure cases** for robust error handling
3. **Include performance tests** for critical paths
4. **Use realistic test data** that mirrors actual usage
5. **Test edge cases** like empty collections, null values, etc.

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use `beforeEach`** for common setup
3. **Keep tests focused** on a single behavior
4. **Use meaningful assertions** with clear error messages

### Performance Testing

1. **Set reasonable performance limits** based on requirements
2. **Test with realistic data sizes** (1000+ entities)
3. **Measure actual performance** not just functionality
4. **Include memory usage tests** where relevant

## Contributing

When adding new tests:

1. **Follow the existing test structure** and naming conventions
2. **Add tests for new features** in the appropriate test file
3. **Update this README** if adding new test categories
4. **Ensure all tests pass** before submitting changes
5. **Add performance tests** for performance-critical features

## Troubleshooting

### Common Issues

1. **Tests failing due to type errors** - Check that all imports are correct
2. **Performance tests failing** - Adjust performance limits based on system capabilities
3. **Memory leaks in tests** - Ensure proper cleanup in `afterEach` blocks
4. **Flaky tests** - Add proper synchronization and avoid race conditions

### Debug Tips

1. **Use `console.log`** for debugging test execution
2. **Check test coverage** to ensure all code paths are tested
3. **Run tests individually** to isolate issues
4. **Use test utilities** for common testing patterns
