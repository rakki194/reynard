/**
 * AABB (Axis-Aligned Bounding Box) Collision Detection
 *
 * A highly optimized collision detection system for axis-aligned bounding boxes.
 * Used for efficient spatial queries, overlap detection, and spatial partitioning.
 *
 * Features:
 * - Fast overlap detection
 * - Spatial hashing support
 * - Batch collision queries
 * - Memory-efficient implementation
 * - Type-safe operations
 * - Performance monitoring
 *
 * @module algorithms/aabbCollision
 */

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionResult {
  colliding: boolean;
  overlap: AABB | null;
  overlapArea: number;
  distance: number;
}

export interface CollisionStats {
  totalChecks: number;
  collisionsFound: number;
  averageCheckTime: number;
  spatialHashHits: number;
  spatialHashMisses: number;
}

export interface AABBSpatialHashConfig {
  cellSize: number;
  maxObjectsPerCell: number;
  enableOptimization: boolean;
}

/**
 * Check if two AABBs overlap
 */
export function checkCollision(a: AABB, b: AABB): CollisionResult {
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

  // AABBs are colliding if they overlap OR if they are touching (edge contact)
  // OR if one AABB is a point inside the other AABB
  const hasOverlap = overlapX > 0 && overlapY > 0;
  const isTouching =
    (overlapX === 0 && overlapY > 0) ||
    (overlapY === 0 && overlapX > 0) ||
    (overlapX === 0 && overlapY === 0 && areAABBsTouching(a, b));
  const isPointInside =
    (b.width === 0 && b.height === 0 && pointInAABB({ x: b.x, y: b.y }, a)) ||
    (a.width === 0 && a.height === 0 && pointInAABB({ x: a.x, y: a.y }, b));
  const colliding = hasOverlap || isTouching || isPointInside;
  const overlapArea = overlapX * overlapY;

  let overlap: AABB | null = null;
  if (hasOverlap) {
    overlap = {
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      width: overlapX,
      height: overlapY,
    };
  }

  // Calculate distance between centers
  const centerAX = a.x + a.width / 2;
  const centerAY = a.y + a.height / 2;
  const centerBX = b.x + b.width / 2;
  const centerBY = b.y + b.height / 2;
  const distance = Math.sqrt((centerBX - centerAX) ** 2 + (centerBY - centerAY) ** 2);

  return {
    colliding,
    overlap,
    overlapArea,
    distance,
  };
}

/**
 * Check if a point is inside an AABB
 */
export function pointInAABB(point: { x: number; y: number }, aabb: AABB): boolean {
  return point.x >= aabb.x && point.x <= aabb.x + aabb.width && point.y >= aabb.y && point.y <= aabb.y + aabb.height;
}

/**
 * Get the union of two AABBs
 */
