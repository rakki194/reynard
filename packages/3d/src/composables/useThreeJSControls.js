// Three.js camera controls composable
import { createSignal } from "solid-js";
export function useThreeJSControls(config) {
    const [controls, setControls] = createSignal(null);
    const createControls = async (camera, renderer, onControlsChange, onCameraAnimationStart, onCameraAnimationEnd) => {
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
        const newControls = new OrbitControls(camera, renderer.domElement);
        newControls.enableDamping = config.enableDamping;
        newControls.dampingFactor = config.dampingFactor;
        newControls.enableZoom = config.enableZoom;
        newControls.enablePan = config.enablePan;
        newControls.enableRotate = config.enableRotate;
        newControls.minDistance = config.minDistance;
        newControls.maxDistance = config.maxDistance;
        newControls.maxPolarAngle = config.maxPolarAngle;
        newControls.autoRotate = config.autoRotate;
        newControls.autoRotateSpeed = 2.0;
        // Smooth transitions
        newControls.zoomSpeed = 1.0;
        newControls.rotateSpeed = 1.0;
        newControls.panSpeed = 1.0;
        // Set initial target
        newControls.target.set(0, 0, 0);
        newControls.update();
        setControls(newControls);
        // Add camera animation methods
        if (config.enableCameraAnimations) {
            addCameraAnimations(newControls, camera, onCameraAnimationStart, onCameraAnimationEnd);
        }
        // Handle controls change events
        if (onControlsChange) {
            newControls.addEventListener("change", onControlsChange);
        }
        return newControls;
    };
    const addCameraAnimations = (controls, camera, onStart, onEnd) => {
        controls.flyTo = (targetPosition, targetLookAt, duration = 1500) => {
            if (onStart)
                onStart();
            const wasEnabled = controls.enabled;
            controls.enabled = false;
            const startPosition = camera.position.clone();
            const startTarget = controls.target.clone();
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Use easeInOutCubic easing
                const easedProgress = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                // Interpolate position and target
                camera.position.lerpVectors(startPosition, new camera.position.constructor(...targetPosition), easedProgress);
                controls.target.lerpVectors(startTarget, new controls.target.constructor(...targetLookAt), easedProgress);
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    controls.enabled = wasEnabled;
                    if (onEnd)
                        onEnd();
                }
            };
            requestAnimationFrame(animate);
        };
    };
    return {
        controls,
        createControls,
    };
}
