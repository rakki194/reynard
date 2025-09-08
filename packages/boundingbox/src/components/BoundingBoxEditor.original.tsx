/**
 * BoundingBoxEditor Component
 * 
 * A comprehensive bounding box editing interface with the following features:
 * - Create new bounding boxes by click and drag
 * - Interactive resize and move existing bounding boxes
 * - Label management with custom classes
 * - Visual feedback with color-coded labels
 * - Fabric.js integration for smooth editing
 */

import type { Component } from 'solid-js';
import { createSignal, For, Show, onMount, createEffect, onCleanup } from 'solid-js';
import { useBoundingBoxes } from 'reynard-composables';
import { useBoxResize } from 'reynard-composables';
import { useBoxMove } from 'reynard-composables';
import type { BoundingBox, ImageInfo, EditorConfig, AnnotationEventHandlers } from '../types';
import { boundingBoxToDisplayCoords, displayToImageCoords, clampBoundingBoxToImage } from '../utils/coordinateTransform';
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

  // Fabric.js integration
  const [fabricCanvas, setFabricCanvas] = createSignal<fabric.Canvas | null>(null);
  const [editingBoxId, setEditingBoxId] = createSignal<string | null>(null);

  // Label management
  const [labelClasses] = createSignal<string[]>(
    config.labelClasses || ['object', 'person', 'vehicle', 'animal']
  );
  const [selectedLabelClass, setSelectedLabelClass] = createSignal<string>(
    config.defaultLabelClass || labelClasses()[0]
  );

  // Initialize bounding box management
  const boundingBoxes = useBoundingBoxes({
    initialBoxes,
    imageInfo,
    enableValidation: true,
  });

  // Initialize resize functionality
  useBoxResize({
    minWidth: 10,
    minHeight: 10,
    maxWidth: imageInfo.width,
    maxHeight: imageInfo.height,
    enableProportionalResizing: true,
    enableCornerHandles: true,
    enableEdgeHandles: true,
    onResizeStart: (boxId) => {
      console.debug('[BoundingBoxEditor] Resize started:', boxId);
    },
    onResizeMove: (boxId, dimensions) => {
      const box = boundingBoxes.getBox(boxId);
      if (box) {
        const imageCoords = displayToImageCoords(
          dimensions,
          imageInfo,
          containerWidth,
          containerHeight
        );
        const updatedBox = {
          ...box,
          x: imageCoords.x,
          y: imageCoords.y,
          width: imageCoords.width!,
          height: imageCoords.height!,
        };
        boundingBoxes.updateBox(boxId, updatedBox);
      }
    },
    onResizeEnd: (boxId, _finalDimensions) => {
      console.debug('[BoundingBoxEditor] Resize ended:', boxId);
      eventHandlers.onAnnotationUpdate?.(boxId, boundingBoxes.getBox(boxId)!);
    },
  });

  // Initialize move functionality
  useBoxMove({
    imageInfo,
    isEnabled: true,
    enableSnapping: true,
    enableAlignment: true,
    enableConstraints: true,
    onBoxMoved: (boxId, newBox) => {
      boundingBoxes.updateBox(boxId, newBox);
    },
    onBoxMoveEnd: (boxId) => {
      eventHandlers.onAnnotationUpdate?.(boxId, boundingBoxes.getBox(boxId)!);
    },
  });

  // Canvas setup
  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  // Set container dimensions
  const setContainerDimensions = (element: HTMLDivElement) => {
    if (element) {
      element.style.width = `${containerWidth}px`;
      element.style.height = `${containerHeight}px`;
    }
  };

  onMount(() => {
    if (canvasRef && containerRef) {
      try {
        const canvas = new fabric.Canvas(canvasRef, {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: 'transparent',
          selection: false,
          preserveObjectStacking: true,
        });

        setFabricCanvas(canvas);

        // Set up canvas event handlers
        setupCanvasEventHandlers(canvas);

        console.debug(`[BoundingBoxEditor] Canvas initialized for instance: ${instanceId}`);
      } catch (error) {
        console.warn(`[BoundingBoxEditor] Failed to initialize canvas:`, error);
        // In test environment, we might not be able to initialize fabric canvas
        // This is expected and we should handle it gracefully
      }
    }
  });

  onCleanup(() => {
    const canvas = fabricCanvas();
    if (canvas) {
      try {
        canvas.dispose();
      } catch (error) {
        console.warn(`[BoundingBoxEditor] Error disposing canvas:`, error);
      }
      setFabricCanvas(null);
    }
    console.debug(`[BoundingBoxEditor] Cleaned up instance: ${instanceId}`);
  });

  function setupCanvasEventHandlers(canvas: fabric.Canvas) {
    // Mouse down - start drawing or select box
    canvas.on('mouse:down', (event) => {
      if (!config.enableCreation) return;

      const pointer = canvas.getPointer(event.e);
      const startX = pointer.x;
      const startY = pointer.y;

      // Check if clicking on existing box
      const clickedObject = canvas.findTarget(event.e);
      if (clickedObject && (clickedObject as any).data?.boxId) {
        const boxId = (clickedObject as any).data.boxId;
        boundingBoxes.selectBox(boxId);
        eventHandlers.onAnnotationSelect?.(boxId);
        return;
      }

      // Start drawing new box
      setIsDrawing(true);
      setStartPoint({ x: startX, y: startY });
      setNewBox({
        id: `box-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        label: selectedLabelClass(),
        x: startX,
        y: startY,
        width: 0,
        height: 0,
      });
    });

    // Mouse move - update drawing box
    canvas.on('mouse:move', (event) => {
      if (!isDrawing() || !newBox() || !startPoint()) return;

      const pointer = canvas.getPointer(event.e);
      const currentX = pointer.x;
      const currentY = pointer.y;
      const start = startPoint()!;

      const newBoxData = {
        ...newBox()!,
        x: Math.min(start.x, currentX),
        y: Math.min(start.y, currentY),
        width: Math.abs(currentX - start.x),
        height: Math.abs(currentY - start.y),
      };

      setNewBox(newBoxData);
    });

    // Mouse up - finish drawing
    canvas.on('mouse:up', () => {
      if (!isDrawing() || !newBox()) return;

      const boxData = newBox()!;
      if (boxData.width! > 10 && boxData.height! > 10) {
        // Convert display coordinates to image coordinates
        const imageCoords = displayToImageCoords(
          { x: boxData.x!, y: boxData.y!, width: boxData.width!, height: boxData.height! },
          imageInfo,
          containerWidth,
          containerHeight
        );

        const finalBox: BoundingBox = {
          id: boxData.id!,
          label: boxData.label!,
          x: imageCoords.x,
          y: imageCoords.y,
          width: imageCoords.width!,
          height: imageCoords.height!,
          color: boxData.color,
          attributes: boxData.attributes,
        };

        // Clamp to image bounds
        const clampedBox = clampBoundingBoxToImage(finalBox, imageInfo);

        if (boundingBoxes.addBox(clampedBox)) {
          eventHandlers.onAnnotationCreate?.(clampedBox);
        }
      }

      setIsDrawing(false);
      setNewBox(null);
      setStartPoint(null);
    });
  }

  // Render bounding boxes on canvas
  createEffect(() => {
    const canvas = fabricCanvas();
    if (!canvas) return;

    try {
      // Clear existing objects
      canvas.clear();

      // Render existing boxes
      boundingBoxes.boxes().forEach((box) => {
        const displayCoords = boundingBoxToDisplayCoords(
          box,
          imageInfo,
          containerWidth,
          containerHeight
        );

        const fabricRect = new fabric.Rect({
          left: displayCoords.x,
          top: displayCoords.y,
          width: displayCoords.width,
          height: displayCoords.height,
          fill: 'transparent',
          stroke: box.color || '#007acc',
          strokeWidth: 2,
          cornerColor: '#007acc',
          cornerSize: 8,
          transparentCorners: false,
          hasRotatingPoint: false,
          lockRotation: true,
          selectable: config.enableEditing !== false,
          evented: config.enableEditing !== false,
        } as any);

        // Store custom data
        (fabricRect as any).data = { boxId: box.id };

        canvas.add(fabricRect);
      });

      // Render new box being drawn
      if (isDrawing() && newBox()) {
        const boxData = newBox()!;
        const fabricRect = new fabric.Rect({
          left: boxData.x!,
          top: boxData.y!,
          width: boxData.width!,
          height: boxData.height!,
          fill: 'transparent',
          stroke: '#ff6b6b',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        });

        canvas.add(fabricRect);
      }

      canvas.renderAll();
    } catch (error) {
      console.warn(`[BoundingBoxEditor] Error rendering canvas:`, error);
    }
  });

  function startEditingBox(boxId: string) {
    if (!config.enableEditing) return;

    setEditingBoxId(boxId);
    boundingBoxes.selectBox(boxId);
    eventHandlers.onEditingStart?.(boxId, 'edit');
  }

  function saveEditingBox() {
    const boxId = editingBoxId();
    if (!boxId) return;

    setEditingBoxId(null);
    eventHandlers.onEditingEnd?.(boxId, 'edit');
  }

  function cancelEditingBox() {
    const boxId = editingBoxId();
    if (!boxId) return;

    setEditingBoxId(null);
    eventHandlers.onEditingCancel?.(boxId);
  }

  function deleteBox(boxId: string) {
    if (!config.enableDeletion) return;

    if (boundingBoxes.deleteBox(boxId)) {
      eventHandlers.onAnnotationDelete?.(boxId);
    }
  }

  return (
    <div class={`bounding-box-editor ${className}`}>
      {/* Canvas Container */}
      <div
        ref={(el) => {
          containerRef = el;
          setContainerDimensions(el);
        }}
        class="canvas-container"
        role="img"
        aria-label="Bounding box editor canvas"
        aria-describedby="canvas-description"
      >
        <canvas ref={canvasRef} />
        <div id="canvas-description" class="sr-only">
          Interactive canvas for creating and editing bounding boxes on the image
        </div>
      </div>

      {/* Controls Panel */}
      <div class="controls-panel">
        {/* Label Classes */}
        <div class="label-classes">
          <label>Label Class:</label>
          <select
            value={selectedLabelClass()}
            onChange={(e) => setSelectedLabelClass(e.currentTarget.value)}
            aria-label="Select label class for new bounding boxes"
          >
            <For each={labelClasses()}>
              {(labelClass) => <option value={labelClass}>{labelClass}</option>}
            </For>
          </select>
        </div>

        {/* Box List */}
        <div class="box-list">
          <h4>Bounding Boxes ({boundingBoxes.boxCount()})</h4>
          <For each={boundingBoxes.boxes()}>
            {(box) => (
              <div 
                class={`box-item ${boundingBoxes.selectedBoxId() === box.id ? 'selected' : ''}`}
                onClick={() => {
                  boundingBoxes.selectBox(box.id);
                  eventHandlers.onAnnotationSelect?.(box.id);
                }}
              >
                <span class="box-label">{box.label}</span>
                <span class="box-coords">
                  ({box.x}, {box.y}) {box.width}×{box.height}
                </span>
                <div class="box-actions">
                  <Show when={config.enableEditing !== false}>
                    <button
                      onClick={() => startEditingBox(box.id)}
                      disabled={editingBoxId() === box.id}
                    >
                      Edit
                    </button>
                  </Show>
                  <Show when={config.enableDeletion !== false}>
                    <button onClick={() => deleteBox(box.id)}>Delete</button>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Editing Controls */}
        <Show when={editingBoxId()}>
          <div class="editing-controls">
            <button onClick={saveEditingBox}>Save</button>
            <button onClick={cancelEditingBox}>Cancel</button>
          </div>
        </Show>
      </div>
    </div>
  );
};
