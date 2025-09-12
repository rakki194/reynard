/**
 * Animation controller for pixel art sprites
 * Handles frame-based animation with timing control
 */

import type { PixelSprite } from "./sprite-renderer";

/**
 * Animated sprite data structure
 */
export interface AnimatedSprite {
  frames: PixelSprite[];
  frameRate: number; // Frames per second
  loop: boolean;
}

/**
 * Animation controller for sprites
 */
export class SpriteAnimator {
  private currentFrame: number = 0;
  private frameTime: number = 0;
  private isPlaying: boolean = false;
  private animation: AnimatedSprite | null = null;

  /**
   * Start playing an animation
   */
  play(animation: AnimatedSprite): void {
    this.animation = animation;
    this.currentFrame = 0;
    this.frameTime = 0;
    this.isPlaying = true;
  }

  /**
   * Stop the current animation
   */
  stop(): void {
    this.isPlaying = false;
    this.currentFrame = 0;
    this.frameTime = 0;
  }

  /**
   * Pause the current animation
   */
  pause(): void {
    this.isPlaying = false;
  }

  /**
   * Resume the current animation
   */
  resume(): void {
    this.isPlaying = true;
  }

  /**
   * Update animation (call this every frame)
   */
  update(deltaTime: number): void {
    if (!this.isPlaying || !this.animation) return;

    this.frameTime += deltaTime;
    const frameDuration = 1000 / this.animation.frameRate; // Convert to milliseconds

    if (this.frameTime >= frameDuration) {
      this.frameTime = 0;
      this.currentFrame++;

      if (this.currentFrame >= this.animation.frames.length) {
        if (this.animation.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.animation.frames.length - 1;
          this.isPlaying = false;
        }
      }
    }
  }

  /**
   * Get the current frame sprite
   */
  getCurrentFrame(): PixelSprite | null {
    if (!this.animation || this.currentFrame >= this.animation.frames.length) {
      return null;
    }

    return this.animation.frames[this.currentFrame];
  }

  /**
   * Check if animation is playing
   */
  isAnimationPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current frame index
   */
  getCurrentFrameIndex(): number {
    return this.currentFrame;
  }

  /**
   * Get total frame count
   */
  getFrameCount(): number {
    return this.animation?.frames.length || 0;
  }

  /**
   * Set current frame (for manual control)
   */
  setFrame(frameIndex: number): void {
    if (
      this.animation &&
      frameIndex >= 0 &&
      frameIndex < this.animation.frames.length
    ) {
      this.currentFrame = frameIndex;
      this.frameTime = 0;
    }
  }
}
