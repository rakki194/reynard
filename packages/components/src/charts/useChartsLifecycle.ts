/**
 * Charts Lifecycle Hook
 * Manages animation loops and real-time data intervals
 */

import { onMount, onCleanup, createEffect } from "solid-js";

interface UseChartsLifecycleProps {
  animationSpeed: () => number;
  realTimeEnabled: () => boolean;
  generateRealTimeData: () => void;
  generatePerformanceData: () => void;
  generateMemoryData: () => void;
  setAnimationFrame: (fn: (prev: number) => number) => void;
  animationId: () => number | undefined;
  setAnimationId: (id: number | undefined) => void;
  realTimeInterval: () => NodeJS.Timeout | undefined;
  setRealTimeInterval: (interval: NodeJS.Timeout | undefined) => void;
  performanceInterval: () => NodeJS.Timeout | undefined;
  setPerformanceInterval: (interval: NodeJS.Timeout | undefined) => void;
  memoryInterval: () => NodeJS.Timeout | undefined;
  setMemoryInterval: (interval: NodeJS.Timeout | undefined) => void;
}

export const useChartsLifecycle = (props: UseChartsLifecycleProps) => {
  // Animation loop
  onMount(() => {
    const animate = () => {
      props.setAnimationFrame((prev) => prev + props.animationSpeed());
      const id = window.requestAnimationFrame(animate);
      props.setAnimationId(id);
    };
    const id = window.requestAnimationFrame(animate);
    props.setAnimationId(id);

    // Start real-time data generation
    if (props.realTimeEnabled()) {
      props.setRealTimeInterval(setInterval(props.generateRealTimeData, 1000));
      props.setPerformanceInterval(
        setInterval(props.generatePerformanceData, 2000),
      );
      props.setMemoryInterval(setInterval(props.generateMemoryData, 3000));
    }
  });

  onCleanup(() => {
    if (props.animationId()) {
      window.cancelAnimationFrame(props.animationId()!);
    }
    if (props.realTimeInterval()) {
      clearInterval(props.realTimeInterval()!);
    }
    if (props.performanceInterval()) {
      clearInterval(props.performanceInterval()!);
    }
    if (props.memoryInterval()) {
      clearInterval(props.memoryInterval()!);
    }
  });

  // Update real-time data when enabled/disabled
  createEffect(() => {
    if (props.realTimeEnabled()) {
      props.setRealTimeInterval(setInterval(props.generateRealTimeData, 1000));
      props.setPerformanceInterval(
        setInterval(props.generatePerformanceData, 2000),
      );
      props.setMemoryInterval(setInterval(props.generateMemoryData, 3000));
    } else {
      if (props.realTimeInterval()) clearInterval(props.realTimeInterval()!);
      if (props.performanceInterval())
        clearInterval(props.performanceInterval()!);
      if (props.memoryInterval()) clearInterval(props.memoryInterval()!);
    }
  });
};
