import { Component } from "solid-js";
import type { DemoType } from "../App";

interface DemoSelectorProps {
  onDemoSelect: (demo: DemoType) => void;
}

interface DemoOption {
  id: DemoType;
  title: string;
  description: string;
  icon: string;
  complexity: "Basic" | "Intermediate" | "Advanced";
  features: string[];
}

const demoOptions: DemoOption[] = [
  {
    id: "aabb-collision",
    title: "AABB Collision Detection",
    description: "Interactive demonstration of Axis-Aligned Bounding Box collision detection with real-time visualization",
    icon: "📦",
    complexity: "Basic",
    features: ["Real-time Collision", "Visual Feedback", "Interactive Objects"]
  },
  {
    id: "spatial-optimization",
    title: "Spatial Optimization",
    description: "Compare naive O(n²) vs spatial hashing optimization for collision detection performance",
    icon: "⚡",
    complexity: "Intermediate",
    features: ["Performance Comparison", "Spatial Hashing", "Scalability Analysis"]
  },
  {
    id: "performance-benchmark",
    title: "Performance Benchmark",
    description: "Comprehensive benchmarking suite for collision detection algorithms with detailed metrics",
    icon: "📊",
    complexity: "Advanced",
    features: ["Benchmarking", "Performance Metrics", "Algorithm Comparison"]
  },
  {
    id: "interactive-physics",
    title: "Interactive Physics",
    description: "Full physics simulation with gravity, bouncing, and complex collision interactions",
    icon: "🎯",
    complexity: "Advanced",
    features: ["Physics Simulation", "Gravity", "Elastic Collisions"]
  }
];

export const DemoSelector: Component<DemoSelectorProps> = (props) => {
  return (
    <div class="demo-selector">
      <div class="selector-header">
        <h2>Choose Your Algorithm Demo</h2>
        <p>Explore the power of Reynard's collision detection and optimization algorithms</p>
      </div>
      
      <div class="demos-grid">
        {demoOptions.map((demo) => (
          <div 
            class="demo-card"
            onClick={() => props.onDemoSelect(demo.id)}
          >
            <div class="demo-icon">{demo.icon}</div>
            <div class="demo-content">
              <h3>{demo.title}</h3>
              <p class="demo-description">{demo.description}</p>
              <div class="demo-meta">
                <span class={`complexity complexity-${demo.complexity.toLowerCase()}`}>
                  {demo.complexity}
                </span>
              </div>
              <div class="demo-features">
                {demo.features.map((feature) => (
                  <span class="feature-tag">{feature}</span>
                ))}
              </div>
            </div>
            <div class="demo-action">
              <button class="run-button">
                Run Demo
                <span class="run-icon">🚀</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
