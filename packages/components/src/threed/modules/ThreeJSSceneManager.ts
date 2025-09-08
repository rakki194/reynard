/**
 * Three.js Scene Manager Module
 * Handles Three.js scene initialization, camera, renderer, and lighting setup
 */

export interface SceneManagerConfig {
  width: number;
  height: number;
  backgroundColor: string;
  container: HTMLElement;
}

// Three.js type definitions for dynamic imports
interface ThreeScene {
  background: unknown;
  add(object: unknown): void;
}

interface ThreeCamera {
  position: { z: number };
}

interface ThreeRenderer {
  setSize(width: number, height: number): void;
  setPixelRatio(ratio: number): void;
  domElement: HTMLCanvasElement;
  render(scene: ThreeScene, camera: ThreeCamera): void;
}

interface ThreeLight {
  position: { set(x: number, y: number, z: number): void };
}

interface ThreeInstance {
  Scene: new () => ThreeScene;
  PerspectiveCamera: new (fov: number, aspect: number, near: number, far: number) => ThreeCamera;
  WebGLRenderer: new (options: { antialias: boolean }) => ThreeRenderer;
  Color: new (color: string | number) => unknown;
  AmbientLight: new (color: number, intensity: number) => unknown;
  DirectionalLight: new (color: number, intensity: number) => ThreeLight;
}

export class ThreeJSSceneManager {
  public scene: ThreeScene | null = null;
  public camera: ThreeCamera | null = null;
  public renderer: ThreeRenderer | null = null;
  private animationId: number | null = null;
  private config: SceneManagerConfig;

  constructor(config: SceneManagerConfig) {
    this.config = config;
  }

  async initialize(THREE: ThreeInstance) {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.width / this.config.height,
      0.1,
      1000
    );
    this.camera.position.z = 8;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.config.width, this.config.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.config.container.appendChild(this.renderer.domElement);

    // Add lighting
    this.setupLighting(THREE);

    return { scene: this.scene, camera: this.camera, renderer: this.renderer };
  }

  private setupLighting(THREE: ThreeInstance) {
    if (!this.scene) return;
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }

  startAnimation(animateCallback: () => void) {
    const animate = () => {
      if (!this.scene || !this.camera || !this.renderer) return;
      this.animationId = requestAnimationFrame(animate);
      animateCallback();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  updateBackgroundColor(THREE: ThreeInstance, color: string) {
    if (this.scene) {
      this.scene.background = new THREE.Color(color);
    }
  }

  dispose() {
    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId);
    }
    if (this.renderer && this.config.container) {
      this.config.container.removeChild(this.renderer.domElement);
    }
  }
}
