/**
 * 🦊 3D Phyllotactic Demo
 * Demonstrates 3D phyllotactic structures with rotation and stroboscopic effects
 */

import { Component, onCleanup } from "solid-js";
import { usePhyllotactic3DDemo } from "../composables/usePhyllotactic3DDemo";
import { Phyllotactic3DDemoLayout } from "./Phyllotactic3DDemoLayout";
import "./Phyllotactic3DDemo.css";

export const Phyllotactic3DDemo: Component = () => {
  console.log("🦊 Phyllotactic3DDemo: Initializing");

  const demo = usePhyllotactic3DDemo();

  // Lifecycle
  onCleanup(demo.cleanup);

  return <Phyllotactic3DDemoLayout demo={demo} />;
};
