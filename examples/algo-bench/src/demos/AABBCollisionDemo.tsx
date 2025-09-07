import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import { 
  batchCollisionDetection, 
  type AABB, 
  type CollisionResult 
} from "reynard-algorithms";

interface AABBCollisionDemoProps {
  onStatsUpdate: (stats: any) => void;
}

interface PhysicsObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  color: string;
  colliding: boolean;
}

export const AABBCollisionDemo: Component<AABBCollisionDemoProps> = (props) => {
  const [objects, setObjects] = createSignal<PhysicsObject[]>([]);
  const [collisions, setCollisions] = createSignal<Array<{index1: number, index2: number, result: CollisionResult}>>([]);
  const [isRunning, setIsRunning] = createSignal(false);
  const [objectCount, setObjectCount] = createSignal(20);
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>();
  const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 });
  const [stats, setStats] = createSignal({
    collisionChecks: 0,
    actualCollisions: 0,
    fps: 0,
    lastFrameTime: 0
  });

  let animationFrameId: number;
  let lastTime = 0;
  let frameCount = 0;
  let fpsTime = 0;

  // Initialize objects
  const initializeObjects = () => {
    const newObjects: PhysicsObject[] = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    
    for (let i = 0; i < objectCount(); i++) {
      newObjects.push({
        id: i,
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
        width: 20 + Math.random() * 30,
        height: 20 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: colors[i % colors.length],
        colliding: false
      });
    }
    setObjects(newObjects);
  };

  // Update physics
  const updatePhysics = (deltaTime: number) => {
    const canvas = canvasRef();
    if (!canvas) return;

    setObjects(prev => prev.map(obj => {
      let newX = obj.x + obj.vx * deltaTime;
      let newY = obj.y + obj.vy * deltaTime;
      let newVx = obj.vx;
      let newVy = obj.vy;

      // Bounce off walls
      if (newX <= 0 || newX + obj.width >= canvas.width) {
        newVx = -newVx;
        newX = Math.max(0, Math.min(canvas.width - obj.width, newX));
      }
      if (newY <= 0 || newY + obj.height >= canvas.height) {
        newVy = -newVy;
        newY = Math.max(0, Math.min(canvas.height - obj.height, newY));
      }

      return {
        ...obj,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
        colliding: false
      };
    }));
  };

  // Check collisions
  const checkCollisions = () => {
    const currentObjects = objects();
    const aabbs: AABB[] = currentObjects.map(obj => ({
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height
    }));

    const startTime = performance.now();
    const collisionResults = batchCollisionDetection(aabbs, {
      spatialHash: {
        enableOptimization: true,
        cellSize: 50
      }
    });
    const endTime = performance.now();

    // Update collision state
    setObjects(prev => prev.map(obj => ({ ...obj, colliding: false })));
    
    collisionResults.forEach(collision => {
      setObjects(prev => prev.map((obj, index) => 
        index === collision.index1 || index === collision.index2 
          ? { ...obj, colliding: true }
          : obj
      ));
    });

    setCollisions(collisionResults);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      collisionChecks: aabbs.length * (aabbs.length - 1) / 2,
      actualCollisions: collisionResults.length,
      lastFrameTime: endTime - startTime
    }));
  };

  // Render frame
  const render = () => {
    const canvas = canvasRef();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw objects
    objects().forEach(obj => {
      ctx.fillStyle = obj.colliding ? '#ff4757' : obj.color;
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      
      // Draw border
      ctx.strokeStyle = obj.colliding ? '#ffffff' : '#333333';
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    });

    // Draw collision lines
    ctx.strokeStyle = '#ff4757';
    ctx.lineWidth = 2;
    collisions().forEach(collision => {
      const obj1 = objects()[collision.index1];
      const obj2 = objects()[collision.index2];
      if (obj1 && obj2) {
        ctx.beginPath();
        ctx.moveTo(
          obj1.x + obj1.width / 2,
          obj1.y + obj1.height / 2
        );
        ctx.lineTo(
          obj2.x + obj2.width / 2,
          obj2.y + obj2.height / 2
        );
        ctx.stroke();
      }
    });

    // Draw mouse cursor
    const mouse = mousePos();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
    ctx.fill();
  };

  // Animation loop
  const animate = (currentTime: number) => {
    if (!isRunning()) return;

    const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps
    lastTime = currentTime;

    updatePhysics(deltaTime);
    checkCollisions();
    render();

    // Calculate FPS
    frameCount++;
    fpsTime += deltaTime;
    if (fpsTime >= 60) {
      setStats(prev => ({ ...prev, fps: Math.round(frameCount * 60 / fpsTime) }));
      frameCount = 0;
      fpsTime = 0;
    }

    animationFrameId = requestAnimationFrame(animate);
  };

  // Mouse handlers
  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef();
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseClick = (e: MouseEvent) => {
    const canvas = canvasRef();
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add new object at mouse position
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const newObject: PhysicsObject = {
      id: Date.now(),
      x: x - 15,
      y: y - 15,
      width: 30,
      height: 30,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      colliding: false
    };

    setObjects(prev => [...prev, newObject]);
  };

  // Effects
  createEffect(() => {
    initializeObjects();
  });

  createEffect(() => {
    props.onStatsUpdate(stats());
  });

  createEffect(() => {
    if (isRunning()) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    } else {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    }
  });

  onCleanup(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });

  return (
    <div class="aabb-demo">
      <div class="demo-controls">
        <div class="control-group">
          <label for="object-count-slider">Object Count: {objectCount()}</label>
          <input 
            id="object-count-slider"
            type="range" 
            min="5" 
            max="100" 
            value={objectCount()}
            onInput={(e) => setObjectCount(parseInt(e.currentTarget.value))}
            title="Adjust the number of objects in the simulation"
          />
        </div>
        
        <div class="control-group">
          <button 
            class={`control-button ${isRunning() ? 'active' : ''}`}
            onClick={() => setIsRunning(!isRunning())}
          >
            {isRunning() ? '⏸️ Pause' : '▶️ Start'}
          </button>
          
          <button 
            class="control-button"
            onClick={initializeObjects}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div class="demo-canvas-container">
        <canvas
          ref={setCanvasRef}
          width={800}
          height={500}
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
          class="demo-canvas"
        />
        <div class="canvas-overlay">
          <p>Click to add objects • Drag to interact</p>
        </div>
      </div>

      <div class="demo-stats">
        <div class="stat-item">
          <span class="stat-label">Objects:</span>
          <span class="stat-value">{objects().length}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Collisions:</span>
          <span class="stat-value">{collisions().length}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">FPS:</span>
          <span class="stat-value">{stats().fps}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Frame Time:</span>
          <span class="stat-value">{stats().lastFrameTime.toFixed(2)}ms</span>
        </div>
      </div>
    </div>
  );
};
