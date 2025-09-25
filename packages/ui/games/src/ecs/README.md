# Reynard ECS System

A complete Entity-Component-System (ECS) implementation for TypeScript,
inspired by Bevy ECS architecture. This system provides high-performance, type-safe entity management for games and
simulations.

## Features

- **Entity Management**: Generational indexing prevents use-after-free bugs
- **Component System**: Flexible component storage with Table and SparseSet strategies
- **Resource System**: Global singleton data management
- **Query System**: Type-safe component access with filtering
- **System Scheduling**: Dependency-based system execution
- **Change Detection**: Track component modifications
- **Commands**: Deferred world modifications

## Core Concepts

### Entities

Lightweight identifiers that group components together. Entities use generational indexing to prevent bugs when
reusing entity IDs.

```typescript
import { createEntity, entityToString } from "./ecs";

const entity = createEntity(0, 1);
console.log(entityToString(entity)); // "0v1"
```

### Components

Data containers that can be attached to entities. Components implement the `Component` interface.

```typescript
import { Component } from "./ecs";

class Position implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number
  ) {}
}

class Velocity implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number
  ) {}
}
```

### Resources

Global singleton data accessible to all systems. Resources implement the `Resource` interface.

```typescript
import { Resource } from "./ecs";

class GameTime implements Resource {
  readonly __resource = true;
  constructor(
    public deltaTime: number,
    public totalTime: number
  ) {}
}
```

### Systems

Functions that operate on components and resources. Systems are the behavior layer of the ECS.

```typescript
import { World } from "./ecs";

function movementSystem(world: World): void {
  const gameTime = world.getResource(GameTime);
  if (!gameTime) return;

  const query = world.query(Position, Velocity);
  query.forEach((entity, position, velocity) => {
    position.x += velocity.x * gameTime.deltaTime;
    position.y += velocity.y * gameTime.deltaTime;
  });
}
```

## Usage

### Basic Setup

```typescript
import { createWorld, ComponentType, ResourceType, StorageType, system, schedule } from "./ecs";

// Create world
const world = createWorld();

// Register component types
const registry = world.getComponentRegistry();
const positionType = registry.register("Position", StorageType.Table, () => new Position(0, 0));
const velocityType = registry.register("Velocity", StorageType.Table, () => new Velocity(0, 0));

// Register resource types
const resourceRegistry = world.getResourceRegistry();
const gameTimeType = resourceRegistry.register("GameTime", () => new GameTime(0, 0));

// Add systems
world.addSystem(system("movement", movementSystem).build());

// Create entities
const player = world.spawn(new Position(100, 100), new Velocity(50, 0));

// Add resources
world.insertResource(new GameTime(0.016, 0));

// Run systems
world.runSystem("movement");
```

### Advanced Features

#### Query Filtering

```typescript
import { QueryFilter } from "./ecs";

// Query entities with Position but without Velocity
const filter: QueryFilter = {
  with: [positionType],
  without: [velocityType],
};

const query = world.queryFiltered([positionType], filter);
```

#### System Dependencies

```typescript
// Create systems with dependencies
const movementSystem = system("movement", movementSystemFn).after("input").build();

const inputSystem = system("input", inputSystemFn).build();

// Systems will run in order: input -> movement
```

#### Commands for Deferred Operations

```typescript
function spawnBulletSystem(world: World): void {
  const commands = world.commands();

  // Deferred operations
  commands.spawn(new Position(100, 100), new Velocity(0, -300), new Bullet(300));

  // Commands are applied at the end of the system
}
```

## Storage Strategies

### Table Storage (Dense)

- Optimized for iteration
- Components stored in contiguous arrays
- Best for frequently accessed components

```typescript
const positionType = registry.register("Position", StorageType.Table, () => new Position(0, 0));
```

### SparseSet Storage (Sparse)

- Optimized for insertion/removal
- Components stored in hash maps
- Best for optional components

