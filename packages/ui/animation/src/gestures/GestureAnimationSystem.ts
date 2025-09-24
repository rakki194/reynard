/**
 * 🦊 Gesture Animation System
 * 
 * Connects gestures to animation properties with momentum and physics
 */

import { GestureDetector, GestureEvent, GestureOptions } from './GestureDetector';
import { createSimpleAnimation } from '../utils/SimplifiedAnimationLoop';
import type { EasingType } from '../types';

export interface GestureAnimationConfig {
  element: HTMLElement;
  properties: {
    translateX?: boolean;
    translateY?: boolean;
    scale?: boolean;
    rotate?: boolean;
    opacity?: boolean;
  };
  momentum?: {
    enabled: boolean;
    friction: number;
    maxVelocity: number;
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
  onGestureStart?: (event: GestureEvent) => void;
  onGestureMove?: (event: GestureEvent) => void;
  onGestureEnd?: (event: GestureEvent) => void;
}

export interface GestureAnimationState {
  translateX: number;
  translateY: number;
  scale: number;
  rotate: number;
  opacity: number;
  isAnimating: boolean;
}

export class GestureAnimationSystem {
  private detector: GestureDetector;
  private config: GestureAnimationConfig;
  private state: GestureAnimationState;
  private momentumAnimation: (() => void) | null = null;
  private isDragging: boolean = false;

  constructor(config: GestureAnimationConfig) {
    this.config = {
      momentum: {
        enabled: true,
        friction: 0.95,
        maxVelocity: 2,
      },
      easing: 'easeOutCubic',
      ...config,
    };

    this.state = {
      translateX: 0,
      translateY: 0,
      scale: 1,
      rotate: 0,
      opacity: 1,
      isAnimating: false,
    };

    this.detector = new GestureDetector(this.config.element, {
      threshold: 5,
      minDistance: 3,
      preventDefault: true,
      onStart: this.handleGestureStart.bind(this),
      onMove: this.handleGestureMove.bind(this),
      onEnd: this.handleGestureEnd.bind(this),
    });

    this.applyTransform();
  }

  private handleGestureStart(event: GestureEvent): void {
    this.isDragging = true;
    this.state.isAnimating = false;
    
    // Stop any existing momentum animation
    if (this.momentumAnimation) {
      this.momentumAnimation();
      this.momentumAnimation = null;
    }

    this.config.onGestureStart?.(event);
  }

  private handleGestureMove(event: GestureEvent): void {
    if (!this.isDragging) return;

    // Update state based on gesture type and enabled properties
    if (event.type === 'drag' || event.type === 'swipe') {
      if (this.config.properties.translateX) {
        this.state.translateX += event.deltaX - (event.deltaX - (event.currentX - event.startX));
      }
      if (this.config.properties.translateY) {
        this.state.translateY += event.deltaY - (event.deltaY - (event.currentY - event.startY));
      }
    }

    if (event.type === 'pinch') {
      if (this.config.properties.scale && event.scale) {
        this.state.scale = Math.max(0.1, Math.min(5, event.scale));
      }
      if (this.config.properties.rotate && event.rotation) {
        this.state.rotate += event.rotation;
      }
    }

    // Apply bounds
    this.applyBounds();

    // Apply transform
    this.applyTransform();

    this.config.onGestureMove?.(event);
  }

  private handleGestureEnd(event: GestureEvent): void {
    this.isDragging = false;

    // Apply momentum if enabled
    if (this.config.momentum?.enabled && (event.type === 'drag' || event.type === 'swipe')) {
      this.applyMomentum(event.velocityX, event.velocityY);
    }

    this.config.onGestureEnd?.(event);
  }

