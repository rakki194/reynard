/**
 * 📊 Animation Dashboard
 *
 * Overview page showcasing all animation system features
 */

import { Component, createSignal, onMount } from "solid-js";
// import { useAnimationControl } from "reynard-core/composables";

export const AnimationDashboard: Component = () => {
  // Mock animation control functions for demo
  const isAnimationsDisabled = () => false;
  const getPerformanceMetrics = () => ({
    fps: 60,
    memoryUsage: 45.2,
    loadTime: 1200,
    animationCount: 5,
  });

  const [metrics, setMetrics] = createSignal(getPerformanceMetrics());

  onMount(() => {
    // Update metrics every second
    const interval = setInterval(() => {
      setMetrics(getPerformanceMetrics());
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div class="animation-dashboard">
      <div class="dashboard-header">
        <h1 class="page-title">🎬 Animation System Dashboard</h1>
        <p class="page-description">
          Welcome to the comprehensive showcase of Reynard's unified animation system. Explore different animation
          types, performance metrics, and interactive demos.
        </p>
      </div>

      {/* System Status */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>⚡</span>
          System Status
        </h2>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Animation Engine:</span>
            <span class="status-value">{isAnimationsDisabled() ? "Disabled" : "Active"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Fallback System:</span>
            <span class="status-value">Ready</span>
          </div>
          <div class="status-item">
            <span class="status-label">Performance Mode:</span>
            <span class="status-value">Normal</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>📈</span>
          Performance Metrics
        </h2>
        <div class="performance-metrics">
          <div class="metric-card">
            <div class="metric-value">{metrics().fps.toFixed(1)}</div>
            <div class="metric-label">FPS</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{metrics().memoryUsage.toFixed(1)}MB</div>
            <div class="metric-label">Memory</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{metrics().animationCount}</div>
            <div class="metric-label">Active Animations</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{metrics().loadTime.toFixed(0)}ms</div>
            <div class="metric-label">Load Time</div>
          </div>
        </div>
      </div>

      {/* Feature Overview */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎯</span>
          Animation Features
        </h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🎭</div>
            <h3 class="feature-title">Staggered Animations</h3>
            <p class="feature-description">Sequential animation effects with customizable timing and easing</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🪟</div>
            <h3 class="feature-title">Floating Panels</h3>
            <p class="feature-description">Smooth panel transitions with smart positioning and z-index management</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <h3 class="feature-title">Color Transitions</h3>
            <p class="feature-description">Beautiful color animations with hue shifting and gradient effects</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎪</div>
            <h3 class="feature-title">3D Animations</h3>
            <p class="feature-description">Three.js integration with WebGL-powered 3D effects and transitions</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <h3 class="feature-title">Performance Mode</h3>
            <p class="feature-description">Adaptive performance optimization with automatic quality adjustment</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <h3 class="feature-title">Fallback System</h3>
            <p class="feature-description">Graceful degradation with CSS-based fallbacks when needed</p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🚀</span>
          Quick Start
        </h2>
        <p class="card-description">
          Get started with the animation system by exploring the different demo pages. Each page showcases specific
          animation features with interactive examples.
        </p>
        <div class="quick-start-grid">
          <div class="quick-start-item">
            <h4>1. Explore Demos</h4>
            <p>Navigate through different animation types using the sidebar</p>
          </div>
          <div class="quick-start-item">
            <h4>2. Test Controls</h4>
            <p>Use the animation controls to toggle features and performance modes</p>
          </div>
          <div class="quick-start-item">
            <h4>3. Monitor Performance</h4>
            <p>Watch real-time metrics and see how animations affect performance</p>
          </div>
        </div>
      </div>
    </div>
  );
};
