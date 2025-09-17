import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import { usePhysicsEngine } from "./composables/usePhysicsEngine";
import { useCollisionRenderer } from "./composables/useCollisionRenderer";
import { DemoControls } from "./components/DemoControls";
import { DemoStats } from "./components/DemoStats";
import type { AABBCollisionDemoProps } from "./types";

/**
 * Create mouse event handlers for canvas interaction
 */
function createMouseHandlers(
  canvasRef: () => HTMLCanvasElement | undefined,
  renderer: ReturnType<typeof useCollisionRenderer>
) {
  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef();
    if (canvas) {
      renderer.handleMouseMove(e, canvas);
    }
  };

  const handleMouseClick = (e: MouseEvent) => {
    const canvas = canvasRef();
    if (canvas) {
      renderer.handleMouseClick(e, canvas);
    }
  };

  return { handleMouseMove, handleMouseClick };
}

/**
 * Setup effects and cleanup for the demo
 */
function setupEffects(
  physicsEngine: ReturnType<typeof usePhysicsEngine>,
  isRunning: () => boolean,
  animate: (currentTime: number) => void
) {
  createEffect(() => {
    physicsEngine.initializeObjects();
  });

  createEffect(() => {
    let animationFrameId: number | undefined;

    if (isRunning()) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }
    }
  });

  onCleanup(() => {
    // Cleanup handled in effect
  });
}

/**
 * AABB Collision Detection Demo Component
 * Demonstrates efficient collision detection using spatial optimization
 */
/**
 * Initialize demo state and composables
 */
function initializeDemo() {
  const [isRunning, setIsRunning] = createSignal(false);
  const [objectCount, setObjectCount] = createSignal(20);
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>();

  const lastTime = { value: 0 };
  const frameCount = { value: 0 };
  const fpsTime = { value: 0 };

  // Initialize physics engine
  const physicsEngine = usePhysicsEngine(objectCount);

  // Initialize renderer
  const renderer = useCollisionRenderer(physicsEngine.objects, physicsEngine.collisions, physicsEngine.addObject);

  return {
    isRunning,
    setIsRunning,
    objectCount,
    setObjectCount,
    canvasRef,
    setCanvasRef,
    lastTime,
    frameCount,
    fpsTime,
    physicsEngine,
    renderer,
  };
}

/**
 * Create animation system for the demo
 */
function createAnimationSystem(demo: ReturnType<typeof initializeDemo>) {
  // Animation loop
  const animate = (currentTime: number) => {
    if (!demo.isRunning()) return;

    const deltaTime = (currentTime - demo.lastTime.value) / 16.67; // Normalize to 60fps
    demo.lastTime.value = currentTime;

    const canvas = demo.canvasRef();
    if (canvas) {
      demo.physicsEngine.updatePhysics(deltaTime, canvas.width, canvas.height);
      demo.physicsEngine.checkCollisions();
      demo.renderer.render(canvas);
    }

    updateFPS(deltaTime);
    requestAnimationFrame(animate);
  };

  // Update FPS calculation
  const updateFPS = (deltaTime: number) => {
    demo.frameCount.value++;
    demo.fpsTime.value += deltaTime;
    if (demo.fpsTime.value >= 60) {
      demo.physicsEngine.updateFPS(Math.round((demo.frameCount.value * 60) / demo.fpsTime.value));
      demo.frameCount.value = 0;
      demo.fpsTime.value = 0;
    }
  };

  return { animate, updateFPS };
}

export const AABBCollisionDemo: Component<AABBCollisionDemoProps> = props => {
  const demo = initializeDemo();
  const animationSystem = createAnimationSystem(demo);

  // Setup effects and cleanup
  setupEffects(demo.physicsEngine, demo.isRunning, animationSystem.animate);

  // Handle stats updates in a tracked scope
  createEffect(() => {
    props.onStatsUpdate(() => demo.physicsEngine.stats);
  });

  // Create mouse handlers
  const mouseHandlers = createMouseHandlers(demo.canvasRef, demo.renderer);

  return (
    <div class="aabb-demo">
      <DemoControls
        objectCount={demo.objectCount()}
        isRunning={demo.isRunning()}
        onObjectCountChange={demo.setObjectCount}
        onToggleRunning={() => demo.setIsRunning(!demo.isRunning())}
        onReset={demo.physicsEngine.initializeObjects}
      />

      <div class="demo-canvas-container">
        <canvas
          ref={demo.setCanvasRef}
          width={800}
          height={500}
          onMouseMove={mouseHandlers.handleMouseMove}
          onClick={mouseHandlers.handleMouseClick}
          class="demo-canvas"
        />
        <div class="canvas-overlay">
          <p>Click to add objects • Drag to interact</p>
        </div>
      </div>

      <DemoStats
        objectCount={demo.physicsEngine.objects().length}
        collisionCount={demo.physicsEngine.collisions().length}
        stats={demo.physicsEngine.stats()}
      />
    </div>
  );
};
