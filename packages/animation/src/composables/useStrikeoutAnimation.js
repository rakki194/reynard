/**
 * 🦊 Strikeout Animation Composable
 * Smooth text strikeout animation for todo items and similar use cases
 */
import { createSignal, onCleanup } from "solid-js";
import { interpolate } from "../easing/easing";
export function useStrikeoutAnimation(options = {}) {
    const { duration = 300, easing = "easeOutCubic", delay = 0, onComplete, onStart } = options;
    const [isAnimating, setIsAnimating] = createSignal(false);
    const [progress, setProgress] = createSignal(0);
    const [isStruckOut, setIsStruckOut] = createSignal(false);
    const [animationFrameId, setAnimationFrameId] = createSignal(null);
    const animate = (targetStruckOut) => {
        if (isAnimating())
            return;
        setIsAnimating(true);
        onStart?.();
        const startTime = performance.now() + delay;
        const startProgress = progress();
        const endProgress = targetStruckOut ? 1 : 0;
        const animateFrame = (currentTime) => {
            if (currentTime < startTime) {
                const frameId = requestAnimationFrame(animateFrame);
                setAnimationFrameId(frameId);
                return;
            }
            const elapsed = currentTime - startTime;
            const animationProgress = Math.min(elapsed / duration, 1);
            const easedProgress = interpolate(startProgress, endProgress, animationProgress, easing);
            setProgress(easedProgress);
            if (animationProgress < 1) {
                const frameId = requestAnimationFrame(animateFrame);
                setAnimationFrameId(frameId);
            }
            else {
                setIsAnimating(false);
                setIsStruckOut(targetStruckOut);
                setAnimationFrameId(null);
                onComplete?.();
            }
        };
        requestAnimationFrame(animateFrame);
    };
    const strikeOut = () => {
        animate(true);
    };
    const unStrikeOut = () => {
        animate(false);
    };
    const toggle = () => {
        animate(!isStruckOut());
    };
    const reset = () => {
        const frameId = animationFrameId();
        if (frameId) {
            cancelAnimationFrame(frameId);
            setAnimationFrameId(null);
        }
        setIsAnimating(false);
        setProgress(0);
        setIsStruckOut(false);
    };
    // Get the strikeout line style
    const getStrikeoutStyle = () => {
        const currentProgress = progress();
        const lineWidth = interpolate(0, 100, currentProgress, easing);
        const opacity = interpolate(0, 1, currentProgress, "linear");
        return {
            width: `${lineWidth}%`,
            opacity: opacity,
        };
    };
    // Get the text style for fade effect
    const getTextStyle = () => {
        const currentProgress = progress();
        const opacity = interpolate(1, 0.6, currentProgress, "easeOutQuad");
        const textDecoration = currentProgress > 0.5 ? "line-through" : "none";
        return {
            opacity: opacity,
            textDecoration: textDecoration,
        };
    };
    onCleanup(() => {
        const frameId = animationFrameId();
        if (frameId) {
            cancelAnimationFrame(frameId);
        }
    });
    return {
        // State
        isAnimating,
        progress,
        isStruckOut,
        // Actions
        strikeOut,
        unStrikeOut,
        toggle,
        reset,
        // Style helpers
        getStrikeoutStyle,
        getTextStyle,
    };
}
