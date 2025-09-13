/**
 * 🦊 Enhanced Phyllotactic System
 * Integrates all advanced features: stroboscopic effects, 3D support, performance optimization
 * Based on latest research and academic findings
 */

import { createSignal, onMount, onCleanup } from "solid-js";
import { StroboscopicEngine } from "../utils/animation/StroboscopicEngine";
import { AdvancedPatternGenerator } from "../utils/phyllotactic/AdvancedPatternGenerator";
import { Phyllotactic3DSystem } from "../utils/phyllotactic/Phyllotactic3D";
import { PerformanceOptimizedEngine } from "../utils/animation/PerformanceOptimizedEngine";
import { createAnimationCore } from "../utils/animation/AnimationCore";
// import type { AnimationConfig } from "../utils/animation/AnimationTypes";

export interface EnhancedSystemConfig {
  // Pattern generation
  patternType: 'vogel' | 'rotase' | 'bernoulli' | 'fibonacci-sibling';
  pointCount: number;
  baseRadius: number;
  growthFactor: number;
  
  // Stroboscopic effects
  enableStroboscopic: boolean;
  rotationSpeed: number;
  frameRate: number;
  
  // 3D support
  enable3D: boolean;
  height: number;
  spiralPitch: number;
  
  // Performance
  enablePerformanceOptimization: boolean;
  maxPoints: number;
  targetFPS: number;
  
  // Advanced features
  enableMorphing: boolean;
  enableColorHarmonics: boolean;
  enableSpatialCulling: boolean;
}

