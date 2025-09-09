import { Component, createSignal } from "solid-js";
import { ThreeJSVisualization } from "./ThreeJSVisualization";
import "./ThreeJSVisualizationDemo.css";

interface ThreeJSVisualizationDemoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const ThreeJSVisualizationDemo: Component<
  ThreeJSVisualizationDemoProps
> = (props) => {
  const [_scene, setScene] = createSignal<unknown>(null);
  const [_camera, setCamera] = createSignal<unknown>(null);
  const [_renderer, setRenderer] = createSignal<unknown>(null);
  const [_controls, setControls] = createSignal<unknown>(null);
  const [cameraInfo, setCameraInfo] = createSignal<string>("");

  // Demo scene setup
  const setupDemoScene = async (
    _scene: unknown,
    _camera: unknown,
    _renderer: unknown,
    _controls: unknown,
  ) => {
    try {
      // Store references
      setScene(_scene);
      setCamera(_camera);
      setRenderer(_renderer);
      setControls(_controls);

      // Lazy load Three.js components
      const THREE = (await import("three")) as any;
      const {
        BoxGeometry,
        SphereGeometry,
        CylinderGeometry,
        MeshStandardMaterial,
        Mesh,
        Group,
        AxesHelper,
        GridHelper,
      } = THREE;

      // Create a group to hold all demo objects
      const demoGroup = new Group();
      (_scene as any).add(demoGroup);

      // Create demo objects with different materials
      const boxGeometry = new BoxGeometry(1, 1, 1);
      const sphereGeometry = new SphereGeometry(0.5, 32, 32);
      const cylinderGeometry = new CylinderGeometry(0.3, 0.3, 1, 32);

      // Create materials with different properties
      const boxMaterial = new MeshStandardMaterial({
        color: 0x4caf50,
        metalness: 0.1,
        roughness: 0.8,
      });
      const sphereMaterial = new MeshStandardMaterial({
        color: 0x2196f3,
        metalness: 0.3,
        roughness: 0.4,
      });
      const cylinderMaterial = new MeshStandardMaterial({
        color: 0xff9800,
        metalness: 0.7,
        roughness: 0.2,
      });

      // Create meshes
      const box = new Mesh(boxGeometry, boxMaterial);
      box.position.set(-2, 0, 0);
      box.castShadow = true;
      box.receiveShadow = true;
      demoGroup.add(box);

      const sphere = new Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(0, 0, 0);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      demoGroup.add(sphere);

      const cylinder = new Mesh(cylinderGeometry, cylinderMaterial);
      cylinder.position.set(2, 0, 0);
      cylinder.castShadow = true;
      cylinder.receiveShadow = true;
      demoGroup.add(cylinder);

      // Add helpers for reference
      const axesHelper = new AxesHelper(2);
      (_scene as any).add(axesHelper);

      const gridHelper = new GridHelper(10, 10);
      gridHelper.position.y = -1;
      (_scene as any).add(gridHelper);

      // Update camera info
      updateCameraInfo();

      // Add controls change listener
      (_controls as any).addEventListener("change", updateCameraInfo);
    } catch (err) {
      console.error("Failed to setup demo scene:", err);
    }
  };

  // Update camera information display
  const updateCameraInfo = () => {
    const currentCamera = _camera();
    const currentControls = _controls();

    if (
      currentCamera &&
      currentControls &&
      (currentCamera as any).position &&
      (currentControls as any).target
    ) {
      const pos = (currentCamera as any).position;
      const target = (currentControls as any).target;

      // Calculate distance manually if distanceTo method is not available
      const distance = pos.distanceTo
        ? pos.distanceTo(target)
        : Math.sqrt(
            Math.pow((pos.x || 0) - (target.x || 0), 2) +
              Math.pow((pos.y || 0) - (target.y || 0), 2) +
              Math.pow((pos.z || 0) - (target.z || 0), 2),
          );

      setCameraInfo(
        `Camera: (${(pos.x || 0).toFixed(2)}, ${(pos.y || 0).toFixed(2)}, ${(pos.z || 0).toFixed(2)}) | ` +
          `Target: (${(target.x || 0).toFixed(2)}, ${(target.y || 0).toFixed(2)}, ${(target.z || 0).toFixed(2)}) | ` +
          `Distance: ${distance.toFixed(2)}`,
      );
    }
  };

  // Custom render function for animations
  const onRender = (
    _scene: any,
    _camera: any,
    _renderer: any,
    _controls: any,
  ) => {
    // Add any custom rendering logic here
    // For now, just update camera info
    updateCameraInfo();
  };

  return (
    <div class={`threejs-demo ${props.className || ""}`}>
      <div class="demo-header">
        <h3>3D Scene Management Demo</h3>
        <p>Enhanced camera controls, lighting system, and responsive canvas</p>
      </div>

      <div class="demo-controls">
        <div class="control-group">
          <label>Camera Controls:</label>
          <div class="control-info">
            <span>🖱️ Left click + drag: Rotate</span>
            <span>🖱️ Right click + drag: Pan</span>
            <span>🖱️ Scroll: Zoom</span>
          </div>
        </div>

        <div class="control-group">
          <label>Lighting System:</label>
          <div class="control-info">
            <span>💡 Ambient light for overall illumination</span>
            <span>☀️ Directional light for main shadows</span>
            <span>🔦 Point light for accent lighting</span>
          </div>
        </div>

        <div class="control-group">
          <label>Responsive Features:</label>
          <div class="control-info">
            <span>📱 Automatic canvas resizing</span>
            <span>🖥️ Device pixel ratio optimization</span>
            <span>⚡ Smooth transitions and damping</span>
          </div>
        </div>
      </div>

      <div class="visualization-container">
        <ThreeJSVisualization
          width={props.width || 800}
          height={props.height || 600}
          backgroundColor="#1a1a1a"
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={50}
          onSceneReady={setupDemoScene}
          onRender={onRender}
          className="demo-visualization"
        />
      </div>

      <div class="demo-info">
        <div class="info-panel">
          <h4>Camera Information</h4>
          <div class="camera-info">{cameraInfo()}</div>
        </div>

        <div class="info-panel">
          <h4>Features Demonstrated</h4>
          <ul>
            <li>✅ Smooth camera controls with damping</li>
            <li>✅ Enhanced lighting system with shadows</li>
            <li>✅ Responsive canvas with device pixel ratio</li>
            <li>✅ Real-time camera position tracking</li>
            <li>✅ Performance optimized rendering</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
