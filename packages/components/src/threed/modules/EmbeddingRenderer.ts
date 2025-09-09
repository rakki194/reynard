/**
 * Embedding Renderer Module
 * Handles the rendering logic for 3D embedding visualizations
 */

export interface EmbeddingRendererConfig {
  theme: string;
  embeddingCount: number;
  scene: any;
  THREE: any;
}

export class EmbeddingRenderer {
  private points: any = null;
  private colorPalette: string[] = [];

  constructor(config: EmbeddingRendererConfig) {
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

  createEmbeddingVisualization(config: EmbeddingRendererConfig) {
    if (!config.scene) return;

    if (this.points) {
      config.scene.remove(this.points);
    }

    this.colorPalette = this.getThemeColors(config.theme);

    const geometry = config.THREE.BufferGeometry();
    const positions = new Float32Array(config.embeddingCount * 3);
    const colors = new Float32Array(config.embeddingCount * 3);
    const sizes = new Float32Array(config.embeddingCount);

    // Generate embedding-like data (spiral pattern)
    for (let i = 0; i < config.embeddingCount; i++) {
      const t = (i / config.embeddingCount) * Math.PI * 4;
      const radius = Math.sqrt(i / config.embeddingCount) * 4;
      const x = Math.cos(t) * radius + (Math.random() - 0.5) * 0.5;
      const y = Math.sin(t) * radius + (Math.random() - 0.5) * 0.5;
      const z = Math.sin(t * 2) * 2 + (Math.random() - 0.5) * 0.5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color based on similarity (distance from center)
      const distance = Math.sqrt(x * x + y * y + z * z);
      const similarity = 1 - distance / 6;
      const colorIndex = Math.floor(similarity * this.colorPalette.length);
      const color = new config.THREE.Color(this.colorPalette[colorIndex]);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 0.01 + similarity * 0.03;
    }

    geometry.setAttribute(
      "position",
      new config.THREE.BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new config.THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new config.THREE.BufferAttribute(sizes, 1));

    const material = new config.THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    this.points = new config.THREE.Points(geometry, material);
    config.scene.add(this.points);
  }

  animate() {
    if (this.points) {
      this.points.rotation.x += 0.0005;
      this.points.rotation.y += 0.001;
    }
  }

  updateTheme(newTheme: string, THREE: any) {
    if (!this.points) return;

    this.colorPalette = this.getThemeColors(newTheme);
    const colors = this.points.geometry.attributes.color.array;
    const positions = this.points.geometry.attributes.position.array;

    for (let i = 0; i < colors.length; i += 3) {
      const pointIndex = i / 3;
      const x = positions[pointIndex * 3];
      const y = positions[pointIndex * 3 + 1];
      const z = positions[pointIndex * 3 + 2];

      const distance = Math.sqrt(x * x + y * y + z * z);
      const similarity = 1 - distance / 6;
      const colorIndex = Math.floor(similarity * this.colorPalette.length);
      const color = new THREE.Color(this.colorPalette[colorIndex]);

      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    this.points.geometry.attributes.color.needsUpdate = true;
  }

  dispose() {
    this.points = null;
  }
}
