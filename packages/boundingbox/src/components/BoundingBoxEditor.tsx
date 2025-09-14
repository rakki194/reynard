/**
 * BoundingBoxEditor Component
 *
 * Main component for editing bounding box annotations on images.
 * Provides a complete interface for creating, editing, and managing bounding boxes.
 */

import { createSignal, onMount, Show } from "solid-js";
import type {
  BoundingBox,
  ImageInfo,
  EditorConfig,
  AnnotationEventHandlers,
} from "../types";
import { useBoundingBoxes } from "../composables/useBoundingBoxes";
import { useLabelManagement } from "../composables/useLabelManagement";

export interface BoundingBoxEditorProps {
  imageInfo: ImageInfo;
  config: EditorConfig;
  eventHandlers?: AnnotationEventHandlers;
  initialBoxes?: BoundingBox[];
  className?: string;
  containerWidth?: number;
  containerHeight?: number;
}

export function BoundingBoxEditor(props: BoundingBoxEditorProps) {
  const {
    imageInfo,
    config,
    eventHandlers = {},
    initialBoxes = [],
    className = "",
    containerWidth = 800,
    containerHeight = 600,
  } = props;

  const [isClient, setIsClient] = createSignal(false);

  // Initialize composables only on client side
  let boundingBoxes: ReturnType<typeof useBoundingBoxes> | null = null;
  let labelManagement: ReturnType<typeof useLabelManagement> | null = null;

  onMount(() => {
    setIsClient(true);

    // Initialize composables after mounting
    boundingBoxes = useBoundingBoxes({
      initialBoxes,
      imageInfo,
      enableValidation: true,
    });

    labelManagement = useLabelManagement({
      labelClasses: config.labelClasses || [
        "person",
        "vehicle",
        "animal",
        "object",
      ],
      defaultLabelClass: config.defaultLabelClass || "person",
    });
  });

  // Handle box selection
  const handleBoxSelect = (boxId: string | null) => {
    if (boundingBoxes) {
      boundingBoxes.selectBox(boxId);
      eventHandlers.onAnnotationSelect?.(boxId);
    }
  };

  // Handle box creation
  const handleBoxCreate = (box: BoundingBox) => {
    if (boundingBoxes) {
      const success = boundingBoxes.addBox(box);
      if (success) {
        eventHandlers.onAnnotationCreate?.(box);
      }
    }
  };

  // Handle box update
  const handleBoxUpdate = (boxId: string, updates: Partial<BoundingBox>) => {
    if (boundingBoxes) {
      const success = boundingBoxes.updateBox(boxId, updates);
      if (success) {
        const updatedBox = boundingBoxes.getBox(boxId);
        if (updatedBox) {
          eventHandlers.onAnnotationUpdate?.(boxId, updatedBox);
        }
      }
    }
  };

  // Handle box deletion
  const handleBoxDelete = (boxId: string) => {
    if (boundingBoxes) {
      const success = boundingBoxes.removeBox(boxId);
      if (success) {
        eventHandlers.onAnnotationDelete?.(boxId);
      }
    }
  };

  return (
    <div class={`bounding-box-editor ${className}`}>
      <Show when={isClient() && boundingBoxes && labelManagement}>
        <div class="editor-container">
          <div class="editor-toolbar">
            <div class="label-selector">
              <label for="label-select">Label:</label>
              <select
                id="label-select"
                value={labelManagement!.selectedLabelClass()}
                onChange={(e) =>
                  labelManagement!.setSelectedLabelClass(e.target.value)
                }
              >
                {labelManagement!.availableLabels().map((label) => (
                  <option value={label}>{label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                if (boundingBoxes) {
                  boundingBoxes.clearBoxes();
                }
              }}
            >
              Clear All
            </button>
          </div>

          <div class="editor-main">
            <div class="editor-canvas-container">
              <canvas
                class="bounding-box-canvas"
                width={containerWidth}
                height={containerHeight}
                style={{
                  border: "1px solid #ccc",
                  cursor: "crosshair",
                }}
              />
            </div>

            <div class="editor-info-panel">
              <div class="box-count">Boxes: {boundingBoxes!.boxCount()}</div>
              <div class="selected-box">
                <Show when={boundingBoxes!.selectedBox()}>
                  Selected: {boundingBoxes!.selectedBox()?.label}
                </Show>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
