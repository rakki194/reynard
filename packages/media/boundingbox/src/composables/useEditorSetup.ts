/**
 * Editor Setup Composable
 *
 * Orchestrates the complete editor setup and configuration
 */

import { useCanvasSetup } from "./useCanvasSetup";
import { useDrawingState } from "./useDrawingState";
import { useLabelManagement } from "./useLabelManagement";
import { useBoundingBoxSetup } from "./useBoundingBoxSetup";
import type { BoundingBox, ImageInfo, EditorConfig, AnnotationEventHandlers } from "../types";

export interface EditorSetupConfig {
  imageInfo: ImageInfo;
  config: EditorConfig;
  eventHandlers: AnnotationEventHandlers;
  initialBoxes: BoundingBox[];
  containerWidth: number;
  containerHeight: number;
}

export interface EditorSetup {
  drawingState: ReturnType<typeof useDrawingState>;
  labelManagement: ReturnType<typeof useLabelManagement>;
  boundingBoxSetup: ReturnType<typeof useBoundingBoxSetup>;
  canvasRef: (element: HTMLCanvasElement) => void;
  handleClearAll: () => void;
}

export const useEditorSetup = (setupConfig: EditorSetupConfig): EditorSetup => {
  const drawingState = useDrawingState();
  const labelManagement = useLabelManagement(setupConfig.config);
  const boundingBoxSetup = useBoundingBoxSetup(setupConfig.initialBoxes, setupConfig.imageInfo);

  const { canvasRef } = useCanvasSetup({
    containerWidth: setupConfig.containerWidth,
    containerHeight: setupConfig.containerHeight,
    imageInfo: setupConfig.imageInfo,
    config: setupConfig.config,
    boundingBoxes: boundingBoxSetup.boundingBoxes.boxes(),
    eventHandlers: setupConfig.eventHandlers,
    selectedLabelClass: labelManagement.selectedLabelClass,
    isDrawing: drawingState.isDrawing,
    setIsDrawing: drawingState.setIsDrawing,
    newBox: drawingState.newBox,
    setNewBox: drawingState.setNewBox,
    startPoint: drawingState.startPoint,
    setStartPoint: drawingState.setStartPoint,
    boundingBoxActions: {
      selectBox: boundingBoxSetup.boundingBoxes.selectBox,
      addBox: boundingBoxSetup.boundingBoxes.addBox,
      updateBox: boundingBoxSetup.boundingBoxes.updateBox,
      removeBox: boundingBoxSetup.boundingBoxes.removeBox,
      getBox: boundingBoxSetup.boundingBoxes.getBox,
    },
  });

  const handleClearAll = () => {
    boundingBoxSetup.boundingBoxes.clearBoxes();
    setupConfig.eventHandlers.onClearAll?.();
  };

  return {
    drawingState,
    labelManagement,
    boundingBoxSetup,
    canvasRef,
    handleClearAll,
  };
};