export const useEnhancedPhyllotacticSystem = (config: EnhancedSystemConfig) => {
  console.log("🦊 EnhancedPhyllotacticSystem: Initializing with config", config);
  
  // Initialize engines
  const stroboscopicEngine = new StroboscopicEngine({
    frameRate: config.frameRate,
    rotationSpeed: config.rotationSpeed,
    enableTemporalAliasing: true,
    enableMorphingEffects: config.enableMorphing,
  });
  
  const patternGenerator = new AdvancedPatternGenerator({
    patternType: config.patternType,
    pointCount: config.pointCount,
    baseRadius: config.baseRadius,
    growthFactor: config.growthFactor,
    enableMorphing: config.enableMorphing,
    enableColorHarmonics: config.enableColorHarmonics,
  });
  
  const phyllotactic3D = new Phyllotactic3DSystem({
    pointCount: config.pointCount,
    baseRadius: config.baseRadius,
    height: config.height,
    spiralPitch: config.spiralPitch,
    enableStroboscopic3D: config.enableStroboscopic,
  });
  
  const performanceEngine = new PerformanceOptimizedEngine({
    maxPoints: config.maxPoints,
    targetFPS: config.targetFPS,
    enableAdaptiveQuality: config.enablePerformanceOptimization,
    enableSpatialCulling: config.enableSpatialCulling,
    enableLOD: config.enablePerformanceOptimization,
  });
  
  // Animation core
  const animationCore = createAnimationCore({
    frameRate: config.frameRate,
    maxFPS: config.targetFPS * 2,
    enableVSync: true,
    enablePerformanceMonitoring: true,
  });
  
  // State
  const [currentPoints, setCurrentPoints] = createSignal<any[]>([]);
  const [isRunning, setIsRunning] = createSignal(false);
  const [performanceMetrics, setPerformanceMetrics] = createSignal<any>(null);
  const [stroboscopicState, setStroboscopicState] = createSignal<any>(null);
  
  // Generate initial pattern
  const generatePattern = () => {
    console.log("🦊 EnhancedPhyllotacticSystem: Generating pattern");
    
    let points: any[];
    
    if (config.enable3D) {
      points = phyllotactic3D.generate3DSpiral();
    } else {
      points = patternGenerator.generatePattern();
    }
    
    // Apply performance optimizations
    if (config.enablePerformanceOptimization) {
      points = performanceEngine.applySpatialCulling(points, {
        x: 0, y: 0, width: 800, height: 600
      });
      points = performanceEngine.applyLOD(points);
    }
    
    setCurrentPoints(points);
    console.log("🦊 EnhancedPhyllotacticSystem: Pattern generated", points.length, "points");
  };
  
  // Animation loop
  const animate = (deltaTime: number) => {
    if (!isRunning()) return;
    
    // Update 3D rotation if enabled
    if (config.enable3D) {
      phyllotactic3D.updateRotation(deltaTime);
    }
    
    // Apply stroboscopic effects if enabled
    if (config.enableStroboscopic) {
      const stroboscopicState = stroboscopicEngine.calculateStroboscopicEffect(deltaTime);
      setStroboscopicState(stroboscopicState);
      
      if (stroboscopicState.isStroboscopic) {
        const transformedPoints = stroboscopicEngine.applyStroboscopicTransform(
          currentPoints(),
          deltaTime
        );
        setCurrentPoints(transformedPoints);
      }
    }
    
    // Update performance metrics
    const frameStartTime = performance.now();
    const renderStartTime = performance.now();
    const updateStartTime = performance.now();
    
    const frameTime = performance.now() - frameStartTime;
    const renderTime = performance.now() - renderStartTime;
    const updateTime = performance.now() - updateStartTime;
    
    performanceEngine.updateMetrics(
      frameTime,
      renderTime,
      updateTime,
      currentPoints().length
    );
    
    setPerformanceMetrics(performanceEngine.getMetrics());
  };
  
  // Start animation
  const startAnimation = () => {
    console.log("🦊 EnhancedPhyllotacticSystem: Starting animation");
    setIsRunning(true);
    
    animationCore.start({
      onUpdate: animate,
      onRender: () => {
        // Render logic would go here
        console.log("🦊 EnhancedPhyllotacticSystem: Rendering", currentPoints().length, "points");
      },
    });
  };
  
  // Stop animation
  const stopAnimation = () => {
    console.log("🦊 EnhancedPhyllotacticSystem: Stopping animation");
    setIsRunning(false);
    animationCore.stop();
  };
  
  // Toggle animation
  const toggleAnimation = () => {
    if (isRunning()) {
      stopAnimation();
    } else {
      startAnimation();
    }
  };
  
  // Update configuration
  const updateConfig = (newConfig: Partial<EnhancedSystemConfig>) => {
    console.log("🦊 EnhancedPhyllotacticSystem: Updating config", newConfig);
    
    // Update engines with new config
    if (newConfig.patternType) {
      patternGenerator.updateConfig({ patternType: newConfig.patternType });
    }
    
    if (newConfig.rotationSpeed !== undefined) {
      stroboscopicEngine.updateConfig({ rotationSpeed: newConfig.rotationSpeed });
    }
    
    if (newConfig.enable3D !== undefined) {
      phyllotactic3D.updateConfig({ 
        enableStroboscopic3D: newConfig.enableStroboscopic 
      });
    }
    
    if (newConfig.maxPoints !== undefined) {
      performanceEngine.updateConfig({ maxPoints: newConfig.maxPoints });
    }
    
    // Regenerate pattern if needed
    const needsRegeneration = (
      newConfig.patternType !== undefined ||
      newConfig.pointCount !== undefined ||
      newConfig.baseRadius !== undefined ||
      newConfig.growthFactor !== undefined ||
      newConfig.enable3D !== undefined
    );
    
    if (needsRegeneration) {
      generatePattern();
    }
    
    // props.onConfigChange(newConfig);
  };
  
  // Lifecycle
  onMount(() => {
    console.log("🦊 EnhancedPhyllotacticSystem: onMount - initializing system");
    generatePattern();
  });
  
  onCleanup(() => {
    console.log("🦊 EnhancedPhyllotacticSystem: onCleanup - stopping animation");
    stopAnimation();
  });
  
  return {
    // State
    currentPoints,
    isRunning,
    performanceMetrics,
    stroboscopicState,
    
    // Actions
    generatePattern,
    startAnimation,
    stopAnimation,
    toggleAnimation,
    updateConfig,
    
    // Engines (for advanced usage)
    stroboscopicEngine,
    patternGenerator,
    phyllotactic3D,
    performanceEngine,
    animationCore,
  };
};
