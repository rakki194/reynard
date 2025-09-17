import { createSignal } from "solid-js";
import { ThreeJSVisualization } from "./ThreeJSVisualization";
import { useI18n } from "reynard-i18n";
import "./ThreeJSVisualizationDemo.css";
export const ThreeJSVisualizationDemo = (props) => {
    const { t } = useI18n();
    const [_scene, setScene] = createSignal(null);
    const [_camera, setCamera] = createSignal(null);
    const [_renderer, setRenderer] = createSignal(null);
    const [_controls, setControls] = createSignal(null);
    const [cameraInfo, setCameraInfo] = createSignal("");
    // Demo scene setup
    const setupDemoScene = async (_scene, _camera, _renderer, _controls) => {
        try {
            // Store references
            setScene(_scene);
            setCamera(_camera);
            setRenderer(_renderer);
            setControls(_controls);
            // Lazy load Three.js components
            const THREE = (await import("three"));
            const { BoxGeometry, SphereGeometry, CylinderGeometry, MeshStandardMaterial, Mesh, Group, AxesHelper, GridHelper, } = THREE;
            // Create a group to hold all demo objects
            const demoGroup = new Group();
            _scene.add(demoGroup);
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
            _scene.add(axesHelper);
            const gridHelper = new GridHelper(10, 10);
            gridHelper.position.y = -1;
            _scene.add(gridHelper);
            // Update camera info
            updateCameraInfo();
            // Add controls change listener
            _controls.addEventListener("change", updateCameraInfo);
        }
        catch (err) {
            console.error("Failed to setup demo scene:", err);
        }
    };
    // Update camera information display
    const updateCameraInfo = () => {
        const currentCamera = _camera();
        const currentControls = _controls();
        if (currentCamera &&
            currentControls &&
            currentCamera.position &&
            currentControls.target) {
            const pos = currentCamera.position;
            const target = currentControls.target;
            // Calculate distance manually if distanceTo method is not available
            const distance = pos.distanceTo
                ? pos.distanceTo(target)
                : Math.sqrt(Math.pow((pos.x || 0) - (target.x || 0), 2) +
                    Math.pow((pos.y || 0) - (target.y || 0), 2) +
                    Math.pow((pos.z || 0) - (target.z || 0), 2));
            setCameraInfo(`Camera: (${(pos.x || 0).toFixed(2)}, ${(pos.y || 0).toFixed(2)}, ${(pos.z || 0).toFixed(2)}) | ` +
                `Target: (${(target.x || 0).toFixed(2)}, ${(target.y || 0).toFixed(2)}, ${(target.z || 0).toFixed(2)}) | ` +
                `Distance: ${distance.toFixed(2)}`);
        }
    };
    // Custom render function for animations
    const onRender = (_scene, _camera, _renderer, _controls) => {
        // Add any custom rendering logic here
        // For now, just update camera info
        updateCameraInfo();
    };
    return (<div class={`threejs-demo ${props.className || ""}`}>
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
        <ThreeJSVisualization width={props.width || 800} height={props.height || 600} backgroundColor="#1a1a1a" enableDamping={true} dampingFactor={0.05} enableZoom={true} enablePan={true} enableRotate={true} minDistance={0.5} maxDistance={50} onSceneReady={setupDemoScene} onRender={onRender} className="demo-visualization"/>
      </div>

      <div class="demo-info">
        <div class="info-panel">
          <h4>{t("3d.cameraInformation")}</h4>
          <div class="camera-info">{cameraInfo()}</div>
        </div>

        <div class="info-panel">
          <h4>{t("3d.featuresDemonstrated")}</h4>
          <ul>
            <li>✅ {t("3d.smoothCameraControlsWithDamping")}</li>
            <li>✅ {t("3d.enhancedLightingSystemWithShadows")}</li>
            <li>✅ {t("3d.responsiveCanvasWithDevicePixelRatio")}</li>
            <li>✅ {t("3d.realTimeCameraPositionTracking")}</li>
            <li>✅ {t("3d.performanceOptimizedRendering")}</li>
          </ul>
        </div>
      </div>
    </div>);
};
