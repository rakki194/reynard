/**
 * Segmentation Editor Component
 *
 * Advanced polygon segmentation editor that integrates with the Reynard
 * floating panel system and provides comprehensive segmentation editing
 * capabilities. Features sophisticated UI with floating panels, real-time
 * editing, and seamless integration with the Reynard ecosystem.
 */

import {
  Component,
  createSignal,
  createEffect,
  createMemo,
  onMount,
  onCleanup,
  Show,
  For,
} from "solid-js";
import {
  FloatingPanelOverlay,
  FloatingPanel,
  useOverlayManager,
  type FloatingPanel as FloatingPanelType,
} from "reynard-floating-panel";
import { CaptionInput } from "reynard-caption";
import { PolygonOps, PointOps, type Point, type Polygon } from "reynard-algorithms";
import {
  SegmentationData,
  SegmentationEditorConfig,
  SegmentationEditorState,
  SegmentationEditorEvents,
  SegmentationSource,
} from "../types/index.js";
import { useSegmentationEditor } from "../composables/useSegmentationEditor.js";
import { usePolygonEditor } from "../composables/usePolygonEditor.js";
import { SegmentationCanvas } from "./SegmentationCanvas.js";
import { SegmentationToolbar } from "./SegmentationToolbar.js";
import { SegmentationPanel } from "./SegmentationPanel.js";
import "./SegmentationEditor.css";

export interface SegmentationEditorProps {
  /** Image source for segmentation */
  imageSrc: string;
  /** Initial segmentations */
  segmentations?: SegmentationData[];
  /** Editor configuration */
  config?: Partial<SegmentationEditorConfig>;
  /** Editor state */
  state?: SegmentationEditorState;
  /** Event handlers */
  events?: SegmentationEditorEvents;
  /** Whether the editor is enabled */
  enabled?: boolean;
  /** Additional CSS class */
  class?: string;
}

/**
 * Default editor configuration
 */
const DEFAULT_CONFIG: SegmentationEditorConfig = {
  enabled: true,
  showGrid: true,
  gridSize: 20,
  snapToGrid: true,
  showVertices: true,
  vertexSize: 8,
  showEdges: true,
  edgeThickness: 2,
  showFill: true,
  fillOpacity: 0.3,
  showBoundingBox: false,
  allowVertexEdit: true,
  allowEdgeEdit: true,
  allowPolygonCreation: true,
  allowPolygonDeletion: true,
  maxPolygons: 50,
  minPolygonArea: 100,
  maxPolygonArea: 1000000,
};

/**
 * Segmentation Editor Component with sophisticated floating panel integration
 */
