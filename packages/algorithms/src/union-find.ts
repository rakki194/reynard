/**
 * Union-Find Algorithm Implementation
 *
 * A highly optimized Union-Find data structure for efficient set operations
 * and cycle detection. Used for managing connected components and detecting
 * cycles in graphs.
 *
 * Features:
 * - Path compression for optimal performance
 * - Union by rank for balanced trees
 * - Cycle detection capabilities
 * - Memory-efficient implementation
 * - Type-safe operations
 *
 * @module algorithms/unionFind
 */

export interface UnionFindNode {
  parent: number;
  rank: number;
}

export interface UnionFindStats {
  totalNodes: number;
  totalSets: number;
  maxRank: number;
  averageRank: number;
  compressionCount: number;
  unionCount: number;
}

export class UnionFind {
  private nodes: UnionFindNode[];
  private stats = {
    compressionCount: 0,
    unionCount: 0,
  };

  constructor(size: number) {
    this.nodes = Array.from({ length: size }, (_, i) => ({
      parent: i,
      rank: 0,
    }));
  }

  /**
   * Find the root of a node with path compression
   */
  find(x: number): number {
    if (this.nodes[x].parent !== x) {
      this.nodes[x].parent = this.find(this.nodes[x].parent);
      this.stats.compressionCount++;
    }
    return this.nodes[x].parent;
  }

  /**
   * Union two sets by rank
   */
  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return false; // Already in same set
    }

    this.stats.unionCount++;

    if (this.nodes[rootX].rank < this.nodes[rootY].rank) {
      this.nodes[rootX].parent = rootY;
    } else if (this.nodes[rootX].rank > this.nodes[rootY].rank) {
      this.nodes[rootY].parent = rootX;
    } else {
      this.nodes[rootY].parent = rootX;
      this.nodes[rootX].rank++;
    }

    return true;
  }

  /**
   * Check if two nodes are in the same set
   */
  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  /**
   * Get the size of the set containing x
   */
  getSetSize(x: number): number {
    const root = this.find(x);
    return this.nodes.filter(node => this.find(this.nodes.indexOf(node)) === root).length;
  }

  /**
   * Get all nodes in the same set as x
   */
  getSetMembers(x: number): number[] {
    const root = this.find(x);
    return this.nodes.map((_, index) => index).filter(index => this.find(index) === root);
  }

  /**
   * Get statistics about the Union-Find structure
   */
  getStats(): UnionFindStats {
    const roots = new Set<number>();
    let maxRank = 0;
    let totalRank = 0;

    for (let i = 0; i < this.nodes.length; i++) {
      const root = this.find(i);
      roots.add(root);
      maxRank = Math.max(maxRank, this.nodes[root].rank);
      totalRank += this.nodes[root].rank;
    }

    return {
      totalNodes: this.nodes.length,
      totalSets: roots.size,
      maxRank,
      averageRank: roots.size > 0 ? totalRank / roots.size : 0,
      compressionCount: this.stats.compressionCount,
      unionCount: this.stats.unionCount,
    };
  }

  /**
   * Reset the Union-Find structure
   */
  reset(): void {
    this.nodes = this.nodes.map((_, i) => ({
      parent: i,
      rank: 0,
    }));
    this.stats.compressionCount = 0;
    this.stats.unionCount = 0;
  }

  /**
   * Get a copy of the current state
   */
  clone(): UnionFind {
    const clone = new UnionFind(this.nodes.length);
    clone.nodes = this.nodes.map(node => ({ ...node }));
    clone.stats = { ...this.stats };
    return clone;
  }
}

/**
 * Utility function to detect cycles in a graph using Union-Find
 */
export function detectCycle(edges: Array<[number, number]>): boolean {
  const maxNode = Math.max(...edges.flat());
  const uf = new UnionFind(maxNode + 1);

  for (const [u, v] of edges) {
    if (!uf.union(u, v)) {
      return true; // Cycle detected
    }
  }

  return false;
}

/**
 * Utility function to find connected components
 */
export function findConnectedComponents(edges: Array<[number, number]>): number[][] {
  const maxNode = Math.max(...edges.flat());
  const uf = new UnionFind(maxNode + 1);

  for (const [u, v] of edges) {
    uf.union(u, v);
  }

  const components = new Map<number, number[]>();
  for (let i = 0; i <= maxNode; i++) {
    const root = uf.find(i);
    if (!components.has(root)) {
      components.set(root, []);
    }
    components.get(root)!.push(i);
  }

  return Array.from(components.values());
}
