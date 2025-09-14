/**
 * 🦊 Animation Core
 * Core animation loop and state management
 * 
 * @deprecated Use reynard-animation package instead
 * This file is kept for backward compatibility
 */

import { createSignal, onCleanup } from "solid-js";
import type { AnimationConfig, AnimationState, AnimationCallbacks, PerformanceStats } from "./AnimationTypes";

export function createAnimationCore(initialConfig: AnimationConfig) {
  let config = { ...initialConfig }; // Make config mutable
  
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
      console.warn("🦊 AnimationCore: Animation ID is undefined, stopping");
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
      console.warn("🦊 AnimationCore: Frame count exceeded safety limit, stopping animation");
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
        // if (config.enablePerformanceMonitoring) {
        //   console.log("🦊 AnimationCore: Calling onUpdate", { deltaTime, frameCount: state.frameCount });
        // }
        callbacks.onUpdate(deltaTime, state.frameCount);
      } catch (error) {
        console.error("🦊 AnimationCore: Error in onUpdate callback", error);
      }
    }
    const updateTime = performance.now() - updateStartTime;

    // Render phase
    const renderStartTime = performance.now();
    if (callbacks.onRender) {
      try {
        // if (config.enablePerformanceMonitoring) {
        //   console.log("🦊 AnimationCore: Calling onRender", { deltaTime, frameCount: state.frameCount });
        // }
        callbacks.onRender(deltaTime, state.frameCount);
      } catch (error) {
        console.error("🦊 AnimationCore: Error in onRender callback", error);
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
    callbacks.onFrameEnd?.(currentTime, state.frameCount + 1);

    // Continue animation loop
    if (state.isRunning) {
      animationId = window.requestAnimationFrame(animate);
    }
  };

  /**
   * Start the animation loop
   */
  const start = (newCallbacks: AnimationCallbacks = {}) => {
    // Safety check: prevent starting if already running
    if (animationState().isRunning) {
      console.warn("🦊 AnimationCore: Animation already running, ignoring start request");
      return;
    }
    
    callbacks = { ...callbacks, ...newCallbacks };

    setAnimationState(prev => ({
      ...prev,
      isRunning: true,
      lastFrameTime: performance.now(),
    }));
    
    // Reset frame counter for safety
    frameCount = 0;

    // Set safety timeout to prevent runaway animations
    safetyTimeout = window.setTimeout(() => {
      console.warn("🦊 AnimationCore: Safety timeout reached, stopping animation");
      stop();
    }, 30000); // 30 second safety timeout

    animationId = window.requestAnimationFrame(animate);
    // console.log("🦊 AnimationCore: Animation started with ID", animationId);
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
      console.log("🦊 AnimationCore: Config updated", config);
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