```typescript
const powerUpType = registry.register("PowerUp", StorageType.SparseSet, () => new PowerUp());
```

## Performance Considerations

1. **Use Table storage** for components that are frequently iterated
2. **Use SparseSet storage** for optional components
3. **Minimize system dependencies** to enable parallel execution
4. **Use queries efficiently** - avoid creating queries in hot paths
5. **Batch operations** using commands when possible

## Examples

See the `examples/` directory for complete game implementations:

- **Basic Game**: Simple player movement and enemy AI
- **Shooting Game**: Bullet physics and collision detection
- **Component Examples**: Various component patterns
- **System Examples**: Different system architectures

## API Reference

### Core Types

- `Entity`: Lightweight entity identifier
- `Component`: Base interface for all components
- `Resource`: Base interface for all resources
- `World`: Main ECS container
- `System`: Behavior functions
- `Query`: Component access patterns

### Storage Types

- `StorageType.Table`: Dense storage for frequent access
- `StorageType.SparseSet`: Sparse storage for optional components

### Query Filters

- `with`: Entities must have these components
- `without`: Entities must not have these components
- `added`: Entities that had these components added this frame
- `changed`: Entities that had these components changed this frame

## Architecture Diagrams

### High-Level ECS Architecture

```mermaid
graph TB
    subgraph "ECS World"
        World[World Container]

        subgraph "Entity Management"
            EM[Entity Manager]
            E[Entities<br/>index + generation]
        end

        subgraph "Component System"
            CR[Component Registry]
            CS[Component Storage]
            TS[Table Storage<br/>Dense Arrays]
            SS[SparseSet Storage<br/>Hash Maps]
        end

        subgraph "Archetype System"
            AS[Archetype Manager]
            A[Archetypes<br/>Component Layout Groups]
        end

        subgraph "Query System"
            QB[Query Builder]
            Q[Query Engine]
            QR[Query Results]
        end

        subgraph "System Execution"
            S[Systems]
            SCH[Schedule Manager]
            CD[Change Detection]
        end

        subgraph "Resource System"
            RR[Resource Registry]
            RS[Resource Storage]
        end

        subgraph "Commands"
            C[Commands Queue]
            DC[Deferred Commands]
        end
    end

    World --> EM
    World --> CR
    World --> AS
    World --> QB
    World --> S
    World --> RR
    World --> C

    EM --> E
    CR --> CS
    CS --> TS
    CS --> SS
    AS --> A
    QB --> Q
    Q --> QR
    S --> SCH
    S --> CD
    RR --> RS
    C --> DC

    Q --> CS
    Q --> AS
    Q --> CD
    S --> Q
    S --> RS
    DC --> World
```

### Component Storage Strategies

```mermaid
graph LR
    subgraph "Storage Strategy Comparison"
        subgraph "Table Storage (Dense)"
            T1[Entity 0: Position]
            T2[Entity 1: Position]
            T3[Entity 2: Position]
            T4[Entity 3: Position]
            T5[Entity 4: Position]

            T1 --> T2
            T2 --> T3
            T3 --> T4
            T4 --> T5

            TDesc["✅ Fast iteration<br/>✅ Cache-friendly<br/>❌ Slow insertion/removal<br/>❌ Memory fragmentation"]
        end

        subgraph "SparseSet Storage (Sparse)"
            S1[Entity 0: PowerUp]
            S3[Entity 2: PowerUp]
            S5[Entity 4: PowerUp]

            SMap["HashMap<br/>0 → PowerUp<br/>2 → PowerUp<br/>4 → PowerUp"]

            SDesc["✅ Fast insertion/removal<br/>✅ Memory efficient<br/>❌ Slower iteration<br/>❌ Cache misses"]
        end
    end

    TDesc --> T1
    SDesc --> S1
```

### Entity Lifecycle and Archetype Management

