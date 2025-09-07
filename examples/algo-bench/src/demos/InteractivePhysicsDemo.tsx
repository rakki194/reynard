import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import { 
  batchCollisionDetection, 
  type AABB, 
  type CollisionResult 
} from "reynard-algorithms";

interface InteractivePhysicsDemoProps {
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
  mass: number;
  color: string;
  colliding: boolean;
  isStatic: boolean;
}

export const InteractivePhysicsDemo: Component<InteractivePhysicsDemoProps> = (props) => {
  const [objects, setObjects] = createSignal<PhysicsObject[]>([]);
  const [collisions, setCollisions] = createSignal<Array<{index1: number, index2: number, result: CollisionResult}>>([]);
  const [isRunning, setIsRunning] = createSignal(false);
  const [gravity, setGravity] = createSignal(0.5);
  const [damping, setDamping] = createSignal(0.98);
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>();
  const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [draggedObject, setDraggedObject] = createSignal<number | null>(null);
  const [stats, setStats] = createSignal({
    collisionChecks: 0,
    actualCollisions: 0,
    fps: 0,
    totalEnergy: 0
  });

  let animationFrameId: number;
  let lastTime = 0;
  let frameCount = 0;
  let fpsTime = 0;

  // Initialize physics objects
  const initializeObjects = () => {
    const newObjects: PhysicsObject[] = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    
    // Add some static objects (walls)
    newObjects.push(
      { id: 0, x: 0, y: 0, width: 800, height: 20, vx: 0, vy: 0, mass: Infinity, color: '#666666', colliding: false, isStatic: true },
      { id: 1, x: 0, y: 480, width: 800, height: 20, vx: 0, vy: 0, mass: Infinity, color: '#666666', colliding: false, isStatic: true },
      { id: 2, x: 0, y: 0, width: 20, height: 500, vx: 0, vy: 0, mass: Infinity, color: '#666666', colliding: false, isStatic: true },
      { id: 3, x: 780, y: 0, width: 20, height: 500, vx: 0, vy: 0, mass: Infinity, color: '#666666', colliding: false, isStatic: true }
    );

    // Add dynamic objects
    for (let i = 4; i < 15; i++) {
      newObjects.push({
        id: i,
        x: 100 + Math.random() * 600,
        y: 50 + Math.random() * 300,
        width: 20 + Math.random() * 30,
        height: 20 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        mass: 1 + Math.random() * 3,
        color: colors[i % colors.length],
        colliding: false,
        isStatic: false
      });
    }
    setObjects(newObjects);
  };

  // Update physics
  const updatePhysics = (deltaTime: number) => {
    setObjects(prev => prev.map(obj => {
      if (obj.isStatic) return obj;

      // Apply gravity
      const newVy = obj.vy + gravity() * deltaTime;
      
      // Update position
      let newX = obj.x + obj.vx * deltaTime;
      let newY = obj.y + newVy * deltaTime;
      let newVx = obj.vx * damping();
      let newVy2 = newVy * damping();

      // Bounce off walls with energy loss
      if (newX <= 20 || newX + obj.width >= 780) {
        newVx = -newVx * 0.8;
        newX = Math.max(20, Math.min(780 - obj.width, newX));
      }
      if (newY <= 20 || newY + obj.height >= 480) {
        newVy2 = -newVy2 * 0.8;
        newY = Math.max(20, Math.min(480 - obj.height, newY));
      }

      return {
        ...obj,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy2,
        colliding: false
      };
    }));
  };

  // Handle collision response
  const handleCollisionResponse = (obj1: PhysicsObject, obj2: PhysicsObject) => {
    if (obj1.isStatic && obj2.isStatic) return;

    // Calculate collision normal and relative velocity
    const dx = (obj2.x + obj2.width/2) - (obj1.x + obj1.width/2);
    const dy = (obj2.y + obj2.height/2) - (obj1.y + obj1.height/2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    // Separate objects
    const overlap = (obj1.width + obj2.width) / 2 - distance;
    if (overlap > 0) {
      const separationX = nx * overlap * 0.5;
      const separationY = ny * overlap * 0.5;

      if (!obj1.isStatic) {
        obj1.x -= separationX;
        obj1.y -= separationY;
      }
      if (!obj2.isStatic) {
        obj2.x += separationX;
        obj2.y += separationY;
      }
    }

    // Calculate relative velocity
    const relativeVx = obj2.vx - obj1.vx;
    const relativeVy = obj2.vy - obj1.vy;
    const relativeSpeed = relativeVx * nx + relativeVy * ny;

    if (relativeSpeed > 0) return; // Objects are separating

    // Calculate impulse
    const restitution = 0.8; // Bounciness
    const impulse = -(1 + restitution) * relativeSpeed / (1/obj1.mass + 1/obj2.mass);

    // Apply impulse
    if (!obj1.isStatic) {
      obj1.vx -= impulse * nx / obj1.mass;
      obj1.vy -= impulse * ny / obj1.mass;
    }
    if (!obj2.isStatic) {
      obj2.vx += impulse * nx / obj2.mass;
      obj2.vy += impulse * ny / obj2.mass;
    }
  };

  // Check collisions
  const checkCollisions = () => {
    const currentObjects = objects();
    const dynamicObjects = currentObjects.filter(obj => !obj.isStatic);
    const aabbs: AABB[] = dynamicObjects.map(obj => ({
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

    // Update collision state and handle responses
    setObjects(prev => prev.map(obj => ({ ...obj, colliding: false })));
    
    collisionResults.forEach(collision => {
      const obj1 = dynamicObjects[collision.index1];
      const obj2 = dynamicObjects[collision.index2];
      
      if (obj1 && obj2) {
        // Mark as colliding
        setObjects(prev => prev.map(obj => 
          obj.id === obj1.id || obj.id === obj2.id 
            ? { ...obj, colliding: true }
            : obj
        ));

        // Handle collision response
        handleCollisionResponse(obj1, obj2);
      }
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

  // Calculate total energy
  const calculateTotalEnergy = () => {
    const currentObjects = objects();
    let totalEnergy = 0;
    
    currentObjects.forEach(obj => {
      if (!obj.isStatic) {
        const kinetic = 0.5 * obj.mass * (obj.vx * obj.vx + obj.vy * obj.vy);
        const potential = obj.mass * gravity() * (500 - obj.y);
        totalEnergy += kinetic + potential;
      }
    });

    setStats(prev => ({ ...prev, totalEnergy }));
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

      // Draw velocity vector
      if (!obj.isStatic && (Math.abs(obj.vx) > 0.1 || Math.abs(obj.vy) > 0.1)) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width/2, obj.y + obj.height/2);
        ctx.lineTo(
          obj.x + obj.width/2 + obj.vx * 5,
          obj.y + obj.height/2 + obj.vy * 5
        );
        ctx.stroke();
      }
    });

    // Draw collision lines
    ctx.strokeStyle = '#ff4757';
    ctx.lineWidth = 2;
    const dynamicObjects = objects().filter(obj => !obj.isStatic);
    collisions().forEach(collision => {
      const obj1 = dynamicObjects[collision.index1];
      const obj2 = dynamicObjects[collision.index2];
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
    calculateTotalEnergy();
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (isDragging() && draggedObject() !== null) {
      const objId = draggedObject()!;
      setObjects(prev => prev.map(obj => 
        obj.id === objId && !obj.isStatic
          ? { ...obj, x: x - obj.width/2, y: y - obj.height/2, vx: 0, vy: 0 }
          : obj
      ));
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    const canvas = canvasRef();
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find object under mouse
    const clickedObject = objects().find(obj => 
      x >= obj.x && x <= obj.x + obj.width &&
      y >= obj.y && y <= obj.y + obj.height &&
      !obj.isStatic
    );

    if (clickedObject) {
      setIsDragging(true);
      setDraggedObject(clickedObject.id);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedObject(null);
  };

  const handleMouseClick = (e: MouseEvent) => {
    if (isDragging()) return;

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
      mass: 1 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      colliding: false,
      isStatic: false
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
    <div class="physics-demo">
      <div class="demo-controls">
        <div class="control-group">
          <label for="gravity-slider">Gravity: {gravity().toFixed(1)}</label>
          <input 
            id="gravity-slider"
            type="range" 
            min="0" 
            max="2" 
            step="0.1"
            value={gravity()}
            onInput={(e) => setGravity(parseFloat(e.currentTarget.value))}
            title="Adjust the gravity strength in the physics simulation"
          />
        </div>

        <div class="control-group">
          <label for="damping-slider">Damping: {damping().toFixed(2)}</label>
          <input 
            id="damping-slider"
            type="range" 
            min="0.9" 
            max="1" 
            step="0.01"
            value={damping()}
            onInput={(e) => setDamping(parseFloat(e.currentTarget.value))}
            title="Adjust the damping factor for object movement"
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
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleMouseClick}
          class="demo-canvas"
        />
        <div class="canvas-overlay">
          <p>Click to add objects • Drag to move objects • Yellow lines show velocity</p>
        </div>
      </div>

      <div class="demo-stats">
        <div class="stat-item">
          <span class="stat-label">Objects:</span>
          <span class="stat-value">{objects().filter(obj => !obj.isStatic).length}</span>
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
          <span class="stat-label">Total Energy:</span>
          <span class="stat-value">{stats().totalEnergy.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
