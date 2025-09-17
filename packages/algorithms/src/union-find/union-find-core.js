/**
 * Core Union-Find Algorithm Implementation
 *
 * A highly optimized Union-Find data structure for efficient set operations
 * and cycle detection. Used for managing connected components and detecting
 * cycles in graphs.
 *
 * @module algorithms/unionFindCore
 */
import { UnionFindSetOperations } from "./union-find-set-operations";
export class UnionFind {
    constructor(size) {
        Object.defineProperty(this, "nodes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                compressionCount: 0,
                unionCount: 0,
            }
        });
        Object.defineProperty(this, "setOps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.nodes = Array.from({ length: size }, (_, i) => ({
            parent: i,
            rank: 0,
        }));
        this.setOps = new UnionFindSetOperations(this.nodes, this.stats);
    }
    find(x) {
        return this.setOps.find(x);
    }
    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);
        if (rootX === rootY)
            return false;
        this.stats.unionCount++;
        if (this.nodes[rootX].rank < this.nodes[rootY].rank) {
            this.nodes[rootX].parent = rootY;
        }
        else if (this.nodes[rootX].rank > this.nodes[rootY].rank) {
            this.nodes[rootY].parent = rootX;
        }
        else {
            this.nodes[rootY].parent = rootX;
            this.nodes[rootX].rank++;
        }
        return true;
    }
    connected(x, y) {
        return this.find(x) === this.find(y);
    }
    getSetSize(x) {
        return this.setOps.getSetSize(x);
    }
    getSetMembers(x) {
        return this.setOps.getSetMembers(x);
    }
    getStats() {
        return this.setOps.getStats();
    }
    reset() {
        this.nodes = this.nodes.map((_, i) => ({
            parent: i,
            rank: 0,
        }));
        this.stats.compressionCount = 0;
        this.stats.unionCount = 0;
        this.setOps = new UnionFindSetOperations(this.nodes, this.stats);
    }
    clone() {
        const clone = new UnionFind(this.nodes.length);
        clone.nodes = this.nodes.map((node) => ({ ...node }));
        clone.stats = { ...this.stats };
        clone.setOps = new UnionFindSetOperations(clone.nodes, clone.stats);
        return clone;
    }
}
