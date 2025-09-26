/**
 * 🦊 Integration Demo
 * Demonstrates all advanced features working together
 */

import { Component, onMount, onCleanup } from "solid-js";
import { useEnhancedIntegration } from "../composables/useEnhancedIntegration";
import { Header } from "./Header";
import { Layout } from "./Layout";
import "./IntegrationDemo.css";

export const IntegrationDemo: Component = () => {
  console.log("🦊 IntegrationDemo: Initializing");

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
      <Header />
      <Layout integration={integration} />
    </>
  );
};
