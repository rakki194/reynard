/**
 * useBoxMove composable
 *
 * Provides move functionality for bounding boxes with support for:
 * - Drag-to-move logic
 * - Move constraints and boundary checking
 * - Move snapping and alignment
 * - Performance optimization
 */
import type { BoundingBox, ImageInfo } from "../types";
export interface MoveConstraints {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    enableBoundaryCheck: boolean;
    enableSnapping: boolean;
    snapThreshold: number;
    enableAlignment: boolean;
    alignmentThreshold: number;
}
export interface MoveState {
    isMoving: boolean;
    boxId: string | null;
    originalBox: BoundingBox | null;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
}
export interface MoveOptions {
    imageInfo: ImageInfo;
    isEnabled: boolean;
    enableSnapping?: boolean;
    enableAlignment?: boolean;
    enableConstraints?: boolean;
    enablePerformanceOptimization?: boolean;
    onBoxMoved?: (boxId: string, newBox: BoundingBox) => void;
    onBoxMoveStart?: (boxId: string) => void;
    onBoxMoveEnd?: (boxId: string) => void;
    onBoxMoveError?: (boxId: string, error: any) => void;
}
export interface UseBoxMoveReturn {
    moveState: () => MoveState | null;
    isMoving: () => boolean;
    movingBoxId: () => string | null;
    startBoxMove: (boxId: string, box: BoundingBox, startX: number, startY: number) => void;
    updateBoxMove: (currentX: number, currentY: number) => void;
    endBoxMove: () => void;
    cancelBoxMove: () => void;
    calculateMoveConstraints: (box: BoundingBox) => MoveConstraints;
}
export declare function useBoxMove(options: MoveOptions): UseBoxMoveReturn;
