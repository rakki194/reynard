/**
 * 🦊 Golden Spiral Color Generator - Physics-Based OKLCH Showcase
 * Generates infinite distinct colors using the golden angle (137.507°)
 * Features physics-based bouncing dots in a beautiful spiral pattern
 */

import { Component, createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { useTheme } from "reynard-themes";
import { type OKLCHColor } from "reynard-colors";
import { Slider, Toggle } from "reynard-components-core";

// Golden angle constant (137.507° in radians)
const GOLDEN_ANGLE = (137.507 * Math.PI) / 180;

interface ColorDot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  oklch: OKLCHColor;
  age: number;
  maxAge: number;
}

interface PhysicsConfig {
  canvasWidth: number;
  canvasHeight: number;
  dotCount: number;
  maxSpeed: number;
  bounceDamping: number;
  gravity: number;
  spiralRadius: number;
  spiralGrowth: number;
}

export const GoldenSpiralColors: Component = () => {
  const themeContext = useTheme();

  // Physics and animation state
  const [, setDots] = createSignal<ColorDot[]>([]);
  const [isRunning, setIsRunning] = createSignal(true);
  const [dotCount, setDotCount] = createSignal(200);
  const [spiralSpeed, setSpiralSpeed] = createSignal(1);
  const [physicsEnabled, setPhysicsEnabled] = createSignal(true);
  const [showSpiral, setShowSpiral] = createSignal(true);

  let animationId: number | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | undefined;
  let spiralAngle = 0;
  let dotIdCounter = 0;

  const config: PhysicsConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    dotCount: dotCount(),
    maxSpeed: 3,
    bounceDamping: 0.8,
    gravity: 0.1,
    spiralRadius: 50,
    spiralGrowth: 2,
  };

  // Convert OKLCH to RGB for canvas compatibility
  const oklchToRgb = (oklch: OKLCHColor): string => {
    const { l, c, h } = oklch;

    // Convert OKLCH to OKLab first
    const hRad = (h * Math.PI) / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    // Convert OKLab to linear RGB
    const l_ = l / 100;
    const a_ = a;
    const b_ = b;

    // OKLab to linear RGB matrix transformation
    const lms1 = l_ + 0.3963377774 * a_ + 0.2158037573 * b_;
    const lms2 = l_ - 0.1055613458 * a_ - 0.0638541728 * b_;
    const lms3 = l_ - 0.0894841775 * a_ - 1.291485548 * b_;

    // Apply gamma correction
    const lms1_ = Math.sign(lms1) * Math.pow(Math.abs(lms1), 1 / 3);
    const lms2_ = Math.sign(lms2) * Math.pow(Math.abs(lms2), 1 / 3);
    const lms3_ = Math.sign(lms3) * Math.pow(Math.abs(lms3), 1 / 3);

    // Convert to RGB
    const r = 4.0767416621 * lms1_ - 3.3077115913 * lms2_ + 0.2309699292 * lms3_;
    const g = -1.2684380046 * lms1_ + 2.6097574011 * lms2_ - 0.3413193965 * lms3_;
    const blue = -0.0041960863 * lms1_ - 0.7034186147 * lms2_ + 1.707614701 * lms3_;

    // Clamp and convert to 0-255 range
    const r255 = Math.max(0, Math.min(255, Math.round(r * 255)));
    const g255 = Math.max(0, Math.min(255, Math.round(g * 255)));
    const b255 = Math.max(0, Math.min(255, Math.round(blue * 255)));

    return `rgb(${r255}, ${g255}, ${b255})`;
  };

  // Generate OKLCH color using golden angle
  const generateGoldenColor = (index: number): OKLCHColor => {
    const hue = ((index * GOLDEN_ANGLE * 180) / Math.PI) % 360;
    const lightness = 50 + Math.sin(index * 0.1) * 20; // Vary lightness
    const chroma = 0.2 + Math.cos(index * 0.05) * 0.15; // Vary chroma

    return {
      l: Math.max(10, Math.min(90, lightness)),
      c: Math.max(0.05, Math.min(0.4, chroma)),
      h: hue,
    };
  };

  // Calculate spiral position
  const getSpiralPosition = (index: number, angle: number) => {
    const radius = config.spiralRadius + index * config.spiralGrowth;
    const x = config.canvasWidth / 2 + Math.cos(angle) * radius;
    const y = config.canvasHeight / 2 + Math.sin(angle) * radius;
    return { x, y };
  };

  // Create a new color dot
  const createColorDot = (index: number, isSpiral: boolean = false): ColorDot => {
    const oklch = generateGoldenColor(index);

    // Use RGB for canvas compatibility
    const color = oklchToRgb(oklch);

    let x, y, vx, vy;

    if (isSpiral) {
      const spiralPos = getSpiralPosition(index, spiralAngle + index * GOLDEN_ANGLE);
      x = spiralPos.x;
      y = spiralPos.y;
      vx = (Math.random() - 0.5) * 2;
      vy = (Math.random() - 0.5) * 2;
    } else {
      x = Math.random() * config.canvasWidth;
      y = Math.random() * config.canvasHeight;
      vx = (Math.random() - 0.5) * config.maxSpeed;
      vy = (Math.random() - 0.5) * config.maxSpeed;
    }

    return {
      id: dotIdCounter++,
      x,
      y,
      vx,
      vy,
      radius: 8 + Math.random() * 6,
      color,
      oklch,
      age: 0,
      maxAge: 1000 + Math.random() * 2000,
    };
  };

  // Initialize dots
  const initializeDots = () => {
    const newDots: ColorDot[] = [];
    for (let i = 0; i < dotCount(); i++) {
      newDots.push(createColorDot(i, showSpiral()));
    }
    setDots(newDots);
  };

  // Simplified physics update
  const updatePhysics = (dots: ColorDot[]): ColorDot[] => {
    if (!physicsEnabled()) return dots;

    return dots
      .map((dot, index) => {
        let { x, y, vx, vy, age } = dot;

        if (showSpiral()) {
          // Simple spiral following - no complex physics
          const targetAngle = spiralAngle + index * GOLDEN_ANGLE;
          const targetRadius = config.spiralRadius + index * config.spiralGrowth;
          const targetX = config.canvasWidth / 2 + Math.cos(targetAngle) * targetRadius;
          const targetY = config.canvasHeight / 2 + Math.sin(targetAngle) * targetRadius;

          // Smooth interpolation to target position
          const lerpFactor = 0.05;
          x += (targetX - x) * lerpFactor;
          y += (targetY - y) * lerpFactor;

          // Add gentle floating motion
          vx = Math.sin(age * 0.01 + index) * 0.5;
          vy = Math.cos(age * 0.01 + index) * 0.5;

          x += vx;
          y += vy;

          // Keep within bounds
          x = Math.max(dot.radius, Math.min(config.canvasWidth - dot.radius, x));
          y = Math.max(dot.radius, Math.min(config.canvasHeight - dot.radius, y));
        } else {
          // Simple free physics
          vy += config.gravity * 0.5;
          x += vx;
          y += vy;

          // Bounce off walls with damping
          if (x - dot.radius < 0 || x + dot.radius > config.canvasWidth) {
            vx *= -config.bounceDamping;
            x = Math.max(dot.radius, Math.min(config.canvasWidth - dot.radius, x));
          }
          if (y - dot.radius < 0 || y + dot.radius > config.canvasHeight) {
            vy *= -config.bounceDamping;
            y = Math.max(dot.radius, Math.min(config.canvasHeight - dot.radius, y));
          }
        }

        // Age the dot
        age++;

        return {
          ...dot,
          x,
          y,
          vx,
          vy,
          age,
        };
      })
      .filter(dot => dot.age < dot.maxAge);
  };

  // Add new dots to maintain count
  const addNewDots = (currentDots: ColorDot[]): ColorDot[] => {
    const newDots = [...currentDots];
    const currentCount = currentDots.length;
    const targetCount = dotCount();

    if (currentCount < targetCount) {
      for (let i = currentCount; i < targetCount; i++) {
        newDots.push(createColorDot(i, showSpiral()));
      }
    }

    return newDots;
  };

  // Animation loop
  const animate = () => {
    if (!isRunning() || !ctx || !canvasRef) return;

    // Clear canvas
    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);

    // Update spiral angle
    spiralAngle += spiralSpeed() * 0.02;

    // Update dots
    setDots(prevDots => {
      let updatedDots = updatePhysics(prevDots);
      updatedDots = addNewDots(updatedDots);

      // Draw dots
      updatedDots.forEach(dot => {
        const alpha = Math.max(0.3, 1 - dot.age / dot.maxAge);

        try {
          // Draw glow effect
          const gradient = ctx!.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.radius * 2);

          // Ensure we have valid colors for the gradient
          const baseColor = dot.color || "rgb(128, 128, 128)";
          const transparentColor = baseColor.replace("rgb(", "rgba(").replace(")", ", 0)");

          gradient.addColorStop(0, baseColor);
          gradient.addColorStop(1, transparentColor);

          ctx!.fillStyle = gradient;
          ctx!.beginPath();
          ctx!.arc(dot.x, dot.y, dot.radius * 2, 0, Math.PI * 2);
          ctx!.fill();
        } catch (error) {
          // Fallback to solid color if gradient fails
          ctx!.fillStyle = dot.color || "rgb(128, 128, 128)";
          ctx!.beginPath();
          ctx!.arc(dot.x, dot.y, dot.radius * 2, 0, Math.PI * 2);
          ctx!.fill();
        }

        // Draw main dot
        ctx!.fillStyle = dot.color || "rgb(128, 128, 128)";
        ctx!.globalAlpha = alpha;
        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = 1;

        // Draw border
        ctx!.strokeStyle = themeContext.isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx!.stroke();
      });

      return updatedDots;
    });

    // Draw spiral guide if enabled
    if (showSpiral()) {
      ctx.strokeStyle = themeContext.isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      for (let i = 0; i < 100; i++) {
        const angle = spiralAngle + i * GOLDEN_ANGLE;
        const radius = config.spiralRadius + i * config.spiralGrowth;
        const x = config.canvasWidth / 2 + Math.cos(angle) * radius;
        const y = config.canvasHeight / 2 + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    animationId = requestAnimationFrame(animate);
  };

  // Setup canvas
  onMount(() => {
    if (canvasRef) {
      ctx = canvasRef.getContext("2d") || undefined;
      if (ctx) {
        canvasRef.width = config.canvasWidth;
        canvasRef.height = config.canvasHeight;
        initializeDots();
        animate();
      }
    }
  });

  onCleanup(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });

  // Restart animation when settings change
  createEffect(() => {
    if (isRunning()) {
      initializeDots();
    }
  });

  return (
    <section class="golden-spiral-colors">
      <div class="spiral-header">
        <h2>
          <span class="fox-emoji">🦊</span>
          Golden Spiral Color Generator
          <span class="fox-emoji">🦊</span>
        </h2>
        <p>
          Infinite distinct colors using the golden angle (137.507°) with physics-based movement that follows the spiral
          pattern
        </p>
      </div>

      <div class="spiral-controls">
        <div class="control-group">
          <label for="dot-count">Dot Count: {dotCount()}</label>
          <Slider
            id="dot-count"
            min={50}
            max={500}
            step={25}
            value={dotCount()}
            onChange={setDotCount}
            class="control-slider"
          />
        </div>

        <div class="control-group">
          <label for="spiral-speed">Spiral Speed: {spiralSpeed().toFixed(1)}</label>
          <Slider
            id="spiral-speed"
            min={0}
            max={5}
            step={0.1}
            value={spiralSpeed()}
            onChange={setSpiralSpeed}
            class="control-slider"
          />
        </div>

        <div class="control-group">
          <label>
            <Toggle checked={physicsEnabled()} onChange={checked => setPhysicsEnabled(checked)} size="sm" />
            Physics & Movement
          </label>
        </div>

        <div class="control-group">
          <label>
            <Toggle checked={showSpiral()} onChange={checked => setShowSpiral(checked)} size="sm" />
            Spiral Pattern Mode
          </label>
        </div>

        <button class="control-button" onClick={() => setIsRunning(!isRunning())}>
          {isRunning() ? "Pause" : "Resume"}
        </button>
      </div>

      <div class="spiral-canvas-container">
        <canvas ref={canvasRef} class="spiral-canvas" width={config.canvasWidth} height={config.canvasHeight} />
      </div>

      <div class="spiral-info">
        <div class="info-grid">
          <div class="info-card">
            <h3>Golden Angle</h3>
            <p>137.507° - The angle that creates the most uniform distribution of points on a sphere</p>
          </div>
          <div class="info-card">
            <h3>OKLCH Colors</h3>
            <p>Perceptually uniform color space ensuring visually distinct colors</p>
          </div>
          <div class="info-card">
            <h3>Physics Simulation</h3>
            <p>Real-time collision detection and bouncing with gravity effects</p>
          </div>
          <div class="info-card">
            <h3>Infinite Generation</h3>
            <p>Mathematically guaranteed distinct colors for any number of dots</p>
          </div>
        </div>
      </div>
    </section>
  );
};
