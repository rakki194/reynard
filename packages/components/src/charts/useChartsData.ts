/**
 * Charts Data Hook
 * Custom hook for managing charts data and real-time generation
 */

import {
  createSignal,
  createMemo,
  onMount,
  onCleanup,
  createEffect,
} from "solid-js";
import {
  type RealTimeDataPoint,
  type StatisticalData,
  type QualityData,
} from "reynard-charts";

export const useChartsData = () => {
  // Real-time data state
  const [realTimeData, setRealTimeData] = createSignal<RealTimeDataPoint[]>([]);
  const [performanceData, setPerformanceData] = createSignal<
    RealTimeDataPoint[]
  >([]);
  const [memoryData, setMemoryData] = createSignal<RealTimeDataPoint[]>([]);

  // Animation state
  const [_animationFrame, setAnimationFrame] = createSignal(0);
  let animationId: number | undefined;
  let realTimeInterval: NodeJS.Timeout | undefined;
  let performanceInterval: NodeJS.Timeout | undefined;
  let memoryInterval: NodeJS.Timeout | undefined;

  // Sample data for different chart types
  const sampleData = createMemo(() => ({
    sales: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Sales",
          data: [12, 19, 3, 5, 2, 3],
        },
        {
          label: "Marketing",
          data: [2, 3, 20, 5, 1, 4],
        },
      ],
    },
    revenue: {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        {
          label: "Revenue",
          data: [65, 59, 80, 81],
        },
      ],
    },
    distribution: {
      labels: ["Desktop", "Mobile", "Tablet", "Other"],
      datasets: [
        {
          label: "Traffic",
          data: [45, 35, 15, 5],
        },
      ],
    },
  }));

  // Statistical data for analysis
  const statisticalData = createMemo(
    (): StatisticalData => ({
      values: Array.from({ length: 100 }, () => Math.random() * 100),
      statistics: {
        min: 0,
        q1: 25,
        median: 50,
        q3: 75,
        max: 100,
        mean: 50,
        std: 28.87,
      },
    }),
  );

  // Quality metrics data
  const qualityData = createMemo(
    (): QualityData => ({
      overallScore: 87,
      metrics: [
        {
          name: "Performance",
          value: 92,
          unit: "%",
          higherIsBetter: true,
          goodThreshold: 80,
          warningThreshold: 60,
        },
        {
          name: "Accessibility",
          value: 88,
          unit: "%",
          higherIsBetter: true,
          goodThreshold: 85,
          warningThreshold: 70,
        },
        {
          name: "SEO",
          value: 76,
          unit: "%",
          higherIsBetter: true,
          goodThreshold: 80,
          warningThreshold: 60,
        },
        {
          name: "Security",
          value: 95,
          unit: "%",
          higherIsBetter: true,
          goodThreshold: 90,
          warningThreshold: 75,
        },
        {
          name: "Load Time",
          value: 1.2,
          unit: "s",
          higherIsBetter: false,
          goodThreshold: 2,
          warningThreshold: 3,
        },
      ],
      assessment: {
        status: "good",
        issues: ["SEO score could be improved", "Load time is slightly slow"],
        recommendations: [
          "Optimize meta tags",
          "Implement lazy loading",
          "Compress images",
        ],
      },
    }),
  );

  // Generate real-time data
  const generateRealTimeData = () => {
    const now = Date.now();
    const newPoint: RealTimeDataPoint = {
      timestamp: now,
      value: Math.random() * 100,
      label: new Date(now).toLocaleTimeString(),
    };

    setRealTimeData((prev) => [...prev, newPoint].slice(-50));
  };

  const generatePerformanceData = () => {
    const now = Date.now();
    const newPoint: RealTimeDataPoint = {
      timestamp: now,
      value: 60 + Math.random() * 40, // FPS between 60-100
      label: new Date(now).toLocaleTimeString(),
    };

    setPerformanceData((prev) => [...prev, newPoint].slice(-30));
  };

  const generateMemoryData = () => {
    const now = Date.now();
    const newPoint: RealTimeDataPoint = {
      timestamp: now,
      value: 100 + Math.random() * 200, // Memory between 100-300MB
      label: new Date(now).toLocaleTimeString(),
    };

    setMemoryData((prev) => [...prev, newPoint].slice(-30));
  };

  return {
    realTimeData,
    performanceData,
    memoryData,
    sampleData,
    statisticalData,
    qualityData,
    generateRealTimeData,
    generatePerformanceData,
    generateMemoryData,
    setAnimationFrame: setAnimationFrame,
    animationId: () => animationId,
    setAnimationId: (id: number | undefined) => {
      animationId = id;
    },
    realTimeInterval: () => realTimeInterval,
    setRealTimeInterval: (interval: NodeJS.Timeout | undefined) => {
      realTimeInterval = interval;
    },
    performanceInterval: () => performanceInterval,
    setPerformanceInterval: (interval: NodeJS.Timeout | undefined) => {
      performanceInterval = interval;
    },
    memoryInterval: () => memoryInterval,
    setMemoryInterval: (interval: NodeJS.Timeout | undefined) => {
      memoryInterval = interval;
    },
  };
};
