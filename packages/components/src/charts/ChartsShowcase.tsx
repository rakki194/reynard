/**
 * Charts Showcase
 * A comprehensive demonstration of Reynard's advanced charting capabilities
 * Showcasing OKLCH integration, real-time data, statistical analysis, and performance optimization
 */

import { Component } from "solid-js";
import {
  ChartsLifecycleProvider,
  ChartsContent,
  useChartsData,
  useChartsCSS,
  useChartsState,
} from ".";

export const ChartsShowcase: Component = () => {
  // Use custom hooks
  const state = useChartsState();
  const chartsData = useChartsData();
  useChartsCSS();

  return (
    <ChartsLifecycleProvider chartsData={chartsData} state={state}>
      <section class="charts-showcase">
        <ChartsContent state={state} chartsData={chartsData} />
      </section>
    </ChartsLifecycleProvider>
  );
};
