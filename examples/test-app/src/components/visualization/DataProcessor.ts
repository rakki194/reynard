/**
 * 🦊 Data Processor
 * Shared data processing utilities for 2D and 3D visualizations
 */

import type { DataPoint } from "./VisualizationCore";

export interface ProcessedData {
  points: DataPoint[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  statistics: {
    count: number;
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
  };
  clusters?: ClusterInfo[];
}

export interface ClusterInfo {
  id: string;
  center: { x: number; y: number; z?: number };
  points: DataPoint[];
  radius: number;
  color: string;
}

export interface ProcessingOptions {
  normalize: boolean;
  removeOutliers: boolean;
  outlierThreshold: number;
  enableClustering: boolean;
  clusterCount: number;
  enableSmoothing: boolean;
  smoothingFactor: number;
}

export class DataProcessor {
  /**
   * Process raw data for visualization
   */
  static processData(rawData: DataPoint[], options: Partial<ProcessingOptions> = {}): ProcessedData {
    const opts: ProcessingOptions = {
      normalize: true,
      removeOutliers: false,
      outlierThreshold: 2.0,
      enableClustering: false,
      clusterCount: 5,
      enableSmoothing: false,
      smoothingFactor: 0.1,
      ...options,
    };

    let processedPoints = [...rawData];

    // Remove outliers if enabled
    if (opts.removeOutliers) {
      processedPoints = this.removeOutliers(processedPoints, opts.outlierThreshold);
    }

    // Normalize data if enabled
    if (opts.normalize) {
      processedPoints = this.normalizeData(processedPoints);
    }

    // Apply smoothing if enabled
    if (opts.enableSmoothing) {
      processedPoints = this.applySmoothing(processedPoints, opts.smoothingFactor);
    }

    // Calculate bounds
    const bounds = this.calculateBounds(processedPoints);

    // Calculate statistics
    const statistics = this.calculateStatistics(processedPoints);

    // Perform clustering if enabled
    const clusters = opts.enableClustering ? this.performClustering(processedPoints, opts.clusterCount) : undefined;

    return {
      points: processedPoints,
      bounds,
      statistics,
      clusters,
    };
  }

  /**
   * Remove outliers using statistical methods
   */
  private static removeOutliers(points: DataPoint[], threshold: number): DataPoint[] {
    const values = points.map(p => p.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length);

    return points.filter(point => Math.abs(point.value - mean) <= threshold * std);
  }

  /**
   * Normalize data to 0-1 range
   */
  private static normalizeData(points: DataPoint[]): DataPoint[] {
    const xValues = points.map(p => p.x);
    const yValues = points.map(p => p.y);
    const zValues = points.map(p => p.z || 0);
    const valueValues = points.map(p => p.value);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const minZ = Math.min(...zValues);
    const maxZ = Math.max(...zValues);
    const minValue = Math.min(...valueValues);
    const maxValue = Math.max(...valueValues);

    return points.map(point => ({
      ...point,
      x: (point.x - minX) / (maxX - minX),
      y: (point.y - minY) / (maxY - minY),
      z: point.z ? (point.z - minZ) / (maxZ - minZ) : undefined,
      value: (point.value - minValue) / (maxValue - minValue),
    }));
  }

  /**
   * Apply smoothing to reduce noise
   */
  private static applySmoothing(points: DataPoint[], factor: number): DataPoint[] {
    return points.map((point, index) => {
      if (index === 0 || index === points.length - 1) {
        return point;
      }

      const prev = points[index - 1];
      const next = points[index + 1];

      return {
        ...point,
        x: point.x + (prev.x + next.x - 2 * point.x) * factor,
        y: point.y + (prev.y + next.y - 2 * point.y) * factor,
        z: point.z ? point.z + ((prev.z || 0) + (next.z || 0) - 2 * (point.z || 0)) * factor : undefined,
        value: point.value + (prev.value + next.value - 2 * point.value) * factor,
      };
    });
  }

