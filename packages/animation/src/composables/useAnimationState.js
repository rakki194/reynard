/**
 * 🦊 Animation State Composable
 * Unified animation state management for SolidJS
 */
import { createSignal, createMemo } from "solid-js";
export function useAnimationState() {
    const [currentAnimation, setCurrentAnimation] = createSignal(null);
    const [animationFrameId, setAnimationFrameId] = createSignal(null);
    const isAnimationsDisabled = createMemo(() => false);
    const createAnimationState = (duration, easing) => ({
        isAnimating: true,
        progress: 0,
        startTime: performance.now(),
        duration,
        easing,
    });
    const stopAnimations = () => {
        const currentId = animationFrameId();
        if (currentId) {
            window.cancelAnimationFrame(currentId);
            setAnimationFrameId(null);
        }
        setCurrentAnimation(null);
    };
    return {
        currentAnimation,
        setCurrentAnimation,
        animationFrameId,
        setAnimationFrameId,
        isAnimationsDisabled,
        createAnimationState,
        stopAnimations,
    };
}
