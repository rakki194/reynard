// Point cloud interaction handlers
// Extracted from usePointCloud for modularity

import { createSignal } from "solid-js";
import type { Point3D, TouchEvent, MouseEvent } from "../types";

export function usePointCloudInteractions() {
  // Interaction state
  const [hoveredPoint, setHoveredPoint] = createSignal<Point3D | null>(null);
  const [selectedPoints, setSelectedPoints] = createSignal<Point3D[]>([]);
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragStart, setDragStart] = createSignal<{
    x: number;
    y: number;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = createSignal<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionGroups, setSelectionGroups] = createSignal<Map<string, Point3D[]>>(new Map());

  /**
   * Handle point selection via raycasting
   */
  const handlePointSelection = (
    event: MouseEvent | TouchEvent,
    camera: unknown,
    scene: unknown,
    raycaster: unknown,
    mouse: unknown
  ) => {
    if (!raycaster || !mouse) return;

    const target = (event as any).currentTarget as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();

    // Handle both MouseEvent and TouchEvent
    const clientX = "clientX" in event ? event.clientX : event.touches[0]?.clientX || 0;
    const clientY = "clientY" in event ? event.clientY : event.touches[0]?.clientY || 0;

    (mouse as any).x = ((clientX - rect.left) / rect.width) * 2 - 1;
    (mouse as any).y = -((clientY - rect.top) / rect.height) * 2 + 1;

    (raycaster as any).setFromCamera(mouse, camera);

    // Find intersected points
    const intersects = (raycaster as any).intersectObjects((scene as any).children, true);

    if (intersects.length > 0) {
      const intersectedPoint = intersects[0];
      const pointCloud = intersectedPoint.object;

      if (pointCloud.userData?.isPointCloud) {
        const pointIndex = intersectedPoint.index;
        const points = pointCloud.userData.points;
        const point = points[pointIndex];

        if (point) {
          if (event.ctrlKey || event.metaKey) {
            // Multi-select
            setSelectedPoints(prev => {
              const isSelected = prev.some(p => p.id === point.id);
              if (isSelected) {
                return prev.filter(p => p.id !== point.id);
              } else {
                return [...prev, point];
              }
            });
          } else {
            // Single select
            setSelectedPoints([point]);
          }
        }
      }
    } else {
      // Clicked on empty space
      if (!event.ctrlKey && !event.metaKey) {
        setSelectedPoints([]);
      }
    }
  };

  /**
   * Handle point hovering
   */
  const handlePointHover = (
    event: MouseEvent | TouchEvent,
    camera: unknown,
    scene: unknown,
    raycaster: unknown,
    mouse: unknown
  ) => {
    if (!raycaster || !mouse) return;

    const target = (event as any).currentTarget as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();

    // Handle both MouseEvent and TouchEvent
    const clientX = "clientX" in event ? event.clientX : event.touches[0]?.clientX || 0;
    const clientY = "clientY" in event ? event.clientY : event.touches[0]?.clientY || 0;

    (mouse as any).x = ((clientX - rect.left) / rect.width) * 2 - 1;
    (mouse as any).y = -((clientY - rect.top) / rect.height) * 2 + 1;

    // Update tooltip position
    setTooltipPosition({ x: clientX, y: clientY });

    (raycaster as any).setFromCamera(mouse, camera);

    const intersects = (raycaster as any).intersectObjects((scene as any).children, true);

    if (intersects.length > 0) {
      const intersectedPoint = intersects[0];
      const pointCloud = intersectedPoint.object;

      if (pointCloud.userData?.isPointCloud) {
        const pointIndex = intersectedPoint.index;
        const points = pointCloud.userData.points;
        const point = points[pointIndex];

        if (point && point.id !== hoveredPoint()?.id) {
          setHoveredPoint(point);
        }
      }
    } else {
      if (hoveredPoint()) {
        setHoveredPoint(null);
        setTooltipPosition(null);
      }
    }
  };

  return {
    // State
    hoveredPoint,
    selectedPoints,
    isDragging,
    dragStart,
    tooltipPosition,
    selectionGroups,

    // Methods
    setHoveredPoint,
    setSelectedPoints,
    setIsDragging,
    setDragStart,
    setTooltipPosition,
    setSelectionGroups,
    handlePointSelection,
    handlePointHover,
  };
}
