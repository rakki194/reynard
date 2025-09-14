/**
 * Canvas Interaction Composable
 *
 * Handles mouse and touch interactions for the segmentation canvas.
 * Leverages patterns from reynard-3d for robust event handling.
 */

import { createSignal, onCleanup } from "solid-js";
import { PointOps, type Point, type Polygon } from "reynard-algorithms";
import { SegmentationEditorConfig, SegmentationEditorState } from "../types/index.js";

export interface UseCanvasInteractionOptions {
  canvas: () => HTMLCanvasElement | undefined;
  config: SegmentationEditorConfig;
  state: SegmentationEditorState;
  onMouseMove?: (position: Point) => void;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (offset: Point) => void;
  onPolygonComplete?: (polygon: Point[]) => void;
  onPolygonUpdate?: (polygon: Point[], segmentationId?: string) => void;
}

export interface UseCanvasInteractionReturn {
  handleMouseMove: (event: MouseEvent) => void;
  handleWheel: (event: WheelEvent) => void;
  handleMouseDown: (event: MouseEvent) => void;
  handleMouseUp: (event: MouseEvent) => void;
  handleDoubleClick: (event: MouseEvent) => void;
  handleTouchStart: (event: TouchEvent) => void;
  handleTouchMove: (event: TouchEvent) => void;
  handleTouchEnd: (event: TouchEvent) => void;
}

/**
 * Canvas interaction composable with robust event handling
 */
