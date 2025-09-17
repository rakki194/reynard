/**
 * Panel State Management
 *
 * State management for draggable/resizable panels.
 */
export interface PanelState {
    x: number;
    y: number;
    width: number;
    height: number;
    minimized: boolean;
}
/**
 * Create panel state signal
 */
export declare function createPanelState(initialState: PanelState): import("solid-js").Signal<PanelState>;
/**
 * Update panel state
 */
export declare function updatePanelState(setState: (state: PanelState) => void, updates: Partial<PanelState>): void;
