import { batchCollisionDetection, type AABB } from "reynard-algorithms";

/**
 * Utility functions for benchmark execution
 * Handles individual benchmark runs and algorithm testing
 */
export const runSingleBenchmark = (objects: AABB[], useSpatialHash: boolean) => {
  const start = performance.now();
  const collisions = batchCollisionDetection(objects, {
    spatialHash: {
      enableOptimization: useSpatialHash,
      cellSize: 50,
      maxObjectsPerCell: 10,
    },
  });
  return {
    time: performance.now() - start,
    collisions,
  };
};

export const benchmarkAlgorithm = (objects: AABB[], useSpatialHash: boolean) => {
  const runs = 5;
  let totalTime = 0;
  let collisionCount = 0;

  for (let i = 0; i < runs; i++) {
    const { time, collisions } = runSingleBenchmark(objects, useSpatialHash);
    totalTime += time;
    collisionCount = collisions.length;
  }

  return {
    time: totalTime / runs,
    collisionCount,
  };
};

export const warmUpAlgorithms = (objects: AABB[]) => {
  batchCollisionDetection(objects, {
    spatialHash: { enableOptimization: false, cellSize: 50, maxObjectsPerCell: 10 },
  });
  batchCollisionDetection(objects, {
    spatialHash: { enableOptimization: true, cellSize: 50, maxObjectsPerCell: 10 },
  });
};
