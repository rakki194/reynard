/**
 * 🕺 Dance Effects Composable
 * 
 * Reusable composable for creating dance club effects and animations
 * Provides sparkle effects, component dancing, and visual feedback
 */

import { createSignal } from "solid-js";

export interface DanceEffectConfig {
  sparkleCount: number;
  sparkleDuration: number;
  danceDuration: number;
  scaleAmount: number;
  rotationAmount: number;
}

export interface SparkleData {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

export const useDanceEffects = (config: Partial<DanceEffectConfig> = {}) => {
  const defaultConfig: DanceEffectConfig = {
    sparkleCount: 5,
    sparkleDuration: 1000,
    danceDuration: 800,
    scaleAmount: 1.2,
    rotationAmount: 5
  };

  const finalConfig = { ...defaultConfig, ...config };
  
  const [sparkles, setSparkles] = createSignal<SparkleData[]>([]);
  const [dancingComponents, setDancingComponents] = createSignal<Set<string>>(new Set<string>());
  const [totalSparklesCreated, setTotalSparklesCreated] = createSignal(0);

  /**
   * Creates sparkle effects at the specified element's position
   */
  const createSparkles = (element: HTMLElement, customConfig?: Partial<DanceEffectConfig>) => {
    const config = { ...finalConfig, ...customConfig };
    const rect = element.getBoundingClientRect();
    const newSparkles: SparkleData[] = [];

    for (let i = 0; i < config.sparkleCount; i++) {
      const sparkle: SparkleData = {
        id: `sparkle-${Date.now()}-${i}`,
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        size: 2 + Math.random() * 4,
        color: `hsl(${Math.random() * 360}, 100%, 70%)`,
        duration: config.sparkleDuration
      };
      newSparkles.push(sparkle);
    }

    setSparkles(prev => [...prev, ...newSparkles]);
    setTotalSparklesCreated(prev => prev + newSparkles.length);

    // Remove sparkles after duration
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.some(ns => ns.id === s.id)));
    }, config.sparkleDuration);
  };

  /**
   * Makes a component dance with visual effects
   */
  const danceComponent = (element: HTMLElement, customConfig?: Partial<DanceEffectConfig>) => {
    const config = { ...finalConfig, ...customConfig };
    const componentId = element.id || `component-${Date.now()}`;
    
    // Add to dancing components
    setDancingComponents(prev => new Set([...prev, componentId]));

    // Reset animation
    element.style.animation = 'none';
    void element.offsetHeight; // Trigger reflow
    element.style.animation = `dance ${config.danceDuration}ms ease-in-out, pulse 1.5s infinite`;

    // Create sparkles
    createSparkles(element, customConfig);

    // Scale and rotation effect
    element.style.transform = `scale(${config.scaleAmount}) rotate(${config.rotationAmount}deg)`;
    element.style.transition = 'transform 0.2s ease';

    setTimeout(() => {
      element.style.transform = '';
      setDancingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(componentId);
        return newSet;
      });
    }, 200);
  };

  /**
   * Creates a random dance effect on a random component from a list
   */
  const randomDance = (components: HTMLElement[], customConfig?: Partial<DanceEffectConfig>) => {
    if (components.length === 0) return;
    
    const randomComponent = components[Math.floor(Math.random() * components.length)];
    danceComponent(randomComponent, customConfig);
  };

  /**
   * Creates a wave dance effect across multiple components
   */
  const waveDance = (components: HTMLElement[], delay: number = 100, customConfig?: Partial<DanceEffectConfig>) => {
    components.forEach((component, index) => {
      setTimeout(() => {
        danceComponent(component, customConfig);
      }, index * delay);
    });
  };

  /**
   * Creates a synchronized dance effect on all components
   */
  const synchronizedDance = (components: HTMLElement[], customConfig?: Partial<DanceEffectConfig>) => {
    components.forEach(component => {
      danceComponent(component, customConfig);
    });
  };

  /**
   * Creates a burst effect with multiple sparkles
   */
  const createBurst = (x: number, y: number, count: number = 10, customConfig?: Partial<DanceEffectConfig>) => {
    const config = { ...finalConfig, ...customConfig };
    const newSparkles: SparkleData[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = 20 + Math.random() * 30;
      const sparkle: SparkleData = {
        id: `burst-${Date.now()}-${i}`,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        size: 3 + Math.random() * 5,
        color: `hsl(${Math.random() * 360}, 100%, 70%)`,
        duration: config.sparkleDuration
      };
      newSparkles.push(sparkle);
    }

    setSparkles(prev => [...prev, ...newSparkles]);
    setTotalSparklesCreated(prev => prev + newSparkles.length);

    // Remove sparkles after duration
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.some(ns => ns.id === s.id)));
    }, config.sparkleDuration);
  };

  /**
   * Clears all active sparkles
   */
  const clearSparkles = () => {
    setSparkles([]);
  };

  /**
   * Stops all dancing components
   */
  const stopAllDancing = () => {
    setDancingComponents(new Set());
  };

  /**
   * Resets all effects
   */
  const reset = () => {
    clearSparkles();
    stopAllDancing();
  };

  return {
    // State
    sparkles,
    dancingComponents,
    totalSparklesCreated,
    
    // Actions
    createSparkles,
    danceComponent,
    randomDance,
    waveDance,
    synchronizedDance,
    createBurst,
    clearSparkles,
    stopAllDancing,
    reset,
    
    // Config
    config: finalConfig
  };
};
