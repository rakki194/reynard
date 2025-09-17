export interface ResizeHandlerOptions {
    onResize: (container: HTMLDivElement) => void;
    debounceMs?: number;
}
export declare function useResizeHandler(containerRef: () => HTMLDivElement | undefined, options: ResizeHandlerOptions): void;
