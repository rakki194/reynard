// Position system implementation for comparison
export class PositionSystem {
    constructor(maxEntities = 100000) {
        Object.defineProperty(this, "maxEntities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maxEntities
        });
        Object.defineProperty(this, "positions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "velocities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "accelerations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "masses", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "entityCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    addEntity(position, velocity, acceleration, mass) {
        if (this.entityCount >= this.maxEntities)
            return;
        this.positions.push(position);
        this.velocities.push(velocity);
        this.accelerations.push(acceleration);
        this.masses.push(mass);
        this.entityCount++;
    }
    updatePositions(deltaTime) {
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
    detectCollisions(radius) {
        const collisions = [];
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
    spatialQuery(queryX, queryY, radius) {
        const results = [];
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
    clear() {
        this.positions.length = 0;
        this.velocities.length = 0;
        this.accelerations.length = 0;
        this.masses.length = 0;
        this.entityCount = 0;
    }
}
