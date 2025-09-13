/**
 * 🦊 Enhanced Integration Composable
 * Main logic for the integration demo
 */

import { createSignal } from "solid-js";
import { useEnhancedEngines, type EngineConfig } from "./useEnhancedEngines";
import { useEnhancedAnimation } from "./useEnhancedAnimation";
import { EnhancedRenderer } from "../utils/rendering/EnhancedRenderer";

export function useEnhancedIntegration() {
  // State
  const [isRunning, setIsRunning] = createSignal(false);
  const [mode, setMode] = createSignal<'2d' | '3d'>('2d');
  const [patternType, setPatternType] = createSignal<'vogel' | 'rotase' | 'bernoulli' | 'fibonacci-sibling'>('vogel');
  const [pointCount, setPointCount] = createSignal(2000);
  const [rotationSpeed, setRotationSpeed] = createSignal(1.0);
  const [enableStroboscopic, setEnableStroboscopic] = createSignal(true);
  const [enableMorphing, setEnableMorphing] = createSignal(true);
  const [enablePerformanceOptimization, setEnablePerformanceOptimization] = createSignal(true);
  
  // Engine configuration
  const engineConfig = (): EngineConfig => ({
    mode: mode(),
    patternType: patternType(),
    pointCount: pointCount(),
    rotationSpeed: rotationSpeed(),
    enableStroboscopic: enableStroboscopic(),
    enableMorphing: enableMorphing(),
    enablePerformanceOptimization: enablePerformanceOptimization(),
  });
  
  // Composables
  const engines = useEnhancedEngines(engineConfig);
  const animation = useEnhancedAnimation(engineConfig);
  
  // Renderer
  let renderer: EnhancedRenderer;

  // Initialize system
  const initializeSystem = () => {
    console.log("🦊 useEnhancedIntegration: Initializing system");
    engines.initializeEngines();
    const canvas = document.getElementById('integration-canvas') as HTMLCanvasElement;
    if (canvas) {
      renderer = new EnhancedRenderer(canvas);
    }
  };
  
  // Generate pattern
  const generatePattern = () => {
    const points = engines.generatePattern();
    if (renderer) {
      const renderConfig = {
        mode: mode(),
        enableStroboscopic: enableStroboscopic(),
        enablePerformanceOptimization: enablePerformanceOptimization(),
        stroboscopicState: engines.stroboscopicState(),
      };
      renderer.renderPoints(points, renderConfig, engines.getEngines().performanceEngine);
    }
  };
  
  // Toggle animation
  const toggleAnimation = () => {
    if (isRunning()) {
      setIsRunning(false);
      engines.stopAnimation();
    } else {
      setIsRunning(true);
      const animationLoop = animation.createAnimationLoop(
        engines,
        renderer,
        (_frameTime, _renderTime, _updateTime, _pointCount) => {
          // Metrics update handled in animation loop
        }
      );
      engines.startAnimation(animationLoop);
    }
  };
  
  // Update configuration
  const updateConfig = () => {
    engines.updateConfig();
    generatePattern();
  };

  return {
    // State
    isRunning,
    setIsRunning,
    mode,
    setMode,
    patternType,
    setPatternType,
    pointCount,
    setPointCount,
    rotationSpeed,
    setRotationSpeed,
    enableStroboscopic,
    setEnableStroboscopic,
    enableMorphing,
    setEnableMorphing,
    enablePerformanceOptimization,
    setEnablePerformanceOptimization,
    
    // Engines
    engines,
    
    // Methods
    initializeSystem,
    generatePattern,
    toggleAnimation,
    updateConfig,
  };
}