export function useCanvasInteraction(
  options: UseCanvasInteractionOptions
): UseCanvasInteractionReturn {
  const [isDragging, setIsDragging] = createSignal(false);
  const [lastMousePosition, setLastMousePosition] = createSignal<Point>({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = createSignal(false);
  const [currentPolygon, setCurrentPolygon] = createSignal<Point[]>([]);
  const [lastTouchDistance, setLastTouchDistance] = createSignal<number>(0);

  // Get mouse position relative to canvas
  const getMousePosition = (event: MouseEvent): Point => {
    if (!event) return { x: 0, y: 0 };
    
    const canvas = options.canvas();
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  // Convert screen coordinates to world coordinates
  const screenToWorld = (screenPoint: Point): Point => {
    const { zoom, panOffset } = options.state;
    const worldPoint = {
      x: screenPoint.x / zoom - panOffset.x,
      y: screenPoint.y / zoom - panOffset.y,
    };
    
    // Apply grid snapping if enabled
    if (options.config.snapToGrid) {
      return snapToGrid(worldPoint, options.config.gridSize);
    }
    
    return worldPoint;
  };

  // Snap point to grid
  const snapToGrid = (point: Point, gridSize: number): Point => {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  };

  // Convert world coordinates to screen coordinates
  const worldToScreen = (worldPoint: Point): Point => {
    const { zoom, panOffset } = options.state;
    return {
      x: (worldPoint.x + panOffset.x) * zoom,
      y: (worldPoint.y + panOffset.y) * zoom,
    };
  };

  // Handle mouse move
  const handleMouseMove = (event: MouseEvent) => {
    if (!options.config.enabled || !event) return;
    
    const mousePos = getMousePosition(event);
    const worldPos = screenToWorld(mousePos);
    
    setLastMousePosition(mousePos);
    options.onMouseMove?.(worldPos);

    // Handle panning
    if (isDragging() && event.buttons === 1) {
      const deltaX = mousePos.x - lastMousePosition().x;
      const deltaY = mousePos.y - lastMousePosition().y;
      
      const newPanOffset = {
        x: options.state.panOffset.x + deltaX / options.state.zoom,
        y: options.state.panOffset.y + deltaY / options.state.zoom,
      };
      
      options.onPanChange?.(newPanOffset);
    }
  };

  // Handle mouse wheel for zooming
  const handleWheel = (event: WheelEvent) => {
    if (!options.config.enabled || !event) return;
    
    event.preventDefault();
    
    const mousePos = getMousePosition(event);
    const worldPos = screenToWorld(mousePos);
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, options.state.zoom * zoomFactor));
    
    // Zoom towards mouse position
    const newPanOffset = {
      x: worldPos.x - (mousePos.x / newZoom),
      y: worldPos.y - (mousePos.y / newZoom),
    };
    
    options.onZoomChange?.(newZoom);
    options.onPanChange?.(newPanOffset);
  };

  // Handle mouse down
  const handleMouseDown = (event: MouseEvent) => {
    if (!options.config.enabled || !event) return;
    
    const mousePos = getMousePosition(event);
    const worldPos = screenToWorld(mousePos);
    
    if (event.button === 0) { // Left click
      if (options.state.isCreating) {
        // Add point to current polygon
        const newPolygon = [...currentPolygon(), worldPos];
        setCurrentPolygon(newPolygon);
        options.onPolygonUpdate?.(newPolygon);
      } else if (options.state.isEditing && options.state.selectedSegmentation) {
        // Handle editing existing polygon
        const newPolygon = [...currentPolygon(), worldPos];
        setCurrentPolygon(newPolygon);
        options.onPolygonUpdate?.(newPolygon, options.state.selectedSegmentation);
      } else {
        // Handle selection
        setIsDragging(true);
      }
    } else if (event.button === 1) { // Middle click
      // Start panning
      setIsDragging(true);
      setLastMousePosition(mousePos);
    } else if (event.button === 2) { // Right click
      if (options.state.isCreating) {
        // Complete polygon creation on right click
        const polygon = currentPolygon();
        if (polygon.length >= 3) {
          options.onPolygonComplete?.(polygon);
          setCurrentPolygon([]);
        }
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = (event: MouseEvent) => {
    if (!event) return;
    
    setIsDragging(false);
    
    if (event.button === 0 && options.state.isCreating) {
      // Check if polygon should be completed (minimum 3 points)
      const polygon = currentPolygon();
      if (polygon.length >= 3) {
        options.onPolygonComplete?.(polygon);
        setCurrentPolygon([]);
      }
    }
  };

  // Handle double click
  const handleDoubleClick = (event: MouseEvent) => {
    if (!options.config.enabled || !event) return;
    
    const mousePos = getMousePosition(event);
    const worldPos = screenToWorld(mousePos);
    
    if (options.state.isCreating) {
      // Complete polygon creation on double click
      const polygon = currentPolygon();
      if (polygon.length >= 3) {
        options.onPolygonComplete?.(polygon);
        setCurrentPolygon([]);
      }
    }
  };

  // Handle touch start
  const handleTouchStart = (event: TouchEvent) => {
    if (!options.config.enabled || !event) return;
    
    event.preventDefault();
    
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
      });
      handleMouseDown(mouseEvent);
    } else if (event.touches.length === 2) {
      // Start pinch zoom
      setIsZooming(true);
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setLastTouchDistance(distance);
    }
  };

  // Handle touch move
  const handleTouchMove = (event: TouchEvent) => {
    if (!options.config.enabled || !event) return;
    
    event.preventDefault();
    
    if (event.touches.length === 1 && !isZooming()) {
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      handleMouseMove(mouseEvent);
    } else if (event.touches.length === 2 && isZooming()) {
      // Handle pinch zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const lastDistance = lastTouchDistance();
      if (lastDistance > 0) {
        const zoomFactor = distance / lastDistance;
        const newZoom = Math.max(0.1, Math.min(5, options.state.zoom * zoomFactor));
        options.onZoomChange?.(newZoom);
      }
      
      setLastTouchDistance(distance);
    }
  };

  // Handle touch end
  const handleTouchEnd = (event: TouchEvent) => {
    if (!options.config.enabled || !event) return;
    
    event.preventDefault();
    
    if (event.touches.length === 0) {
      setIsDragging(false);
      setIsZooming(false);
      
      const mouseEvent = new MouseEvent("mouseup", {
        button: 0,
      });
      handleMouseUp(mouseEvent);
    } else if (event.touches.length === 1) {
      setIsZooming(false);
    }
  };

  // Cleanup
  onCleanup(() => {
    setIsDragging(false);
    setIsZooming(false);
    setCurrentPolygon([]);
    setLastTouchDistance(0);
  });

  return {
    handleMouseMove,
    handleWheel,
    handleMouseDown,
    handleMouseUp,
    handleDoubleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

