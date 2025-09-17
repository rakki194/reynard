import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { ThreeJSVisualization } from "reynard-3d";

interface CubeCollectorGameProps {
  onScoreUpdate: (score: number) => void;
}

interface CollectibleCube {
  id: number;
  mesh: any;
  collected: boolean;
  points: number;
}

export const CubeCollectorGame: Component<CubeCollectorGameProps> = props => {
  const [score, setScore] = createSignal(0);
  const [cubes, setCubes] = createSignal<CollectibleCube[]>([]);
  const [gameStarted, setGameStarted] = createSignal(false);
  const [timeLeft, setTimeLeft] = createSignal(60);

  let gameLoop: ReturnType<typeof setInterval>;
  let scene: any;
  let camera: any;
  let renderer: any;
  let _controls: any;
  let raycaster: any;
  let mouse: any;

  const setupGameScene = async (_scene: any, _camera: any, _renderer: any, controls: any) => {
    scene = _scene;
    camera = _camera;
    renderer = _renderer;
    _controls = controls;

    // Lazy load Three.js
    const THREE = (await import("three")) as any;

    // Setup raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add ground grid
    const gridHelper = new THREE.GridHelper(20, 20);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Create initial cubes
    createCollectibleCubes(THREE);

    // Setup mouse interaction
    renderer.domElement.addEventListener("click", onMouseClick);

    setGameStarted(true);
  };

  const createCollectibleCubes = (THREE: any) => {
    const newCubes: CollectibleCube[] = [];

    for (let i = 0; i < 10; i++) {
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        metalness: 0.3,
        roughness: 0.7,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set((Math.random() - 0.5) * 15, Math.random() * 2 + 0.5, (Math.random() - 0.5) * 15);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);

      newCubes.push({
        id: i,
        mesh,
        collected: false,
        points: Math.floor(Math.random() * 50) + 10,
      });
    }

    setCubes(newCubes);
  };

  const onMouseClick = (event: MouseEvent) => {
    if (!raycaster || !camera || !scene) return;

    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(
      cubes()
        .filter(cube => !cube.collected)
        .map(cube => cube.mesh)
    );

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const cube = cubes().find(c => c.mesh === clickedMesh);

      if (cube && !cube.collected) {
        // Collect the cube
        scene.remove(clickedMesh);
        setCubes(prev => prev.map(c => (c.id === cube.id ? { ...c, collected: true } : c)));

        // Update score
        const newScore = score() + cube.points;
        setScore(newScore);
        props.onScoreUpdate(newScore);

        // Check if all cubes collected
        if (cubes().filter(c => !c.collected).length === 1) {
          // Game won!
          setTimeout(() => {
            alert(`🎉 Congratulations! You collected all cubes! Final Score: ${newScore}`);
          }, 100);
        }
      }
    }
  };

  const gameUpdate = () => {
    if (!gameStarted()) return;

    // Animate remaining cubes
    cubes().forEach(cube => {
      if (!cube.collected) {
        cube.mesh.rotation.x += 0.01;
        cube.mesh.rotation.y += 0.01;
        cube.mesh.position.y += Math.sin(Date.now() * 0.001 + cube.id) * 0.002;
      }
    });

    // Update timer
    setTimeLeft(prev => {
      if (prev <= 0) {
        alert(`⏰ Time's up! Final Score: ${score()}`);
        return 0;
      }
      return prev - 0.016; // ~60fps
    });
  };

  onMount(() => {
    gameLoop = setInterval(gameUpdate, 16);
  });

  onCleanup(() => {
    if (gameLoop) clearInterval(gameLoop);
    if (renderer?.domElement) {
      renderer.domElement.removeEventListener("click", onMouseClick);
    }
  });

  return (
    <div class="cube-collector-game">
      <div class="game-hud">
        <div class="hud-item">
          <span class="hud-label">Score:</span>
          <span class="hud-value">{score()}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Time:</span>
          <span class="hud-value">{Math.ceil(timeLeft())}s</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Cubes:</span>
          <span class="hud-value">{cubes().filter(c => !c.collected).length}/10</span>
        </div>
      </div>

      <div class="game-instructions">
        <h3>🎲 Cube Collector</h3>
        <p>Click on the colorful cubes to collect them! Each cube is worth different points.</p>
        <p>Collect all 10 cubes before time runs out!</p>
      </div>

      <div class="game-viewport">
        <ThreeJSVisualization
          backgroundColor="#87CEEB"
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          onSceneReady={setupGameScene}
          className="cube-game-canvas"
        />
      </div>
    </div>
  );
};
