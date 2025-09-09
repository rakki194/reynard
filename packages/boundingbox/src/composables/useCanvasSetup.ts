/**
 * Canvas Setup Composable
 *
 * Handles canvas initialization and lifecycle management
 */

import { createSignal, onMount, onCleanup, createEffect } from "solid-js";
import type { BoundingBox, ImageInfo, EditorConfig } from "../types";
import type { Setter } from "solid-js";
import {
  createCanvas,
  addBoundingBoxesToCanvas,
  cleanupCanvas,
} from "../utils/canvasSetup";
import { setupCanvasEventHandlers } from "../handlers/canvasEventHandlers";
import {
  displayToImageCoords,
  clampBoundingBoxToImage,
} from "../utils/coordinateTransform";
import * as fabric from "fabric";

export interface CanvasSetupConfig {
  containerWidth: number;
  containerHeight: number;
  imageInfo: ImageInfo;
  config: EditorConfig;
  boundingBoxes: BoundingBox[];
  eventHandlers: any;
  selectedLabelClass: () => string;
  isDrawing: () => boolean;
  setIsDrawing: Setter<boolean>;
  newBox: () => Partial<BoundingBox> | null;
  setNewBox: Setter<Partial<BoundingBox> | null>;
  startPoint: () => { x: number; y: number } | null;
  setStartPoint: Setter<{ x: number; y: number } | null>;
  boundingBoxActions: {
    selectBox: (id: string) => void;
    addBox: (box: BoundingBox) => void;
    updateBox: (id: string, updates: Partial<BoundingBox>) => void;
    removeBox: (id: string) => void;
    getBox: (id: string) => BoundingBox | undefined;
  };
}

export const useCanvasSetup = (config: CanvasSetupConfig) => {
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>();
  const [fabricCanvas, setFabricCanvas] = createSignal<fabric.Canvas>();

  onMount(() => {
    const canvas = canvasRef();
    if (!canvas) return;

    const fabric = createCanvas(canvas, {
      containerWidth: config.containerWidth,
      containerHeight: config.containerHeight,
      imageInfo: config.imageInfo,
      config: config.config,
      boundingBoxes: config.boundingBoxes,
    });

    setFabricCanvas(fabric);

    // Setup event handlers
    setupCanvasEventHandlers(fabric, {
      config: config.config,
      eventHandlers: config.eventHandlers,
      scale: config.config.scale,
      boundingBoxes: config.boundingBoxActions,
      isDrawing: config.isDrawing,
      setIsDrawing: config.setIsDrawing,
      newBox: config.newBox,
      setNewBox: config.setNewBox,
      startPoint: config.startPoint,
      setStartPoint: config.setStartPoint,
      selectedLabelClass: config.selectedLabelClass,
      displayToImageCoords: (x, y) =>
        displayToImageCoords(
          { x, y },
          config.imageInfo,
          config.containerWidth,
          config.containerHeight,
        ),
      clampBoundingBoxToImage: (box) =>
        clampBoundingBoxToImage(box, config.imageInfo),
    });

    // Add initial bounding boxes
    addBoundingBoxesToCanvas(fabric, config.boundingBoxes, {
      containerWidth: config.containerWidth,
      containerHeight: config.containerHeight,
      imageInfo: config.imageInfo,
      config: config.config,
      boundingBoxes: config.boundingBoxes,
    });
  });

  // Update canvas when bounding boxes change
  createEffect(() => {
    const fabric = fabricCanvas();
    if (!fabric) return;

    addBoundingBoxesToCanvas(fabric, config.boundingBoxes, {
      containerWidth: config.containerWidth,
      containerHeight: config.containerHeight,
      imageInfo: config.imageInfo,
      config: config.config,
      boundingBoxes: config.boundingBoxes,
    });
  });

  onCleanup(() => {
    const fabric = fabricCanvas();
    if (fabric) {
      cleanupCanvas(fabric);
    }
  });

  return {
    canvasRef: setCanvasRef,
    fabricCanvas: fabricCanvas(),
  };
};
