/**
 * 🦊 Phyllotactic Canvas Component
 * Canvas rendering for spiral animation
 */

import { Component, onMount, onCleanup, createEffect } from "solid-js";
import { useOKLCHColors } from "reynard-themes";
import { createAnimationEngine } from "../utils/animationEngine";
import type { SpiralPoint } from "./PhyllotacticSpiralLogic";

interface PhyllotacticCanvasProps {
  spiralPoints: SpiralPoint[];
  isRunning: boolean;
  onUpdate: (deltaTime: number) => void;
  animationConfig?: {
    frameRate: number;
    maxFPS: number;
    enableVSync: boolean;
    enablePerformanceMonitoring: boolean;
  };
}

export const PhyllotacticCanvas: Component<PhyllotacticCanvasProps> = props => {
  console.log("🦊 PhyllotacticCanvas: Component initializing with props", {
    spiralPointsCount: props.spiralPoints.length,
    isRunning: props.isRunning,
  });
  const oklchColors = useOKLCHColors();

  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | undefined;
  let animationEngine: ReturnType<typeof createAnimationEngine> | undefined;

  // Render spiral
  const renderSpiral = () => {
    if (!ctx || !canvasRef) {
      console.log("🦊 PhyllotacticCanvas: renderSpiral skipped - no context or canvas", {
        hasCtx: !!ctx,
        hasCanvas: !!canvasRef,
      });
      return;
    }

    console.log("🦊 PhyllotacticCanvas: Rendering spiral", {
      pointsCount: props.spiralPoints.length,
    });
    ctx.fillStyle = oklchColors.getColor("background");
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

    const points = props.spiralPoints;
    points.forEach((point, index) => {
      if (ctx) {
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
      }
      if (index < 3) {
        // Log first few points for debugging
        console.log(`🦊 PhyllotacticCanvas: Point ${index}`, {
          x: point.x,
          y: point.y,
          color: point.color,
        });
      }
    });

    // Draw center
    if (ctx) {
      ctx.fillStyle = oklchColors.getColor("accent");
      ctx.beginPath();
      ctx.arc(400, 300, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Lifecycle
  onMount(() => {
    console.log("🦊 PhyllotacticCanvas: onMount - setting up canvas and animation");
    if (canvasRef) {
      ctx = canvasRef.getContext("2d")!;
      canvasRef.width = 800;
      canvasRef.height = 600;
      console.log("🦊 PhyllotacticCanvas: Canvas setup complete", {
        width: canvasRef.width,
        height: canvasRef.height,
      });

      animationEngine = createAnimationEngine(
        props.animationConfig || {
          frameRate: 60,
          maxFPS: 120,
          enableVSync: true,
          enablePerformanceMonitoring: true,
        }
      );
      console.log("🦊 PhyllotacticCanvas: Animation engine created", animationEngine);

      // Always render the initial spiral, even if not animating
      console.log("🦊 PhyllotacticCanvas: Rendering initial spiral");
      renderSpiral();

      if (props.isRunning) {
        console.log("🦊 PhyllotacticCanvas: Starting animation engine");
        animationEngine.start({
          onUpdate: props.onUpdate,
          onRender: renderSpiral,
        });
      } else {
        console.log("🦊 PhyllotacticCanvas: Animation not running, engine ready but not started");
      }
    } else {
      console.log("🦊 PhyllotacticCanvas: onMount - no canvas ref available");
    }
  });

  onCleanup(() => {
    animationEngine?.stop();
  });

  // Handle running state changes reactively with safety checks
  createEffect(() => {
    const isRunning = props.isRunning;
    console.log("🦊 PhyllotacticCanvas: isRunning changed", {
      isRunning,
      hasAnimationEngine: !!animationEngine,
    });

    if (animationEngine) {
      // Always stop first to prevent multiple loops
      animationEngine.stop();

      if (isRunning) {
        console.log("🦊 PhyllotacticCanvas: Starting animation due to isRunning change");
        // Add a small delay to ensure previous animation is fully stopped
        setTimeout(() => {
          if (animationEngine && props.isRunning) {
            animationEngine.start({
              onUpdate: props.onUpdate,
              onRender: renderSpiral,
            });
          }
        }, 10);
      } else {
        console.log("🦊 PhyllotacticCanvas: Animation stopped due to isRunning change");
      }
    }
  });

  // Re-render when spiral points change (but not animating)
  createEffect(() => {
    const points = props.spiralPoints;
    const isRunning = props.isRunning;
    console.log("🦊 PhyllotacticCanvas: spiralPoints changed", {
      pointsCount: points.length,
      isRunning,
    });

    // Only re-render if not currently animating (animation handles its own rendering)
    if (!isRunning && ctx && canvasRef) {
      console.log("🦊 PhyllotacticCanvas: Re-rendering static spiral");
      renderSpiral();
    }
  });

  // Update animation config dynamically without recreating the engine
  createEffect(() => {
    const config = props.animationConfig;
    if (config && animationEngine) {
      animationEngine.updateConfig(config);
    }
  });

  return (
    <div class="canvas-container">
      <canvas ref={canvasRef} class="spiral-canvas" />

      <div class="canvas-overlay">
        <div class="math-badges">
          <span class="math-badge">φ = 1.618034</span>
          <span class="math-badge">ψ = 137.51°</span>
        </div>
      </div>
    </div>
  );
};
