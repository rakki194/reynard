import type {
  EmbeddingRenderingConfig,
  MaterialManager,
  MaterialLike,
  ThreeJSInterface,
} from "../types/rendering";
import { generateMaterialCacheKey } from "../utils/rendering";

export class PointCloudMaterialManager implements MaterialManager {
  public threeJS: ThreeJSInterface;
  private materialCache: Map<string, MaterialLike> = new Map();
  private disposedMaterials: Set<MaterialLike> = new Set();

  constructor(threeJS: ThreeJSInterface) {
    this.threeJS = threeJS;
  }

  createPointMaterial(config: EmbeddingRenderingConfig): MaterialLike {
    const { PointsMaterial } = this.threeJS;

    // Create material with enhanced features
    const material = new PointsMaterial({
      size: config.pointSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: 1, // Additive blending for better visual effect
      depthWrite: false,
      map: null, // No texture by default
    });

    // Add custom properties for shader customization
    material.userData = {
      config,
      isPointMaterial: true,
      createdAt: Date.now(),
    };

    // Cache the material
    const cacheKey = generateMaterialCacheKey(config);
    this.materialCache.set(cacheKey, material);

    return material;
  }

  createThumbnailMaterial(config: EmbeddingRenderingConfig): MaterialLike {
    const { SpriteMaterial } = this.threeJS;

    const material = new SpriteMaterial({
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: 1, // Additive blending
    });

    material.userData = {
      config,
      isThumbnailMaterial: true,
      createdAt: Date.now(),
    };

    return material;
  }

  createTextMaterial(config: EmbeddingRenderingConfig): MaterialLike {
    const { SpriteMaterial } = this.threeJS;

    const material = new SpriteMaterial({
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: 1, // Additive blending
    });

    material.userData = {
      config,
      isTextMaterial: true,
      createdAt: Date.now(),
    };

    return material;
  }

  updateMaterial(
    material: MaterialLike,
    config: EmbeddingRenderingConfig,
  ): void {
    if (!material || !material.userData) return;

    const userData = material.userData;

    // Update point material properties
    if (userData.isPointMaterial) {
      material.size = config.pointSize;
      material.opacity = 0.8;
    }

    // Update thumbnail material properties
    if (userData.isThumbnailMaterial) {
      material.opacity = 0.8;
    }

    // Update text material properties
    if (userData.isTextMaterial) {
      material.opacity = 0.9;
    }

    // Update user data
    userData.config = config;
    userData.updatedAt = Date.now();
  }

  disposeMaterial(material: MaterialLike): void {
    if (!material || this.disposedMaterials.has(material)) return;

    // Dispose Three.js material
    if (material.dispose) {
      material.dispose();
    }

    // Remove from cache
    for (const [key, cachedMaterial] of this.materialCache.entries()) {
      if (cachedMaterial === material) {
        this.materialCache.delete(key);
        break;
      }
    }

    // Mark as disposed
    this.disposedMaterials.add(material);
  }

  disposeAllMaterials(): void {
    // Dispose all cached materials
    for (const material of this.materialCache.values()) {
      if (material.dispose) {
        material.dispose();
      }
    }

    // Clear cache
    this.materialCache.clear();
    this.disposedMaterials.clear();
  }

  /**
   * Get cached material or create new one
   */
  getOrCreatePointMaterial(config: EmbeddingRenderingConfig): MaterialLike {
    const cacheKey = generateMaterialCacheKey(config);
    const cached = this.materialCache.get(cacheKey);

    if (cached && !this.disposedMaterials.has(cached)) {
      return cached;
    }

    return this.createPointMaterial(config);
  }

  /**
   * Get material statistics
   */
  getStats(): { cached: number; disposed: number } {
    return {
      cached: this.materialCache.size,
      disposed: this.disposedMaterials.size,
    };
  }

  /**
   * Clean up disposed materials from memory
   */
  cleanup(): void {
    this.disposedMaterials.clear();
  }
}
