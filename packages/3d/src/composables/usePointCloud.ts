// Point cloud visualization composable for SolidJS
// Orchestrates modular point cloud functionality

import { createMemo } from "solid-js";
import type {
  Point3D,
  PointCloudSettings,
  SearchIntegrationSettings,
  TouchEvent,
  MouseEvent,
} from "../types";
import { useThreeJSInitialization } from "./useThreeJSInitialization";
import { usePointCloudInteractions } from "./usePointCloudInteractions";
import { usePointCloudEvents } from "./usePointCloudEvents";
import { usePointCloudSearchIntegration } from "./usePointCloudSearchIntegration";
import { usePointCloudSettings } from "./usePointCloudSettings";
import { usePointCloudState } from "./usePointCloudState";
import { calculatePointColors } from "./usePointCloudColors";
import { calculatePointSizes } from "./usePointCloudSizes";
import { createPointCloudReturn } from "./usePointCloudReturn";

export function usePointCloud(
  points: () => Point3D[],
  settings: () => PointCloudSettings = () => ({}),
  searchIntegration: () => SearchIntegrationSettings = () => ({}),
) {
  // Initialize modular composables
  const threeJSInit = useThreeJSInitialization({});
  const interactions = usePointCloudInteractions();
  const eventsModule = usePointCloudEvents();
  const searchIntegrationModule = usePointCloudSearchIntegration(searchIntegration);
  const settingsModule = usePointCloudSettings(settings);
  const stateModule = usePointCloudState();

  // Process points with color, size, and search integration
  const processedPoints = createMemo(() => {
    const pointData = points().slice(0, settingsModule.maxPoints());
    const coloredPoints = calculatePointColors(pointData, settings().colorMapping || "similarity");
    const sizedPoints = calculatePointSizes(coloredPoints, settings().sizeMapping || "uniform", settingsModule.pointSize());
    return searchIntegrationModule.processPointsWithSearchIntegration(sizedPoints);
  });

  // Interaction handlers
  const handlePointSelection = (event: MouseEvent | TouchEvent, camera: unknown, scene: unknown) => {
    const raycaster = eventsModule.raycaster();
    const mouse = eventsModule.mouse();
    
    if (!raycaster || !mouse) {
      console.warn("Raycaster or mouse not initialized. Call eventsModule.initializeRaycaster() first.");
      return;
    }
    
    interactions.handlePointSelection(event, camera, scene, raycaster, mouse);
  };

  const handlePointHover = (event: MouseEvent | TouchEvent, camera: unknown, scene: unknown) => {
    const raycaster = eventsModule.raycaster();
    const mouse = eventsModule.mouse();
    
    if (!raycaster || !mouse) {
      console.warn("Raycaster or mouse not initialized. Call eventsModule.initializeRaycaster() first.");
      return;
    }
    
    interactions.handlePointHover(event, camera, scene, raycaster, mouse);
  };

  return createPointCloudReturn(
    threeJSInit,
    interactions,
    eventsModule,
    searchIntegrationModule,
    settingsModule,
    stateModule,
    processedPoints,
    handlePointSelection,
    handlePointHover
  );
}
