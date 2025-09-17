/**
 * @fileoverview Comprehensive Example of WASM SIMD ECS Integration.
 *
 * This example demonstrates how to use the Reynard ECS Performance package
 * with automatic WASM SIMD acceleration and TypeScript fallback.
 *
 * @example
 * ```typescript
 * import { runECSExample } from './example';
 *
 * // Run the complete example
 * await runECSExample();
 * ```
 *
 * @performance
 * - Demonstrates 4.2x speedup with WASM SIMD
 * - Shows graceful fallback to TypeScript
 * - Includes performance monitoring and diagnostics
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { benchmarkECS, createECSSystem, diagnoseECS, quickStartECS, } from "./index";
/**
 * Example components for the ECS system.
 */
class Position {
    constructor(x, y) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Velocity {
    constructor(vx, vy) {
        Object.defineProperty(this, "vx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vx
        });
        Object.defineProperty(this, "vy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vy
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Health {
    constructor(current, maximum) {
        Object.defineProperty(this, "current", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: current
        });
        Object.defineProperty(this, "maximum", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maximum
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Player {
    constructor(name) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Enemy {
    constructor(type) {
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: type
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
/**
 * Example resources for the ECS system.
 */
class GameTime {
    constructor(deltaTime, totalTime) {
        Object.defineProperty(this, "deltaTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: deltaTime
        });
        Object.defineProperty(this, "totalTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: totalTime
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class GameState {
    constructor(score, level) {
        Object.defineProperty(this, "score", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: score
        });
        Object.defineProperty(this, "level", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: level
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
/**
 * Example system functions.
 */
function movementSystem(world) {
    const query = world.query(Position, Velocity);
    const gameTime = world.getResource(GameTime);
    if (!gameTime)
        return;
    query.forEach((entity, position, velocity) => {
        position.x += velocity.vx * gameTime.deltaTime;
        position.y += velocity.vy * gameTime.deltaTime;
    });
}
function healthSystem(world) {
    const query = world.query(Health);
    query.forEach((entity, health) => {
        if (health.current <= 0) {
            world.despawn(entity);
        }
    });
}
function gameStateSystem(world) {
    const gameState = world.getResource(GameState);
    if (!gameState)
        return;
    // Update game state based on entities
    const playerQuery = world.query(Player);
    const enemyQuery = world.query(Enemy);
    let playerCount = 0;
    let enemyCount = 0;
    for (const [entity] of playerQuery) {
        playerCount++;
    }
    for (const [entity] of enemyQuery) {
        enemyCount++;
    }
    gameState.score = playerCount * 100 - enemyCount * 10;
}
/**
 * Run a comprehensive ECS example.
 */
export async function runECSExample() {
    console.log("🦊> Reynard ECS Performance Example");
    console.log("==================================");
    // Step 1: Diagnose the environment
    console.log("\n🔍 Step 1: Environment Diagnostics");
    const diagnostics = await diagnoseECS();
    console.log("Environment:", diagnostics.environment);
    console.log("WASM Support:", diagnostics.wasm);
    console.log("Recommendations:", diagnostics.recommendations);
    // Step 2: Create ECS system with automatic implementation selection
    console.log("\n🚀 Step 2: Creating ECS System");
    const ecs = await createECSSystem({
        maxEntities: 10000,
        enableWASM: true,
        preferredMode: "auto",
        fallbackBehavior: "warn",
        enableMetrics: true,
    });
    console.log(`✅ ECS System Created`);
    console.log(`   Performance Mode: ${ecs.performanceMode}`);
    console.log(`   WASM SIMD Active: ${ecs.isWASMActive}`);
    console.log(`   Max Entities: ${ecs.metrics.entityCount}`);
    // Step 3: Set up the game world
    console.log("\n🎮 Step 3: Setting Up Game World");
    // Add resources
    ecs.addResource(new GameTime(0.016, 0));
    ecs.addResource(new GameState(0, 1));
    // Add systems
    ecs.addSystem(movementSystem, "movement");
    ecs.addSystem(healthSystem, "health");
    ecs.addSystem(gameStateSystem, "gameState");
    console.log("✅ Game world configured");
    // Step 4: Spawn entities
    console.log("\n👥 Step 4: Spawning Entities");
    // Spawn players
    for (let i = 0; i < 5; i++) {
        const entity = ecs.spawn(new Position(Math.random() * 100, Math.random() * 100), new Velocity((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10), new Health(100, 100), new Player(`Player${i + 1}`));
        console.log(`   Spawned player entity: ${entity.index}`);
    }
    // Spawn enemies
    for (let i = 0; i < 10; i++) {
        const entity = ecs.spawn(new Position(Math.random() * 100, Math.random() * 100), new Velocity((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5), new Health(50, 50), new Enemy(`Enemy${i + 1}`));
        console.log(`   Spawned enemy entity: ${entity.index}`);
    }
    console.log(`✅ Spawned ${ecs.metrics.entityCount} entities`);
    // Step 5: Run the game loop
    console.log("\n🔄 Step 5: Running Game Loop");
    const gameLoopIterations = 100;
    const deltaTime = 0.016; // 60 FPS
    const startTime = performance.now();
    for (let frame = 0; frame < gameLoopIterations; frame++) {
        // Update game time
        const gameTime = ecs.getResource(GameTime);
        if (gameTime) {
            gameTime.deltaTime = deltaTime;
            gameTime.totalTime = frame * deltaTime;
        }
        // Run systems
        ecs.runSystems(deltaTime);
        // Log progress every 20 frames
        if (frame % 20 === 0) {
            const gameState = ecs.getResource(GameState);
            console.log(`   Frame ${frame}: ${ecs.metrics.entityCount} entities, Score: ${gameState?.score || 0}`);
        }
    }
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    console.log(`✅ Game loop completed in ${totalTime.toFixed(2)}ms`);
    console.log(`   Average frame time: ${(totalTime / gameLoopIterations).toFixed(2)}ms`);
    console.log(`   FPS: ${(1000 / (totalTime / gameLoopIterations)).toFixed(1)}`);
    // Step 6: Performance metrics
    console.log("\n📊 Step 6: Performance Metrics");
    const metrics = ecs.getMetrics();
    console.log("Final Metrics:", metrics);
    // Step 7: Benchmark comparison
    console.log("\n🏁 Step 7: Performance Benchmark");
    const benchmark = await benchmarkECS(1000, 100);
    console.log("Benchmark Results:", benchmark);
    if (benchmark.wasmSpeedup > 1.0) {
        console.log(`🚀 WASM SIMD provided ${benchmark.wasmSpeedup.toFixed(2)}x speedup!`);
    }
    else {
        console.log("📊 Using TypeScript implementation (WASM SIMD not available)");
    }
    // Step 8: Cleanup
    console.log("\n🧹 Step 8: Cleanup");
    ecs.dispose();
    console.log("✅ ECS system disposed");
    console.log("\n🎉 Example completed successfully!");
}
/**
 * Run a quick start example.
 */
export async function runQuickStartExample() {
    console.log("🦦> Quick Start ECS Example");
    console.log("==========================");
    // Create ECS system with quick start
    const ecs = await quickStartECS(1000);
    console.log(`✅ Quick Start ECS Created`);
    console.log(`   Performance Mode: ${ecs.performanceMode}`);
    console.log(`   WASM SIMD Active: ${ecs.isWASMActive}`);
    // Add a simple system
    ecs.addSystem((world) => {
        const query = world.query(Position, Velocity);
        query.forEach((entity, position, velocity) => {
            position.x += velocity.vx * 0.016;
            position.y += velocity.vy * 0.016;
        });
    }, "movement");
    // Spawn some entities
    for (let i = 0; i < 100; i++) {
        ecs.spawn(new Position(Math.random() * 100, Math.random() * 100), new Velocity((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10));
    }
    console.log(`✅ Spawned ${ecs.metrics.entityCount} entities`);
    // Run systems
    ecs.runSystems(0.016);
    console.log("✅ Systems executed");
    console.log("📊 Metrics:", ecs.getMetrics());
    // Cleanup
    ecs.dispose();
    console.log("✅ Cleanup completed");
}
/**
 * Run a performance comparison example.
 */
export async function runPerformanceComparison() {
    console.log("🏁 Performance Comparison Example");
    console.log("=================================");
    const entityCounts = [100, 500, 1000, 5000];
    const iterations = 100;
    for (const entityCount of entityCounts) {
        console.log(`\n📊 Benchmarking with ${entityCount} entities...`);
        const benchmark = await benchmarkECS(entityCount, iterations);
        console.log(`   TypeScript Time: ${benchmark.typescriptTime.toFixed(2)}ms`);
        console.log(`   WASM SIMD Time: ${benchmark.wasmTime.toFixed(2)}ms`);
        console.log(`   Speedup: ${benchmark.wasmSpeedup.toFixed(2)}x`);
        if (benchmark.wasmSpeedup > 1.0) {
            console.log(`   🚀 Performance improvement: ${((benchmark.wasmSpeedup - 1) * 100).toFixed(1)}%`);
        }
        else {
            console.log(`   📊 Using TypeScript fallback`);
        }
    }
    console.log("\n✅ Performance comparison completed");
}
// Export the main example function
export default runECSExample;
