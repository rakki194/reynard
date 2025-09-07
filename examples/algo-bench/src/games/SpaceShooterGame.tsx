import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { ThreeJSVisualization } from "reynard-3d";

interface SpaceShooterGameProps {
  onScoreUpdate: (score: number) => void;
}

interface Bullet {
  id: number;
  mesh: any;
  velocity: { x: number; y: number; z: number };
}

interface Enemy {
  id: number;
  mesh: any;
  velocity: { x: number; y: number; z: number };
  health: number;
}

export const SpaceShooterGame: Component<SpaceShooterGameProps> = (props) => {
  const [score, setScore] = createSignal(0);
  const [bullets, setBullets] = createSignal<Bullet[]>([]);
  const [enemies, setEnemies] = createSignal<Enemy[]>([]);
  const [gameStarted, setGameStarted] = createSignal(false);
  const [playerHealth, setPlayerHealth] = createSignal(100);
  
  let gameLoop: number;
  let scene: any;
  let camera: any;
  let renderer: any;
  let controls: any;
  let player: any;
  let nextBulletId = 0;
  let nextEnemyId = 0;
  let lastEnemySpawn = 0;

  const setupGameScene = async (_scene: any, _camera: any, _renderer: any, _controls: any) => {
    scene = _scene;
    camera = _camera;
    renderer = _renderer;
    controls = _controls;

    // Lazy load Three.js
    const THREE = await import('three') as any;
    const { 
      BoxGeometry, 
      SphereGeometry,
      MeshStandardMaterial, 
      Mesh, 
      AmbientLight, 
      DirectionalLight,
      PointLight,
      Fog
    } = THREE;

    // Setup space environment
    scene.fog = new Fog(0x000011, 1, 100);
    scene.background = new THREE.Color(0x000011);

    // Add lighting
    const ambientLight = new AmbientLight(0x404080, 0.3);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 0);
    scene.add(directionalLight);

    const pointLight = new PointLight(0x00ffff, 1, 50);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Create player ship
    const playerGeometry = new BoxGeometry(0.5, 0.2, 1);
    const playerMaterial = new MeshStandardMaterial({
      color: 0x00ff00,
      metalness: 0.8,
      roughness: 0.2,
    });
    player = new Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0, -8);
    scene.add(player);

    // Setup controls
    setupControls();
    
    setGameStarted(true);
  };

  const setupControls = () => {
    const keys: { [key: string]: boolean } = {};
    
    const onKeyDown = (event: KeyboardEvent) => {
      keys[event.code] = true;
    };
    
    const onKeyUp = (event: KeyboardEvent) => {
      keys[event.code] = false;
    };
    
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    // Update player position based on keys
    const updatePlayer = () => {
      if (!player) return;
      
      const speed = 0.2;
      if (keys['KeyA'] || keys['ArrowLeft']) {
        player.position.x = Math.max(-8, player.position.x - speed);
      }
      if (keys['KeyD'] || keys['ArrowRight']) {
        player.position.x = Math.min(8, player.position.x + speed);
      }
      if (keys['KeyW'] || keys['ArrowUp']) {
        player.position.y = Math.min(4, player.position.y + speed);
      }
      if (keys['KeyS'] || keys['ArrowDown']) {
        player.position.y = Math.max(-4, player.position.y - speed);
      }
      if (keys['Space']) {
        shoot();
      }
    };
    
    // Store update function for game loop
    (window as any).updatePlayer = updatePlayer;
  };

  const shoot = () => {
    if (!player || !scene) return;
    
    const THREE = require('three') as any;
    const bulletGeometry = new SphereGeometry(0.1, 8, 8);
    const bulletMaterial = new MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
    });
    
    const bullet = new Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(player.position);
    bullet.position.z += 1;
    
    scene.add(bullet);
    
    const newBullet: Bullet = {
      id: nextBulletId++,
      mesh: bullet,
      velocity: { x: 0, y: 0, z: 0.5 }
    };
    
    setBullets(prev => [...prev, newBullet]);
  };

  const spawnEnemy = () => {
    if (!scene) return;
    
    const THREE = require('three') as any;
    const enemyGeometry = new BoxGeometry(0.8, 0.3, 0.6);
    const enemyMaterial = new MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.5,
      roughness: 0.5,
    });
    
    const enemy = new Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 8,
      10
    );
    
    scene.add(enemy);
    
    const newEnemy: Enemy = {
      id: nextEnemyId++,
      mesh: enemy,
      velocity: { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1, z: -0.05 },
      health: 2
    };
    
    setEnemies(prev => [...prev, newEnemy]);
  };

  const gameUpdate = () => {
    if (!gameStarted()) return;
    
    const now = Date.now();
    
    // Spawn enemies periodically
    if (now - lastEnemySpawn > 2000) {
      spawnEnemy();
      lastEnemySpawn = now;
    }
    
    // Update player
    if ((window as any).updatePlayer) {
      (window as any).updatePlayer();
    }
    
    // Update bullets
    setBullets(prev => prev.filter(bullet => {
      bullet.mesh.position.z += bullet.velocity.z;
      
      // Remove bullets that are too far
      if (bullet.mesh.position.z > 15) {
        scene.remove(bullet.mesh);
        return false;
      }
      
      return true;
    }));
    
    // Update enemies
    setEnemies(prev => prev.filter(enemy => {
      enemy.mesh.position.x += enemy.velocity.x;
      enemy.mesh.position.y += enemy.velocity.y;
      enemy.mesh.position.z += enemy.velocity.z;
      
      // Remove enemies that are too far
      if (enemy.mesh.position.z < -15) {
        scene.remove(enemy.mesh);
        return false;
      }
      
      // Check collision with player
      if (enemy.mesh.position.distanceTo(player.position) < 1) {
        setPlayerHealth(prev => {
          const newHealth = prev - 10;
          if (newHealth <= 0) {
            alert(`💥 Game Over! Final Score: ${score()}`);
          }
          return newHealth;
        });
        scene.remove(enemy.mesh);
        return false;
      }
      
      return true;
    }));
    
    // Check bullet-enemy collisions
    bullets().forEach(bullet => {
      enemies().forEach(enemy => {
        if (bullet.mesh.position.distanceTo(enemy.mesh.position) < 0.5) {
          // Hit!
          enemy.health--;
          scene.remove(bullet.mesh);
          setBullets(prev => prev.filter(b => b.id !== bullet.id));
          
          if (enemy.health <= 0) {
            scene.remove(enemy.mesh);
            setEnemies(prev => prev.filter(e => e.id !== enemy.id));
            setScore(prev => {
              const newScore = prev + 100;
              props.onScoreUpdate(newScore);
              return newScore;
            });
          }
        }
      });
    });
  };

  onMount(() => {
    gameLoop = setInterval(gameUpdate, 16);
  });

  onCleanup(() => {
    if (gameLoop) clearInterval(gameLoop);
  });

  return (
    <div class="space-shooter-game">
      <div class="game-hud">
        <div class="hud-item">
          <span class="hud-label">Score:</span>
          <span class="hud-value">{score()}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Health:</span>
          <span class="hud-value">{playerHealth()}%</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Enemies:</span>
          <span class="hud-value">{enemies().length}</span>
        </div>
      </div>
      
      <div class="game-instructions">
        <h3>🚀 Space Shooter</h3>
        <p>Use WASD or Arrow Keys to move your ship. Press SPACE to shoot!</p>
        <p>Destroy red enemy ships to score points. Avoid collisions!</p>
      </div>
      
      <div class="game-viewport">
        <ThreeJSVisualization
          backgroundColor="#000011"
          enableDamping={false}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          onSceneReady={setupGameScene}
          className="space-game-canvas"
        />
      </div>
    </div>
  );
};
