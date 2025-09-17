export declare class ECSComparisonBenchmark {
    private maxEntities;
    private simdSystem;
    private systemSetup;
    private benchmarkRunner;
    private isInitialized;
    constructor(maxEntities?: number);
    /**
     * Initialize both systems
     */
    initialize(): Promise<void>;
    /**
     * Setup test data for both systems
     */
    private setupTestData;
    /**
     * Run complete comparison benchmark
     */
    runComparisonBenchmark(): Promise<void>;
    private runBenchmarkSuite;
    /**
     * Clean up resources
     */
    destroy(): void;
}
