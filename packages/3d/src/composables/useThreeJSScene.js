// Three.js scene initialization composable
import { createSignal } from "solid-js";
export function useThreeJSScene(config) {
    const [scene, setScene] = createSignal(null);
    const [camera, setCamera] = createSignal(null);
    const [renderer, setRenderer] = createSignal(null);
    // Lazy load Three.js for performance optimization
    const loadThreeJS = async () => {
        const THREE = (await import("three"));
        const { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, PointLight, Color, Vector3, PCFSoftShadowMap, ACESFilmicToneMapping, SRGBColorSpace, } = THREE;
        return {
            Scene,
            PerspectiveCamera,
            WebGLRenderer,
            AmbientLight,
            DirectionalLight,
            PointLight,
            Color,
            Vector3,
            PCFSoftShadowMap,
            ACESFilmicToneMapping,
            SRGBColorSpace,
        };
    };
    const createScene = async (container) => {
        const threeJSModules = await loadThreeJS();
        // Create scene
        const newScene = new threeJSModules.Scene();
        newScene.background = new threeJSModules.Color(config.backgroundColor);
        setScene(newScene);
        // Create camera
        const newCamera = new threeJSModules.PerspectiveCamera(75, config.width / config.height, 0.1, 1000);
        newCamera.position.set(5, 5, 5);
        newCamera.lookAt(0, 0, 0);
        setCamera(newCamera);
        // Create renderer
        const newRenderer = new threeJSModules.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
        });
        const updateRendererSize = () => {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const pixelRatio = Math.min(window.devicePixelRatio, 2);
            newRenderer.setSize(containerWidth, containerHeight, false);
            newRenderer.setPixelRatio(pixelRatio);
            if (newCamera) {
                newCamera.aspect = containerWidth / containerHeight;
                newCamera.updateProjectionMatrix();
            }
        };
        updateRendererSize();
        newRenderer.shadowMap.enabled = true;
        newRenderer.shadowMap.type = threeJSModules.PCFSoftShadowMap;
        newRenderer.toneMapping = threeJSModules.ACESFilmicToneMapping;
        newRenderer.toneMappingExposure = 1.0;
        newRenderer.outputColorSpace = threeJSModules.SRGBColorSpace;
        container.appendChild(newRenderer.domElement);
        setRenderer(newRenderer);
        // Setup lighting
        setupLighting(newScene, threeJSModules);
        return { scene: newScene, camera: newCamera, renderer: newRenderer };
    };
    const setupLighting = (scene, THREE) => {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        scene.add(directionalLight);
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4080ff, 0.3);
        fillLight.position.set(-5, 3, -5);
        scene.add(fillLight);
        // Point light
        const pointLight = new THREE.PointLight(0xff8040, 0.5, 20);
        pointLight.position.set(0, 8, 0);
        pointLight.castShadow = true;
        scene.add(pointLight);
    };
    return {
        scene,
        camera,
        renderer,
        createScene,
    };
}