export const SegmentationEditor: Component<SegmentationEditorProps> = (props) => {
  // Merge configuration with defaults
  const config = createMemo(() => ({
    ...DEFAULT_CONFIG,
    ...props.config,
  }));

  // Initialize editor state
  const [editorState, setEditorState] = createSignal<SegmentationEditorState>({
    selectedSegmentation: undefined,
    hoveredSegmentation: undefined,
    editingSegmentation: undefined,
    isCreating: false,
    isEditing: false,
    mousePosition: undefined,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    ...props.state,
  });

  // Initialize segmentations
  const [segmentations, setSegmentations] = createSignal<SegmentationData[]>(
    props.segmentations || []
  );

  // Initialize overlay manager for floating panels
  const overlayManager = useOverlayManager({
    config: {
      backdropBlur: 2,
      backdropColor: "rgb(0 0 0 / 0.1)",
      outlineColor: "#3b82f6",
    },
  });

  // Initialize editor composables
  const editor = useSegmentationEditor({
    config: config(),
    state: editorState(),
    onStateChange: (newState) => {
      setEditorState(newState);
      props.events?.onStateChange?.(newState);
    },
    onSegmentationCreate: (segmentation) => {
      setSegmentations(prev => [...prev, segmentation]);
      props.events?.onSegmentationCreate?.(segmentation);
    },
    onSegmentationUpdate: (segmentation) => {
      setSegmentations(prev => 
        prev.map(s => s.id === segmentation.id ? segmentation : s)
      );
      props.events?.onSegmentationUpdate?.(segmentation);
    },
    onSegmentationDelete: (segmentationId) => {
      setSegmentations(prev => prev.filter(s => s.id !== segmentationId));
      props.events?.onSegmentationDelete?.(segmentationId);
    },
  });

  const polygonEditor = usePolygonEditor({
    config: config(),
    onPolygonChange: (polygon, segmentationId) => {
      if (segmentationId) {
        const segmentation = segmentations().find(s => s.id === segmentationId);
        if (segmentation) {
          const updatedSegmentation: SegmentationData = {
            ...segmentation,
            polygon,
            updatedAt: new Date(),
          };
          editor.updateSegmentation(updatedSegmentation);
        }
      }
    },
  });

  // Computed values
  const selectedSegmentation = createMemo(() => {
    const selectedId = editorState().selectedSegmentation;
    return selectedId ? segmentations().find(s => s.id === selectedId) : undefined;
  });

  const isEditorActive = createMemo(() => 
    config().enabled && overlayManager.isActive()
  );

  // Create floating panels
  const panels = createMemo((): FloatingPanelType[] => {
    const currentSegmentations = segmentations();
    const currentState = editorState();
    
    return [
      // Main segmentation panel
      {
        id: "segmentation-panel",
        position: { top: 20, left: 20 },
        size: { width: 300, height: 400 },
        content: (
          <SegmentationPanel
            segmentations={currentSegmentations}
            selectedSegmentation={currentState.selectedSegmentation}
            onSegmentationSelect={(id) => {
              setEditorState(prev => ({ ...prev, selectedSegmentation: id }));
              props.events?.onSegmentationSelect?.(id);
            }}
            onSegmentationCreate={() => {
              setEditorState(prev => ({ ...prev, isCreating: true }));
            }}
            onSegmentationDelete={(id) => {
              editor.deleteSegmentation(id);
            }}
          />
        ),
        config: {
          draggable: true,
          resizable: true,
          closable: true,
          theme: "accent",
        },
      },
      
      // Caption editing panel (shown when segmentation is selected)
      ...(selectedSegmentation() ? [{
        id: "caption-panel",
        position: { top: 20, right: 20 },
        size: { width: 250, height: 200 },
        content: (
          <CaptionInput
            caption={selectedSegmentation()!.caption || { type: "caption", content: "" }}
            state="expanded"
            onCaptionChange={(caption) => {
              const updatedSegmentation: SegmentationData = {
                ...selectedSegmentation()!,
                caption,
                updatedAt: new Date(),
              };
              editor.updateSegmentation(updatedSegmentation);
            }}
            onSave={async (caption) => {
              const updatedSegmentation: SegmentationData = {
                ...selectedSegmentation()!,
                caption,
                updatedAt: new Date(),
              };
              editor.updateSegmentation(updatedSegmentation);
            }}
            placeholder="Enter caption for this segmentation..."
          />
        ),
        config: {
          draggable: true,
          resizable: true,
          closable: true,
          theme: "info",
        },
      }] : []),
    ];
  });

  // Effects
  createEffect(() => {
    if (props.segmentations) {
      setSegmentations(props.segmentations);
    }
  });

  createEffect(() => {
    if (props.state) {
      setEditorState(prev => ({ ...prev, ...props.state }));
    }
  });

  // Event handlers
  const handleToggleEditor = () => {
    overlayManager.toggleOverlay();
  };

  const handleMouseMove = (position: Point) => {
    setEditorState(prev => ({ ...prev, mousePosition: position }));
    props.events?.onMouseMove?.(position);
  };

  const handleZoomChange = (zoom: number) => {
    setEditorState(prev => ({ ...prev, zoom }));
    props.events?.onZoomChange?.(zoom);
  };

  const handlePanChange = (offset: Point) => {
    setEditorState(prev => ({ ...prev, panOffset: offset }));
    props.events?.onPanChange?.(offset);
  };

  const handleKeyboardShortcuts = (event: KeyboardEvent) => {
    if (!isEditorActive()) return;
    
    switch (event.key) {
      case "Escape":
        overlayManager.toggleOverlay();
        break;
      case "Delete":
      case "Backspace":
        if (editorState().selectedSegmentation) {
          editor.deleteSegmentation(editorState().selectedSegmentation!);
        }
        break;
      case "n":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          editor.startCreating();
        }
        break;
      case "z":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (event.shiftKey) {
            editor.redo();
          } else {
            editor.undo();
          }
        }
        break;
    }
  };

  // Keyboard event handling
  onMount(() => {
    document.addEventListener("keydown", handleKeyboardShortcuts);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyboardShortcuts);
  });

  // Cleanup
  onCleanup(() => {
    editor.cleanup();
    polygonEditor.cleanup();
    document.removeEventListener("keydown", handleKeyboardShortcuts);
  });

  return (
    <div class={`segmentation-editor ${props.class || ""}`}>
      {/* Main editor interface */}
      <div class="segmentation-editor-main">
        {/* Toolbar */}
        <SegmentationToolbar
          config={config()}
          state={editorState()}
          onToggleEditor={handleToggleEditor}
          onZoomChange={handleZoomChange}
          onPanChange={handlePanChange}
        />

        {/* Canvas */}
        <SegmentationCanvas
          imageSrc={props.imageSrc}
          segmentations={segmentations()}
          config={config()}
          state={editorState()}
          onMouseMove={handleMouseMove}
          onZoomChange={handleZoomChange}
          onPanChange={handlePanChange}
          onSegmentationSelect={(id) => {
            setEditorState(prev => ({ ...prev, selectedSegmentation: id }));
            props.events?.onSegmentationSelect?.(id);
          }}
          onSegmentationCreate={(polygon) => {
            const newSegmentation: SegmentationData = {
              id: `seg_${Date.now()}`,
              polygon,
              metadata: {
                source: SegmentationSource.MANUAL,
                confidence: 1.0,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            editor.createSegmentation(newSegmentation);
          }}
          onSegmentationUpdate={(id, polygon) => {
            const segmentation = segmentations().find(s => s.id === id);
            if (segmentation) {
              const updatedSegmentation: SegmentationData = {
                ...segmentation,
                polygon,
                updatedAt: new Date(),
              };
              editor.updateSegmentation(updatedSegmentation);
            }
          }}
        />
      </div>

      {/* Floating panels overlay */}
      <FloatingPanelOverlay
        isActive={isEditorActive()}
        transitionPhase={overlayManager.overlayState().transitionPhase}
      >
        <For each={panels()}>
          {(panel) => (
            <FloatingPanel
              id={panel.id}
              position={panel.position}
              size={panel.size}
              config={panel.config}
            >
              {panel.content}
            </FloatingPanel>
          )}
        </For>
      </FloatingPanelOverlay>
    </div>
  );
};

