/**
 * 🦊 Spring Physics System
 *
 * Mass, stiffness, damping parameters with velocity-based spring calculations
 */

export interface SpringConfig {
  mass: number; // Mass of the object (affects inertia)
  stiffness: number; // Spring stiffness (how strong the spring is)
  damping: number; // Damping coefficient (friction/resistance)
  precision: number; // Precision threshold for stopping
  velocity?: number; // Initial velocity
}

export interface SpringState {
  position: number;
  velocity: number;
  acceleration: number;
  isAtRest: boolean;
}

export interface SpringResult {
  position: number;
  velocity: number;
  isComplete: boolean;
}

export class SpringPhysics {
  private config: Required<SpringConfig>;
  private state: SpringState;
  private target: number = 0;
  private startTime: number = 0;
  private lastTime: number = 0;

  constructor(config: SpringConfig) {
    this.config = {
      mass: 1,
      stiffness: 100,
      damping: 10,
      precision: 0.01,
      velocity: 0,
      ...config,
    };

    this.state = {
      position: 0,
      velocity: this.config.velocity,
      acceleration: 0,
      isAtRest: false,
    };
  }

  /**
   * Set the target position for the spring
   */
  setTarget(target: number): void {
    this.target = target;
    this.state.isAtRest = false;
  }

  /**
   * Set the current position and reset velocity
   */
  setPosition(position: number): void {
    this.state.position = position;
    this.state.velocity = 0;
    this.state.isAtRest = false;
  }

  /**
   * Update the spring physics for one frame
   */
  update(deltaTime: number = 16): SpringResult {
    if (this.state.isAtRest) {
      return {
        position: this.state.position,
        velocity: this.state.velocity,
        isComplete: true,
      };
    }

    // Calculate spring force (Hooke's law: F = -kx)
    const displacement = this.state.position - this.target;
    const springForce = -this.config.stiffness * displacement;

    // Calculate damping force (F = -bv)
    const dampingForce = -this.config.damping * this.state.velocity;

    // Calculate total force
    const totalForce = springForce + dampingForce;

    // Calculate acceleration (F = ma, so a = F/m)
    this.state.acceleration = totalForce / this.config.mass;

    // Update velocity using acceleration
    this.state.velocity += this.state.acceleration * (deltaTime / 1000);

    // Update position using velocity
    this.state.position += this.state.velocity * (deltaTime / 1000);

    // Check if spring is at rest
    const isAtRest =
      Math.abs(displacement) < this.config.precision && Math.abs(this.state.velocity) < this.config.precision;

    if (isAtRest && !this.state.isAtRest) {
      this.state.isAtRest = true;
      this.state.position = this.target;
      this.state.velocity = 0;
    }

    return {
      position: this.state.position,
      velocity: this.state.velocity,
      isComplete: this.state.isAtRest,
    };
  }

  /**
   * Get current spring state
   */
  getState(): SpringState {
    return { ...this.state };
  }

  /**
   * Reset spring to initial state
   */
  reset(): void {
    this.state = {
      position: 0,
      velocity: this.config.velocity,
      acceleration: 0,
      isAtRest: false,
    };
    this.target = 0;
  }

  /**
   * Check if spring is at rest
   */
  isAtRest(): boolean {
    return this.state.isAtRest;
  }

  /**
   * Get the target position
   */
  getTarget(): number {
    return this.target;
  }
}

/**
 * Spring-based easing functions
 */
export class SpringEasing {
  /**
   * Create a spring easing function
   */
  static create(config: SpringConfig): (t: number) => number {
    const spring = new SpringPhysics(config);
    spring.setTarget(1);

    return (t: number): number => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;

      // Reset spring for each evaluation
      spring.reset();
      spring.setTarget(1);

      // Simulate spring for the given time
      const totalTime = t * 1000; // Convert to milliseconds
      let currentTime = 0;

      while (currentTime < totalTime && !spring.isAtRest()) {
        spring.update(16); // 60fps simulation
        currentTime += 16;
      }

      return spring.getState().position;
    };
  }

  /**
   * Predefined spring configurations
   */
  static readonly presets = {
    // Gentle spring
    gentle: { mass: 1, stiffness: 120, damping: 14, precision: 0.01 },

    // Wobbly spring
    wobbly: { mass: 1, stiffness: 180, damping: 12, precision: 0.01 },

    // Stiff spring
    stiff: { mass: 1, stiffness: 210, damping: 20, precision: 0.01 },

    // Slow spring
    slow: { mass: 1, stiffness: 280, damping: 60, precision: 0.01 },

    // Bouncy spring
    bouncy: { mass: 1, stiffness: 400, damping: 10, precision: 0.01 },

    // No bounce spring
    noBounce: { mass: 1, stiffness: 200, damping: 25, precision: 0.01 },
  };

  /**
   * Get spring easing function by preset name
   */
  static getPreset(presetName: keyof typeof SpringEasing.presets): (t: number) => number {
    return SpringEasing.create(SpringEasing.presets[presetName]);
  }
}

/**
 * Multi-dimensional spring system for 2D/3D animations
 */
export class MultiSpringPhysics {
  private springs: SpringPhysics[];
  private dimensions: number;

  constructor(dimensions: number, config: SpringConfig) {
    this.dimensions = dimensions;
    this.springs = Array.from({ length: dimensions }, () => new SpringPhysics(config));
  }

  setTarget(target: number[]): void {
    if (target.length !== this.dimensions) {
      throw new Error(`Target must have ${this.dimensions} dimensions`);
    }

    this.springs.forEach((spring, index) => {
      spring.setTarget(target[index]);
    });
  }

  setPosition(position: number[]): void {
    if (position.length !== this.dimensions) {
      throw new Error(`Position must have ${this.dimensions} dimensions`);
    }

    this.springs.forEach((spring, index) => {
      spring.setPosition(position[index]);
    });
  }

  update(deltaTime: number = 16): number[] {
    return this.springs.map(spring => spring.update(deltaTime).position);
  }

  isAtRest(): boolean {
    return this.springs.every(spring => spring.isAtRest());
  }

  getState(): SpringState[] {
    return this.springs.map(spring => spring.getState());
  }

  reset(): void {
    this.springs.forEach(spring => spring.reset());
  }
}

/**
 * Spring animation loop for smooth 60fps animations
 */
export class SpringAnimationLoop {
  private spring: SpringPhysics;
  private animationId: number | null = null;
  private isRunning: boolean = false;
  private onUpdate: (result: SpringResult) => void;
  private onComplete?: () => void;

  constructor(spring: SpringPhysics, onUpdate: (result: SpringResult) => void, onComplete?: () => void) {
    this.spring = spring;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.animate();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate = (currentTime: number = performance.now()): void => {
    if (!this.isRunning) return;

    const deltaTime = currentTime - (this.lastTime || currentTime);
    this.lastTime = currentTime;

    const result = this.spring.update(deltaTime);
    this.onUpdate(result);

    if (result.isComplete) {
      this.onComplete?.();
      this.stop();
    } else {
      this.animationId = requestAnimationFrame(this.animate);
    }
  };
}
