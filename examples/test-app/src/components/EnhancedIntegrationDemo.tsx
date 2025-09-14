/**
 * 🦊 Enhanced Integration Demo
 * Demonstrates all advanced features working together
 */

import { Component, onMount, onCleanup } from "solid-js";
import { useEnhancedIntegration } from "../composables/useEnhancedIntegration";
import { EnhancedHeader } from "./EnhancedHeader";
import { EnhancedLayout } from "./EnhancedLayout";
import "./EnhancedIntegrationDemo.css";

export const EnhancedIntegrationDemo: Component = () => {
  console.log("🦊 EnhancedIntegrationDemo: Initializing");

  const integration = useEnhancedIntegration();

  // Lifecycle
  onMount(() => {
    integration.initializeSystem();
    integration.generatePattern();
  });

  onCleanup(() => {
    integration.engines.stopAnimation();
  });

  return (
    <>
      <EnhancedHeader />
      <EnhancedLayout integration={integration} />
    </>
  );
};
