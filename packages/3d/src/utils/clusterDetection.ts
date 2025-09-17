// Cluster detection algorithms for 3D point clouds
// Adapted from yipyap's cluster detection utilities

import type { Point3D } from "../types";
import { distanceVector3, createVector3 } from "./geometry";

export interface Cluster {
  id: string;
  points: Point3D[];
  center: [number, number, number];
  radius: number;
  density: number;
  color?: [number, number, number];
}

export interface ClusterDetectionOptions {
  algorithm: "kmeans" | "dbscan" | "hierarchical" | "gaussian-mixture";
  minPoints?: number;
  maxDistance?: number;
  maxClusters?: number;
  iterations?: number;
  tolerance?: number;
}

/**
 * K-means clustering algorithm
 */
export function kmeansClustering(
  points: Point3D[],
  k: number,
  maxIterations: number = 100,
  tolerance: number = 0.001
): Cluster[] {
  if (points.length === 0 || k <= 0) return [];

  // Initialize centroids randomly
  const centroids: [number, number, number][] = [];
  for (let i = 0; i < k; i++) {
    const randomIndex = Math.floor(Math.random() * points.length);
    const randomPoint = points[randomIndex];
    if (randomPoint) {
      centroids.push([...randomPoint.position]);
    }
  }

  let iterations = 0;
  let converged = false;

  while (iterations < maxIterations && !converged) {
    // Assign points to nearest centroid
    const clusters: Point3D[][] = Array(k)
      .fill(null)
      .map(() => []);

    for (const point of points) {
      let minDistance = Infinity;
      let closestCentroid = 0;

      for (let i = 0; i < k; i++) {
        const centroid = centroids[i];
        if (!centroid) continue;
        const distance = distanceVector3(createVector3(...point.position), createVector3(...centroid));
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = i;
        }
      }

      const targetCluster = clusters[closestCentroid];
      if (targetCluster) {
        targetCluster.push(point);
      }
    }

    // Update centroids
    const newCentroids: [number, number, number][] = [];
    let maxChange = 0;

    for (let i = 0; i < k; i++) {
      const cluster = clusters[i];
      const centroid = centroids[i];
      if (!cluster || !centroid) continue;

      if (cluster.length === 0) {
        newCentroids.push(centroid);
        continue;
      }

      const sumX = cluster.reduce((sum, p) => sum + p.position[0], 0);
      const sumY = cluster.reduce((sum, p) => sum + p.position[1], 0);
      const sumZ = cluster.reduce((sum, p) => sum + p.position[2], 0);
      const count = cluster.length;

      const newCentroid: [number, number, number] = [sumX / count, sumY / count, sumZ / count];

      // Calculate change in centroid position
      const change = distanceVector3(createVector3(...centroid), createVector3(...newCentroid));
      maxChange = Math.max(maxChange, change);

      newCentroids.push(newCentroid);
    }

    centroids.splice(0, centroids.length, ...newCentroids);
    converged = maxChange < tolerance;
    iterations++;
  }

  // Create cluster objects
  const result: Cluster[] = [];
  for (let i = 0; i < k; i++) {
    const centroid = centroids[i];
    if (centroid) {
      const clusterPoints = points.filter(point => {
        const distance = distanceVector3(createVector3(...point.position), createVector3(...centroid));
        return distance < tolerance * 10; // Assign points to clusters
      });

      if (clusterPoints.length > 0) {
        result.push({
          id: `cluster_${i}`,
          points: clusterPoints,
          center: centroid,
          radius: calculateClusterRadius(clusterPoints, centroid),
          density: clusterPoints.length / ((4 / 3) * Math.PI * Math.pow(centroid[0], 3)),
          color: generateClusterColor(i),
        });
      }
    }
  }

  return result;
}

/**
 * DBSCAN clustering algorithm
 */
export function dbscanClustering(points: Point3D[], minPoints: number = 5, maxDistance: number = 1.0): Cluster[] {
  if (points.length === 0) return [];

  const visited = new Set<string>();
  const clusters: Cluster[] = [];
  let clusterId = 0;

  for (const point of points) {
    if (visited.has(point.id)) continue;

    visited.add(point.id);
    const neighbors = getNeighbors(point, points, maxDistance);

    if (neighbors.length < minPoints) {
      // Mark as noise (outlier)
      continue;
    }

    // Create new cluster
    const clusterPoints: Point3D[] = [point];
    const seedSet = [...neighbors];

    while (seedSet.length > 0) {
      const currentPoint = seedSet.shift()!;

      if (!visited.has(currentPoint.id)) {
        visited.add(currentPoint.id);
        const currentNeighbors = getNeighbors(currentPoint, points, maxDistance);

        if (currentNeighbors.length >= minPoints) {
          seedSet.push(...currentNeighbors);
        }
      }

      if (!clusterPoints.some(p => p.id === currentPoint.id)) {
        clusterPoints.push(currentPoint);
      }
    }

    if (clusterPoints.length >= minPoints) {
      const center = calculateClusterCenter(clusterPoints);
      clusters.push({
        id: `cluster_${clusterId++}`,
        points: clusterPoints,
        center,
        radius: calculateClusterRadius(clusterPoints, center),
        density: clusterPoints.length / ((4 / 3) * Math.PI * Math.pow(center[0], 3)),
        color: generateClusterColor(clusterId),
      });
    }
  }

  return clusters;
}

