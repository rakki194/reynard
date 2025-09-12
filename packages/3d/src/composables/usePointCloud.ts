// Point cloud visualization composable for SolidJS
// Orchestrates modular point cloud functionality

import type {
  Point3D,
  PointCloudSettings,
  SearchIntegrationSettings,
} from "../types";
import { useThreeJSInitialization } from "./useThreeJSInitialization";
import { usePointCloudInteractions } from "./usePointCloudInteractions";
import { usePointCloudEvents } from "./usePointCloudEvents";
import { usePointCloudSearchIntegration } from "./usePointCloudSearchIntegration";
import { usePointCloudSettings } from "./usePointCloudSettings";
import { usePointCloudState } from "./usePointCloudState";
import { usePointCloudProcessing } from "./usePointCloudProcessing";
import { usePointCloudHandlers } from "./usePointCloudHandlers";
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
  const searchIntegrationModule =
    usePointCloudSearchIntegration(searchIntegration);
  const settingsModule = usePointCloudSettings(settings);
  const stateModule = usePointCloudState();

  // Process points with color, size, and search integration
  const { processedPoints } = usePointCloudProcessing(
    points,
    settings,
    settingsModule.maxPoints,
    settingsModule.pointSize,
    searchIntegrationModule.processPointsWithSearchIntegration,
  );

  // Create interaction handlers
  const { createPointSelectionHandler, createPointHoverHandler } =
    usePointCloudHandlers(
      eventsModule.raycaster,
      eventsModule.mouse,
      interactions.handlePointSelection,
      interactions.handlePointHover,
    );

  return createPointCloudReturn(
    threeJSInit,
    interactions,
    eventsModule,
    searchIntegrationModule,
    settingsModule,
    stateModule,
    processedPoints,
    createPointSelectionHandler,
    createPointHoverHandler,
  );
}
