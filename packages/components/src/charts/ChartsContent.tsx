/**
 * Charts Content Component
 * Renders all the chart sections
 */

import { Component } from "solid-js";
import { ChartsHero } from "./ChartsHero";
import { ChartsControls } from "./ChartsControls";
import { ChartsTypesShowcase } from "./ChartsTypesShowcase";
import { ChartsRealtimeSection } from "./ChartsRealtimeSection";
import { ChartsStatisticalSection } from "./ChartsStatisticalSection";
import { ChartsPerformanceSection } from "./ChartsPerformanceSection";
import { ChartsAdvancedFeatures } from "./ChartsAdvancedFeatures";
import { ChartsTechnicalInfo } from "./ChartsTechnicalInfo";

interface ChartsContentProps {
  state: ReturnType<typeof import("./useChartsState").useChartsState>;
  chartsData: ReturnType<typeof import("./useChartsData").useChartsData>;
}

export const ChartsContent: Component<ChartsContentProps> = (props) => {
  return (
    <>
      <ChartsHero
        selectedTheme={props.state.selectedTheme()}
        sampleData={props.chartsData.sampleData()}
        performanceMonitoring={props.state.performanceMonitoring()}
      />

      <ChartsControls
        selectedTheme={props.state.selectedTheme()}
        setSelectedTheme={props.state.setSelectedTheme}
        animationSpeed={props.state.animationSpeed()}
        setAnimationSpeed={props.state.setAnimationSpeed}
        realTimeEnabled={props.state.realTimeEnabled()}
        setRealTimeEnabled={props.state.setRealTimeEnabled}
        performanceMonitoring={props.state.performanceMonitoring()}
        setPerformanceMonitoring={props.state.setPerformanceMonitoring}
        availableThemes={props.state.availableThemes}
        themeContext={props.state.themeContext}
      />

      <ChartsTypesShowcase
        sampleData={props.chartsData.sampleData()}
        selectedTheme={props.state.selectedTheme()}
      />

      <ChartsRealtimeSection
        realTimeData={props.chartsData.realTimeData()}
        performanceData={props.chartsData.performanceData()}
        memoryData={props.chartsData.memoryData()}
        selectedTheme={props.state.selectedTheme()}
        performanceMonitoring={props.state.performanceMonitoring()}
      />

      <ChartsStatisticalSection
        statisticalData={props.chartsData.statisticalData()}
        qualityData={props.chartsData.qualityData()}
        selectedTheme={props.state.selectedTheme()}
      />

      <ChartsPerformanceSection
        visualization={props.state.visualization}
      />

      <ChartsAdvancedFeatures
        showAdvanced={props.state.showAdvanced()}
        setShowAdvanced={props.state.setShowAdvanced}
        visualization={props.state.visualization}
      />

      <ChartsTechnicalInfo />
    </>
  );
};
