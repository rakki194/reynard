/**
 * 🕺 Transformer Dance Club Demo
 *
 * Interactive visualization of transformer architecture with dance club aesthetics
 * Showcases neural network components through playful animations and effects
 */

import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { useDanceEffects } from "../composables/useDanceEffects";
import { useTransformerAnimations } from "../composables/useTransformerAnimations";
import { useAdvancedAnimations } from "../composables/useAdvancedAnimations";
import { TransformerControls } from "../components/TransformerControls";
import { TransformerStats } from "../components/TransformerStats";
import { TransformerVisualization } from "../components/TransformerVisualization";
import { transformerComponents } from "../data/transformerComponents";

interface AnimationConfig {
  strobeSpeed: number;
  danceFloorSpeed: number;
  componentPulseSpeed: number;
  autoDanceInterval: number;
  backgroundHueSpeed: number;
}

export const TransformerDanceClubDemo: Component = () => {
  const [animationConfig, setAnimationConfig] = createSignal<AnimationConfig>({
    strobeSpeed: 300,
    danceFloorSpeed: 2000,
    componentPulseSpeed: 1500,
    autoDanceInterval: 2000,
    backgroundHueSpeed: 100,
  });

  // Initialize composables
  const danceEffects = useDanceEffects({
    sparkleCount: 8,
    sparkleDuration: 1200,
    danceDuration: 800,
    scaleAmount: 1.3,
    rotationAmount: 8,
  });

  const transformerAnimations = useTransformerAnimations();
  const advancedAnimations = useAdvancedAnimations(transformerAnimations);

  // Get transformer components data
  const components = () => transformerComponents;

  // Enhanced animation control functions
  const startAnimations = () => {
    transformerAnimations.startAnimations();
  };

  const stopAnimations = () => {
    transformerAnimations.stopAnimations();
  };

  const toggleAnimations = () => {
    console.log("Toggle animations called, current state:", transformerAnimations.animationState().isPlaying);
    if (transformerAnimations.animationState().isPlaying) {
      console.log("Stopping animations...");
      stopAnimations();
    } else {
      console.log("Starting animations...");
      startAnimations();
    }
  };

  const danceComponent = (componentId: string) => {
    const element = document.getElementById(componentId);
    if (!element) return;
    danceEffects.danceComponent(element);
  };

  const updateConfig = (key: keyof AnimationConfig, value: number) => {
    setAnimationConfig(prev => ({ ...prev, [key]: value }));
    transformerAnimations.updateConfig({
      strobeSpeed: animationConfig().strobeSpeed,
      danceFloorSpeed: animationConfig().danceFloorSpeed,
      backgroundHueSpeed: animationConfig().backgroundHueSpeed,
      autoDanceInterval: animationConfig().autoDanceInterval,
      componentPulseSpeed: animationConfig().componentPulseSpeed,
      [key]: value,
    });
  };

  // Burst effect function
  const createBurstEffect = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    danceEffects.createBurst(centerX, centerY, 15);
  };

  onMount(() => {
    startAnimations();
  });

  onCleanup(() => {
    stopAnimations();
  });

  return (
    <div class="transformer-dance-club-demo">
      <div class="demo-header">
        <h1 class="page-title">🕺 Transformer Dance Club 💃</h1>
        <p class="page-description">
          Interactive visualization of transformer architecture with dance club aesthetics. Click components to make
          them dance!
        </p>
      </div>

      <TransformerControls
        animationConfig={animationConfig()}
        isPlaying={transformerAnimations.animationState().isPlaying}
        onConfigUpdate={updateConfig}
        onStartStop={toggleAnimations}
        onForwardPass={advancedAnimations.animateForwardPass}
        onAttentionViz={advancedAnimations.createAttentionVisualization}
        onBurstEffect={createBurstEffect}
      />

      <TransformerStats
        totalSparkles={danceEffects.totalSparklesCreated()}
        currentHue={transformerAnimations.animationState().currentHue}
        activeSparkles={danceEffects.sparkles().length}
        dancingComponents={danceEffects.dancingComponents().size}
        totalComponents={components().length}
        isPlaying={transformerAnimations.animationState().isPlaying}
      />

      <TransformerVisualization
        backgroundGradient={transformerAnimations.getBackgroundGradient()}
        strobeBackground={transformerAnimations.getStrobeBackground()}
        strobeSpeed={animationConfig().strobeSpeed}
        danceFloorSpeed={animationConfig().danceFloorSpeed}
        danceFloorOpacity={transformerAnimations.getDanceFloorOpacity()}
        sparkles={danceEffects.sparkles()}
        onComponentClick={danceComponent}
      />

      {/* Code Example */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>💻</span>
          Implementation Notes
        </h2>
        <div class="code-example">
          {`// Transformer Dance Club - Interactive Neural Network Visualization

// Key Features:
// - Interactive component clicking with dance animations
// - Configurable animation speeds and effects
// - Real-time sparkle effects and visual feedback
// - Responsive design with party club aesthetics
// - Educational tool for understanding transformer architecture

// Animation System:
// - Strobe effects for club atmosphere
// - Pulsing dance floor grid
// - Component-specific dance animations
// - Auto-dancing random components
// - Dynamic background hue rotation

// Interactive Elements:
// - Click any component to make it dance
// - Adjustable animation parameters
// - Real-time statistics tracking
// - Play/pause animation controls`}
        </div>
      </div>
    </div>
  );
};
