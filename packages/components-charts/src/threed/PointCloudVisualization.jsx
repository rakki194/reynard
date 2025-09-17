/**
 * Point Cloud 3D Visualization
 * Interactive point cloud with theme-aware colors
 */
import { createSignal, onMount, onCleanup, createEffect, } from "solid-js";
export const PointCloudVisualization = (props) => {
    const [container, setContainer] = createSignal();
    const [isInitialized, setIsInitialized] = createSignal(false);
    let scene = null;
    let camera = null;
    let renderer = null;
    let animationId = null;
    let points = null;
    // Get theme-based color palette
    const getThemeColors = (theme) => {
        const colorPalettes = {
            light: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"],
            dark: ["#60a5fa", "#f87171", "#34d399", "#fbbf24"],
            gray: ["#9ca3af", "#ef4444", "#10b981", "#f59e0b"],
            banana: ["#fbbf24", "#f59e0b", "#d97706", "#92400e"],
            strawberry: ["#f87171", "#ef4444", "#dc2626", "#991b1b"],
            peanut: ["#d97706", "#b45309", "#92400e", "#78350f"],
        };
        return (colorPalettes[theme] || colorPalettes.dark);
    };
    const initializeThreeJS = async () => {
        if (!container() || isInitialized())
            return;
        try {
            const THREE = await import("three");
            // Create scene with theme-aware background
            scene = new THREE.Scene();
            const bgColor = getThemeBackgroundColor();
            scene.background = new THREE.Color(bgColor);
            // Create camera
            camera = new THREE.PerspectiveCamera(75, (props.width || 400) / (props.height || 300), 0.1, 1000);
            camera.position.z = 5;
            // Create renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(props.width || 400, props.height || 300);
            renderer.setPixelRatio(window.devicePixelRatio);
            container()?.appendChild(renderer.domElement);
            // Create point cloud
            createPointCloud(THREE);
            // Add lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);
            // Start animation
            animate();
            setIsInitialized(true);
        }
        catch (error) {
            console.error("Failed to initialize Three.js:", error);
        }
    };
    const getThemeBackgroundColor = () => {
        switch (props.theme) {
            case "light":
                return "#ffffff";
            case "dark":
                return "#1a1a1a";
            case "gray":
                return "#2a2a2a";
            case "banana":
                return "#fff8dc";
            case "strawberry":
                return "#ffe4e1";
            case "peanut":
                return "#f5deb3";
            default:
                return "#1a1a1a";
        }
    };
    const createPointCloud = (THREE) => {
        if (!scene)
            return;
        if (points) {
            scene.remove(points);
        }
        const geometry = new THREE.BufferGeometry();
        const pointCount = props.pointCount || 1000;
        const positions = new Float32Array(pointCount * 3);
        const colors = new Float32Array(pointCount * 3);
        // Generate clustered point cloud data
        for (let i = 0; i < pointCount; i++) {
            // Create 3 clusters
            const cluster = Math.floor(i / (pointCount / 3));
            const clusterOffset = (cluster - 1) * 3;
            const angle = (i / (pointCount / 3)) * Math.PI * 2;
            const radius = Math.random() * 1.5;
            const x = Math.cos(angle) * radius + clusterOffset;
            const y = Math.sin(angle) * radius;
            const z = (Math.random() - 0.5) * 2;
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            // Use theme-aware colors
            const colorPalette = getThemeColors(props.theme);
            const colorIndex = cluster % colorPalette.length;
            const color = new THREE.Color(colorPalette[colorIndex]);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        const material = new THREE.PointsMaterial({
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
        });
        points = new THREE.Points(geometry, material);
        scene.add(points);
    };
    const animate = () => {
        if (!scene || !camera || !renderer)
            return;
        animationId = requestAnimationFrame(animate);
        if (points) {
            points.rotation.x += 0.001;
            points.rotation.y += 0.002;
        }
        renderer.render(scene, camera);
    };
    // Update colors when theme changes
    createEffect(() => {
        if (isInitialized() && points) {
            import("three").then((THREE) => {
                const colorPalette = getThemeColors(props.theme);
                const colors = points.geometry.attributes.color.array;
                for (let i = 0; i < colors.length; i += 3) {
                    const cluster = Math.floor(i / 3 / (colors.length / 3 / 3));
                    const colorIndex = cluster % colorPalette.length;
                    const color = new THREE.Color(colorPalette[colorIndex]);
                    colors[i] = color.r;
                    colors[i + 1] = color.g;
                    colors[i + 2] = color.b;
                }
                points.geometry.attributes.color.needsUpdate = true;
                // Update background color
                if (scene) {
                    scene.background = new THREE.Color(getThemeBackgroundColor());
                }
            });
        }
    });
    onMount(() => {
        initializeThreeJS();
    });
    onCleanup(() => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        if (renderer && container()) {
            container()?.removeChild(renderer.domElement);
        }
    });
    return <div ref={setContainer} class="simple-threed-container"/>;
};
