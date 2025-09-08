/**
 * BoundingBoxEditor Component - Refactored
 * 
 * A modular bounding box editing interface with separated concerns:
 * - Canvas management handled by canvasSetup utility
 * - Event handling delegated to canvasEventHandlers
 * - Label management extracted to LabelSelector component
 */

import type { Component } from 'solid-js';
import { createSignal, For, Show, onMount, createEffect, onCleanup } from 'solid-js';
import { useBoundingBoxes } from '../composables/useBoundingBoxes';
import { useBoxResize } from '../composables/useBoxResize';
import { useBoxMove } from '../composables/useBoxMove';
import { LabelSelector } from './LabelSelector';
import { setupCanvasEventHandlers } from '../handlers/canvasEventHandlers';
import { createCanvas, addBoundingBoxesToCanvas, cleanupCanvas } from '../utils/canvasSetup';
import type { BoundingBox, ImageInfo, EditorConfig, AnnotationEventHandlers } from '../types';
import { displayToImageCoords, clampBoundingBoxToImage } from '../utils/coordinateTransform';
import * as fabric from 'fabric';
import './BoundingBoxEditor.css';

export interface BoundingBoxEditorProps {
  imageInfo: ImageInfo;
  config?: EditorConfig;
  eventHandlers?: AnnotationEventHandlers;
  initialBoxes?: BoundingBox[];
  containerWidth?: number;
  containerHeight?: number;
  className?: string;
}

export const BoundingBoxEditor: Component<BoundingBoxEditorProps> = (props) => {
  const {
    imageInfo,
    config = {},
    eventHandlers = {},
    initialBoxes = [],
    containerWidth = 800,
    containerHeight = 600,
    className = '',
  } = props;

  // Create a unique identifier for this instance
  const instanceId = `bbe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // State for drawing new boxes
  const [isDrawing, setIsDrawing] = createSignal(false);
  const [newBox, setNewBox] = createSignal<Partial<BoundingBox> | null>(null);
  const [startPoint, setStartPoint] = createSignal<{ x: number; y: number } | null>(null);

  // Canvas reference
  let canvasRef: HTMLCanvasElement | undefined;
  let fabricCanvas: fabric.Canvas | undefined;

  // Bounding box management
  const boundingBoxes = useBoundingBoxes(initialBoxes);
  const boxResize = useBoxResize(boundingBoxes);
  const boxMove = useBoxMove(boundingBoxes);

  // Label management
  const [selectedLabelClass, setSelectedLabelClass] = createSignal(
    config.defaultLabel || 'default'
  );
  const [availableLabels, setAvailableLabels] = createSignal(
    config.availableLabels || ['default', 'person', 'object', 'vehicle']
  );

  // Initialize canvas on mount
  onMount(() => {
    if (!canvasRef) return;

    fabricCanvas = createCanvas(canvasRef, {
      containerWidth,
      containerHeight,
      imageInfo,
      config,
      boundingBoxes: boundingBoxes.boxes(),
    });

    // Setup event handlers
    setupCanvasEventHandlers(fabricCanvas, {
      config,
      eventHandlers,
      boundingBoxes: {
        selectBox: boundingBoxes.selectBox,
        addBox: boundingBoxes.addBox,
        updateBox: boundingBoxes.updateBox,
        removeBox: boundingBoxes.removeBox,
      },
      isDrawing,
      setIsDrawing,
      newBox,
      setNewBox,
      startPoint,
      setStartPoint,
      selectedLabelClass,
      displayToImageCoords: (x, y) => displayToImageCoords(x, y, imageInfo, containerWidth, containerHeight, config.scale || 1),
      clampBoundingBoxToImage: (box) => clampBoundingBoxToImage(box, imageInfo),
    });

    // Add initial bounding boxes
    addBoundingBoxesToCanvas(fabricCanvas, boundingBoxes.boxes(), {
      containerWidth,
      containerHeight,
      imageInfo,
      config,
      boundingBoxes: boundingBoxes.boxes(),
    });
  });

  // Update canvas when bounding boxes change
  createEffect(() => {
    if (!fabricCanvas) return;
    
    addBoundingBoxesToCanvas(fabricCanvas, boundingBoxes.boxes(), {
      containerWidth,
      containerHeight,
      imageInfo,
      config,
      boundingBoxes: boundingBoxes.boxes(),
    });
  });

  // Cleanup on unmount
  onCleanup(() => {
    if (fabricCanvas) {
      cleanupCanvas(fabricCanvas);
    }
  });

  // Handle label changes
  const handleLabelChange = (label: string) => {
    setSelectedLabelClass(label);
  };

  const handleAddLabel = (label: string) => {
    setAvailableLabels(prev => [...prev, label]);
  };

  return (
    <div class={`bounding-box-editor ${className}`} data-instance-id={instanceId}>
      {/* Toolbar */}
      <div class="editor-toolbar">
        <LabelSelector
          availableLabels={availableLabels()}
          selectedLabel={selectedLabelClass()}
          onLabelChange={handleLabelChange}
          onAddLabel={handleAddLabel}
          className="label-selector"
        />
        
        <div class="toolbar-actions">
          <button
            class="clear-button"
            onClick={() => {
              boundingBoxes.clearBoxes();
              eventHandlers.onClearAll?.();
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div class="canvas-container">
        <canvas
          ref={canvasRef}
          class="bounding-box-canvas"
          width={containerWidth}
          height={containerHeight}
        />
        
        {/* Drawing overlay */}
        <Show when={isDrawing() && newBox()}>
          <div
            class="drawing-overlay"
            style={{
              position: 'absolute',
              left: `${newBox()!.x}px`,
              top: `${newBox()!.y}px`,
              width: `${newBox()!.width}px`,
              height: `${newBox()!.height}px`,
              border: '2px dashed #ff0000',
              pointerEvents: 'none',
            }}
          />
        </Show>
      </div>

      {/* Info Panel */}
      <div class="info-panel">
        <div class="box-count">
          Boxes: {boundingBoxes.boxes().length}
        </div>
        <div class="selected-box">
          <Show when={boundingBoxes.selectedBox()}>
            Selected: {boundingBoxes.selectedBox()?.label}
          </Show>
        </div>
      </div>
    </div>
  );
};
