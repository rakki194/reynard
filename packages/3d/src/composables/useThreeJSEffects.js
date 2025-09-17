// Three.js effects and lifecycle management
import { createEffect } from "solid-js";
export function useThreeJSEffects(props, initialization, isLoading) {
    /**
     * Start animation loop when scene is ready
     */
    createEffect(() => {
        if (initialization.sceneComposable.scene() &&
            initialization.sceneComposable.camera() &&
            initialization.sceneComposable.renderer() &&
            initialization.controlsComposable.controls() &&
            !isLoading()) {
            initialization.animationComposable.startAnimationLoop(initialization.sceneComposable.scene, initialization.sceneComposable.camera, initialization.sceneComposable.renderer, initialization.controlsComposable.controls, props.onRender);
        }
    });
    /**
     * Handle resize using animation composable
     */
    const handleResize = (container) => {
        return initialization.animationComposable.handleResize(container, initialization.sceneComposable.camera, initialization.sceneComposable.renderer, initialization.controlsComposable.controls);
    };
    return { handleResize };
}
