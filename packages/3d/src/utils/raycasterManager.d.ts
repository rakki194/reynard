import type { RaycasterLike, Vector2Like } from "../types/rendering";
/**
 * Manages raycaster and mouse position for 3D interactions
 * Follows the 50-line axiom for focused responsibility
 */
export declare function createRaycasterManager(): {
    raycaster: import("solid-js").Accessor<RaycasterLike | null>;
    mouse: import("solid-js").Accessor<Vector2Like | null>;
    initialize: (threeJS: unknown) => void;
    updateMousePosition: (event: MouseEvent, renderer: unknown) => void;
    performRaycast: (camera: unknown, pointCloud: unknown) => import("..").IntersectionLike[];
};
