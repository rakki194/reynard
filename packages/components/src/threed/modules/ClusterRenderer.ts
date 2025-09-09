/**
 * Cluster Renderer Module
 * Handles the rendering logic for 3D cluster visualizations
 */

export interface ClusterRendererConfig {
  theme: string;
  clusterCount: number;
  pointCount: number;
  scene: any;
  THREE: any;
}

export class ClusterRenderer {
  private clusters: any[] = [];
  private colorPalette: string[] = [];

  constructor(config: ClusterRendererConfig) {
    // Use theme-based color palette instead of OKLCH
    this.colorPalette = this.getThemeColors(config.theme);
  }

  private getThemeColors(theme: string): string[] {
    const colorPalettes = {
      light: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"],
      dark: ["#60a5fa", "#f87171", "#34d399", "#fbbf24"],
      gray: ["#9ca3af", "#ef4444", "#10b981", "#f59e0b"],
      banana: ["#fbbf24", "#f59e0b", "#d97706", "#92400e"],
      strawberry: ["#f87171", "#ef4444", "#dc2626", "#991b1b"],
      peanut: ["#d97706", "#b45309", "#92400e", "#78350f"],
    };
    return (
      colorPalettes[theme as keyof typeof colorPalettes] || colorPalettes.dark
    );
  }

  createClusters(config: ClusterRendererConfig) {
    if (!config.scene) return;

    // Clear existing clusters
    this.clusters.forEach((cluster) => config.scene.remove(cluster));
    this.clusters = [];

    // Update color palette for new theme
    this.colorPalette = this.getThemeColors(config.theme);

    for (let i = 0; i < config.clusterCount; i++) {
      const cluster = this.createSingleCluster(
        config,
        i,
        this.colorPalette[i % this.colorPalette.length],
      );
      this.clusters.push(...cluster);
    }
  }

  private createSingleCluster(
    config: ClusterRendererConfig,
    index: number,
    color: string,
  ) {
    const { THREE, scene } = config;
    const centerX = (Math.random() - 0.5) * 8;
    const centerY = (Math.random() - 0.5) * 8;
    const centerZ = (Math.random() - 0.5) * 4;

    // Create cluster points
    const pointsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.pointCount * 3);
    const colors = new Float32Array(config.pointCount * 3);

    for (let j = 0; j < config.pointCount; j++) {
      const angle = (j / config.pointCount) * Math.PI * 2;
      const radius = Math.random() * 1.5;
      positions[j * 3] = centerX + Math.cos(angle) * radius;
      positions[j * 3 + 1] = centerY + Math.sin(angle) * radius;
      positions[j * 3 + 2] = centerZ + (Math.random() - 0.5) * 1;

      const pointColor = new THREE.Color(color);
      colors[j * 3] = pointColor.r;
      colors[j * 3 + 1] = pointColor.g;
      colors[j * 3 + 2] = pointColor.b;
    }

    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    pointsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const clusterPoints = new THREE.Points(
      pointsGeometry,
      new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
      }),
    );
    scene.add(clusterPoints);

    // Create cluster hull
    const hull = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 16, 16),
      new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.1,
        wireframe: true,
      }),
    );
    hull.position.set(centerX, centerY, centerZ);
    scene.add(hull);

    return [clusterPoints, hull];
  }

  animate() {
    this.clusters.forEach((cluster, index) => {
      if (index % 2 === 0) {
        // Only rotate point clusters, not hulls
        cluster.rotation.x += 0.001;
        cluster.rotation.y += 0.002;
      }
    });
  }

  dispose() {
    this.clusters = [];
  }
}
