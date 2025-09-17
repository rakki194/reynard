/**
 * Panel Constraints
 *
 * Constraint management for draggable/resizable panels.
 */
/**
 * Apply constraints to panel state
 */
export function applyConstraints(state, constraints) {
    const { minWidth = 180, minHeight = 120, maxWidth = 800, maxHeight = 600, bounds, } = constraints;
    let { x, y, width, height } = state;
    // Apply size constraints
    width = Math.max(minWidth, Math.min(maxWidth, width));
    height = Math.max(minHeight, Math.min(maxHeight, height));
    // Apply position constraints
    if (bounds) {
        const { top = 0, right = window.innerWidth, bottom = window.innerHeight, left = 0, } = bounds;
        x = Math.max(left, Math.min(right - width, x));
        y = Math.max(top, Math.min(bottom - height, y));
    }
    return { ...state, x, y, width, height };
}
