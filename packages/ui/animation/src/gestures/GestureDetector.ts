/**
 * 🦊 Gesture Detector
 * 
 * Detects touch/mouse gestures and provides animation triggers
 */

export interface GestureEvent {
  type: 'drag' | 'swipe' | 'pinch' | 'rotate' | 'tap' | 'longpress';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  scale?: number;
  rotation?: number;
  duration: number;
  timestamp: number;
}

export interface GestureOptions {
  threshold?: number;
  maxDuration?: number;
  minDistance?: number;
  preventDefault?: boolean;
  onStart?: (event: GestureEvent) => void;
  onMove?: (event: GestureEvent) => void;
  onEnd?: (event: GestureEvent) => void;
}

export class GestureDetector {
  private element: HTMLElement;
  private options: Required<GestureOptions>;
  private isActive: boolean = false;
  private startTime: number = 0;
  private startX: number = 0;
  private startY: number = 0;
  private lastX: number = 0;
  private lastY: number = 0;
  private lastTime: number = 0;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private initialDistance: number = 0;
  private initialAngle: number = 0;
  private touchCount: number = 0;

  constructor(element: HTMLElement, options: GestureOptions = {}) {
    this.element = element;
    this.options = {
      threshold: 10,
      maxDuration: 1000,
      minDistance: 5,
      preventDefault: true,
      onStart: () => {},
      onMove: () => {},
      onEnd: () => {},
      ...options,
    };

    this.bindEvents();
  }

  private bindEvents(): void {
    // Mouse events
    this.element.addEventListener('mousedown', this.handleStart.bind(this));
    this.element.addEventListener('mousemove', this.handleMove.bind(this));
    this.element.addEventListener('mouseup', this.handleEnd.bind(this));
    this.element.addEventListener('mouseleave', this.handleEnd.bind(this));

    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });

    // Prevent context menu on long press
    this.element.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private handleStart(event: MouseEvent): void {
    if (this.options.preventDefault) {
      event.preventDefault();
    }
    this.startGesture(event.clientX, event.clientY);
  }

  private handleTouchStart(event: TouchEvent): void {
    if (this.options.preventDefault) {
      event.preventDefault();
    }
    
    this.touchCount = event.touches.length;
    
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.startGesture(touch.clientX, touch.clientY);
    } else if (event.touches.length === 2) {
      this.startMultiTouch(event.touches[0], event.touches[1]);
    }
  }

  private startGesture(x: number, y: number): void {
    this.isActive = true;
    this.startTime = performance.now();
    this.startX = this.lastX = x;
    this.startY = this.lastY = y;
    this.velocityX = this.velocityY = 0;
    this.lastTime = this.startTime;

    const gestureEvent: GestureEvent = {
      type: 'drag',
      startX: this.startX,
      startY: this.startY,
      currentX: x,
      currentY: y,
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0,
      duration: 0,
      timestamp: this.startTime,
    };

    this.options.onStart(gestureEvent);
  }

  private startMultiTouch(touch1: Touch, touch2: Touch): void {
    this.isActive = true;
    this.startTime = performance.now();
    
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    
    this.startX = this.lastX = centerX;
    this.startY = this.lastY = centerY;
    
    this.initialDistance = this.getDistance(touch1, touch2);
    this.initialAngle = this.getAngle(touch1, touch2);
    
    const gestureEvent: GestureEvent = {
      type: 'pinch',
      startX: this.startX,
      startY: this.startY,
      currentX: centerX,
      currentY: centerY,
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0,
      scale: 1,
      rotation: 0,
      duration: 0,
      timestamp: this.startTime,
    };

    this.options.onStart(gestureEvent);
  }

  private handleMove(event: MouseEvent): void {
    if (!this.isActive) return;
    if (this.options.preventDefault) {
      event.preventDefault();
    }
    this.updateGesture(event.clientX, event.clientY);
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isActive) return;
    if (this.options.preventDefault) {
      event.preventDefault();
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.updateGesture(touch.clientX, touch.clientY);
    } else if (event.touches.length === 2) {
      this.updateMultiTouch(event.touches[0], event.touches[1]);
    }
  }

  private updateGesture(x: number, y: number): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime > 0) {
      this.velocityX = (x - this.lastX) / deltaTime;
      this.velocityY = (y - this.lastY) / deltaTime;
    }

    const deltaX = x - this.startX;
    const deltaY = y - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Determine gesture type based on movement
    let gestureType: GestureEvent['type'] = 'drag';
    if (distance < this.options.minDistance) {
      gestureType = 'tap';
    } else if (Math.abs(this.velocityX) > Math.abs(this.velocityY)) {
      gestureType = 'swipe';
    }

    const gestureEvent: GestureEvent = {
      type: gestureType,
      startX: this.startX,
      startY: this.startY,
      currentX: x,
      currentY: y,
      deltaX,
      deltaY,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      duration: currentTime - this.startTime,
      timestamp: currentTime,
    };

    this.options.onMove(gestureEvent);

    this.lastX = x;
    this.lastY = y;
    this.lastTime = currentTime;
  }

  private updateMultiTouch(touch1: Touch, touch2: Touch): void {
    const currentTime = performance.now();
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    
    const currentDistance = this.getDistance(touch1, touch2);
    const currentAngle = this.getAngle(touch1, touch2);
    
    const scale = currentDistance / this.initialDistance;
    const rotation = currentAngle - this.initialAngle;

    const gestureEvent: GestureEvent = {
      type: 'pinch',
      startX: this.startX,
      startY: this.startY,
      currentX: centerX,
      currentY: centerY,
      deltaX: centerX - this.startX,
      deltaY: centerY - this.startY,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      scale,
      rotation,
      duration: currentTime - this.startTime,
      timestamp: currentTime,
    };

    this.options.onMove(gestureEvent);
  }

  private handleEnd(event: MouseEvent): void {
    this.endGesture();
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (event.touches.length === 0) {
      this.endGesture();
    } else if (event.touches.length === 1) {
      // Switch from multi-touch to single touch
      const touch = event.touches[0];
      this.startGesture(touch.clientX, touch.clientY);
    }
  }

  private endGesture(): void {
    if (!this.isActive) return;

    const currentTime = performance.now();
    const duration = currentTime - this.startTime;
    const deltaX = this.lastX - this.startX;
    const deltaY = this.lastY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Determine final gesture type
    let gestureType: GestureEvent['type'] = 'tap';
    if (distance > this.options.minDistance) {
      if (Math.abs(this.velocityX) > Math.abs(this.velocityY)) {
        gestureType = 'swipe';
      } else {
        gestureType = 'drag';
      }
    }

    const gestureEvent: GestureEvent = {
      type: gestureType,
      startX: this.startX,
      startY: this.startY,
      currentX: this.lastX,
      currentY: this.lastY,
      deltaX,
      deltaY,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      duration,
      timestamp: currentTime,
    };

    this.options.onEnd(gestureEvent);
    this.isActive = false;
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getAngle(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.atan2(dy, dx);
  }

  destroy(): void {
    // Remove all event listeners
    this.element.removeEventListener('mousedown', this.handleStart.bind(this));
    this.element.removeEventListener('mousemove', this.handleMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleEnd.bind(this));
    this.element.removeEventListener('mouseleave', this.handleEnd.bind(this));
    
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchEnd.bind(this));
  }
}
