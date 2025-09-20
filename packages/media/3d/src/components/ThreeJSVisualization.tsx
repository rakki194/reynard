import { Component, createSignal, onMount, Show } from "solid-js";
import type { ThreeJSVisualizationProps } from "../types";
import { useThreeJSVisualization } from "../composables/useThreeJSVisualization";
import { useResizeHandler } from "../composables/useResizeHandler";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";
import "./ThreeJSVisualization.css";

export const ThreeJSVisualization: Component<ThreeJSVisualizationProps> = props => {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const visualization = useThreeJSVisualization(props);

  const initializeScene = (container: HTMLDivElement) => visualization.initializeScene(container);

  onMount(() => {
    const container = containerRef();
    if (container) initializeScene(container);
  });

  useResizeHandler(containerRef, {
    onResize: container => visualization.handleResize(container),
  });

  return (
    <div ref={setContainerRef} class={`threejs-visualization threejs-container ${props.className || ""}`}>
      <Show when={visualization.isLoading()}>
        <LoadingSpinner />
      </Show>
      <Show when={visualization.error()}>
        <ErrorDisplay
          error={visualization.error()}
          onRetry={() => {
            const container = containerRef();
            if (container) initializeScene(container);
          }}
        />
      </Show>
    </div>
  );
};
