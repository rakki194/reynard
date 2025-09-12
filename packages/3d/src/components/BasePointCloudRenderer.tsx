import { Component, createEffect, onCleanup } from "solid-js";
import type { BasePointCloudRendererProps } from "../types/rendering";
import { useThreeJSAnimations } from "../composables/useThreeJSAnimations";
import { usePointCloudInitialization } from "../composables/usePointCloudInitialization";
import { RendererUI } from "./RendererUI";
import "./BasePointCloudRenderer.css";

export const BasePointCloudRenderer: Component<BasePointCloudRendererProps> = (
  props,
) => {
  const animations = useThreeJSAnimations();
  const initialization = usePointCloudInitialization();

  createEffect(() => {
    if (!props.scene || !props.camera || !props.renderer) return;

    initialization
      .initializeRenderer(
        props.scene,
        props.camera,
        props.renderer,
        props.points,
        props.config,
        props.onPointSelect,
      )
      .catch(console.error);
  });

  const updateConfiguration = (newConfig: typeof props.config) => {
    if (props.onConfigChange) {
      props.onConfigChange(newConfig);
    }
  };

  const animate = () => {
    if (!initialization.isInitialized()) return;

    // Update animations
    animations.updateAnimations();

    // Render scene
    props.renderer.render(props.scene, props.camera);
  };

  createEffect(() => {
    if (!initialization.isInitialized()) return;

    const interval = setInterval(animate, 16); // ~60fps
    onCleanup(() => clearInterval(interval));
  });

  onCleanup(() => {
    initialization.dispose();
  });

  return (
    <RendererUI
      props={props}
      pointCloudRenderer={initialization.pointCloudRenderer}
      onConfigChange={updateConfiguration}
    />
  );
};
