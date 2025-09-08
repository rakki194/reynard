/**
 * Animation Loop Module
 * Manages the Three.js animation loop and point cloud rotation
 */

export interface AnimationObjects {
  scene: any;
  camera: any;
  renderer: any;
  points: any;
}

export class AnimationLoop {
  private animationId: number | null = null;
  private objects: AnimationObjects;

  constructor(objects: AnimationObjects) {
    this.objects = objects;
  }

  start(): void {
    this.animate();
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate = (): void => {
    if (!this.objects.scene || !this.objects.camera || !this.objects.renderer) {
      return;
    }

    this.animationId = requestAnimationFrame(this.animate);

    // Rotate the point cloud
    if (this.objects.points) {
      this.objects.points.rotation.x += 0.001;
      this.objects.points.rotation.y += 0.002;
    }

    this.objects.renderer.render(this.objects.scene, this.objects.camera);
  };
}
