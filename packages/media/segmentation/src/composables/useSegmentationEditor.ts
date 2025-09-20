/**
 * Segmentation Editor Composable
 *
 * Core composable for managing segmentation editor state and operations.
 * Integrates with the Reynard annotation system and provides comprehensive
 * state management for polygon segmentation workflows.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { PolygonOps, type Point, type Polygon } from "reynard-algorithms";
import {
  SegmentationData,
  SegmentationEditorConfig,
  SegmentationEditorState,
  SegmentationSource,
} from "../types/index.js";

export interface UseSegmentationEditorOptions {
  config: SegmentationEditorConfig;
  state: SegmentationEditorState;
  onStateChange?: (state: SegmentationEditorState) => void;
  onSegmentationCreate?: (segmentation: SegmentationData) => void;
  onSegmentationUpdate?: (segmentation: SegmentationData) => void;
  onSegmentationDelete?: (segmentationId: string) => void;
}

export interface UseSegmentationEditorReturn {
  // State management
  state: () => SegmentationEditorState;
  updateState: (updates: Partial<SegmentationEditorState>) => void;
  segmentations: () => SegmentationData[];

  // Segmentation operations
  createSegmentation: (segmentation: SegmentationData) => void;
  updateSegmentation: (segmentation: SegmentationData) => void;
  deleteSegmentation: (segmentationId: string) => void;
  selectSegmentation: (segmentationId: string | undefined) => void;

  // Editor operations
  startCreating: () => void;
  stopCreating: () => void;
  startEditing: (segmentationId: string) => void;
  stopEditing: () => void;

  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Validation
  validateSegmentation: (segmentation: SegmentationData) => boolean;
  validatePolygon: (polygon: Polygon) => boolean;

  // Utilities
  getSegmentation: (id: string) => SegmentationData | undefined;
  getSelectedSegmentation: () => SegmentationData | undefined;
  clearAll: () => void;

  // Cleanup
  cleanup: () => void;
}

/**
 * Segmentation editor composable with comprehensive state management
 */
