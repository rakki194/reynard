/**
 * 🦊 Enhanced Engines Composable
 * Manages all animation engines for the integration demo
 */

import { createSignal } from "solid-js";
import { createEngines, type EngineInstances } from "./engineFactory";
import { updateEngineConfigs } from "./configManager";
import { generatePattern, startAnimation, stopAnimation } from "./animationController";
import type { Point, PerformanceMetrics, StroboscopicState, QualityLevel } from "./types";

export interface EngineConfig {
  mode: '2d' | '3d';
  patternType: 'vogel' | 'rotase' | 'bernoulli' | 'fibonacci-sibling';
  pointCount: number;
  rotationSpeed: number;
  enableStroboscopic: boolean;
  enableMorphing: boolean;
  enablePerformanceOptimization: boolean;
}

export function useEnhancedEngines(config: () => EngineConfig) {
  const [currentPoints, setCurrentPoints] = createSignal<Point[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = createSignal<PerformanceMetrics | null>(null);
  const [stroboscopicState, setStroboscopicState] = createSignal<StroboscopicState | null>(null);
  const [qualityLevel, setQualityLevel] = createSignal<QualityLevel | null>(null);

  let engines: EngineInstances;

  const initializeEngines = () => {
    engines = createEngines(config());
  };

  const generatePatternData = () => {
    const points = generatePattern(engines, config());
    setCurrentPoints(points);
    return points;
  };

  const updateConfig = () => {
    updateEngineConfigs(engines, config());
  };

  const startAnimationLoop = (onUpdate: (deltaTime: number) => void) => {
    startAnimation(engines, onUpdate);
  };

  const stopAnimationLoop = () => {
    stopAnimation(engines);
  };

  const getEngines = () => ({
    ...engines,
    currentPoints: currentPoints(),
    setCurrentPoints,
    setStroboscopicState,
    setPerformanceMetrics,
    setQualityLevel,
    stroboscopicState: stroboscopicState(),
  });

  return {
    currentPoints,
    performanceMetrics,
    stroboscopicState,
    qualityLevel,
    setCurrentPoints,
    setPerformanceMetrics,
    setStroboscopicState,
    setQualityLevel,
    initializeEngines,
    generatePattern: generatePatternData,
    updateConfig,
    startAnimation: startAnimationLoop,
    stopAnimation: stopAnimationLoop,
    getEngines,
  };
}
