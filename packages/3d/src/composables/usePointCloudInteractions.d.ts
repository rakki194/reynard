import type { Point3D, TouchEvent, MouseEvent } from "../types";
export declare function usePointCloudInteractions(): {
    hoveredPoint: import("solid-js").Accessor<Point3D | null>;
    selectedPoints: import("solid-js").Accessor<Point3D[]>;
    isDragging: import("solid-js").Accessor<boolean>;
    dragStart: import("solid-js").Accessor<{
        x: number;
        y: number;
    } | null>;
    tooltipPosition: import("solid-js").Accessor<{
        x: number;
        y: number;
    } | null>;
    selectionGroups: import("solid-js").Accessor<Map<string, Point3D[]>>;
    setHoveredPoint: import("solid-js").Setter<Point3D | null>;
    setSelectedPoints: import("solid-js").Setter<Point3D[]>;
    setIsDragging: import("solid-js").Setter<boolean>;
    setDragStart: import("solid-js").Setter<{
        x: number;
        y: number;
    } | null>;
    setTooltipPosition: import("solid-js").Setter<{
        x: number;
        y: number;
    } | null>;
    setSelectionGroups: import("solid-js").Setter<Map<string, Point3D[]>>;
    handlePointSelection: (event: MouseEvent | TouchEvent, camera: unknown, scene: unknown, raycaster: unknown, mouse: unknown) => void;
    handlePointHover: (event: MouseEvent | TouchEvent, camera: unknown, scene: unknown, raycaster: unknown, mouse: unknown) => void;
};
