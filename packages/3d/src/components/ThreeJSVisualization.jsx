import { createSignal, onMount, Show } from "solid-js";
import { useThreeJSVisualization } from "../composables/useThreeJSVisualization";
import { useResizeHandler } from "../composables/useResizeHandler";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";
import "./ThreeJSVisualization.css";
export const ThreeJSVisualization = (props) => {
    const [containerRef, setContainerRef] = createSignal();
    const visualization = useThreeJSVisualization(props);
    const initializeScene = (container) => visualization.initializeScene(container);
    onMount(() => {
        const container = containerRef();
        if (container)
            initializeScene(container);
    });
    useResizeHandler(containerRef, {
        onResize: (container) => visualization.handleResize(container),
    });
    return (<div ref={setContainerRef} class={`threejs-visualization threejs-container ${props.className || ""}`}>
      <Show when={visualization.isLoading()}>
        <LoadingSpinner />
      </Show>
      <Show when={visualization.error()}>
        <ErrorDisplay error={visualization.error()} onRetry={() => {
            const container = containerRef();
            if (container)
                initializeScene(container);
        }}/>
      </Show>
    </div>);
};
