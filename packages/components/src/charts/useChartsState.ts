/**
 * Charts State Hook
 * Manages the main state and visualization engine for the charts showcase
 */

import { createSignal } from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";
import { useVisualizationEngine } from "reynard-charts";

export const useChartsState = () => {
  const themeContext = useTheme();
  
  // Interactive state
  const [selectedTheme, setSelectedTheme] = createSignal(themeContext.theme);
  const [animationSpeed, setAnimationSpeed] = createSignal(1);
  const [showAdvanced, setShowAdvanced] = createSignal(false);
  const [realTimeEnabled, setRealTimeEnabled] = createSignal(true);
  const [performanceMonitoring, setPerformanceMonitoring] = createSignal(true);

  // Initialize visualization engine
  const visualization = useVisualizationEngine({
    theme: selectedTheme() as any,
    useOKLCH: true,
    performance: {
      lazyLoading: true,
      memoryLimit: 512,
      targetFPS: 60,
    }
  });

  // Available themes for demonstration
  const availableThemes = getAvailableThemes().map(theme => theme.name as ThemeName);

  return {
    themeContext,
    selectedTheme,
    setSelectedTheme,
    animationSpeed,
    setAnimationSpeed,
    showAdvanced,
    setShowAdvanced,
    realTimeEnabled,
    setRealTimeEnabled,
    performanceMonitoring,
    setPerformanceMonitoring,
    visualization,
    availableThemes,
  };
};
