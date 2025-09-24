/**
 * 🦊 Gesture Animation Composable
 * 
 * SolidJS composable for gesture-based animations
 */

import { createSignal, onCleanup, onMount } from "solid-js";
import { GestureAnimationSystem, GestureAnimationConfig, GestureAnimationState } from "../gestures/GestureAnimationSystem";
import type { EasingType } from "../types";

export interface UseGestureAnimationOptions {
  properties?: {
    translateX?: boolean;
    translateY?: boolean;
    scale?: boolean;
    rotate?: boolean;
    opacity?: boolean;
  };
  momentum?: {
    enabled?: boolean;
    friction?: number;
    maxVelocity?: number;
  };
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    minScale?: number;
    maxScale?: number;
  };
  easing?: EasingType;
  onGestureStart?: (event: any) => void;
  onGestureMove?: (event: any) => void;
  onGestureEnd?: (event: any) => void;
}

export interface UseGestureAnimationReturn {
  state: () => GestureAnimationState;
  isAnimating: () => boolean;
  animateTo: (targetState: Partial<GestureAnimationState>, duration?: number) => void;
  reset: () => void;
  setState: (newState: Partial<GestureAnimationState>) => void;
  ref: (element: HTMLElement) => void;
}

export function useGestureAnimation(
  options: UseGestureAnimationOptions = {}
): UseGestureAnimationReturn {
  const [state, setState] = createSignal<GestureAnimationState>({
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0,
    opacity: 1,
    isAnimating: false,
  });

  const [isAnimating, setIsAnimating] = createSignal(false);
  let gestureSystem: GestureAnimationSystem | null = null;
  let elementRef: HTMLElement | null = null;

  const ref = (element: HTMLElement) => {
    elementRef = element;
    
    if (gestureSystem) {
      gestureSystem.destroy();
    }

    const config: GestureAnimationConfig = {
      element,
      properties: {
        translateX: true,
        translateY: true,
        scale: false,
        rotate: false,
        opacity: false,
        ...options.properties,
      },
      momentum: options.momentum,
      bounds: options.bounds,
      easing: options.easing,
      onGestureStart: (event) => {
        setIsAnimating(true);
        options.onGestureStart?.(event);
      },
      onGestureMove: (event) => {
        setState(gestureSystem!.getState());
        options.onGestureMove?.(event);
      },
      onGestureEnd: (event) => {
        setIsAnimating(false);
        setState(gestureSystem!.getState());
        options.onGestureEnd?.(event);
      },
    };

    gestureSystem = new GestureAnimationSystem(config);
  };

  const animateTo = (targetState: Partial<GestureAnimationState>, duration: number = 300): void => {
    if (!gestureSystem) return;
    
    setIsAnimating(true);
    gestureSystem.animateTo(targetState, duration);
    
    // Update state after animation
    setTimeout(() => {
      setState(gestureSystem!.getState());
      setIsAnimating(false);
    }, duration);
  };

  const reset = (): void => {
    if (!gestureSystem) return;
    gestureSystem.reset();
    setState(gestureSystem.getState());
  };

  const setGestureState = (newState: Partial<GestureAnimationState>): void => {
    if (!gestureSystem) return;
    gestureSystem.setState(newState);
    setState(gestureSystem.getState());
  };

  // Cleanup on unmount
  onCleanup(() => {
    if (gestureSystem) {
      gestureSystem.destroy();
    }
  });

  return {
    state,
    isAnimating,
    animateTo,
    reset,
    setState: setGestureState,
    ref,
  };
}
