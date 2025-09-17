import { createEffect, onCleanup } from "solid-js";
export function useResizeHandler(containerRef, options) {
    const { onResize, debounceMs = 100 } = options;
    let resizeTimeout = null;
    createEffect(() => {
        const container = containerRef();
        if (!container)
            return;
        const resizeObserver = new ResizeObserver(() => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = window.setTimeout(() => {
                onResize(container);
            }, debounceMs);
        });
        resizeObserver.observe(container);
        const handleWindowResize = () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = window.setTimeout(() => {
                onResize(container);
            }, debounceMs);
        };
        window.addEventListener("resize", handleWindowResize, { passive: true });
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", handleWindowResize);
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
        };
    });
    onCleanup(() => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
    });
}
