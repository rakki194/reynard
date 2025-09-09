/**
 * Charts Lifecycle Provider
 * Handles the lifecycle setup for the charts showcase
 */

import { Component } from "solid-js";
import { useChartsLifecycle } from "./useChartsLifecycle";

interface ChartsLifecycleProviderProps {
  chartsData: ReturnType<typeof import("./useChartsData").useChartsData>;
  state: ReturnType<typeof import("./useChartsState").useChartsState>;
  children: any;
}

export const ChartsLifecycleProvider: Component<
  ChartsLifecycleProviderProps
> = (props) => {
  useChartsLifecycle({
    animationSpeed: props.state.animationSpeed,
    realTimeEnabled: props.state.realTimeEnabled,
    generateRealTimeData: props.chartsData.generateRealTimeData,
    generatePerformanceData: props.chartsData.generatePerformanceData,
    generateMemoryData: props.chartsData.generateMemoryData,
    setAnimationFrame: props.chartsData.setAnimationFrame,
    animationId: props.chartsData.animationId,
    setAnimationId: props.chartsData.setAnimationId,
    realTimeInterval: props.chartsData.realTimeInterval,
    setRealTimeInterval: props.chartsData.setRealTimeInterval,
    performanceInterval: props.chartsData.performanceInterval,
    setPerformanceInterval: props.chartsData.setPerformanceInterval,
    memoryInterval: props.chartsData.memoryInterval,
    setMemoryInterval: props.chartsData.setMemoryInterval,
  });

  return props.children;
};
