import type { AABB } from "reynard-algorithms";

/**
 * Utility functions for generating benchmark test data
 * Handles creation of test objects for performance testing
 */
export const generateTestData = (objectCount: number): AABB[] => {
  const objects: AABB[] = [];
  for (let i = 0; i < objectCount; i++) {
    objects.push({
      x: Math.random() * 700 + 50,
      y: Math.random() * 400 + 50,
      width: 20 + Math.random() * 30,
      height: 20 + Math.random() * 30,
    });
  }
  return objects;
};

export const getBenchmarkTestSizes = (): number[] => {
  return [10, 25, 50, 100, 150, 200, 300, 500];
};