export function unionAABB(a: AABB, b: AABB): AABB {
  const minX = Math.min(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const maxY = Math.max(a.y + a.height, b.y + b.height);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Get the intersection of two AABBs
 */
export function intersectionAABB(a: AABB, b: AABB): AABB | null {
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

  // Only return intersection if there's actual overlap (not just touching)
  if (overlapX > 0 && overlapY > 0) {
    return {
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      width: overlapX,
      height: overlapY,
    };
  }

  return null;
}

/**
 * Expand an AABB by a given amount
 */
export function expandAABB(aabb: AABB, amount: number): AABB {
  return {
    x: aabb.x - amount,
    y: aabb.y - amount,
    width: aabb.width + amount * 2,
    height: aabb.height + amount * 2,
  };
}

/**
 * Check if an AABB is completely contained within another
 */
export function containsAABB(container: AABB, contained: AABB): boolean {
  return (
    contained.x >= container.x &&
    contained.y >= container.y &&
    contained.x + contained.width <= container.x + container.width &&
    contained.y + contained.height <= container.y + container.height
  );
}

/**
 * Batch collision detection for multiple AABBs
 */
export function batchCollisionDetection(
  aabbs: AABB[],
  options: {
    maxDistance?: number;
    includeSelf?: boolean;
    spatialHash?: AABBSpatialHashConfig;
  } = {}
): Array<{ index1: number; index2: number; result: CollisionResult }> {
  const { maxDistance, includeSelf = false, spatialHash } = options;
  const collisions: Array<{ index1: number; index2: number; result: CollisionResult }> = [];

  if (spatialHash?.enableOptimization && aabbs.length > 100) {
    return batchCollisionWithSpatialHash(aabbs, options);
  }

  for (let i = 0; i < aabbs.length; i++) {
    for (let j = includeSelf ? i : i + 1; j < aabbs.length; j++) {
      const result = checkCollision(aabbs[i], aabbs[j]);

      if (result.colliding && (!maxDistance || result.distance <= maxDistance)) {
        collisions.push({
          index1: i,
          index2: j,
          result,
        });
      }
    }
  }

  return collisions;
}

/**
 * Spatial hash for optimized collision detection
 */
class SpatialHash {
  private cells = new Map<string, number[]>();
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  private getAABBCells(aabb: AABB): string[] {
    const minCellX = Math.floor(aabb.x / this.cellSize);
    const maxCellX = Math.floor((aabb.x + aabb.width) / this.cellSize);
    const minCellY = Math.floor(aabb.y / this.cellSize);
    const maxCellY = Math.floor((aabb.y + aabb.height) / this.cellSize);

    const cells: string[] = [];
    for (let x = minCellX; x <= maxCellX; x++) {
      for (let y = minCellY; y <= maxCellY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    return cells;
  }

  insert(index: number, aabb: AABB): void {
    const cells = this.getAABBCells(aabb);
    for (const cell of cells) {
      if (!this.cells.has(cell)) {
        this.cells.set(cell, []);
      }
      this.cells.get(cell)!.push(index);
    }
  }

  query(aabb: AABB): number[] {
    const cells = this.getAABBCells(aabb);
    const candidates = new Set<number>();

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

  clear(): void {
    this.cells.clear();
  }
}

/**
 * Batch collision detection using spatial hashing
 */
function batchCollisionWithSpatialHash(
  aabbs: AABB[],
  options: {
    maxDistance?: number;
    includeSelf?: boolean;
    spatialHash?: AABBSpatialHashConfig;
  }
): Array<{ index1: number; index2: number; result: CollisionResult }> {
  const { maxDistance, includeSelf = false, spatialHash } = options;
  const collisions: Array<{ index1: number; index2: number; result: CollisionResult }> = [];

  if (!spatialHash) {
    return batchCollisionDetection(aabbs, options);
  }

  const hash = new SpatialHash(spatialHash.cellSize);

  // Insert all AABBs into spatial hash
  for (let i = 0; i < aabbs.length; i++) {
    hash.insert(i, aabbs[i]);
  }

  // Query for collisions
  for (let i = 0; i < aabbs.length; i++) {
    const candidates = hash.query(aabbs[i]);

    for (const j of candidates) {
      if (!includeSelf && i >= j) continue;

      const result = checkCollision(aabbs[i], aabbs[j]);

      if (result.colliding && (!maxDistance || result.distance <= maxDistance)) {
        collisions.push({
          index1: i,
          index2: j,
          result,
        });
      }
    }
  }

  return collisions;
}

/**
 * Calculate the area of an AABB
 */
export function getAABBArea(aabb: AABB): number {
  return aabb.width * aabb.height;
}

/**
 * Calculate the perimeter of an AABB
 */
export function getAABBPerimeter(aabb: AABB): number {
  return 2 * (aabb.width + aabb.height);
}

/**
 * Check if two AABBs are touching (edge contact)
 */
export function areAABBsTouching(a: AABB, b: AABB): boolean {
  // Check if AABBs are touching but not overlapping
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

  // They are touching if they are adjacent but not overlapping
  const isAdjacentX = a.x + a.width === b.x || b.x + b.width === a.x;
  const isAdjacentY = a.y + a.height === b.y || b.y + b.height === a.y;

  return (isAdjacentX && overlapY > 0) || (isAdjacentY && overlapX > 0);
}
