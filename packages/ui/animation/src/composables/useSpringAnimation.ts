/**
 * 🦊 Spring Animation Composable
 * 
 * SolidJS composable for spring-based animations with natural motion physics
 */

import { createSignal, onCleanup, onMount } from "solid-js";
import { SpringPhysics, SpringEasing, SpringAnimationLoop, type SpringConfig, type SpringResult } from "../physics/SpringPhysics";

export interface UseSpringAnimationOptions extends SpringConfig {
  initialValue?: number;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

export interface UseSpringAnimationReturn {
  value: () => number;
  velocity: () => number;
  isAtRest: () => boolean;
  setTarget: (target: number) => void;
  setValue: (value: number) => void;
  reset: () => void;
  stop: () => void;
}

export function useSpringAnimation(
  options: UseSpringAnimationOptions = {}
): UseSpringAnimationReturn {
  const {
    mass = 1,
    stiffness = 100,
    damping = 10,
    precision = 0.01,
    velocity: initialVelocity = 0,
    initialValue = 0,
    onUpdate,
    onComplete,
  } = options;

  const [value, setValue] = createSignal(initialValue);
  const [velocity, setVelocity] = createSignal(0);
  const [isAtRest, setIsAtRest] = createSignal(true);

  const spring = new SpringPhysics({
    mass,
    stiffness,
    damping,
    precision,
    velocity: initialVelocity,
  });

  spring.setPosition(initialValue);

  let animationLoop: SpringAnimationLoop | null = null;

  const handleUpdate = (result: SpringResult) => {
    setValue(result.position);
    setVelocity(result.velocity);
    setIsAtRest(result.isComplete);
    onUpdate?.(result.position);
  };

  const handleComplete = () => {
    setIsAtRest(true);
    onComplete?.();
  };

  const setTarget = (target: number): void => {
    spring.setTarget(target);
    setIsAtRest(false);
    
    // Start animation loop if not running
    if (!animationLoop) {
      animationLoop = new SpringAnimationLoop(spring, handleUpdate, handleComplete);
      animationLoop.start();
    }
  };

  const setSpringValue = (newValue: number): void => {
    spring.setPosition(newValue);
    setValue(newValue);
    setVelocity(0);
    setIsAtRest(true);
  };

  const reset = (): void => {
    spring.reset();
    setValue(initialValue);
    setVelocity(0);
    setIsAtRest(true);
    if (animationLoop) {
      animationLoop.stop();
      animationLoop = null;
    }
  };

  const stop = (): void => {
    if (animationLoop) {
      animationLoop.stop();
      animationLoop = null;
    }
  };

  // Cleanup on unmount
  onCleanup(() => {
    stop();
  });

  return {
    value,
    velocity,
    isAtRest,
    setTarget,
    setValue: setSpringValue,
    reset,
    stop,
  };
}

/**
 * Convenience composable for 2D spring animations
 */
export function useSpring2D(options: UseSpringAnimationOptions = {}) {
  const springX = useSpringAnimation(options);
  const springY = useSpringAnimation(options);

  return {
    x: springX.value,
    y: springY.value,
    velocityX: springX.velocity,
    velocityY: springY.velocity,
    isAtRest: () => springX.isAtRest() && springY.isAtRest(),
    setTarget: (x: number, y: number) => {
      springX.setTarget(x);
      springY.setTarget(y);
    },
    setValue: (x: number, y: number) => {
      springX.setValue(x);
      springY.setValue(y);
    },
    reset: () => {
      springX.reset();
      springY.reset();
    },
    stop: () => {
      springX.stop();
      springY.stop();
    },
  };
}

/**
 * Convenience composable for 3D spring animations
 */
export function useSpring3D(options: UseSpringAnimationOptions = {}) {
  const springX = useSpringAnimation(options);
  const springY = useSpringAnimation(options);
  const springZ = useSpringAnimation(options);

  return {
    x: springX.value,
    y: springY.value,
    z: springZ.value,
    velocityX: springX.velocity,
    velocityY: springY.velocity,
    velocityZ: springZ.velocity,
    isAtRest: () => springX.isAtRest() && springY.isAtRest() && springZ.isAtRest(),
    setTarget: (x: number, y: number, z: number) => {
      springX.setTarget(x);
      springY.setTarget(y);
      springZ.setTarget(z);
    },
    setValue: (x: number, y: number, z: number) => {
      springX.setValue(x);
      springY.setValue(y);
      springZ.setValue(z);
    },
    reset: () => {
      springX.reset();
      springY.reset();
      springZ.reset();
    },
    stop: () => {
      springX.stop();
      springY.stop();
      springZ.stop();
    },
  };
}

/**
 * Get spring easing function by preset name
 */
export function getSpringEasing(presetName: keyof typeof SpringEasing.presets) {
  return SpringEasing.getPreset(presetName);
}

/**
 * Create custom spring easing function
 */
export function createSpringEasing(config: SpringConfig) {
  return SpringEasing.create(config);
}
