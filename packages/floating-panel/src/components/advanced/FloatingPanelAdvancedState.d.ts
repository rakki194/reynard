/**
 * Advanced Panel State
 *
 * State management for advanced panels.
 */
import type { FloatingPanelProps } from "../../types.js";
/**
 * Create initial state for advanced panel
 */
export declare function createAdvancedState(props: FloatingPanelProps): {
    x: number;
    y: number;
    width: number;
    height: number;
    minimized: boolean;
};
/**
 * Create constraints for advanced panel
 */
export declare function createAdvancedConstraints(props: FloatingPanelProps): {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
};
