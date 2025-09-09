/**
 * BoundingBoxEditor Component
 *
 * A modular bounding box editing interface with separated concerns:
 * - Canvas management handled by useCanvasSetup composable
 * - Toolbar extracted to EditorToolbar component
 * - Info panel extracted to EditorInfoPanel component
 * - Drawing state managed by useDrawingState composable
 * - Label management handled by useLabelManagement composable
 */

import type { Component } from "solid-js";
import { useEditorSetup } from "../composables/useEditorSetup";
import { EditorToolbar } from "./EditorToolbar";
import { EditorCanvas } from "./EditorCanvas";
import { EditorInfoPanel } from "./EditorInfoPanel";
import type {
  BoundingBox,
  ImageInfo,
  EditorConfig,
  AnnotationEventHandlers,
} from "../types";
import "./BoundingBoxEditor.css";

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
  // Create a unique identifier for this instance
  const instanceId = `bbe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      class={`bounding-box-editor ${props.className || ""}`}
      data-instance-id={instanceId}
    >
      {(() => {
        // Complete editor setup - inside JSX to maintain reactivity
        const {
          drawingState,
          labelManagement,
          boundingBoxSetup,
          canvasRef,
          handleClearAll,
        } = useEditorSetup({
          imageInfo: props.imageInfo,
          config: props.config || {},
          eventHandlers: props.eventHandlers || {},
          initialBoxes: props.initialBoxes || [],
          containerWidth: props.containerWidth || 800,
          containerHeight: props.containerHeight || 600,
        });

        return (
          <>
            <EditorToolbar
              availableLabels={labelManagement.availableLabels()}
              selectedLabel={labelManagement.selectedLabelClass()}
              onLabelChange={labelManagement.handleLabelChange}
              onAddLabel={labelManagement.handleAddLabel}
              onClearAll={handleClearAll}
            />

            <EditorCanvas
              canvasRef={canvasRef}
              containerWidth={props.containerWidth || 800}
              containerHeight={props.containerHeight || 600}
              isDrawing={drawingState.isDrawing}
              newBox={drawingState.newBox}
            />

            <EditorInfoPanel
              boxes={boundingBoxSetup.boundingBoxes.boxes()}
              selectedBox={boundingBoxSetup.boundingBoxes.selectedBox() || null}
            />
          </>
        );
      })()}
    </div>
  );
};
