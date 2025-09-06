// Three.js visualization composable for SolidJS
// Adapted from yipyap's ThreeJSVisualization component

import { createSignal, createEffect, onCleanup, createMemo } from 'solid-js';
import type { 
  ThreeJSVisualizationProps
} from '../types';

// Lazy load Three.js for performance optimization
const loadThreeJS = async () => {
  const THREE = await import('three') as any;
  const {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    PointLight,
    Color,
    Vector3,
    Clock,
    PCFSoftShadowMap,
    ACESFilmicToneMapping,
    SRGBColorSpace,
  } = THREE;

  // Lazy load OrbitControls
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

  return {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    PointLight,
    Color,
    Vector3,
    Clock,
    PCFSoftShadowMap,
    ACESFilmicToneMapping,
    SRGBColorSpace,
    OrbitControls,
  };
};

export function useThreeJSVisualization(props: ThreeJSVisualizationProps) {
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string>('');
  const [threeJS, setThreeJS] = createSignal<any>(null);

  // Scene state
  const [scene, setScene] = createSignal<any>(null);
  const [camera, setCamera] = createSignal<any>(null);
  const [renderer, setRenderer] = createSignal<any>(null);
  const [controls, setControls] = createSignal<any>(null);
  const [clock, setClock] = createSignal<any>(null);
  const [animationId, setAnimationId] = createSignal<number | null>(null);

  // Responsive dimensions
  const width = createMemo(() => props.width || 800);
  const height = createMemo(() => props.height || 600);
  const backgroundColor = createMemo(() => props.backgroundColor || '#1a1a1a');

  // Camera control settings
  const enableDamping = createMemo(() => props.enableDamping ?? true);
  const dampingFactor = createMemo(() => props.dampingFactor ?? 0.05);
  const enableZoom = createMemo(() => props.enableZoom ?? true);
  const enablePan = createMemo(() => props.enablePan ?? true);
  const enableRotate = createMemo(() => props.enableRotate ?? true);
  const minDistance = createMemo(() => props.minDistance ?? 0.1);
  const maxDistance = createMemo(() => props.maxDistance ?? 1000);
  const maxPolarAngle = createMemo(() => props.maxPolarAngle ?? Math.PI);
  const enableCameraAnimations = createMemo(() => props.enableCameraAnimations ?? true);

  /**
   * Initialize Three.js scene
   */
  const initializeScene = async (container: HTMLDivElement) => {
    try {
      setIsLoading(true);
      setError('');

      // Lazy load Three.js
      const threeJSModules = await loadThreeJS();
      setThreeJS(threeJSModules);

      // Create scene
      const newScene = new threeJSModules.Scene();
      newScene.background = new threeJSModules.Color(backgroundColor());
      setScene(newScene);

      // Create camera with improved positioning
      const newCamera = new threeJSModules.PerspectiveCamera(
        75, // Field of view
        width() / height(), // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
      );
      newCamera.position.set(5, 5, 5);
      newCamera.lookAt(0, 0, 0);
      setCamera(newCamera);

      // Create renderer with enhanced settings
      const newRenderer = new threeJSModules.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });

      // Enhanced responsive canvas sizing
      const updateRendererSize = () => {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const pixelRatio = Math.min(window.devicePixelRatio, 2); // Cap at 2x for performance

        newRenderer.setSize(containerWidth, containerHeight, false);
        newRenderer.setPixelRatio(pixelRatio);

        // Update camera aspect ratio
        if (newCamera) {
          newCamera.aspect = containerWidth / containerHeight;
          newCamera.updateProjectionMatrix();
        }
      };

      updateRendererSize();
      newRenderer.shadowMap.enabled = true;
      newRenderer.shadowMap.type = threeJSModules.PCFSoftShadowMap;
      newRenderer.toneMapping = threeJSModules.ACESFilmicToneMapping;
      newRenderer.toneMappingExposure = 1.0;
      newRenderer.outputColorSpace = threeJSModules.SRGBColorSpace;
      container.appendChild(newRenderer.domElement);
      setRenderer(newRenderer);

      // Enhanced lighting system
      // Ambient light for overall illumination
      const ambientLight = new threeJSModules.AmbientLight(0x404040, 0.4);
      newScene.add(ambientLight);

      // Main directional light (sun-like)
      const directionalLight = new threeJSModules.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -10;
      directionalLight.shadow.camera.right = 10;
      directionalLight.shadow.camera.top = 10;
      directionalLight.shadow.camera.bottom = -10;
      newScene.add(directionalLight);

      // Secondary directional light for fill lighting
      const fillLight = new threeJSModules.DirectionalLight(0x4080ff, 0.3);
      fillLight.position.set(-5, 3, -5);
      newScene.add(fillLight);

      // Point light for accent lighting
      const pointLight = new threeJSModules.PointLight(0xff8040, 0.5, 20);
      pointLight.position.set(0, 8, 0);
      pointLight.castShadow = true;
      newScene.add(pointLight);

      // Create OrbitControls for smooth camera controls
      const newControls = new threeJSModules.OrbitControls(newCamera, newRenderer.domElement);
      newControls.enableDamping = enableDamping();
      newControls.dampingFactor = dampingFactor();
      newControls.enableZoom = enableZoom();
      newControls.enablePan = enablePan();
      newControls.enableRotate = enableRotate();
      newControls.minDistance = minDistance();
      newControls.maxDistance = maxDistance();
      newControls.maxPolarAngle = maxPolarAngle();
      newControls.autoRotate = props.autoRotate || false;
      newControls.autoRotateSpeed = 2.0;

      // Smooth transitions
      newControls.zoomSpeed = 1.0;
      newControls.rotateSpeed = 1.0;
      newControls.panSpeed = 1.0;

      // Set initial target
      newControls.target.set(0, 0, 0);
      newControls.update();
      setControls(newControls);

      // Add camera animation methods to controls
      if (enableCameraAnimations()) {
        (newControls as any).flyTo = (
          targetPosition: [number, number, number],
          targetLookAt: [number, number, number],
          duration: number = 1500
        ) => {
          if (props.onCameraAnimationStart) {
            props.onCameraAnimationStart();
          }

          // Temporarily disable controls during animation
          const wasEnabled = newControls.enabled;
          newControls.enabled = false;

          const startPosition = newCamera.position.clone();
          const startTarget = newControls.target.clone();
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Use easeInOutCubic easing
            const easedProgress =
              progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Interpolate position
            newCamera.position.lerpVectors(startPosition, new threeJSModules.Vector3(...targetPosition), easedProgress);

            // Interpolate target
            newControls.target.lerpVectors(startTarget, new threeJSModules.Vector3(...targetLookAt), easedProgress);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Re-enable controls
              newControls.enabled = wasEnabled;
              if (props.onCameraAnimationEnd) {
                props.onCameraAnimationEnd();
              }
            }
          };

          requestAnimationFrame(animate);
        };
      }

      // Create clock for smooth animations
      const newClock = new threeJSModules.Clock();
      setClock(newClock);

      // Handle controls change events
      if (props.onControlsChange) {
        newControls.addEventListener('change', props.onControlsChange);
      }

      // Call onSceneReady callback
      if (props.onSceneReady) {
        props.onSceneReady(newScene, newCamera, newRenderer, newControls);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize Three.js scene:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize 3D scene');
      setIsLoading(false);
    }
  };

  /**
   * Enhanced animation loop with smooth controls
   */
  const animate = () => {
    const currentScene = scene();
    const currentCamera = camera();
    const currentRenderer = renderer();
    const currentControls = controls();
    const currentClock = clock();

    if (!currentScene || !currentCamera || !currentRenderer || !currentControls || !currentClock) return;

    const _deltaTime = currentClock.getDelta();

    // Update controls (required for damping)
    currentControls.update();

    // Call onRender callback for custom rendering logic
    if (props.onRender) {
      props.onRender(currentScene, currentCamera, currentRenderer, currentControls);
    }

    // Render the scene
    currentRenderer.render(currentScene, currentCamera);

    // Continue animation loop
    const id = requestAnimationFrame(animate);
    setAnimationId(id);
  };

  /**
   * Enhanced resize handling with debouncing
   */
  let resizeTimeout: number | null = null;
  const handleResize = (container: HTMLDivElement) => {
    const currentCamera = camera();
    const currentRenderer = renderer();
    const currentControls = controls();

    if (!currentCamera || !currentRenderer || !currentControls) return;

    // Debounce resize events for better performance
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = window.setTimeout(() => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const pixelRatio = Math.min(window.devicePixelRatio, 2);

      // Update camera
      currentCamera.aspect = containerWidth / containerHeight;
      currentCamera.updateProjectionMatrix();

      // Update renderer
      currentRenderer.setSize(containerWidth, containerHeight, false);
      currentRenderer.setPixelRatio(pixelRatio);

      // Update controls
      currentControls.update();
    }, 100);
  };

  /**
   * Start animation loop when scene is ready
   */
  createEffect(() => {
    if (scene() && camera() && renderer() && controls() && !isLoading()) {
      animate();
    }
  });

  /**
   * Cleanup on unmount
   */
  onCleanup(() => {
    const currentAnimationId = animationId();
    if (currentAnimationId) {
      window.cancelAnimationFrame(currentAnimationId);
    }

    const currentRenderer = renderer();
    const currentControls = controls();

    if (currentControls) {
      currentControls.dispose();
    }

    if (currentRenderer) {
      currentRenderer.dispose();
    }

    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  });

  return {
    // State
    isLoading,
    error,
    threeJS,
    scene,
    camera,
    renderer,
    controls,
    clock,

    // Methods
    initializeScene,
    handleResize,
  };
}
