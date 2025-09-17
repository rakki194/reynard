/**
 * Reynard Components
 * Production-ready SolidJS component library
 */

// Import styles
import "./styles.css";

// Export primitives
export * from "./primitives";

// Export navigation components
export * from "./navigation";

// Export composite components
export { Modal, type ModalProps } from "./Modal";
export { TabPanel, Tabs, type TabItem, type TabPanelProps, type TabsProps } from "./Tabs";

// Export icons
export * from "./icons";

// Export layout components
export * from "./layout";

// Export dashboard components
export * from "./dashboard";

// Export 3D components
export * from "./threed";

// Export charts components (temporarily disabled for build)
// export {
//   ChartsShowcase,
//   ChartsShowcaseSimple,
//   ChartsHero,
//   ChartsContent,
//   ChartsControls,
//   ChartsTechnicalInfo,
//   ChartsPerformanceSection,
//   ChartsRealtimeSection,
//   ChartsStatisticalSection,
//   ChartsTypesShowcase,
//   ChartsAdvancedFeatures,
//   ChartsLifecycleProvider,
//   useChartsCSS,
//   useChartsData,
//   useChartsLifecycle,
//   useChartsState,
// } from "reynard-charts";

// Export OKLCH components
export * from "./oklch";

// Export theme components
export * from "./theme";

// Export utility components
export * from "./utils";

// Export debug components
export * from "./debug";
