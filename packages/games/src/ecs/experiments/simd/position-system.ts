// Position system implementation for comparison

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Acceleration {
  ax: number;
  ay: number;
}

export interface Mass {
  mass: number;
}

export class PositionSystem {
  private positions: Position[] = [];
  private velocities: Velocity[] = [];
  private accelerations: Acceleration[] = [];
  private masses: Mass[] = [];
  private entityCount: number = 0;

  constructor(private maxEntities: number = 100000) {}

  addEntity(position: Position, velocity: Velocity, acceleration: Acceleration, mass: Mass): void {
    if (this.entityCount >= this.maxEntities) return;
    
    this.positions.push(position);
    this.velocities.push(velocity);
    this.accelerations.push(acceleration);
    this.masses.push(mass);
    this.entityCount++;
  }

  updatePositions(deltaTime: number): void {
    for (let i = 0; i < this.entityCount; i++) {
      const pos = this.positions[i];
      const vel = this.velocities[i];
      const acc = this.accelerations[i];
      
      // Update velocity
      vel.vx += acc.ax * deltaTime;
      vel.vy += acc.ay * deltaTime;
      
      // Update position
      pos.x += vel.vx * deltaTime;
      pos.y += vel.vy * deltaTime;
    }
  }

  detectCollisions(radius: number): number[] {
    const collisions: number[] = [];
    for (let i = 0; i < this.entityCount; i++) {
      for (let j = i + 1; j < this.entityCount; j++) {
        const dx = this.positions[i].x - this.positions[j].x;
        const dy = this.positions[i].y - this.positions[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius * 2) {
          collisions.push(i, j);
        }
      }
    }
    return collisions;
  }

  spatialQuery(queryX: number, queryY: number, radius: number): number[] {
    const results: number[] = [];
    for (let i = 0; i < this.entityCount; i++) {
      const dx = this.positions[i].x - queryX;
      const dy = this.positions[i].y - queryY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < radius) {
        results.push(i);
      }
    }
    return results;
  }

  clear(): void {
    this.positions.length = 0;
    this.velocities.length = 0;
    this.accelerations.length = 0;
    this.masses.length = 0;
    this.entityCount = 0;
  }
}