// System setup and configuration for ECS benchmark

import { 
  createWorld, 
  World
} from '../../index.js';
import { TestDataGenerator } from './test-data-generator.js';
import { ECSSystems } from './ecs-systems.js';

export interface SystemSetup {
  initialize(): Promise<void>;
  setupTestData(entityCount: number): void;
  getWorld(): World;
}

export class ECSSystemSetup implements SystemSetup {
  private reynardWorld: World;
  private isInitialized: boolean = false;

  constructor(private maxEntities: number = 100000) {
    this.reynardWorld = createWorld();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing ECS systems...');
    
    // Register systems
    this.reynardWorld.addSystem(ECSSystems.createPositionUpdateSystem().build());
    this.reynardWorld.addSystem(ECSSystems.createCollisionSystem().build());
    this.reynardWorld.addSystem(ECSSystems.createSpatialQuerySystem().build());

    this.isInitialized = true;
    console.log('ECS systems initialized');
  }

  setupTestData(entityCount: number): void {
    const testData = TestDataGenerator.generateTestData(entityCount);

    // Add entities to Reynard ECS
    for (const data of testData) {
      const entity = this.reynardWorld.spawnEmpty();
      this.reynardWorld.insert(entity, 
        { ...data.position, __component: true as const },
        { ...data.velocity, __component: true as const },
        { ...data.acceleration, __component: true as const },
        { ...data.mass, __component: true as const }
      );
    }
  }

  getWorld(): World {
    return this.reynardWorld;
  }
}
