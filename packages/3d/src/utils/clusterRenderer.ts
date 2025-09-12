import type { ClusterData } from "../types/rendering";

export interface ClusterRendererConfig {
  scene: any;
  renderer: any;
  camera: any;
}

export class ClusterRenderer {
  private hullMeshes: any[] = [];
  private textSprites: any[] = [];
  private THREE: any = null;

  constructor(private config: ClusterRendererConfig) {}

  async initialize() {
    if (!this.THREE) {
      this.THREE = await import("three");
    }
  }

  clearClusterVisualizations() {
    // Remove hull meshes
    this.hullMeshes.forEach((mesh) => {
      this.config.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    this.hullMeshes = [];

    // Remove text sprites
    this.textSprites.forEach((sprite) => {
      this.config.scene.remove(sprite);
      if (sprite.material) sprite.material.dispose();
    });
    this.textSprites = [];
  }

  async renderClusters(clusters: ClusterData[], onHover?: (clusterId: string) => void) {
    await this.initialize();
    
    // Clear existing cluster visualizations
    this.clearClusterVisualizations();

    // Create new cluster visualizations
    clusters.forEach((cluster) => {
      this.createConvexHull(cluster, onHover);
      this.createClusterLabel(cluster);
    });

    // Update scene
    this.config.renderer.render(this.config.scene, this.config.camera);
  }

  private createConvexHull(cluster: ClusterData, onHover?: (clusterId: string) => void) {
    if (!cluster.points || cluster.points.length < 3 || !this.THREE) return;

    // Create convex hull geometry
    const geometry = new this.THREE.ConvexGeometry(cluster.points);
    const material = new this.THREE.MeshBasicMaterial({
      color: cluster.color,
      transparent: true,
      opacity: 0.3,
      wireframe: false,
      side: this.THREE.DoubleSide,
    });

    const mesh = new this.THREE.Mesh(geometry, material);
    mesh.userData = { clusterId: cluster.id, type: "clusterHull" };

    // Add hover effect
    if (onHover) {
      mesh.onHover = () => onHover(cluster.id);
      mesh.onLeave = () => onHover("");
    }

    this.config.scene.add(mesh);
    this.hullMeshes.push(mesh);
  }

  private createClusterLabel(cluster: ClusterData) {
    if (!cluster.label || !this.THREE) return;

    // Create text sprite
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = 256;
    canvas.height = 64;

    // Draw text
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "white";
    context.font = "24px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(cluster.label, canvas.width / 2, canvas.height / 2);

    // Create texture and sprite
    const texture = new this.THREE.CanvasTexture(canvas);
    const spriteMaterial = new this.THREE.SpriteMaterial({ map: texture });
    const sprite = new this.THREE.Sprite(spriteMaterial);

    sprite.position.copy(cluster.centroid);
    sprite.position.y += 0.5; // Offset above centroid
    sprite.scale.set(2, 0.5, 1);
    sprite.userData = { clusterId: cluster.id, type: "clusterLabel" };

    this.config.scene.add(sprite);
    this.textSprites.push(sprite);
  }

  getHullMeshes() {
    return this.hullMeshes;
  }

  dispose() {
    this.clearClusterVisualizations();
  }
}
