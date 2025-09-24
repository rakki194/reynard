/**
 * 🦊 Simplified Animation Loop
 * 
 * Single requestAnimationFrame loop with proper frame timing
 * No setTimeout anti-patterns, no unnecessary abstractions
 */

import type { EasingType } from "../types";
import { applyEasing } from "../easing/easing";

export interface AnimationItem {
  id: string;
  startTime: number;
  duration: number;
  delay: number;
  easing: EasingType;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
  isActive: boolean;
}

export class SimplifiedAnimationLoop {
  private items: Map<string, AnimationItem> = new Map();
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private lastFrameTime: number = 0;

  /**
   * Add an animation item to the loop
   */
  addItem(item: Omit<AnimationItem, 'isActive'>): void {
    this.items.set(item.id, { ...item, isActive: true });
    
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Remove an animation item
   */
  removeItem(id: string): void {
    this.items.delete(id);
    
    if (this.items.size === 0) {
      this.stop();
    }
  }

  /**
   * Start the animation loop
   */
  private start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }

  /**
   * Stop the animation loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Main animation loop - single requestAnimationFrame
   */
  private animate = (currentTime: number = performance.now()): void => {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Process all active animation items
    const itemsToRemove: string[] = [];
    
    for (const [id, item] of this.items) {
      if (!item.isActive) continue;

      const elapsed = currentTime - item.startTime;
      
      // Check if delay period is over
      if (elapsed < item.delay) {
        continue;
      }

      // Calculate progress (0-1)
      const animationElapsed = elapsed - item.delay;
      const progress = Math.min(animationElapsed / item.duration, 1);
      const easedProgress = applyEasing(progress, item.easing);

      // Update the animation
      item.onUpdate(easedProgress);

      // Check if animation is complete
      if (progress >= 1) {
        item.onComplete?.();
        itemsToRemove.push(id);
      }
    }

    // Remove completed items
    itemsToRemove.forEach(id => this.items.delete(id));

    // Continue loop if there are active items
    if (this.items.size > 0) {
      this.animationId = requestAnimationFrame(this.animate);
    } else {
      this.stop();
    }
  }

  /**
   * Get current animation count
   */
  getActiveCount(): number {
    return this.items.size;
  }

  /**
   * Check if loop is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Clear all animations
   */
  clear(): void {
    this.items.clear();
    this.stop();
  }
}

// Global animation loop instance
export const globalAnimationLoop = new SimplifiedAnimationLoop();

/**
 * Simplified staggered animation using single loop
 */
export function createStaggeredAnimation(
  itemCount: number,
  duration: number,
  stagger: number,
  easing: EasingType,
  onItemUpdate: (index: number, progress: number) => void,
  onItemComplete?: (index: number) => void,
  onAllComplete?: () => void
): () => void {
  const startTime = performance.now();
  const itemIds: string[] = [];
  let completedItems = 0;

  // Add all items to the global loop
  for (let i = 0; i < itemCount; i++) {
    const itemId = `staggered-${i}-${Date.now()}-${Math.random()}`;
    itemIds.push(itemId);

    globalAnimationLoop.addItem({
      id: itemId,
      startTime,
      duration,
      delay: i * stagger,
      easing,
      onUpdate: (progress) => onItemUpdate(i, progress),
      onComplete: () => {
        completedItems++;
        onItemComplete?.(i);
        
        // Check if all items are complete
        if (completedItems >= itemCount) {
          onAllComplete?.();
        }
      },
    });
  }

  // Return cleanup function
  return () => {
    itemIds.forEach(id => globalAnimationLoop.removeItem(id));
  };
}

/**
 * Simple single animation using the loop
 */
export function createSimpleAnimation(
  duration: number,
  easing: EasingType,
  onUpdate: (progress: number) => void,
  onComplete?: () => void
): () => void {
  const itemId = `simple-${Date.now()}-${Math.random()}`;
  
  globalAnimationLoop.addItem({
    id: itemId,
    startTime: performance.now(),
    duration,
    delay: 0,
    easing,
    onUpdate,
    onComplete,
  });

  return () => globalAnimationLoop.removeItem(itemId);
}