  private applyMomentum(velocityX: number, velocityY: number): void {
    if (!this.config.momentum?.enabled) return;

    const friction = this.config.momentum.friction;
    const maxVelocity = this.config.momentum.maxVelocity;
    
    // Clamp velocity
    velocityX = Math.max(-maxVelocity, Math.min(maxVelocity, velocityX));
    velocityY = Math.max(-maxVelocity, Math.min(maxVelocity, velocityY));

    let currentVelocityX = velocityX;
    let currentVelocityY = velocityY;
    let currentTranslateX = this.state.translateX;
    let currentTranslateY = this.state.translateY;

    const animate = () => {
      // Apply velocity
      currentTranslateX += currentVelocityX * 16; // 60fps
      currentTranslateY += currentVelocityY * 16;

      // Apply friction
      currentVelocityX *= friction;
      currentVelocityY *= friction;

      // Update state
      this.state.translateX = currentTranslateX;
      this.state.translateY = currentTranslateY;

      // Apply bounds
      this.applyBounds();

      // Apply transform
      this.applyTransform();

      // Continue if velocity is significant
      if (Math.abs(currentVelocityX) > 0.01 || Math.abs(currentVelocityY) > 0.01) {
        requestAnimationFrame(animate);
      } else {
        this.state.isAnimating = false;
        this.momentumAnimation = null;
      }
    };

    this.state.isAnimating = true;
    this.momentumAnimation = () => {
      this.state.isAnimating = false;
    };

    requestAnimationFrame(animate);
  }

  private applyBounds(): void {
    const bounds = this.config.bounds;
    if (!bounds) return;

    if (bounds.minX !== undefined) {
      this.state.translateX = Math.max(bounds.minX, this.state.translateX);
    }
    if (bounds.maxX !== undefined) {
      this.state.translateX = Math.min(bounds.maxX, this.state.translateX);
    }
    if (bounds.minY !== undefined) {
      this.state.translateY = Math.max(bounds.minY, this.state.translateY);
    }
    if (bounds.maxY !== undefined) {
      this.state.translateY = Math.min(bounds.maxY, this.state.translateY);
    }
    if (bounds.minScale !== undefined) {
      this.state.scale = Math.max(bounds.minScale, this.state.scale);
    }
    if (bounds.maxScale !== undefined) {
      this.state.scale = Math.min(bounds.maxScale, this.state.scale);
    }
  }

  private applyTransform(): void {
    const transform = [];
    
    if (this.config.properties.translateX || this.config.properties.translateY) {
      transform.push(`translate3d(${this.state.translateX}px, ${this.state.translateY}px, 0)`);
    }
    
    if (this.config.properties.scale) {
      transform.push(`scale(${this.state.scale})`);
    }
    
    if (this.config.properties.rotate) {
      transform.push(`rotate(${this.state.rotate}rad)`);
    }

    this.config.element.style.transform = transform.join(' ');
    
    if (this.config.properties.opacity) {
      this.config.element.style.opacity = this.state.opacity.toString();
    }
  }

  // Public API
  getState(): GestureAnimationState {
    return { ...this.state };
  }

  setState(newState: Partial<GestureAnimationState>): void {
    Object.assign(this.state, newState);
    this.applyBounds();
    this.applyTransform();
  }

  animateTo(targetState: Partial<GestureAnimationState>, duration: number = 300): void {
    const startState = { ...this.state };
    const startTime = performance.now();

    this.momentumAnimation = createSimpleAnimation(
      duration,
      this.config.easing || 'easeOutCubic',
      (progress) => {
        // Interpolate between start and target state
        this.state.translateX = this.lerp(startState.translateX, targetState.translateX || startState.translateX, progress);
        this.state.translateY = this.lerp(startState.translateY, targetState.translateY || startState.translateY, progress);
        this.state.scale = this.lerp(startState.scale, targetState.scale || startState.scale, progress);
        this.state.rotate = this.lerp(startState.rotate, targetState.rotate || startState.rotate, progress);
        this.state.opacity = this.lerp(startState.opacity, targetState.opacity || startState.opacity, progress);
        
        this.applyBounds();
        this.applyTransform();
      },
      () => {
        this.state.isAnimating = false;
        this.momentumAnimation = null;
      }
    );
  }

  reset(): void {
    this.setState({
      translateX: 0,
      translateY: 0,
      scale: 1,
      rotate: 0,
      opacity: 1,
      isAnimating: false,
    });
  }

  destroy(): void {
    this.detector.destroy();
    if (this.momentumAnimation) {
      this.momentumAnimation();
    }
  }

  private lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }
}
