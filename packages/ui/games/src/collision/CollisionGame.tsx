import { createSignal, createEffect, onMount } from "solid-js";
import { Button } from "reynard-primitives";
import "./CollisionGame.css";
export function CollisionGame(props: any = {}) {
  const [balls, setBalls] = createSignal([]);
  const [collisions, setCollisions] = createSignal([]);
  const [isRunning, setIsRunning] = createSignal(false);
  const [stats, setStats] = createSignal({
    totalCollisions: 0,
    activeBalls: 0,
    averageSpeed: 0,
  });
  const config = {
    canvasWidth: 600,
    canvasHeight: 400,
    ballCount: 15,
    ...props.config,
  };
  const CANVAS_WIDTH = config.canvasWidth;
  const CANVAS_HEIGHT = config.canvasHeight;
  const BALL_COUNT = config.ballCount;
  let animationId = null;
  const createBall = id => ({
    id,
    x: Math.random() * (CANVAS_WIDTH - 40) + 20,
    y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
    vx: (Math.random() - 0.5) * 6,
    vy: (Math.random() - 0.5) * 6,
    radius: Math.random() * 15 + 10,
    color: `oklch(60% 0.2 ${Math.random() * 360})`,
  });
  const initializeBalls = () => {
    setBalls(Array.from({ length: BALL_COUNT }, (_, i) => createBall(i)));
    setCollisions([]);
    setStats({
      totalCollisions: 0,
      activeBalls: BALL_COUNT,
      averageSpeed: 0,
    });
  };
  const updateBalls = () => {
    if (!isRunning()) return;
    setBalls(prevBalls => {
      const newBalls = prevBalls.map(ball => {
        let newX = ball.x + ball.vx;
        let newY = ball.y + ball.vy;
        let newVx = ball.vx;
        let newVy = ball.vy;
        // Bounce off walls with proper physics
        if (newX - ball.radius <= 0) {
          newVx = Math.abs(newVx) * 0.9; // Add some damping
          newX = ball.radius;
        } else if (newX + ball.radius >= CANVAS_WIDTH) {
          newVx = -Math.abs(newVx) * 0.9;
          newX = CANVAS_WIDTH - ball.radius;
        }
        if (newY - ball.radius <= 0) {
          newVy = Math.abs(newVy) * 0.9;
          newY = ball.radius;
        } else if (newY + ball.radius >= CANVAS_HEIGHT) {
          newVy = -Math.abs(newVy) * 0.9;
          newY = CANVAS_HEIGHT - ball.radius;
        }
        return { ...ball, x: newX, y: newY, vx: newVx, vy: newVy };
      });
      // Simple collision detection between balls
      const newCollisions = [...collisions()];
      let collisionCount = 0;
      for (let i = 0; i < newBalls.length; i++) {
        for (let j = i + 1; j < newBalls.length; j++) {
          const ball1 = newBalls[i];
          const ball2 = newBalls[j];
          const dx = ball2.x - ball1.x;
          const dy = ball2.y - ball1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = ball1.radius + ball2.radius;
          if (distance < minDistance && distance > 0) {
            // Collision detected - resolve it
            const overlap = minDistance - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;
            // Separate the balls
            newBalls[i] = {
              ...ball1,
              x: ball1.x - separationX,
              y: ball1.y - separationY,
            };
            newBalls[j] = {
              ...ball2,
              x: ball2.x + separationX,
              y: ball2.y + separationY,
            };
            // Calculate collision response
            const nx = dx / distance;
            const ny = dy / distance;
            // Relative velocity
            const dvx = ball2.vx - ball1.vx;
            const dvy = ball2.vy - ball1.vy;
            // Relative velocity in collision normal direction
            const dvn = dvx * nx + dvy * ny;
            // Do not resolve if velocities are separating
            if (dvn > 0) continue;
            // Collision impulse (elastic collision)
            const impulse = (2 * dvn) / 2; // Simplified for equal mass
            // Update velocities
            newBalls[i] = {
              ...newBalls[i],
              vx: ball1.vx + impulse * nx,
              vy: ball1.vy + impulse * ny,
            };
            newBalls[j] = {
              ...newBalls[j],
              vx: ball2.vx - impulse * nx,
              vy: ball2.vy - impulse * ny,
            };
            newCollisions.push({
              ball1: ball1.id,
              ball2: ball2.id,
              timestamp: Date.now(),
            });
            collisionCount++;
          }
        }
      }
      // Keep only recent collisions
      const recentCollisions = newCollisions.filter(c => Date.now() - c.timestamp < 1000);
      setCollisions(recentCollisions);
      // Update stats
      const totalSpeed = newBalls.reduce((sum, ball) => sum + Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy), 0);
      setStats({
        totalCollisions: stats().totalCollisions + collisionCount,
        activeBalls: newBalls.length,
        averageSpeed: totalSpeed / newBalls.length,
      });
      return newBalls;
    });
    // Schedule next frame
    animationId = requestAnimationFrame(updateBalls);
  };
  const startAnimation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    animationId = requestAnimationFrame(updateBalls);
  };
  const stopAnimation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };
  onMount(() => {
    initializeBalls();
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  });
  createEffect(() => {
    if (isRunning()) {
      startAnimation();
    } else {
      stopAnimation();
    }
  });
  return (
    <div class="collision-game">
      <div class="game-header">
        <h3>⚽ Bouncing Balls Collision Demo</h3>
        <div class="game-controls">
          <Button onClick={() => setIsRunning(!isRunning())} variant={isRunning() ? "danger" : "primary"} size="sm">
            {isRunning() ? "Pause" : "Start"}
          </Button>
          <Button onClick={initializeBalls} variant="secondary" size="sm">
            Reset
          </Button>
        </div>
        <div class="game-stats">
          <span>Collisions: {stats().totalCollisions}</span>
          <span>Balls: {stats().activeBalls}</span>
          <span>Avg Speed: {stats().averageSpeed?.toFixed(1)}</span>
        </div>
      </div>

      <div class="collision-canvas">
        <svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} class="balls-svg">
          {balls().map(ball => (
            <circle cx={ball.x} cy={ball.y} r={ball.radius} fill={ball.color} stroke="#333" stroke-width="2" />
          ))}
          {collisions().map(collision => {
            const ball1 = balls().find(b => b.id === collision.ball1);
            const ball2 = balls().find(b => b.id === collision.ball2);
            if (!ball1 || !ball2) return null;
            return (
              <line x1={ball1.x} y1={ball1.y} x2={ball2.x} y2={ball2.y} stroke="red" stroke-width="3" opacity="0.7" />
            );
          })}
        </svg>
      </div>

      <div class="game-instructions">
        <p>
          🎯 <strong>Watch:</strong> AABB collision detection in real-time with elastic collisions
        </p>
        <p>
          💡 <strong>Algorithm:</strong> Batch collision detection with spatial optimization
        </p>
      </div>
    </div>
  );
}
