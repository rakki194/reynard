// Animation frame management utilities
import { createSignal } from "solid-js";
/**
 * Animation frame manager for handling requestAnimationFrame lifecycle
 */
export function createAnimationFrameManager() {
    const [animationFrameId, setAnimationFrameId] = createSignal(null);
    const requestFrame = (callback) => {
        const id = window.requestAnimationFrame(callback);
        setAnimationFrameId(id);
        return id;
    };
    const cancelFrame = () => {
        const currentId = animationFrameId();
        if (currentId) {
            window.cancelAnimationFrame(currentId);
            setAnimationFrameId(null);
        }
    };
    const isAnimating = () => animationFrameId() !== null;
    return {
        animationFrameId,
        requestFrame,
        cancelFrame,
        isAnimating,
    };
}
