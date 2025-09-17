import { World } from "../../index.js";
export interface SystemSetup {
    initialize(): Promise<void>;
    setupTestData(entityCount: number): void;
    getWorld(): World;
}
export declare class ECSSystemSetup implements SystemSetup {
    private maxEntities;
    private reynardWorld;
    private isInitialized;
    constructor(maxEntities?: number);
    initialize(): Promise<void>;
    setupTestData(entityCount: number): void;
    getWorld(): World;
}