  /**
   * Calculate data bounds
   */
  private static calculateBounds(points: DataPoint[]) {
    const xValues = points.map(p => p.x);
    const yValues = points.map(p => p.y);
    const zValues = points.map(p => p.z || 0);

    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
      minZ: Math.min(...zValues),
      maxZ: Math.max(...zValues),
    };
  }

  /**
   * Calculate statistical measures
   */
  private static calculateStatistics(points: DataPoint[]) {
    const values = points.map(p => p.value);
    const sortedValues = [...values].sort((a, b) => a - b);

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median = sortedValues[Math.floor(sortedValues.length / 2)];
    const std = Math.sqrt(values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length);

    return {
      count: points.length,
      mean,
      median,
      std,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  /**
   * Perform K-means clustering
   */
  private static performClustering(points: DataPoint[], clusterCount: number): ClusterInfo[] {
    if (points.length === 0 || clusterCount <= 0) return [];

    // Initialize cluster centers randomly
    const clusters: ClusterInfo[] = [];
    for (let i = 0; i < clusterCount; i++) {
      const randomPoint = points[Math.floor(Math.random() * points.length)];
      clusters.push({
        id: `cluster-${i}`,
        center: { x: randomPoint.x, y: randomPoint.y, z: randomPoint.z },
        points: [],
        radius: 0,
        color: `hsl(${(i * 360) / clusterCount}, 70%, 50%)`,
      });
    }

    // K-means iteration
    for (let iter = 0; iter < 10; iter++) {
      // Assign points to nearest cluster
      clusters.forEach(cluster => (cluster.points = []));

      points.forEach(point => {
        let nearestCluster = clusters[0];
        let minDistance = this.calculateDistance(point, nearestCluster.center);

        for (let i = 1; i < clusters.length; i++) {
          const distance = this.calculateDistance(point, clusters[i].center);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCluster = clusters[i];
          }
        }

        nearestCluster.points.push(point);
      });

      // Update cluster centers
      clusters.forEach(cluster => {
        if (cluster.points.length > 0) {
          cluster.center.x = cluster.points.reduce((sum, p) => sum + p.x, 0) / cluster.points.length;
          cluster.center.y = cluster.points.reduce((sum, p) => sum + p.y, 0) / cluster.points.length;
          cluster.center.z = cluster.points.reduce((sum, p) => sum + (p.z || 0), 0) / cluster.points.length;

          // Calculate cluster radius
          cluster.radius = Math.max(...cluster.points.map(p => this.calculateDistance(p, cluster.center)));
        }
      });
    }

    return clusters;
  }

  /**
   * Calculate distance between two points
   */
  private static calculateDistance(point: DataPoint, center: { x: number; y: number; z?: number }): number {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const dz = (point.z || 0) - (center.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Generate sample data for testing
   */
  static generateSampleData(count: number, type: "random" | "spiral" | "clusters" = "random"): DataPoint[] {
    const points: DataPoint[] = [];

    switch (type) {
      case "random":
        for (let i = 0; i < count; i++) {
          points.push({
            id: `point-${i}`,
            x: Math.random(),
            y: Math.random(),
            z: Math.random(),
            value: Math.random(),
            label: `Point ${i}`,
          });
        }
        break;

      case "spiral":
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 4;
          const radius = (i / count) * 0.5;
          points.push({
            id: `spiral-${i}`,
            x: 0.5 + Math.cos(angle) * radius,
            y: 0.5 + Math.sin(angle) * radius,
            z: i / count,
            value: Math.sin(angle) * 0.5 + 0.5,
            label: `Spiral ${i}`,
          });
        }
        break;

      case "clusters":
        const clusterCount = 3;
        const pointsPerCluster = Math.floor(count / clusterCount);

        for (let c = 0; c < clusterCount; c++) {
          const centerX = 0.2 + c * 0.3;
          const centerY = 0.2 + c * 0.3;

          for (let i = 0; i < pointsPerCluster; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.1;

            points.push({
              id: `cluster-${c}-${i}`,
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
              z: Math.random(),
              value: Math.random(),
              label: `Cluster ${c} Point ${i}`,
            });
          }
        }
        break;
    }

    return points;
  }
}
