/**
 * 🦊 Staggered Animation Composable
 * Unified staggered animation system from floating-panel package
 */
import { createSignal } from "solid-js";
import { createSimpleAnimationLoop } from "../utils/AnimationLoop";
export function useStaggeredAnimation(options = {}) {
    const [items, setItems] = createSignal([]);
    const [isAnimating, setIsAnimating] = createSignal(false);
    const config = {
        duration: 500,
        delay: 0,
        stagger: 100,
        easing: "easeOutCubic",
        direction: "forward",
        ...options,
    };
    const calculateItemDelay = (index, totalItems) => {
        switch (config.direction) {
            case "forward":
                return config.delay + index * config.stagger;
            case "reverse":
                return config.delay + (totalItems - 1 - index) * config.stagger;
            case "center":
                const centerIndex = Math.floor(totalItems / 2);
                const distanceFromCenter = Math.abs(index - centerIndex);
                return config.delay + distanceFromCenter * config.stagger;
            case "random":
                return config.delay + Math.random() * config.stagger * totalItems;
            default:
                return config.delay + index * config.stagger;
        }
    };
    const start = async (itemCount) => {
        if (isAnimating()) {
            console.warn("🦊 StaggeredAnimation: Already animating, ignoring start request");
            return;
        }
        setIsAnimating(true);
        config.onStart?.();
        // Create items
        const newItems = Array.from({ length: itemCount }, (_, index) => ({
            index,
            delay: calculateItemDelay(index, itemCount),
            isAnimating: false,
            progress: 0,
        }));
        setItems(newItems);
        // Start animations for each item
        const animationPromises = newItems.map((item) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    setItems((prev) => prev.map((i) => i.index === item.index ? { ...i, isAnimating: true } : i));
                    config.onItemStart?.(item.index);
                    createSimpleAnimationLoop(config.duration, config.easing, (progress) => {
                        setItems((prev) => prev.map((i) => i.index === item.index ? { ...i, progress } : i));
                    }, () => {
                        setItems((prev) => prev.map((i) => i.index === item.index
                            ? { ...i, isAnimating: false, progress: 1 }
                            : i));
                        config.onItemComplete?.(item.index);
                        resolve();
                    });
                }, item.delay);
            });
        });
        // Wait for all animations to complete
        await Promise.all(animationPromises);
        setIsAnimating(false);
        config.onComplete?.();
    };
    const stop = () => {
        setIsAnimating(false);
        setItems((prev) => prev.map((item) => ({ ...item, isAnimating: false })));
    };
    const reset = () => {
        setIsAnimating(false);
        setItems([]);
    };
    return {
        items,
        isAnimating,
        start,
        stop,
        reset,
    };
}
