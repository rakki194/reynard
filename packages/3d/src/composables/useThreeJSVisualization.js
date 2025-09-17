// Three.js visualization composable for SolidJS
// Orchestrates modular Three.js components
import { createSignal } from "solid-js";
import { useThreeJSInitialization } from "./useThreeJSInitialization";
import { useThreeJSEffects } from "./useThreeJSEffects";
export function useThreeJSVisualization(props) {
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal("");
    const initialization = useThreeJSInitialization(props);
    const { handleResize } = useThreeJSEffects(props, initialization, isLoading);
    /**
     * Initialize Three.js scene using modular composables
     */
    const initializeScene = async (container) => {
        try {
            setIsLoading(true);
            setError("");
            await initialization.initializeScene(container);
            setIsLoading(false);
        }
        catch (err) {
            console.error("Failed to initialize Three.js scene:", err);
            setError(err instanceof Error ? err.message : "Failed to initialize 3D scene");
            setIsLoading(false);
        }
    };
    return {
        // State
        isLoading,
        error,
        scene: initialization.sceneComposable.scene,
        camera: initialization.sceneComposable.camera,
        renderer: initialization.sceneComposable.renderer,
        controls: initialization.controlsComposable.controls,
        clock: initialization.animationComposable.clock,
        // Methods
        initializeScene,
        handleResize,
    };
}
