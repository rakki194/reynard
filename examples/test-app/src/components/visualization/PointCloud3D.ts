/**
 * 🦊 Point Cloud 3D Utilities
 * Three.js point cloud creation and management
 */

import * as THREE from "three";
import type { ProcessedData } from "./DataProcessor";
import type { ColorMapping } from "./VisualizationCore";
import { oklchToRgb } from "./colorUtils";

export interface PointCloud3DConfig {
  scene: THREE.Scene;
  pointSize?: number;
  opacity?: number;
  enableSizeAttenuation?: boolean;
}

export class PointCloud3D {
  private scene: THREE.Scene;
  private pointCloud: THREE.Points | null = null;
  private config: PointCloud3DConfig;

  constructor(config: PointCloud3DConfig) {
    this.scene = config.scene;
    this.config = {
      pointSize: 0.5, // Increased from 0.1 to make points more visible
      opacity: 0.8,
      enableSizeAttenuation: true,
      ...config,
    };
  }

  /**
   * Create or update point cloud from processed data
   */
  createPointCloud(data: ProcessedData, colors: ColorMapping[]): void {
    // console.log("🦊 Creating point cloud:", {
    //   dataLength: data?.points?.length,
    //   colorsLength: colors?.length
    // });

    if (!data || !colors.length) {
      // console.log("🦊 No data or colors available for point cloud");
      return;
    }

    // Prevent creating multiple point clouds with the same data
    if (this.pointCloud && this.pointCloud.geometry.attributes.position.count === data.points.length) {
      console.log("🦊 Point cloud already exists with same data, skipping creation");
      return;
    }

    // Remove existing point cloud
    if (this.pointCloud) {
      this.scene.remove(this.pointCloud);
    }

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(data.points.length * 3);
    const colorArray = new Float32Array(data.points.length * 3);
    const sizes = new Float32Array(data.points.length);

    data.points.forEach((point, index) => {
      const i = index * 3;

      // Convert normalized coordinates to 3D space
      positions[i] = (point.x - 0.5) * 4;
      positions[i + 1] = (point.y - 0.5) * 4;
      positions[i + 2] = (point.z || 0) * 4;

      // Debug: Log first few point positions (disabled to reduce spam)
      // if (index < 3) {
      //   console.log(`🦊 Point ${index} position:`, {
      //     original: { x: point.x, y: point.y, z: point.z },
      //     transformed: { x: positions[i], y: positions[i + 1], z: positions[i + 2] }
      //   });
      // }

      // Set colors from OKLCH
      const color = colors[index];
      if (color) {
        // Convert OKLCH to RGB for Three.js
        const rgb = oklchToRgb(color.point);
        colorArray[i] = rgb.r;
        colorArray[i + 1] = rgb.g;
        colorArray[i + 2] = rgb.b;

        // Set size based on intensity
        sizes[index] = 2 + color.intensity * 8;
      }
    });

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Create material
    const material = new THREE.PointsMaterial({
      size: this.config.pointSize!,
      vertexColors: true,
      sizeAttenuation: this.config.enableSizeAttenuation!,
      transparent: true,
      opacity: this.config.opacity!,
    });

    // Create point cloud
    this.pointCloud = new THREE.Points(geometry, material);
    this.scene.add(this.pointCloud);

    // console.log("🦊 Point cloud created and added to scene:", {
    //   pointCount: data.points.length,
    //   sceneChildren: this.scene.children.length,
    //   pointCloud: this.pointCloud
    // });
  }

  /**
   * Update point cloud rotation for animation
   */
  updateRotation(deltaX: number, deltaY: number): void {
    if (this.pointCloud) {
      this.pointCloud.rotation.y += deltaY;
      this.pointCloud.rotation.x += deltaX;
    }
  }

  /**
   * Remove point cloud from scene
   */
  dispose(): void {
    if (this.pointCloud) {
      this.scene.remove(this.pointCloud);
      this.pointCloud.geometry.dispose();
      if (this.pointCloud.material instanceof THREE.Material) {
        this.pointCloud.material.dispose();
      }
      this.pointCloud = null;
    }
  }

  /**
   * Get the point cloud object
   */
  getPointCloud(): THREE.Points | null {
    return this.pointCloud;
  }
}
