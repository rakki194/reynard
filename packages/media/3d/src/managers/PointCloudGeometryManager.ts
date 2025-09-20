import type {
  EmbeddingPoint,
  EmbeddingRenderingConfig,
  GeometryManager,
  GeometryLike,
  BufferGeometryLike,
  InstancedBufferGeometryLike,
  ThreeJSInterface,
} from "../types/rendering";
import { applyColorMapping, applySizeMapping, filterPoints, generateGeometryCacheKey } from "../utils/rendering";

export class PointCloudGeometryManager implements GeometryManager {
  public threeJS: ThreeJSInterface;
  private geometryCache: Map<string, GeometryLike> = new Map();
  private disposedGeometries: Set<GeometryLike> = new Set();

  constructor(threeJS: ThreeJSInterface) {
    this.threeJS = threeJS;
  }

  createPointGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): GeometryLike {
    const { BufferGeometry } = this.threeJS;

    // Apply color and size mappings
    const processedPoints = [...points];
    applyColorMapping(processedPoints, config.colorMapping);
    applySizeMapping(processedPoints, config.sizeMapping, config.pointSize);

    // Filter points based on configuration
    const filteredPoints = filterPoints(processedPoints, config);

    if (filteredPoints.length === 0) {
      return new BufferGeometry();
    }

    // Use instancing for better performance if enabled
    if (config.enableInstancing && filteredPoints.length > 1000) {
      return this.createInstancedGeometry(filteredPoints, config);
    } else {
      return this.createStandardGeometry(filteredPoints, config);
    }
  }

  private createStandardGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): BufferGeometryLike {
    const { BufferGeometry, Float32BufferAttribute } = this.threeJS;

    const geometry = new BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    const sizes = new Float32Array(points.length);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point) continue;

      const index = i * 3;

      // Validate position values before setting them
      const x = Number.isFinite(point.position[0]) ? point.position[0] : 0;
      const y = Number.isFinite(point.position[1]) ? point.position[1] : 0;
      const z = Number.isFinite(point.position[2]) ? point.position[2] : 0;

      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;

      // Set colors
      if (point.color) {
        colors[index] = point.color[0];
        colors[index + 1] = point.color[1];
        colors[index + 2] = point.color[2];
      } else {
        colors[index] = 1;
        colors[index + 1] = 1;
        colors[index + 2] = 1;
      }

      // Set sizes
      sizes[i] = point.size || config.pointSize;
    }

    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geometry.setAttribute("size", new Float32BufferAttribute(sizes, 1));

    // Add user data for reference
    geometry.userData = {
      pointCount: points.length,
      config,
      createdAt: Date.now(),
    };

    return geometry;
  }

  private createInstancedGeometry(
    points: EmbeddingPoint[],
    config: EmbeddingRenderingConfig
  ): InstancedBufferGeometryLike {
    const { InstancedBufferGeometry, BufferGeometry, Float32BufferAttribute, InstancedBufferAttribute } = this.threeJS;

    const geometry = new InstancedBufferGeometry();

    // Create a single point geometry
    const pointGeometry = new BufferGeometry();
    const positions = new Float32Array([0, 0, 0]);
    pointGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));

    geometry.index = pointGeometry.index;
    geometry.attributes = pointGeometry.attributes;

    // Create instance attributes
    const instancePositions = new Float32Array(points.length * 3);
    const instanceColors = new Float32Array(points.length * 3);
    const instanceSizes = new Float32Array(points.length);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point) continue;

      const index = i * 3;

      // Validate position values
      const x = Number.isFinite(point.position[0]) ? point.position[0] : 0;
      const y = Number.isFinite(point.position[1]) ? point.position[1] : 0;
      const z = Number.isFinite(point.position[2]) ? point.position[2] : 0;

      instancePositions[index] = x;
      instancePositions[index + 1] = y;
      instancePositions[index + 2] = z;

      // Set colors
      if (point.color) {
        instanceColors[index] = point.color[0];
        instanceColors[index + 1] = point.color[1];
        instanceColors[index + 2] = point.color[2];
      } else {
        instanceColors[index] = 1;
        instanceColors[index + 1] = 1;
        instanceColors[index + 2] = 1;
      }

      // Set sizes
      instanceSizes[i] = point.size || config.pointSize;
    }

    geometry.setAttribute("instancePosition", new InstancedBufferAttribute(instancePositions, 3));
    geometry.setAttribute("instanceColor", new InstancedBufferAttribute(instanceColors, 3));
    geometry.setAttribute("instanceSize", new InstancedBufferAttribute(instanceSizes, 1));

    geometry.instanceCount = points.length;

    // Add user data
    geometry.userData = {
      pointCount: points.length,
      config,
      isInstanced: true,
      createdAt: Date.now(),
    };

    return geometry;
  }

  createThumbnailGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): BufferGeometryLike {
    const { BufferGeometry, Float32BufferAttribute } = this.threeJS;

    const geometry = new BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    const uvs = new Float32Array(points.length * 2);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point) continue;

      const index = i * 3;
      const uvIndex = i * 2;

      // Validate position values
      const x = Number.isFinite(point.position[0]) ? point.position[0] : 0;
      const y = Number.isFinite(point.position[1]) ? point.position[1] : 0;
      const z = Number.isFinite(point.position[2]) ? point.position[2] : 0;

      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;

      // Set UV coordinates for thumbnail
      uvs[uvIndex] = 0;
      uvs[uvIndex + 1] = 0;
    }

    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));

    geometry.userData = {
      pointCount: points.length,
      config,
      isThumbnail: true,
      createdAt: Date.now(),
    };

    return geometry;
  }

  createTextGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): BufferGeometryLike {
    const { BufferGeometry, Float32BufferAttribute } = this.threeJS;

    const geometry = new BufferGeometry();
    const positions = new Float32Array(points.length * 3);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point) continue;

      const index = i * 3;

      // Validate position values
      const x = Number.isFinite(point.position[0]) ? point.position[0] : 0;
      const y = Number.isFinite(point.position[1]) ? point.position[1] : 0;
      const z = Number.isFinite(point.position[2]) ? point.position[2] : 0;

      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;
    }

    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));

    geometry.userData = {
      pointCount: points.length,
      config,
      isText: true,
      createdAt: Date.now(),
    };

    return geometry;
  }

  updateGeometry(geometry: GeometryLike, points: EmbeddingPoint[], config: EmbeddingRenderingConfig): void {
    if (!geometry || !geometry.userData) return;

    // Dispose old geometry
    this.disposeGeometry(geometry);

    // Create new geometry based on type
    if (geometry.userData.isThumbnail) {
      this.createThumbnailGeometry(points, config);
    } else if (geometry.userData.isText) {
      this.createTextGeometry(points, config);
    } else {
      this.createPointGeometry(points, config);
    }
  }

  disposeGeometry(geometry: GeometryLike): void {
    if (!geometry || this.disposedGeometries.has(geometry)) return;

    // Dispose Three.js geometry
    if (geometry.dispose) {
      geometry.dispose();
    }

    // Remove from cache
    for (const [key, cachedGeometry] of this.geometryCache.entries()) {
      if (cachedGeometry === geometry) {
        this.geometryCache.delete(key);
        break;
      }
    }

    // Mark as disposed
    this.disposedGeometries.add(geometry);
  }

  disposeAllGeometries(): void {
    // Dispose all cached geometries
    for (const geometry of this.geometryCache.values()) {
      if (geometry.dispose) {
        geometry.dispose();
      }
    }

    // Clear cache
    this.geometryCache.clear();
    this.disposedGeometries.clear();
  }

  /**
   * Get cached geometry or create new one
   */
  getOrCreatePointGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): GeometryLike {
    const cacheKey = generateGeometryCacheKey(points, config);
    const cached = this.geometryCache.get(cacheKey);

    if (cached && !this.disposedGeometries.has(cached)) {
      return cached;
    }

    const geometry = this.createPointGeometry(points, config);
    this.geometryCache.set(cacheKey, geometry);
    return geometry;
  }

  /**
   * Get geometry statistics
   */
  getStats(): { cached: number; disposed: number } {
    return {
      cached: this.geometryCache.size,
      disposed: this.disposedGeometries.size,
    };
  }

  /**
   * Clean up disposed geometries from memory
   */
  cleanup(): void {
    this.disposedGeometries.clear();
  }
}
