/**
 * AABB Spatial Hashing
 *
 * Optimized spatial partitioning system for efficient collision detection.
 * Uses spatial hashing to reduce collision checks from O(n²) to O(n) in many cases.
 *
 * @module algorithms/aabbSpatialHash
 */
/**
 * Spatial hash for optimized collision detection
 */
export class SpatialHash {
    constructor(cellSize) {
        Object.defineProperty(this, "cells", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "cellSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.cellSize = cellSize;
    }
    getCellKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }
    getAABBCells(aabb) {
        const minCellX = Math.floor(aabb.x / this.cellSize);
        const maxCellX = Math.floor((aabb.x + aabb.width) / this.cellSize);
        const minCellY = Math.floor(aabb.y / this.cellSize);
        const maxCellY = Math.floor((aabb.y + aabb.height) / this.cellSize);
        const cells = [];
        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                cells.push(`${x},${y}`);
            }
        }
        return cells;
    }
    insert(index, aabb) {
        const cells = this.getAABBCells(aabb);
        for (const cell of cells) {
            if (!this.cells.has(cell)) {
                this.cells.set(cell, []);
            }
            this.cells.get(cell).push(index);
        }
    }
    query(aabb) {
        const cells = this.getAABBCells(aabb);
        const candidates = new Set();
        for (const cell of cells) {
            const cellObjects = this.cells.get(cell);
            if (cellObjects) {
                for (const index of cellObjects) {
                    candidates.add(index);
                }
            }
        }
        return Array.from(candidates);
    }
    clear() {
        this.cells.clear();
    }
}
