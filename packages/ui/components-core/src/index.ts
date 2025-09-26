/**
 * Reynard Components Core Package
 *
 * Core UI primitives, navigation, layout, and icon components.
 * This package provides the foundational UI components for the Reynard ecosystem.
 */

// Import styles
import "./styles.css";

// Export primitives from the dedicated primitives package
// export * from "reynard-primitives";

// Export navigation components
export * from "./navigation/index.js";

// Export layout components
export * from "./layout/index.js";

// Export icons
export * from "./icons/index.js";

// Export composite components
export { Modal, type ModalProps } from "./Modal.js";
export { TabPanel, Tabs, type TabItem, type TabPanelProps, type TabsProps } from "./Tabs.js";
