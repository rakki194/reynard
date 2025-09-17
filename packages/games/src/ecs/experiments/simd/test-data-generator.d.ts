import { TestData } from "./benchmark-types.js";
export declare class TestDataGenerator {
    static generateTestData(entityCount: number): TestData[];
    static generateVectorArrays(size: number): {
        a: Float32Array;
        b: Float32Array;
    };
}