/**
 * Hierarchical clustering algorithm
 */
export function hierarchicalClustering(points: Point3D[], maxClusters: number = 10): Cluster[] {
  if (points.length === 0) return [];

  // Start with each point as its own cluster
  let clusters: Cluster[] = points.map((point, index) => ({
    id: `cluster_${index}`,
    points: [point],
    center: [...point.position] as [number, number, number],
    radius: 0,
    density: 1,
    color: generateClusterColor(index),
  }));

  while (clusters.length > maxClusters) {
    // Find the two closest clusters
    let minDistance = Infinity;
    let cluster1Index = 0;
    let cluster2Index = 1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const cluster1 = clusters[i];
        const cluster2 = clusters[j];
        if (!cluster1 || !cluster2) continue;

        const distance = distanceVector3(createVector3(...cluster1.center), createVector3(...cluster2.center));
        if (distance < minDistance) {
          minDistance = distance;
          cluster1Index = i;
          cluster2Index = j;
        }
      }
    }

    // Merge the two closest clusters
    const cluster1 = clusters[cluster1Index];
    const cluster2 = clusters[cluster2Index];
    if (!cluster1 || !cluster2) continue;

    const mergedCluster = mergeClusters(cluster1, cluster2);

    // Remove the two original clusters and add the merged one
    clusters = clusters.filter((_, index) => index !== cluster1Index && index !== cluster2Index);
    clusters.push(mergedCluster);
  }

  return clusters;
}

/**
 * Get neighbors within a given distance
 */
function getNeighbors(point: Point3D, allPoints: Point3D[], maxDistance: number): Point3D[] {
  return allPoints.filter(p => {
    if (p.id === point.id) return false;
    const distance = distanceVector3(createVector3(...point.position), createVector3(...p.position));
    return distance <= maxDistance;
  });
}

/**
 * Calculate cluster center
 */
function calculateClusterCenter(points: Point3D[]): [number, number, number] {
  if (points.length === 0) return [0, 0, 0];

  const sumX = points.reduce((sum, p) => sum + p.position[0], 0);
  const sumY = points.reduce((sum, p) => sum + p.position[1], 0);
  const sumZ = points.reduce((sum, p) => sum + p.position[2], 0);
  const count = points.length;

  return [sumX / count, sumY / count, sumZ / count];
}

/**
 * Calculate cluster radius
 */
function calculateClusterRadius(points: Point3D[], center: [number, number, number]): number {
  if (points.length === 0) return 0;

  let maxDistance = 0;
  for (const point of points) {
    const distance = distanceVector3(createVector3(...point.position), createVector3(...center));
    maxDistance = Math.max(maxDistance, distance);
  }

  return maxDistance;
}

/**
 * Merge two clusters
 */
function mergeClusters(cluster1: Cluster, cluster2: Cluster): Cluster {
  const mergedPoints = [...cluster1.points, ...cluster2.points];
  const center = calculateClusterCenter(mergedPoints);

  return {
    id: `merged_${cluster1.id}_${cluster2.id}`,
    points: mergedPoints,
    center,
    radius: calculateClusterRadius(mergedPoints, center),
    density: mergedPoints.length / ((4 / 3) * Math.PI * Math.pow(center[0], 3)),
    color: cluster1.color || generateClusterColor(0),
  };
}

/**
 * Generate a color for a cluster
 */
function generateClusterColor(index: number): [number, number, number] {
  const hue = (index * 137.5) % 360; // Golden angle for good distribution
  const saturation = 0.7;
  const lightness = 0.6;

  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (hue >= 0 && hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (hue >= 120 && hue < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (hue >= 180 && hue < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (hue >= 240 && hue < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (hue >= 300 && hue < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return [r + m, g + m, b + m];
}

/**
 * Main cluster detection function
 */
export function detectClusters(points: Point3D[], options: ClusterDetectionOptions): Cluster[] {
  switch (options.algorithm) {
    case "kmeans":
      return kmeansClustering(points, options.maxClusters || 5, options.iterations || 100, options.tolerance || 0.001);

    case "dbscan":
      return dbscanClustering(points, options.minPoints || 5, options.maxDistance || 1.0);

    case "hierarchical":
      return hierarchicalClustering(points, options.maxClusters || 10);

    default:
      throw new Error(`Unsupported clustering algorithm: ${options.algorithm}`);
  }
}

/**
 * Calculate cluster statistics
 */
export function calculateClusterStats(clusters: Cluster[]): {
  totalClusters: number;
  totalPoints: number;
  averageClusterSize: number;
  averageDensity: number;
  averageRadius: number;
} {
  if (clusters.length === 0) {
    return {
      totalClusters: 0,
      totalPoints: 0,
      averageClusterSize: 0,
      averageDensity: 0,
      averageRadius: 0,
    };
  }

  const totalPoints = clusters.reduce((sum, cluster) => sum + cluster.points.length, 0);
  const averageClusterSize = totalPoints / clusters.length;
  const averageDensity = clusters.reduce((sum, cluster) => sum + cluster.density, 0) / clusters.length;
  const averageRadius = clusters.reduce((sum, cluster) => sum + cluster.radius, 0) / clusters.length;

  return {
    totalClusters: clusters.length,
    totalPoints,
    averageClusterSize,
    averageDensity,
    averageRadius,
  };
}
