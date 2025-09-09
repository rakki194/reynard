/**
 * Three.js Initializer Module
 * Orchestrates the complete Three.js setup process
 */

import { createThreeJSSetup, createPointCloud, AnimationLoop } from "./index";
import type { ThreeJSObjects } from "./ThreeJSSetup";

export interface InitializationConfig {
  width: number;
  height: number;
  backgroundColor: string;
  pointCount: number;
  colorPalette: number[];
}

export interface InitializedThreeJS {
  objects: ThreeJSObjects;
  animationLoop: AnimationLoop;
  points: any;
}

export const initializeThreeJS = async (
  container: HTMLDivElement,
  config: InitializationConfig,
): Promise<InitializedThreeJS> => {
  const setupConfig = {
    width: config.width,
    height: config.height,
    backgroundColor: config.backgroundColor,
  };

  const objects = await createThreeJSSetup(container, setupConfig);

  const pointCloudConfig = {
    pointCount: config.pointCount,
    colorPalette: config.colorPalette,
  };

  const points = await createPointCloud(objects.scene, pointCloudConfig);

  const animationLoop = new AnimationLoop({
    ...objects,
    points,
  });

  return { objects, animationLoop, points };
};
