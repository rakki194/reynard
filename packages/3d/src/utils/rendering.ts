import type {
  EmbeddingPoint,
  EmbeddingRenderingConfig,
} from "../types/rendering";

/**
 * Apply color mapping to points based on configuration
 */
export function applyColorMapping(
  points: EmbeddingPoint[],
  colorMapping: string,
): void {
  switch (colorMapping) {
    case "similarity":
      points.forEach((point) => {
        if (point.similarity !== undefined) {
          const intensity = Math.max(0, Math.min(1, point.similarity));
          point.color = [intensity, 1 - intensity, 0.5];
        }
      });
      break;
    case "cluster":
      points.forEach((point) => {
        if (point.clusterId) {
          const hash = point.clusterId.split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
          }, 0);
          const r = (hash & 0xff0000) >> 16;
          const g = (hash & 0x00ff00) >> 8;
          const b = hash & 0x0000ff;
          point.color = [r / 255, g / 255, b / 255];
        }
      });
      break;
    case "importance":
      points.forEach((point) => {
        if (point.importance !== undefined) {
          const intensity = Math.max(0, Math.min(1, point.importance));
          point.color = [intensity, intensity, 1 - intensity];
        }
      });
      break;
    case "confidence":
      points.forEach((point) => {
        if (point.confidence !== undefined) {
          const intensity = Math.max(0, Math.min(1, point.confidence));
          point.color = [1 - intensity, intensity, 0.5];
        }
      });
      break;
    case "custom":
      // Keep existing colors
      break;
    default:
      // Default to similarity
      applyColorMapping(points, "similarity");
  }
}

/**
 * Apply size mapping to points based on configuration
 */
export function applySizeMapping(
  points: EmbeddingPoint[],
  sizeMapping: string,
  baseSize: number,
): void {
  switch (sizeMapping) {
    case "importance":
      points.forEach((point) => {
        if (point.importance !== undefined) {
          point.size = baseSize * (0.5 + point.importance * 1.5);
        } else {
          point.size = baseSize;
        }
      });
      break;
    case "confidence":
      points.forEach((point) => {
        if (point.confidence !== undefined) {
          point.size = baseSize * (0.5 + point.confidence * 1.5);
        } else {
          point.size = baseSize;
        }
      });
      break;
    case "uniform":
    default:
      points.forEach((point) => {
        point.size = baseSize;
      });
      break;
  }
}

/**
 * Filter points based on configuration
 */
export function filterPoints(
  points: EmbeddingPoint[],
  config: EmbeddingRenderingConfig,
): EmbeddingPoint[] {
  let filtered = [...points];

  // Apply max points limit
  if (config.maxPoints > 0 && filtered.length > config.maxPoints) {
    // Sort by importance if available, otherwise random
    filtered.sort((a, b) => {
      if (a.importance !== undefined && b.importance !== undefined) {
        return b.importance - a.importance;
      }
      return Math.random() - 0.5;
    });
    filtered = filtered.slice(0, config.maxPoints);
  }

  // Filter out invalid positions
  filtered = filtered.filter((point) => {
    const [x, y, z] = point.position;
    return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z);
  });

  return filtered;
}

/**
 * Generate a cache key for materials
 */
export function generateMaterialCacheKey(
  config: EmbeddingRenderingConfig,
): string {
  return JSON.stringify({
    pointSize: config.pointSize,
    colorMapping: config.colorMapping,
    sizeMapping: config.sizeMapping,
    enableThumbnails: config.enableThumbnails,
    thumbnailSize: config.thumbnailSize,
    enableTextSprites: config.enableTextSprites,
    textSpriteSize: config.textSpriteSize,
    highlightColor: config.highlightColor,
    highlightSize: config.highlightSize,
  });
}

/**
 * Generate a cache key for geometries
 */
export function generateGeometryCacheKey(
  points: EmbeddingPoint[],
  config: EmbeddingRenderingConfig,
): string {
  return JSON.stringify({
    pointCount: points.length,
    enableInstancing: config.enableInstancing,
    enableLOD: config.enableLOD,
    lodLevels: config.lodLevels,
    maxPoints: config.maxPoints,
  });
}

/**
 * Calculate bounding box for points
 */
export function calculateBoundingBox(points: EmbeddingPoint[]): {
  min: [number, number, number];
  max: [number, number, number];
} {
  if (points.length === 0) {
    return { min: [0, 0, 0], max: [0, 0, 0] };
  }

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  points.forEach((point) => {
    const [x, y, z] = point.position;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  });

  return {
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ],
  };
}

/**
 * Calculate center point for points
 */
export function calculateCenter(
  points: EmbeddingPoint[],
): [number, number, number] {
  if (points.length === 0) {
    return [0, 0, 0];
  }

  let sumX = 0,
    sumY = 0,
    sumZ = 0;
  points.forEach((point) => {
    const [x, y, z] = point.position;
    sumX += x;
    sumY += y;
    sumZ += z;
  });

  return [sumX / points.length, sumY / points.length, sumZ / points.length];
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(
  point1: [number, number, number],
  point2: [number, number, number],
): number {
  const dx = point1[0] - point2[0];
  const dy = point1[1] - point2[1];
  const dz = point1[2] - point2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Normalize points to fit within a unit cube
 */
export function normalizePoints(points: EmbeddingPoint[]): EmbeddingPoint[] {
  if (points.length === 0) return points;

  const bbox = calculateBoundingBox(points);
  const [minX, minY, minZ] = bbox.min;
  const [maxX, maxY, maxZ] = bbox.max;

  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  const rangeZ = maxZ - minZ;
  const maxRange = Math.max(rangeX, rangeY, rangeZ);

  if (maxRange === 0) return points;

  return points.map((point) => ({
    ...point,
    position: [
      (point.position[0] - minX) / maxRange,
      (point.position[1] - minY) / maxRange,
      (point.position[2] - minZ) / maxRange,
    ] as [number, number, number],
  }));
}
