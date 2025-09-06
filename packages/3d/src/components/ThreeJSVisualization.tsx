import { Component, createSignal, createEffect, onMount, onCleanup, Show, createMemo } from 'solid-js';
import type { ThreeJSVisualizationProps } from '../types';
import { useThreeJSVisualization } from '../composables/useThreeJSVisualization';
import './ThreeJSVisualization.css';

export const ThreeJSVisualization: Component<ThreeJSVisualizationProps> = props => {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  
  const visualization = useThreeJSVisualization(props);

  // Initialize scene on mount
  onMount(() => {
    const container = containerRef();
    if (container) {
      visualization.initializeScene(container);
    }
  });

  // Handle resize events with passive listeners for performance
  createEffect(() => {
    const container = containerRef();
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        visualization.handleResize(container);
      });
      resizeObserver.observe(container);

      window.addEventListener('resize', () => {
        visualization.handleResize(container);
      }, { passive: true });

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', () => {
          visualization.handleResize(container);
        });
      };
    }
  });

  return (
    <div
      ref={setContainerRef}
      class={`threejs-visualization threejs-container ${props.className || ''}`}
    >
      <Show when={visualization.isLoading()}>
        <div class="threejs-loading">
          <div class="loading-spinner"></div>
          <span>Loading 3D visualization...</span>
        </div>
      </Show>

      <Show when={visualization.error()}>
        <div class="threejs-error">
          <span>Error: {visualization.error()}</span>
          <button onClick={() => {
            const container = containerRef();
            if (container) {
              visualization.initializeScene(container);
            }
          }}>Retry</button>
        </div>
      </Show>
    </div>
  );
};
