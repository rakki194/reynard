/**
 * 🌹 Phyllotactic Rose Petal Growth Demo
 * Beautiful 3D rose petal growth animation using phyllotactic mathematics
 */

import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { Card, Button } from "reynard-components";
import {
  RosePetalGrowthSystem,
  RosePetalRenderer,
  type RosePetal,
} from "../utils/phyllotactic";
import "./PhyllotacticRosePetalDemo.css";

export const PhyllotacticRosePetalDemo: Component = () => {
  console.log("🌹 PhyllotacticRosePetalDemo: Initializing");

  // State
  const [isGrowing, setIsGrowing] = createSignal(false);
  const [petalCount, setPetalCount] = createSignal(200);
  const [growthSpeed, setGrowthSpeed] = createSignal(0.02);
  const [maxPetalSize, setMaxPetalSize] = createSignal(40);
  const [colorVariation, setColorVariation] = createSignal(0.3);
  const [animationSpeed, setAnimationSpeed] = createSignal(1.0);
  const [enableOrganicMovement, setEnableOrganicMovement] = createSignal(true);
  const [enablePetalRotation, setEnablePetalRotation] = createSignal(true);
  const [currentPetals, setCurrentPetals] = createSignal<RosePetal[]>([]);
  const [growthPhase, setGrowthPhase] = createSignal("bud");
  const [fps, setFps] = createSignal(60);

  // Natural growth state
  const [growthMode, setGrowthMode] = createSignal("gaussian");
  const [unfoldSpeed, setUnfoldSpeed] = createSignal(0.03);
  const [bundleGrowthDelay, setBundleGrowthDelay] = createSignal(0.2);
  const [sepalVisibility, setSepalVisibility] = createSignal(true);

  // System
  let roseSystem: RosePetalGrowthSystem;
  let renderer: RosePetalRenderer;
  let canvas: HTMLCanvasElement;
  let animationId: number;
  let lastTime = 0;
  let frameCount = 0;
  let lastFpsTime = 0;

  // Initialize the rose system
  const initializeRoseSystem = () => {
    console.log("🌹 PhyllotacticRosePetalDemo: Initializing rose system");

    roseSystem = new RosePetalGrowthSystem({
      petalCount: petalCount(),
      growthSpeed: growthSpeed(),
      maxPetalSize: maxPetalSize(),
      colorVariation: colorVariation(),
      animationSpeed: animationSpeed(),
      centerX: 400,
      centerY: 300,
      baseRadius: 20,
    });

    renderer = new RosePetalRenderer(canvas);
    roseSystem.initializeRose();
  };

  // Render petals with beautiful organic shapes
  const renderPetals = (petals: RosePetal[]) => {
    if (!renderer) return;

    renderer.renderPetals(petals);
    renderer.drawGrowthPhaseIndicator(
      growthPhase(),
      currentPetals().length,
      fps(),
    );
  };

  // Animation loop
  const animate = (currentTime: number) => {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update FPS counter
    frameCount++;
    if (currentTime - lastFpsTime >= 1000) {
      setFps(Math.round((frameCount * 1000) / (currentTime - lastFpsTime)));
      frameCount = 0;
      lastFpsTime = currentTime;
    }

    if (isGrowing()) {
      // Update rose system
      roseSystem.update(deltaTime);

      // Get current state
      setCurrentPetals(roseSystem.getPetals());
      setGrowthPhase(roseSystem.getGrowthPhase());

      // Render
      renderPetals(currentPetals());
    }

    animationId = requestAnimationFrame(animate);
  };

  // Start/stop animation
  const toggleGrowth = () => {
    if (isGrowing()) {
      setIsGrowing(false);
      roseSystem.stopGrowth();
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    } else {
      setIsGrowing(true);
      roseSystem.startGrowth();
      lastTime = performance.now();
      animationId = requestAnimationFrame(animate);
    }
  };

  // Reset the rose
  const resetRose = () => {
    roseSystem.reset();
    setCurrentPetals(roseSystem.getPetals());
    setGrowthPhase(roseSystem.getGrowthPhase());
    renderPetals(currentPetals());
  };

  // Update configuration
  const updateConfig = () => {
    roseSystem.updateConfig({
      petalCount: petalCount(),
      growthSpeed: growthSpeed(),
      maxPetalSize: maxPetalSize(),
      colorVariation: colorVariation(),
      animationSpeed: animationSpeed(),
      growthMode: growthMode() as any,
      unfoldSpeed: unfoldSpeed(),
      bundleGrowthDelay: bundleGrowthDelay(),
      sepalVisibility: sepalVisibility(),
    });
  };

  // Lifecycle
  onMount(() => {
    console.log("🌹 PhyllotacticRosePetalDemo: onMount - setting up canvas");
    canvas = document.getElementById("rose-canvas") as HTMLCanvasElement;
    if (canvas) {
      canvas.width = 800;
      canvas.height = 600;
    }

    initializeRoseSystem();
    setCurrentPetals(roseSystem.getPetals());
    setGrowthPhase(roseSystem.getGrowthPhase());
    renderPetals(currentPetals());
  });

  onCleanup(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });

  return (
    <div class="phyllotactic-rose-demo">
      <div class="demo-header">
        <h2>🌹 Phyllotactic Rose Petal Growth</h2>
        <p>
          Beautiful organic rose petal growth animation using phyllotactic
          mathematics
        </p>
      </div>

      <div class="demo-content">
        <div class="demo-controls">
          <Card class="growth-controls">
            <h3>Growth Configuration</h3>

            <div class="control-group">
              <label>Petal Count: {petalCount()}</label>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={petalCount()}
                onInput={(e: any) => {
                  setPetalCount(parseInt(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <label>Growth Speed: {growthSpeed().toFixed(3)}</label>
              <input
                type="range"
                min="0.005"
                max="0.1"
                step="0.005"
                value={growthSpeed()}
                onInput={(e: any) => {
                  setGrowthSpeed(parseFloat(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <label>Max Petal Size: {maxPetalSize()}</label>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={maxPetalSize()}
                onInput={(e: any) => {
                  setMaxPetalSize(parseInt(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <label>Color Variation: {colorVariation().toFixed(2)}</label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={colorVariation()}
                onInput={(e: any) => {
                  setColorVariation(parseFloat(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <label>Animation Speed: {animationSpeed().toFixed(1)}x</label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={animationSpeed()}
                onInput={(e: any) => {
                  setAnimationSpeed(parseFloat(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <label>Growth Mode</label>
              <select
                value={growthMode()}
                onChange={(e: any) => {
                  setGrowthMode(e.currentTarget.value);
                  updateConfig();
                }}
              >
                <option value="gaussian">Gaussian (Original)</option>
                <option value="natural">Natural (Botanical)</option>
                <option value="hybrid">Hybrid (Smooth Natural)</option>
              </select>
            </div>

            <div class="control-group">
              <label>Unfold Speed: {unfoldSpeed().toFixed(3)}</label>
              <input
                type="range"
                min="0.01"
                max="0.05"
                step="0.005"
                value={unfoldSpeed()}
                onInput={(e: any) => {
                  setUnfoldSpeed(parseFloat(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <label>
                Bundle Growth Delay: {bundleGrowthDelay().toFixed(2)}s
              </label>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={bundleGrowthDelay()}
                onInput={(e: any) => {
                  setBundleGrowthDelay(parseFloat(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <input
                type="checkbox"
                checked={sepalVisibility()}
                onChange={(e) => {
                  setSepalVisibility(e.currentTarget.checked);
                  updateConfig();
                }}
              />
              <label>Show Sepals (Green Points)</label>
            </div>
          </Card>

          <Card class="animation-controls">
            <h3>Animation Effects</h3>

            <div class="control-group">
              <input
                type="checkbox"
                checked={enableOrganicMovement()}
                onChange={(e) =>
                  setEnableOrganicMovement(e.currentTarget.checked)
                }
              />
              <label>Enable Organic Movement</label>
            </div>

            <div class="control-group">
              <input
                type="checkbox"
                checked={enablePetalRotation()}
                onChange={(e) =>
                  setEnablePetalRotation(e.currentTarget.checked)
                }
              />
              <label>Enable Petal Rotation</label>
            </div>

            <div class="control-group">
              <Button
                variant="secondary"
                onClick={resetRose}
                class="control-button"
              >
                🌱 Reset Rose
              </Button>
            </div>

            <div class="control-group">
              <Button
                variant={isGrowing() ? "danger" : "primary"}
                onClick={toggleGrowth}
                class="control-button"
              >
                {isGrowing() ? "⏹️ Stop Growth" : "🌹 Start Growth"}
              </Button>
            </div>
          </Card>

          <Card class="info-panel">
            <h3>Rose Information</h3>
            <div class="info-content">
              <div class="info-item">
                <span class="info-label">Growth Phase:</span>
                <span class="info-value">
                  {growthPhase().charAt(0).toUpperCase() +
                    growthPhase().slice(1)}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Petal Count:</span>
                <span class="info-value">{currentPetals().length}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Animation FPS:</span>
                <span class="info-value">{fps()}</span>
              </div>
            </div>
          </Card>
        </div>

        <div class="demo-visualization">
          <Card class="canvas-container">
            <canvas id="rose-canvas" class="demo-canvas"></canvas>
            <div class="canvas-overlay">
              <div class="overlay-info">
                <h4>🌹 Rose Petal Growth</h4>
                <p>Watch the beautiful phyllotactic pattern unfold</p>
                <p>Each petal follows the golden angle of 137.5°</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div class="demo-info">
        <Card class="info-panel">
          <h3>Phyllotactic Rose Features</h3>
          <div class="feature-descriptions">
            <div class="feature-description">
              <h4>🌱 Organic Growth</h4>
              <p>
                Petals grow naturally following the golden angle (137.5°)
                creating the perfect spiral pattern found in nature.
              </p>
            </div>
            <div class="feature-description">
              <h4>🎨 Dynamic Colors</h4>
              <p>
                Each petal has unique colors that transition from deep purples
                in the center to vibrant reds and oranges on the outer edges.
              </p>
            </div>
            <div class="feature-description">
              <h4>🌊 Organic Movement</h4>
              <p>
                Subtle organic movement and rotation make each petal feel alive
                and natural, just like a real rose in a gentle breeze.
              </p>
            </div>
            <div class="feature-description">
              <h4>⏱️ Growth Phases</h4>
              <p>
                Watch the rose progress through bud, blooming, full bloom, and
                wilting phases with realistic timing and behavior.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