export function useSegmentationEditor(options: UseSegmentationEditorOptions): UseSegmentationEditorReturn {
  const [state, setState] = createSignal<SegmentationEditorState>(options.state);
  const [segmentations, setSegmentations] = createSignal<SegmentationData[]>([]);
  const [history, setHistory] = createSignal<SegmentationData[][]>([]);
  const [historyIndex, setHistoryIndex] = createSignal<number>(-1);

  // Update state and notify parent
  const updateState = (updates: Partial<SegmentationEditorState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      options.onStateChange?.(newState);
      return newState;
    });
  };

  // Create a new segmentation
  const createSegmentation = (segmentation: SegmentationData) => {
    // Validate the segmentation
    if (!validateSegmentation(segmentation)) {
      console.error("Invalid segmentation data:", segmentation);
      return;
    }

    // Check polygon count limit
    const currentCount = segmentations().length;
    if (currentCount >= options.config.maxPolygons) {
      console.warn(`Maximum polygon count (${options.config.maxPolygons}) reached`);
      return;
    }

    // Add to segmentations
    setSegmentations(prev => [...prev, segmentation]);

    // Update state
    updateState({
      selectedSegmentation: segmentation.id,
      isCreating: false,
    });

    // Notify parent
    options.onSegmentationCreate?.(segmentation);
  };

  // Update an existing segmentation
  const updateSegmentation = (segmentation: SegmentationData) => {
    // Validate the segmentation
    if (!validateSegmentation(segmentation)) {
      console.error("Invalid segmentation data:", segmentation);
      return;
    }

    // Update in segmentations
    setSegmentations(prev => prev.map(s => (s.id === segmentation.id ? segmentation : s)));

    // Update state if this is the selected segmentation
    const currentState = state();
    if (currentState.selectedSegmentation === segmentation.id) {
      updateState({
        selectedSegmentation: segmentation.id,
        isEditing: false,
      });
    }

    // Notify parent
    options.onSegmentationUpdate?.(segmentation);
  };

  // Delete a segmentation
  const deleteSegmentation = (segmentationId: string) => {
    // Remove from segmentations
    setSegmentations(prev => prev.filter(s => s.id !== segmentationId));

    // Update state if this was the selected segmentation
    const currentState = state();
    if (currentState.selectedSegmentation === segmentationId) {
      updateState({
        selectedSegmentation: undefined,
        isEditing: false,
      });
    }

    // Notify parent
    options.onSegmentationDelete?.(segmentationId);
  };

  // Select a segmentation
  const selectSegmentation = (segmentationId: string | undefined) => {
    updateState({
      selectedSegmentation: segmentationId,
      isEditing: false,
    });
  };

  // Start creating mode
  const startCreating = () => {
    updateState({
      isCreating: true,
      isEditing: false,
      selectedSegmentation: undefined,
    });
  };

  // Stop creating mode
  const stopCreating = () => {
    updateState({
      isCreating: false,
    });
  };

  // Start editing mode
  const startEditing = (segmentationId: string) => {
    updateState({
      isEditing: true,
      isCreating: false,
      selectedSegmentation: segmentationId,
      editingSegmentation: segmentationId,
    });
  };

  // Stop editing mode
  const stopEditing = () => {
    updateState({
      isEditing: false,
      editingSegmentation: undefined,
    });
  };

  // Validate segmentation data
  const validateSegmentation = (segmentation: SegmentationData): boolean => {
    // Check required fields
    if (!segmentation.id || !segmentation.polygon) {
      return false;
    }

    // Validate polygon
    if (!validatePolygon(segmentation.polygon)) {
      return false;
    }

    // Check area constraints
    const area = PolygonOps.area(segmentation.polygon);
    if (area < options.config.minPolygonArea || area > options.config.maxPolygonArea) {
      return false;
    }

    return true;
  };

  // Validate polygon geometry
  const validatePolygon = (polygon: Polygon): boolean => {
    // Check minimum points
    if (polygon.points.length < 3) {
      return false;
    }

    // Check for valid area
    const area = PolygonOps.area(polygon);
    if (area <= 0) {
      return false;
    }

    // Check for self-intersections (basic check)
    if (hasSelfIntersections(polygon)) {
      return false;
    }

    return true;
  };

  // Check for polygon self-intersections
  const hasSelfIntersections = (polygon: Polygon): boolean => {
    const points = polygon.points;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 2; j < points.length; j++) {
        if (linesIntersect(points[i], points[(i + 1) % points.length], points[j], points[(j + 1) % points.length])) {
          return true;
        }
      }
    }

    return false;
  };

  // Check if two line segments intersect
  const linesIntersect = (p1: Point, p2: Point, p3: Point, p4: Point): boolean => {
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) < 1e-10) return false; // Lines are parallel

    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  // History operations
  const saveToHistory = () => {
    const currentSegmentations = segmentations();
    const newHistory = history().slice(0, historyIndex() + 1);
    newHistory.push([...currentSegmentations]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (canUndo()) {
      const newIndex = historyIndex() - 1;
      setHistoryIndex(newIndex);
      setSegmentations([...history()[newIndex]]);
    }
  };

  const redo = () => {
    if (canRedo()) {
      const newIndex = historyIndex() + 1;
      setHistoryIndex(newIndex);
      setSegmentations([...history()[newIndex]]);
    }
  };

  const canUndo = () => historyIndex() > 0;
  const canRedo = () => historyIndex() < history().length - 1;

  // Utility functions
  const getSegmentation = (id: string): SegmentationData | undefined => {
    return segmentations().find(s => s.id === id);
  };

  const getSelectedSegmentation = (): SegmentationData | undefined => {
    const selectedId = state().selectedSegmentation;
    return selectedId ? getSegmentation(selectedId) : undefined;
  };

  const clearAll = () => {
    setSegmentations([]);
    saveToHistory();
    updateState({
      selectedSegmentation: undefined,
      isCreating: false,
      isEditing: false,
    });
  };

  // Save to history when segmentations change
  createEffect(() => {
    const currentSegmentations = segmentations();
    if (currentSegmentations.length > 0) {
      saveToHistory();
    }
  });

  // Cleanup function
  const cleanup = () => {
    // Clean up any resources
    setSegmentations([]);
    setHistory([]);
    setHistoryIndex(-1);
    setState({
      selectedSegmentation: undefined,
      hoveredSegmentation: undefined,
      editingSegmentation: undefined,
      isCreating: false,
      isEditing: false,
      mousePosition: undefined,
      zoom: 1,
      panOffset: { x: 0, y: 0 },
    });
  };

  // Cleanup on unmount
  onCleanup(cleanup);

  return {
    state,
    updateState,
    segmentations,
    createSegmentation,
    updateSegmentation,
    deleteSegmentation,
    selectSegmentation,
    startCreating,
    stopCreating,
    startEditing,
    stopEditing,
    undo,
    redo,
    canUndo,
    canRedo,
    validateSegmentation,
    validatePolygon,
    getSegmentation,
    getSelectedSegmentation,
    clearAll,
    cleanup,
  };
}
