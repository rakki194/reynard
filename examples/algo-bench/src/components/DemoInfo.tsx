import { Component } from "solid-js";

export const DemoInfo: Component = () => {
  return (
    <div class="demo-info">
      <div class="info-section">
        <h3>🦦 About Algorithm Bench</h3>
        <p>
          This interactive demo showcases the advanced collision detection and
          optimization algorithms in the Reynard framework. Each demo
          demonstrates different aspects of spatial algorithms and performance
          optimization techniques.
        </p>
      </div>

      <div class="info-section">
        <h3>📦 AABB Collision Detection</h3>
        <p>
          Axis-Aligned Bounding Boxes provide efficient collision detection for
          rectangular objects. This demo shows real-time collision detection
          with visual feedback and interactive controls.
        </p>
      </div>

      <div class="info-section">
        <h3>⚡ Spatial Optimization</h3>
        <p>
          Compare the performance difference between naive O(n²) collision
          detection and spatial hashing optimization. Watch how spatial
          partitioning dramatically improves performance with large numbers of
          objects.
        </p>
      </div>

      <div class="info-section">
        <h3>📊 Performance Benchmarking</h3>
        <p>
          Comprehensive performance analysis tools that measure collision
          detection speed, memory usage, and algorithm efficiency across
          different scenarios and object counts.
        </p>
      </div>

      <div class="info-section">
        <h3>🎯 Interactive Physics</h3>
        <p>
          Full physics simulation combining collision detection with realistic
          physics including gravity, bouncing, and momentum conservation.
        </p>
      </div>

      <div class="info-section">
        <h3>🦊 Reynard Framework</h3>
        <p>
          Built with the Reynard framework, showcasing modular, performant, and
          well-tested algorithm implementations that can be easily integrated
          into your projects.
        </p>
      </div>
    </div>
  );
};