```mermaid
sequenceDiagram
    participant App as Application
    participant World as World
    participant EM as Entity Manager
    participant AS as Archetype System
    participant CS as Component Storage

    App->>World: spawn(Position, Velocity)
    World->>EM: allocate()
    EM-->>World: Entity{index: 0, generation: 1}

    World->>CS: insert(entity, Position)
    World->>CS: insert(entity, Velocity)

    World->>AS: updateEntityArchetype(entity)
    AS->>AS: getOrCreateArchetype([Position, Velocity])
    AS-->>World: ArchetypeId{index: 1}

    Note over AS: Entity now in archetype<br/>with Position + Velocity

    App->>World: insert(entity, Health)
    World->>CS: insert(entity, Health)
    World->>AS: updateEntityArchetype(entity)
    AS->>AS: getOrCreateArchetype([Position, Velocity, Health])
    AS-->>World: ArchetypeId{index: 2}

    Note over AS: Entity moved to new archetype<br/>with Position + Velocity + Health

    App->>World: remove(entity, Velocity)
    World->>CS: remove(entity, Velocity)
    World->>AS: updateEntityArchetype(entity)
    AS->>AS: getOrCreateArchetype([Position, Health])
    AS-->>World: ArchetypeId{index: 3}

    Note over AS: Entity moved to archetype<br/>with Position + Health only
```

### Query System and Filtering

```mermaid
graph TD
    subgraph "Query Execution Pipeline"
        QB[Query Builder]

        subgraph "Query Filters"
            W[WITH Components]
            WO[WITHOUT Components]
            A[ADDED Components]
            C[CHANGED Components]
            R[REMOVED Components]
        end

        subgraph "Query Execution"
            QE[Query Engine]
            AM[Archetype Matching]
            CD[Change Detection]
            CS[Component Storage]
        end

        subgraph "Result Processing"
            QR[Query Result]
            FE[forEach Iterator]
            FM[filter/map Operations]
        end
    end

    QB --> W
    QB --> WO
    QB --> A
    QB --> C
    QB --> R

    W --> QE
    WO --> QE
    A --> QE
    C --> QE
    R --> QE

    QE --> AM
    QE --> CD
    QE --> CS

    AM --> QR
    CD --> QR
    CS --> QR

    QR --> FE
    QR --> FM

    subgraph "Example Query"
        EQ["world.query(Position, Velocity)<br/>.without(Dead)<br/>.changed(Position)<br/>.forEach((entity, pos, vel) => {<br/>  // Update position<br/>})"]
    end

    EQ -.-> QB
```

### System Execution and Scheduling

```mermaid
graph TB
    subgraph "System Scheduling Architecture"
        subgraph "System Definition"
            S1[Input System]
            S2[Movement System]
            S3[Physics System]
            S4[Render System]
        end

        subgraph "Dependency Graph"
            S1 --> S2
            S2 --> S3
            S3 --> S4

            S1 -.-> S4
            S2 -.-> S4
        end

        subgraph "Schedule Execution"
            SCH[Schedule Manager]
            TP[Topological Sort]
            PE[Parallel Execution]
            SE[Sequential Execution]
        end

        subgraph "Execution Phases"
            P1[Phase 1: Input]
            P2[Phase 2: Movement]
            P3[Phase 3: Physics]
            P4[Phase 4: Render]
        end
    end

    S1 --> SCH
    S2 --> SCH
    S3 --> SCH
    S4 --> SCH

    SCH --> TP
    TP --> PE
    TP --> SE

    PE --> P1
    SE --> P2
    SE --> P3
    SE --> P4

    subgraph "System Conditions"
        SC1[Every Frame]
        SC2[Every N Frames]
        SC3[On Event]
        SC4[Custom Condition]
    end

    S1 --> SC1
    S2 --> SC1
    S3 --> SC2
    S4 --> SC1
```

### Change Detection System

