import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { ThreeJSVisualization } from "reynard-3d";

interface MazeExplorerGameProps {
  onScoreUpdate: (score: number) => void;
}

interface MazeCell {
  x: number;
  z: number;
  walls: { north: boolean; south: boolean; east: boolean; west: boolean };
  visited: boolean;
}

export const MazeExplorerGame: Component<MazeExplorerGameProps> = props => {
  const [score, setScore] = createSignal(0);
  const [gameStarted, setGameStarted] = createSignal(false);
  const [playerPosition, setPlayerPosition] = createSignal({ x: 0, z: 0 });
  const [mazeSize] = createSignal(15);
  const [maze, setMaze] = createSignal<MazeCell[][]>([]);
  const [exitFound, setExitFound] = createSignal(false);

  let gameLoop: number;
  let scene: any;
  let camera: any;
  let renderer: any;
  let controls: any;
  let player: any;
  let mazeMeshes: any[] = [];

  const setupGameScene = async (_scene: any, _camera: any, _renderer: any, _controls: any) => {
    scene = _scene;
    camera = _camera;
    renderer = _renderer;
    controls = _controls;

    // Lazy load Three.js
    const THREE = (await import("three")) as any;
    const { BoxGeometry, MeshStandardMaterial, Mesh, AmbientLight, DirectionalLight, PointLight, Fog } = THREE;

    // Setup maze environment
    scene.fog = new Fog(0x222222, 1, 50);
    scene.background = new THREE.Color(0x111111);

    // Add lighting
    const ambientLight = new AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create player (first-person view)
    const playerGeometry = new BoxGeometry(0.5, 1.8, 0.5);
    const playerMaterial = new MeshStandardMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.1,
    });
    player = new Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0.9, 0);
    scene.add(player);

    // Generate and render maze
    generateMaze();
    renderMaze(THREE);

    // Position camera for first-person view
    camera.position.set(0, 1.6, 0);
    controls.target.set(0, 1.6, -1);

    setupControls();
    setGameStarted(true);
  };

  const generateMaze = () => {
    const size = mazeSize();
    const newMaze: MazeCell[][] = [];

    // Initialize maze with all walls
    for (let x = 0; x < size; x++) {
      newMaze[x] = [];
      for (let z = 0; z < size; z++) {
        newMaze[x][z] = {
          x,
          z,
          walls: { north: true, south: true, east: true, west: true },
          visited: false,
        };
      }
    }

    // Recursive backtracking algorithm
    const stack: MazeCell[] = [];
    const start = newMaze[0][0];
    start.visited = true;
    stack.push(start);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = getUnvisitedNeighbors(current, newMaze);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        removeWallBetween(current, next);
        next.visited = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    setMaze(newMaze);
  };

  const getUnvisitedNeighbors = (cell: MazeCell, maze: MazeCell[][]): MazeCell[] => {
    const neighbors: MazeCell[] = [];
    const { x, z } = cell;

    if (x > 0 && !maze[x - 1][z].visited) neighbors.push(maze[x - 1][z]);
    if (x < maze.length - 1 && !maze[x + 1][z].visited) neighbors.push(maze[x + 1][z]);
    if (z > 0 && !maze[x][z - 1].visited) neighbors.push(maze[x][z - 1]);
    if (z < maze[0].length - 1 && !maze[x][z + 1].visited) neighbors.push(maze[x][z + 1]);

    return neighbors;
  };

  const removeWallBetween = (cell1: MazeCell, cell2: MazeCell) => {
    const dx = cell2.x - cell1.x;
    const dz = cell2.z - cell1.z;

    if (dx === 1) {
      cell1.walls.east = false;
      cell2.walls.west = false;
    } else if (dx === -1) {
      cell1.walls.west = false;
      cell2.walls.east = false;
    } else if (dz === 1) {
      cell1.walls.south = false;
      cell2.walls.north = false;
    } else if (dz === -1) {
      cell1.walls.north = false;
      cell2.walls.south = false;
    }
  };

  const renderMaze = (THREE: any) => {
    // Clear existing maze
    mazeMeshes.forEach(mesh => scene.remove(mesh));
    mazeMeshes = [];

    const wallGeometry = new BoxGeometry(1, 2, 0.1);
    const wallMaterial = new MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.3,
      roughness: 0.7,
    });

    const floorGeometry = new BoxGeometry(1, 0.1, 1);
    const floorMaterial = new MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.1,
      roughness: 0.9,
    });

    const exitGeometry = new BoxGeometry(1, 0.1, 1);
    const exitMaterial = new MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3,
    });

    // Render floor and walls
    maze().forEach(row => {
      row.forEach(cell => {
        const x = cell.x - mazeSize() / 2;
        const z = cell.z - mazeSize() / 2;

        // Floor
        const floor = new Mesh(floorGeometry, floorMaterial);
        floor.position.set(x, -1, z);
        floor.receiveShadow = true;
        scene.add(floor);
        mazeMeshes.push(floor);

        // Exit at the end
        if (cell.x === mazeSize() - 1 && cell.z === mazeSize() - 1) {
          const exit = new Mesh(exitGeometry, exitMaterial);
          exit.position.set(x, -0.9, z);
          scene.add(exit);
          mazeMeshes.push(exit);
        }

        // Walls
        if (cell.walls.north) {
          const wall = new Mesh(wallGeometry, wallMaterial);
          wall.position.set(x, 0, z - 0.5);
          wall.castShadow = true;
          scene.add(wall);
          mazeMeshes.push(wall);
        }
        if (cell.walls.south) {
          const wall = new Mesh(wallGeometry, wallMaterial);
          wall.position.set(x, 0, z + 0.5);
          wall.castShadow = true;
          scene.add(wall);
          mazeMeshes.push(wall);
        }
        if (cell.walls.east) {
          const wall = new Mesh(wallGeometry, wallMaterial);
          wall.position.set(x + 0.5, 0, z);
          wall.rotation.y = Math.PI / 2;
          wall.castShadow = true;
          scene.add(wall);
          mazeMeshes.push(wall);
        }
        if (cell.walls.west) {
          const wall = new Mesh(wallGeometry, wallMaterial);
          wall.position.set(x - 0.5, 0, z);
          wall.rotation.y = Math.PI / 2;
          wall.castShadow = true;
          scene.add(wall);
          mazeMeshes.push(wall);
        }
      });
    });
  };

  const setupControls = () => {
    const keys: { [key: string]: boolean } = {};

    const onKeyDown = (event: KeyboardEvent) => {
      keys[event.code] = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys[event.code] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Store keys for game loop
    (window as any).mazeKeys = keys;
  };

  const canMoveTo = (x: number, z: number): boolean => {
    if (x < 0 || x >= mazeSize() || z < 0 || z >= mazeSize()) return false;

    const currentCell =
      maze()[Math.floor(playerPosition().x + mazeSize() / 2)][Math.floor(playerPosition().z + mazeSize() / 2)];
    const targetCell = maze()[x][z];

    // Check if there's a wall between current and target position
    const dx = x - (playerPosition().x + mazeSize() / 2);
    const dz = z - (playerPosition().z + mazeSize() / 2);

    if (Math.abs(dx) + Math.abs(dz) !== 1) return false; // Only allow adjacent moves

    if (dx === 1 && currentCell.walls.east) return false;
    if (dx === -1 && currentCell.walls.west) return false;
    if (dz === 1 && currentCell.walls.south) return false;
    if (dz === -1 && currentCell.walls.north) return false;

    return true;
  };

  const gameUpdate = () => {
    if (!gameStarted() || !player) return;

    const keys = (window as any).mazeKeys;
    if (!keys) return;

    const moveSpeed = 0.1;
    let newX = playerPosition().x;
    let newZ = playerPosition().z;

    if (keys["KeyW"] || keys["ArrowUp"]) {
      newZ -= moveSpeed;
    }
    if (keys["KeyS"] || keys["ArrowDown"]) {
      newZ += moveSpeed;
    }
    if (keys["KeyA"] || keys["ArrowLeft"]) {
      newX -= moveSpeed;
    }
    if (keys["KeyD"] || keys["ArrowRight"]) {
      newX += moveSpeed;
    }

    // Check if movement is valid
    const targetGridX = Math.floor(newX + mazeSize() / 2);
    const targetGridZ = Math.floor(newZ + mazeSize() / 2);

    if (canMoveTo(targetGridX, targetGridZ)) {
      setPlayerPosition({ x: newX, z: newZ });
      player.position.set(newX, 0.9, newZ);
      camera.position.set(newX, 1.6, newZ);
      controls.target.set(newX, 1.6, newZ - 1);

      // Check if reached exit
      if (targetGridX === mazeSize() - 1 && targetGridZ === mazeSize() - 1 && !exitFound()) {
        setExitFound(true);
        const newScore = score() + 1000;
        setScore(newScore);
        props.onScoreUpdate(newScore);
        alert(`🎉 Congratulations! You found the exit! Score: ${newScore}`);
      }
    }
  };

  onMount(() => {
    gameLoop = setInterval(gameUpdate, 16);
  });

  onCleanup(() => {
    if (gameLoop) clearInterval(gameLoop);
  });

  return (
    <div class="maze-explorer-game">
      <div class="game-hud">
        <div class="hud-item">
          <span class="hud-label">Score:</span>
          <span class="hud-value">{score()}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Position:</span>
          <span class="hud-value">
            ({Math.floor(playerPosition().x + mazeSize() / 2)}, {Math.floor(playerPosition().z + mazeSize() / 2)})
          </span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Status:</span>
          <span class="hud-value">{exitFound() ? "Exit Found!" : "Exploring..."}</span>
        </div>
      </div>

      <div class="game-instructions">
        <h3>🧩 Maze Explorer</h3>
        <p>Use WASD or Arrow Keys to navigate through the 3D maze.</p>
        <p>Find the golden exit at the far corner to win!</p>
        <p>🖱️ Mouse to look around • First-person view</p>
      </div>

      <div class="game-viewport">
        <ThreeJSVisualization
          backgroundColor="#111111"
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          onSceneReady={setupGameScene}
          className="maze-game-canvas"
        />
      </div>
    </div>
  );
};
