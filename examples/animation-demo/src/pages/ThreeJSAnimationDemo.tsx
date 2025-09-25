/**
 * 🎪 Three.js Animation Demo
 *
 * Showcase of 3D animations and WebGL effects
 */

import { Component, createSignal, onCleanup } from "solid-js";
import { useThreeDAnimation } from "reynard-animation";

export const ThreeJSAnimationDemo: Component = () => {
  const [sceneConfig, setSceneConfig] = createSignal({
    cameraPosition: { x: 0, y: 0, z: 5 },
    rotationSpeed: 0.01,
    animationDuration: 3000,
    particleCount: 100,
  });

  const [isAnimating, setIsAnimating] = createSignal(false);
  const [animationType, setAnimationType] = createSignal<"rotation" | "cluster" | "particles">("rotation");

  const threeDAnimation = useThreeDAnimation();

  let animationId: number | null = null;

  const startAnimation = async () => {
    setIsAnimating(true);

    if (animationType() === "rotation") {
      await startRotationAnimation();
    } else if (animationType() === "cluster") {
      await startClusterAnimation();
    } else if (animationType() === "particles") {
      await startParticleAnimation();
    }
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    threeDAnimation.controls.stopAllAnimations();
  };

  const startRotationAnimation = async () => {
    // Create a camera animation for rotation effect
    await threeDAnimation.controls.createCameraAnimation({
      duration: sceneConfig().animationDuration,
      easing: "easeInOutCubic",
      startPosition: [0, 0, 5],
      endPosition: [0, 0, 5],
      startTarget: [0, 0, 0],
      endTarget: [0, 0, 0],
      rotationSpeed: sceneConfig().rotationSpeed,
    });
  };

  const startClusterAnimation = async () => {
    // Create a cluster animation
    await threeDAnimation.controls.createClusterAnimation({
      duration: sceneConfig().animationDuration,
      easing: "easeOutElastic",
      clusterId: "demo-cluster",
      points: Array.from({ length: sceneConfig().particleCount }, (_, i) => ({
        id: `point-${i}`,
        position: [Math.sin(i * 0.1) * 2, Math.cos(i * 0.1) * 2, Math.sin(i * 0.2) * 1] as [number, number, number],
      })),
      center: [0, 0, 0],
      expansionRadius: 2,
    });
  };

  const startParticleAnimation = async () => {
    // Create multiple point animations for particle effect
    const particleCount = Math.min(sceneConfig().particleCount, 50); // Limit for performance

    for (let i = 0; i < particleCount; i++) {
      await threeDAnimation.controls.createPointAnimation({
        duration: sceneConfig().animationDuration,
        easing: "easeOutBounce",
        pointId: `particle-${i}`,
        startPosition: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4] as [
          number,
          number,
          number,
        ],
        endPosition: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4] as [
          number,
          number,
          number,
        ],
        startSize: 0.1,
        endSize: 0.2,
        startColor: [Math.random(), 0.8, 0.6],
        endColor: [Math.random(), 0.8, 0.6],
      });
    }
  };

  onCleanup(() => {
    stopAnimation();
  });

  return (
    <div class="threejs-animation-demo">
      <div class="demo-header">
        <h1 class="page-title">🎪 Three.js Animation Demo</h1>
        <p class="page-description">
          Interactive 3D animations powered by Three.js with WebGL rendering and smooth transitions.
        </p>
      </div>

      {/* Controls */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎛️</span>
          3D Scene Controls
        </h2>
        <div class="demo-controls">
          <div class="control-group">
            <label class="control-label">Animation Type</label>
            <select
              value={animationType()}
              onChange={e => setAnimationType(e.currentTarget.value as "rotation" | "cluster" | "particles")}
            >
              <option value="rotation">Rotation</option>
              <option value="cluster">Cluster</option>
              <option value="particles">Particles</option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label">Animation Duration (ms)</label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={sceneConfig().animationDuration}
              onInput={e =>
                setSceneConfig(prev => ({
                  ...prev,
                  animationDuration: parseInt(e.currentTarget.value),
                }))
              }
            />
            <span class="control-value">{sceneConfig().animationDuration}ms</span>
          </div>

          <div class="control-group">
            <label class="control-label">Particle Count</label>
            <input
              type="range"
              min="50"
              max="500"
              step="25"
              value={sceneConfig().particleCount}
              onInput={e =>
                setSceneConfig(prev => ({
                  ...prev,
                  particleCount: parseInt(e.currentTarget.value),
                }))
              }
            />
            <span class="control-value">{sceneConfig().particleCount}</span>
          </div>

          <div class="control-group">
            <label class="control-label">Camera X</label>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={sceneConfig().cameraPosition.x}
              onInput={e =>
                setSceneConfig(prev => ({
                  ...prev,
                  cameraPosition: { ...prev.cameraPosition, x: parseFloat(e.currentTarget.value) },
                }))
              }
            />
            <span class="control-value">{sceneConfig().cameraPosition.x}</span>
          </div>

          <div class="control-group">
            <label class="control-label">Camera Y</label>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={sceneConfig().cameraPosition.y}
              onInput={e =>
                setSceneConfig(prev => ({
                  ...prev,
                  cameraPosition: { ...prev.cameraPosition, y: parseFloat(e.currentTarget.value) },
                }))
              }
            />
            <span class="control-value">{sceneConfig().cameraPosition.y}</span>
          </div>

          <div class="control-group">
            <label class="control-label">Camera Z</label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={sceneConfig().cameraPosition.z}
              onInput={e =>
                setSceneConfig(prev => ({
                  ...prev,
                  cameraPosition: { ...prev.cameraPosition, z: parseFloat(e.currentTarget.value) },
                }))
              }
            />
            <span class="control-value">{sceneConfig().cameraPosition.z}</span>
          </div>

          <div class="control-group">
            <button class="control-button primary" onClick={startAnimation} disabled={isAnimating()}>
              {isAnimating() ? "🎪 Animating..." : "🎪 Start Animation"}
            </button>
            <button class="control-button" onClick={stopAnimation} disabled={!isAnimating()}>
              ⏹️ Stop Animation
            </button>
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎨</span>
          3D Scene
        </h2>
        <div class="threejs-scene">
          <div class="scene-container">
            <div class="scene-placeholder">
              <div class="scene-info">
                <h3>3D Scene Placeholder</h3>
                <p>In a real implementation, this would contain a Three.js WebGL canvas</p>
                <div class="scene-stats">
                  <div class="stat">
                    <span class="stat-label">Animation Type:</span>
                    <span class="stat-value">{animationType()}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Particle Count:</span>
                    <span class="stat-value">{sceneConfig().particleCount}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Camera Position:</span>
                    <span class="stat-value">
                      ({sceneConfig().cameraPosition.x}, {sceneConfig().cameraPosition.y},{" "}
                      {sceneConfig().cameraPosition.z})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Status */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>📊</span>
          Animation Status
        </h2>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Is Animating:</span>
            <span class="status-value">{isAnimating() ? "Yes" : "No"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Animation Type:</span>
            <span class="status-value">{animationType()}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Animation Engine:</span>
            <span class="status-value">{threeDAnimation.animationEngine()}</span>
          </div>
          <div class="status-item">
            <span class="status-label">System Available:</span>
            <span class="status-value">{threeDAnimation.isSystemAvailable() ? "Yes" : "No"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Point Animations:</span>
            <span class="status-value">{threeDAnimation.state().pointAnimations.length}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Cluster Animations:</span>
            <span class="status-value">{threeDAnimation.state().clusterAnimations.length}</span>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>💻</span>
          Code Example
        </h2>
        <pre class="code-example">
          {`import { useThreeDAnimation } from "reynard-animation";

const threeDAnimation = useThreeDAnimation();

// Start camera animation
await threeDAnimation.controls.createCameraAnimation({
  duration: 3000,
  easing: "easeInOutCubic",
  startPosition: [0, 0, 5],
  endPosition: [0, 0, 5],
  startTarget: [0, 0, 0],
  endTarget: [0, 0, 0],
  rotationSpeed: 0.01
});

// Create cluster animation
await threeDAnimation.controls.createClusterAnimation({
  duration: 2000,
  easing: "easeOutElastic",
  clusterId: "my-cluster",
  points: [...],
  center: [0, 0, 0],
  expansionRadius: 2
});

// Create point animation
await threeDAnimation.controls.createPointAnimation({
  duration: 1500,
  easing: "easeOutBounce",
  pointId: "my-point",
  startPosition: [0, 0, 0],
  endPosition: [1, 1, 1],
  startSize: 0.1,
  endSize: 0.2,
  startColor: [0.5, 0.8, 0.6],
  endColor: [0.8, 0.6, 0.9]
});`}
        </pre>
      </div>
    </div>
  );
};