```mermaid
graph LR
    subgraph "Change Detection Flow"
        subgraph "Component Operations"
            CO1[Component Added]
            CO2[Component Changed]
            CO3[Component Removed]
        end

        subgraph "Tick System"
            CT[Current Tick]
            LT[Last Check Tick]
            IT[Tick Increment]
        end

        subgraph "Change Tracking"
            CTM[Component Ticks Map]
            AT[Added Tick]
            CHT[Changed Tick]
            RT[Removed Tick]
        end

        subgraph "Query Integration"
            QI[Query Filters]
            CD[Change Detection]
            QR[Query Results]
        end
    end

    CO1 --> AT
    CO2 --> CHT
    CO3 --> RT

    AT --> CTM
    CHT --> CTM
    RT --> CTM

    CTM --> CT
    CT --> LT
    CT --> IT

    QI --> CD
    CD --> CTM
    CD --> QR

    subgraph "Example: Changed Components"
        EC["query(Position)<br/>.changed(Position)<br/>.forEach((entity, pos) => {<br/>  // Only entities with<br/>  // modified Position<br/>})"]
    end

    EC -.-> QI
```

### Performance Optimization Strategies

```mermaid
graph TB
    subgraph "Performance Optimization Layers"
        subgraph "Memory Layout"
            ML1[Archetype Grouping]
            ML2[Component Arrays]
            ML3[Cache-Friendly Access]
        end

        subgraph "Query Optimization"
            QO1[Archetype Filtering]
            QO2[Component Bitmasking]
            QO3[Early Termination]
        end

        subgraph "System Optimization"
            SO1[Parallel Execution]
            SO2[Dependency Minimization]
            SO3[Batch Processing]
        end

        subgraph "Storage Optimization"
            STO1[Table vs SparseSet]
            STO2[Memory Pooling]
            STO3[Component Packing]
        end
    end

    ML1 --> ML2
    ML2 --> ML3

    QO1 --> QO2
    QO2 --> QO3

    SO1 --> SO2
    SO2 --> SO3

    STO1 --> STO2
    STO2 --> STO3

    subgraph "Performance Metrics"
        PM1[Entity Count: 10K+]
        PM2[Component Count: 100+]
        PM3[System Count: 50+]
        PM4[Frame Rate: 60 FPS]
    end

    ML3 --> PM1
    QO3 --> PM2
    SO3 --> PM3
    STO3 --> PM4
```

### Advanced Features Integration

```mermaid
graph TB
    subgraph "Advanced ECS Features"
        subgraph "Bundle System"
            B[Bundle Registry]
            BC[Bundle Creation]
            BI[Bundle Info]
        end

        subgraph "Event System"
            E[Event Registry]
            ER[Event Reader]
            EW[Event Writer]
        end

        subgraph "Parallel Processing"
            PP[Parallel Iterator]
            PC[Parallel Commands]
            TP[Task Pool]
        end

        subgraph "Component Hooks"
            CH[Component Hooks]
            CHR[Hook Registry]
            CHC[Common Hooks]
        end

        subgraph "Query State Management"
            QS[Query State]
            QSB[Query State Builder]
            QSM[Query State Manager]
        end
    end

    B --> BC
    BC --> BI

    E --> ER
    E --> EW

    PP --> PC
    PC --> TP

    CH --> CHR
    CHR --> CHC

    QS --> QSB
    QSB --> QSM

    subgraph "Integration Points"
        IP1[World Integration]
        IP2[System Integration]
        IP3[Query Integration]
    end

    BI --> IP1
    EW --> IP2
    TP --> IP2
    CHC --> IP1
    QSM --> IP3
```

## Integration with Reynard

This ECS system is designed to integrate seamlessly with the Reynard framework:

- **SolidJS Integration**: Systems can be used in SolidJS components
- **Type Safety**: Full TypeScript support with strict typing
- **Performance**: Optimized for 60fps game loops
- **Modularity**: Can be used independently or as part of larger applications

## License

Part of the Reynard framework. See main project license for details.
