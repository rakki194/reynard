// System setup and configuration for ECS benchmark
import { createWorld } from "../../index.js";
import { TestDataGenerator } from "./test-data-generator.js";
import { ECSSystems } from "./ecs-systems.js";
export class ECSSystemSetup {
    constructor(maxEntities = 100000) {
        Object.defineProperty(this, "maxEntities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maxEntities
        });
        Object.defineProperty(this, "reynardWorld", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.reynardWorld = createWorld();
    }
    async initialize() {
        if (this.isInitialized)
            return;
        console.log("Initializing ECS systems...");
        // Register systems
        this.reynardWorld.addSystem(ECSSystems.createPositionUpdateSystem().build());
        this.reynardWorld.addSystem(ECSSystems.createCollisionSystem().build());
        this.reynardWorld.addSystem(ECSSystems.createSpatialQuerySystem().build());
        this.isInitialized = true;
        console.log("ECS systems initialized");
    }
    setupTestData(entityCount) {
        const testData = TestDataGenerator.generateTestData(entityCount);
        // Add entities to Reynard ECS
        for (const data of testData) {
            const entity = this.reynardWorld.spawnEmpty();
            this.reynardWorld.insert(entity, { ...data.position, __component: true }, { ...data.velocity, __component: true }, { ...data.acceleration, __component: true }, { ...data.mass, __component: true });
        }
    }
    getWorld() {
        return this.reynardWorld;
    }
}
