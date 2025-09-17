import type { TouchEvent, MouseEvent } from "../types";
export declare function usePointCloudHandlers(raycaster: () => unknown, mouse: () => unknown, handlePointSelection: (event: MouseEvent | TouchEvent, camera: unknown, scene: unknown, raycaster: unknown, mouse: unknown) => void, handlePointHover: (event: MouseEvent | TouchEvent, camera: unknown, scene: unknown, raycaster: unknown, mouse: unknown) => void): {
    createPointSelectionHandler: (camera: unknown, scene: unknown) => (event: MouseEvent | TouchEvent) => void;
    createPointHoverHandler: (camera: unknown, scene: unknown) => (event: MouseEvent | TouchEvent) => void;
};
