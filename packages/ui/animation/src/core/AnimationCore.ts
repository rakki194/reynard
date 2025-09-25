/**
 * 🦊 Animation Core
 * Core animation loop and state management - unified from test-app
 */

import { createSignal, onCleanup } from "solid-js";
import { log } from "reynard-error-boundaries";
import type { AnimationConfig, AnimationState, AnimationCallbacks, PerformanceStats } from "../types";

export function createAnimationCore(initialConfig: AnimationConfig) {
  let config = { ...initialConfig };

  const [animationState, setAnimationState] = createSignal<AnimationState>({
    isRunning: false,
    frameCount: 0,
    lastFrameTime: 0,
    deltaTime: 0,
    fps: 0,
    averageFPS: 0,
    performanceMetrics: {
      frameTime: 0,
      renderTime: 0,
      updateTime: 0,
    },
  });

  let animationId: number | undefined;
  let callbacks: AnimationCallbacks = {};
  let fpsHistory: number[] = [];
  const maxFPSHistory = 60; // Keep last 60 frames for average
  let lastFrameTime = 0;
  let frameCount = 0;
  const maxFramesPerSecond = 1000; // Safety limit
  let safetyTimeout: number | undefined;
  let fpsSum = 0; // Optimize FPS calculation

  /**
   * Main animation loop with proper FPS limiting and safety checks
   */
  const animate = (currentTime: number) => {
    const state = animationState();
    if (!state.isRunning) {
      return;
    }

    // Safety check: prevent infinite loops
    if (!animationId) {
      log.warn("Animation ID is undefined, stopping", undefined, {
        component: "AnimationCore",
        function: "animate",
      });
      setAnimationState(prev => ({ ...prev, isRunning: false }));
      return;
    }

    // Initialize lastFrameTime if this is the first frame
    if (lastFrameTime === 0) {
      lastFrameTime = currentTime;
    }

    const deltaTime = currentTime - lastFrameTime;
    const targetFrameTime = 1000 / config.frameRate;

    // FPS limiting: only render if enough time has passed
    if (deltaTime < targetFrameTime) {
      animationId = window.requestAnimationFrame(animate);
      return;
    }

    // Update frame tracking
    lastFrameTime = currentTime;
    frameCount++;

    // Safety check: prevent runaway animations
    if (frameCount > maxFramesPerSecond) {
      log.warn("Frame count exceeded safety limit, stopping animation", undefined, {
        component: "AnimationCore",
        function: "animate",
        frameCount,
      });
      stop();
      return;
    }

    // Performance monitoring
    const frameStartTime = performance.now();

    // Update FPS calculation (optimized)
    const currentFPS = 1000 / deltaTime;
    fpsHistory.push(currentFPS);
    fpsSum += currentFPS;

    if (fpsHistory.length > maxFPSHistory) {
      const removedFPS = fpsHistory.shift()!;
      fpsSum -= removedFPS;
    }

    const averageFPS = fpsSum / fpsHistory.length;

    // Call frame start callback
    callbacks.onFrameStart?.(currentTime);

    // Update phase
    const updateStartTime = performance.now();
    if (callbacks.onUpdate) {
      try {
        if (config.enablePerformanceMonitoring) {
          log.debug(
            "Calling onUpdate",
            {
              deltaTime,
              frameCount: state.frameCount,
            },
            {
              component: "AnimationCore",
              function: "animate",
            }
          );
        }
        callbacks.onUpdate(deltaTime, state.frameCount);
      } catch (error) {
        log.error("Error in onUpdate callback", error instanceof Error ? error : new Error(String(error)), undefined, {
          component: "AnimationCore",
          function: "animate",
        });
      }
    }
    const updateTime = performance.now() - updateStartTime;

    // Render phase
    const renderStartTime = performance.now();
    if (callbacks.onRender) {
      try {
        if (config.enablePerformanceMonitoring) {
          log.debug(
            "Calling onRender",
            {
              deltaTime,
              frameCount: state.frameCount,
            },
            {
              component: "AnimationCore",
              function: "animate",
            }
          );
        }
        callbacks.onRender(deltaTime, state.frameCount);
      } catch (error) {
        log.error("Error in onRender callback", error instanceof Error ? error : new Error(String(error)), undefined, {
          component: "AnimationCore",
          function: "animate",
        });
      }
    }
    const renderTime = performance.now() - renderStartTime;

    // Update state
    setAnimationState(prev => ({
      ...prev,
      frameCount: prev.frameCount + 1,
      lastFrameTime: currentTime,
      deltaTime,
      fps: currentFPS,
      averageFPS,
      performanceMetrics: {
        frameTime: performance.now() - frameStartTime,
        renderTime,
        updateTime,
      },
    }));

    // Call frame end callback
    callbacks.onFrameEnd?.(performance.now() - frameStartTime, frameCount);

    // Continue animation loop
    animationId = window.requestAnimationFrame(animate);
  };

  /**
   * Start the animation loop
   */
  const start = (newCallbacks: AnimationCallbacks) => {
    const state = animationState();
    if (state.isRunning) {
      log.warn("Animation already running, ignoring start request", undefined, {
        component: "AnimationCore",
        function: "start",
      });
      return;
    }

    callbacks = { ...callbacks, ...newCallbacks };

    // Set up safety timeout
    safetyTimeout = window.setTimeout(() => {
      log.warn("Safety timeout reached, stopping animation", undefined, {
        component: "AnimationCore",
        function: "start",
      });
      stop();
    }, 30000); // 30 second safety timeout

    setAnimationState(prev => ({ ...prev, isRunning: true }));
    animationId = window.requestAnimationFrame(animate);
    log.info(
      "Animation started",
      { animationId },
      {
        component: "AnimationCore",
        function: "start",
      }
    );
  };

  /**
   * Stop the animation loop
   */
  const stop = () => {
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      animationId = undefined;
    }

    if (safetyTimeout) {
      clearTimeout(safetyTimeout);
      safetyTimeout = undefined;
    }

    setAnimationState(prev => ({
      ...prev,
      isRunning: false,
    }));
  };

  /**
   * Get performance statistics
   */
  const getPerformanceStats = (): PerformanceStats => {
    const state = animationState();
    return {
      currentFPS: state.fps,
      averageFPS: state.averageFPS,
      frameCount: state.frameCount,
      frameTime: state.performanceMetrics.frameTime,
      renderTime: state.performanceMetrics.renderTime,
      updateTime: state.performanceMetrics.updateTime,
      isRunning: state.isRunning,
    };
  };

  // Cleanup on unmount
  onCleanup(() => {
    stop();
  });

  return {
    animationState,
    start,
    stop,
    getPerformanceStats,
    updateConfig: (newConfig: Partial<AnimationConfig>) => {
      config = { ...config, ...newConfig };
      log.debug("Config updated", config, {
        component: "AnimationCore",
        function: "updateConfig",
      });
    },
    updateCallbacks: (newCallbacks: AnimationCallbacks) => {
      callbacks = { ...callbacks, ...newCallbacks };
    },
    reset: () => {
      stop();
      setAnimationState({
        isRunning: false,
        frameCount: 0,
        lastFrameTime: 0,
        deltaTime: 0,
        fps: 0,
        averageFPS: 0,
        performanceMetrics: {
          frameTime: 0,
          renderTime: 0,
          updateTime: 0,
        },
      });
      fpsHistory = [];
      fpsSum = 0;
    },
  };
}
