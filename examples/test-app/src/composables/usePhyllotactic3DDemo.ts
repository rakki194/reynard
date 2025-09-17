/**
 * 🦊 3D Phyllotactic Demo Composable
 * Manages state and logic for 3D phyllotactic demo
 */

import { createSignal } from "solid-js";
import { Phyllotactic3DSystem } from "../utils/phyllotactic/Phyllotactic3D";
import { Phyllotactic3DRenderer, type Point3D } from "../utils/phyllotactic/Phyllotactic3DRenderer";
import { createAnimationCore } from "../utils/animation/AnimationCore";

export interface PerformanceMetrics {
  currentFPS?: number;
  frameTime?: number;
  renderTime?: number;
}

export function usePhyllotactic3DDemo() {
  // State
  const [isRunning, setIsRunning] = createSignal(false);
  const [pointCount, setPointCount] = createSignal(1000);
  const [baseRadius, setBaseRadius] = createSignal(10);
  const [height, setHeight] = createSignal(100);
  const [spiralPitch, setSpiralPitch] = createSignal(0.1);
  const [enableSphericalProjection, setEnableSphericalProjection] = createSignal(false);
  const [enableStroboscopic3D, setEnableStroboscopic3D] = createSignal(true);
  const [rotationSpeedX, setRotationSpeedX] = createSignal(0.01);
  const [rotationSpeedY, setRotationSpeedY] = createSignal(0.02);
  const [rotationSpeedZ, setRotationSpeedZ] = createSignal(0.005);
  const [currentPoints, setCurrentPoints] = createSignal<Point3D[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = createSignal<PerformanceMetrics | null>(null);

  // Engines
  let phyllotactic3D: Phyllotactic3DSystem;
  let animationCore: ReturnType<typeof createAnimationCore>;
  let renderer: Phyllotactic3DRenderer;

  // Initialize engines
  const initializeEngines = () => {
    console.log("🦊 usePhyllotactic3DDemo: Initializing engines");

    phyllotactic3D = new Phyllotactic3DSystem({
      pointCount: pointCount(),
      baseRadius: baseRadius(),
      height: height(),
      spiralPitch: spiralPitch(),
      enableSphericalProjection: enableSphericalProjection(),
      enableStroboscopic3D: enableStroboscopic3D(),
      rotationSpeedX: rotationSpeedX(),
      rotationSpeedY: rotationSpeedY(),
      rotationSpeedZ: rotationSpeedZ(),
    });

    animationCore = createAnimationCore({
      frameRate: 60,
      maxFPS: 120,
      enableVSync: true,
      enablePerformanceMonitoring: true,
    });
  };

  // Generate 3D pattern
  const generate3DPattern = () => {
    console.log("🦊 usePhyllotactic3DDemo: Generating 3D pattern");
    const points = phyllotactic3D.generate3DSpiral();
    setCurrentPoints(points);
    renderer.render3DPoints(points);
  };

  // Animation loop
  const animate = (deltaTime: number) => {
    if (!isRunning()) return;

    phyllotactic3D.updateRotation(deltaTime);
    const points = phyllotactic3D.generate3DSpiral();
    setCurrentPoints(points);
    renderer.render3DPoints(points);
    setPerformanceMetrics(animationCore.getPerformanceStats());
  };

  // Start/stop animation
  const toggleAnimation = () => {
    if (isRunning()) {
      setIsRunning(false);
      animationCore.stop();
    } else {
      setIsRunning(true);
      animationCore.start({
        onUpdate: animate,
        onRender: () => {
          // Render handled in animate
        },
      });
    }
  };

  // Update configuration
  const updateConfig = () => {
    phyllotactic3D.updateConfig({
      pointCount: pointCount(),
      baseRadius: baseRadius(),
      height: height(),
      spiralPitch: spiralPitch(),
      enableSphericalProjection: enableSphericalProjection(),
      enableStroboscopic3D: enableStroboscopic3D(),
      rotationSpeedX: rotationSpeedX(),
      rotationSpeedY: rotationSpeedY(),
      rotationSpeedZ: rotationSpeedZ(),
    });

    generate3DPattern();
  };

  // Handle canvas ready
  const handleCanvasReady = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    renderer = new Phyllotactic3DRenderer(canvas, ctx);
    initializeEngines();
    generate3DPattern();
  };

  // Cleanup
  const cleanup = () => {
    if (animationCore) {
      animationCore.stop();
    }
  };

  return {
    // State
    isRunning,
    pointCount,
    setPointCount,
    baseRadius,
    setBaseRadius,
    height,
    setHeight,
    spiralPitch,
    setSpiralPitch,
    enableSphericalProjection,
    setEnableSphericalProjection,
    enableStroboscopic3D,
    setEnableStroboscopic3D,
    rotationSpeedX,
    setRotationSpeedX,
    rotationSpeedY,
    setRotationSpeedY,
    rotationSpeedZ,
    setRotationSpeedZ,
    currentPoints,
    performanceMetrics,

    // Actions
    generate3DPattern,
    toggleAnimation,
    updateConfig,
    handleCanvasReady,
    cleanup,
  };
}
