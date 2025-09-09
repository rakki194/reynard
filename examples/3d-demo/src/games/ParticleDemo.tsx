import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { ThreeJSVisualization } from "reynard-3d";

interface ParticleDemoProps {
  onScoreUpdate: (score: number) => void;
}

interface Particle {
  id: number;
  mesh: any;
  velocity: { x: number; y: number; z: number };
  life: number;
  maxLife: number;
}

export const ParticleDemo: Component<ParticleDemoProps> = (props) => {
  const [score, setScore] = createSignal(0);
  const [particles, setParticles] = createSignal<Particle[]>([]);
  const [gameStarted, setGameStarted] = createSignal(false);
  const [particleCount, setParticleCount] = createSignal(0);
  const [effectType, setEffectType] = createSignal<
    "fireworks" | "fountain" | "spiral" | "explosion"
  >("fireworks");

  let gameLoop: number;
  let scene: any;
  let camera: any;
  let renderer: any;
  let controls: any;
  let nextParticleId = 0;
  let mousePosition = { x: 0, y: 0 };

  const setupGameScene = async (
    _scene: any,
    _camera: any,
    _renderer: any,
    _controls: any,
  ) => {
    scene = _scene;
    camera = _camera;
    renderer = _renderer;
    controls = _controls;

    // Lazy load Three.js
    const THREE = (await import("three")) as any;
    const {
      SphereGeometry,
      MeshBasicMaterial,
      Mesh,
      AmbientLight,
      DirectionalLight,
      Fog,
    } = THREE;

    // Setup environment
    scene.fog = new Fog(0x000022, 1, 100);
    scene.background = new THREE.Color(0x000022);

    // Add lighting
    const ambientLight = new AmbientLight(0x404080, 0.3);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Setup mouse interaction
    setupMouseInteraction();

    setGameStarted(true);
  };

  const setupMouseInteraction = () => {
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseClick = (event: MouseEvent) => {
      createParticleEffect(event.clientX, event.clientY);
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("click", onMouseClick);
  };

  const createParticleEffect = (mouseX: number, mouseY: number) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((mouseX - rect.left) / rect.width) * 2 - 1;
    const y = -((mouseY - rect.top) / rect.height) * 2 + 1;

    // Convert screen coordinates to world coordinates
    const vector = new (require("three") as any).Vector3(x, y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    switch (effectType()) {
      case "fireworks":
        createFireworks(pos);
        break;
      case "fountain":
        createFountain(pos);
        break;
      case "spiral":
        createSpiral(pos);
        break;
      case "explosion":
        createExplosion(pos);
        break;
    }

    // Update score
    const newScore = score() + 10;
    setScore(newScore);
    props.onScoreUpdate(newScore);
  };

  const createFireworks = (position: any) => {
    const THREE = require("three") as any;
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new SphereGeometry(0.05, 8, 8);
      const material = new MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        transparent: true,
        opacity: 1,
      });

      const particle = new Mesh(geometry, material);
      particle.position.copy(position);

      scene.add(particle);

      const velocity = {
        x: (Math.random() - 0.5) * 0.3,
        y: Math.random() * 0.3 + 0.1,
        z: (Math.random() - 0.5) * 0.3,
      };

      const newParticle: Particle = {
        id: nextParticleId++,
        mesh: particle,
        velocity,
        life: 0,
        maxLife: 120 + Math.random() * 60,
      };

      setParticles((prev) => [...prev, newParticle]);
    }
  };

  const createFountain = (position: any) => {
    const THREE = require("three") as any;
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new SphereGeometry(0.03, 6, 6);
      const material = new MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6, 1, 0.7),
        transparent: true,
        opacity: 0.8,
      });

      const particle = new Mesh(geometry, material);
      particle.position.copy(position);

      scene.add(particle);

      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = {
        x: Math.cos(angle) * 0.1,
        y: Math.random() * 0.2 + 0.1,
        z: Math.sin(angle) * 0.1,
      };

      const newParticle: Particle = {
        id: nextParticleId++,
        mesh: particle,
        velocity,
        life: 0,
        maxLife: 90 + Math.random() * 30,
      };

      setParticles((prev) => [...prev, newParticle]);
    }
  };

  const createSpiral = (position: any) => {
    const THREE = require("three") as any;
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new SphereGeometry(0.04, 6, 6);
      const material = new MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.8, 1, 0.6),
        transparent: true,
        opacity: 0.9,
      });

      const particle = new Mesh(geometry, material);
      particle.position.copy(position);

      scene.add(particle);

      const t = i / particleCount;
      const velocity = {
        x: Math.cos(t * Math.PI * 4) * 0.15,
        y: 0.05,
        z: Math.sin(t * Math.PI * 4) * 0.15,
      };

      const newParticle: Particle = {
        id: nextParticleId++,
        mesh: particle,
        velocity,
        life: 0,
        maxLife: 150 + Math.random() * 50,
      };

      setParticles((prev) => [...prev, newParticle]);
    }
  };

  const createExplosion = (position: any) => {
    const THREE = require("three") as any;
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new SphereGeometry(0.06, 8, 8);
      const material = new MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.1, 1, 0.7),
        transparent: true,
        opacity: 1,
      });

      const particle = new Mesh(geometry, material);
      particle.position.copy(position);

      scene.add(particle);

      const velocity = {
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.4,
      };

      const newParticle: Particle = {
        id: nextParticleId++,
        mesh: particle,
        velocity,
        life: 0,
        maxLife: 60 + Math.random() * 40,
      };

      setParticles((prev) => [...prev, newParticle]);
    }
  };

  const gameUpdate = () => {
    if (!gameStarted()) return;

    // Update particles
    setParticles((prev) =>
      prev.filter((particle) => {
        particle.life++;

        // Update position
        particle.mesh.position.x += particle.velocity.x;
        particle.mesh.position.y += particle.velocity.y;
        particle.mesh.position.z += particle.velocity.z;

        // Apply gravity
        particle.velocity.y -= 0.005;

        // Fade out over time
        const lifeRatio = particle.life / particle.maxLife;
        particle.mesh.material.opacity = 1 - lifeRatio;

        // Remove dead particles
        if (particle.life >= particle.maxLife) {
          scene.remove(particle.mesh);
          return false;
        }

        return true;
      }),
    );

    setParticleCount(particles().length);
  };

  const cycleEffectType = () => {
    const types: Array<"fireworks" | "fountain" | "spiral" | "explosion"> = [
      "fireworks",
      "fountain",
      "spiral",
      "explosion",
    ];
    const currentIndex = types.indexOf(effectType());
    const nextIndex = (currentIndex + 1) % types.length;
    setEffectType(types[nextIndex]);
  };

  onMount(() => {
    gameLoop = setInterval(gameUpdate, 16);
  });

  onCleanup(() => {
    if (gameLoop) clearInterval(gameLoop);
  });

  return (
    <div class="particle-demo">
      <div class="game-hud">
        <div class="hud-item">
          <span class="hud-label">Score:</span>
          <span class="hud-value">{score()}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Particles:</span>
          <span class="hud-value">{particleCount()}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Effect:</span>
          <span class="hud-value">{effectType()}</span>
        </div>
      </div>

      <div class="game-instructions">
        <h3>✨ Particle Playground</h3>
        <p>
          Click anywhere to create particle effects! Each click creates 10
          points.
        </p>
        <p>🖱️ Move mouse to aim • Click to create effects</p>
        <button class="effect-toggle" onClick={cycleEffectType}>
          Switch Effect: {effectType()}
        </button>
      </div>

      <div class="game-viewport">
        <ThreeJSVisualization
          backgroundColor="#000022"
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={50}
          onSceneReady={setupGameScene}
          className="particle-demo-canvas"
        />
      </div>
    </div>
  );
};
