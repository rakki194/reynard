/**
 * 🎬 Animation System Demo - Reynard Framework
 *
 * Comprehensive showcase of the unified animation system including:
 * - Staggered animations
 * - Floating panel animations
 * - Color transitions
 * - 3D animations
 * - Performance monitoring
 * - Fallback systems
 */

import { Component, createSignal, Show } from "solid-js";
import { ReynardProvider } from "reynard-themes";
import { NotificationsProvider, createNotificationsModule } from "reynard-core";
import "reynard-themes/themes.css";
// import { Router, Route, Routes } from "@solidjs/router";
import { AnimationDashboard } from "./pages/AnimationDashboard";
import { StaggeredAnimationDemo } from "./pages/StaggeredAnimationDemo";
import { FloatingPanelDemo } from "./pages/FloatingPanelDemo";
import { ColorAnimationDemo } from "./pages/ColorAnimationDemo";
import { GradientAnimationDemo } from "./pages/GradientAnimationDemo";
import { ThreeJSAnimationDemo } from "./pages/ThreeJSAnimationDemo";
import { PerformanceDemo } from "./pages/PerformanceDemo";
import { TransformerDanceClubDemo } from "./pages/TransformerDanceClubDemo";
import { Navigation } from "./components/Navigation";
import { AnimationControls } from "./components/AnimationControls";
import { ThemeSelector } from "./components/ThemeSelector";
import { LanguageSelector } from "./components/LanguageSelector";
import "./styles/global.css";
import "./styles/transformer-dance-club.css";

const App: Component = () => {
  const notificationsModule = createNotificationsModule();
  const [currentPage, setCurrentPage] = createSignal("dashboard");

  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <div class="animation-demo-app">
          <header class="demo-header">
            <div class="header-content">
              <h1 class="demo-title">
                <span class="reynard-logo">🦊</span>
                Animation System Demo
              </h1>
              <p class="demo-subtitle">Comprehensive showcase of Reynard's unified animation system</p>
            </div>
            <div class="selector-container">
              <ThemeSelector />
              <LanguageSelector />
            </div>
            <AnimationControls />
          </header>

          <main class="demo-main">
            <Navigation currentPage={currentPage()} onPageChange={setCurrentPage} />

            <div class="demo-content">
              <Show when={currentPage() === "dashboard"}>
                <AnimationDashboard />
              </Show>
              <Show when={currentPage() === "staggered"}>
                <StaggeredAnimationDemo />
              </Show>
              <Show when={currentPage() === "floating-panel"}>
                <FloatingPanelDemo />
              </Show>
              <Show when={currentPage() === "colors"}>
                <ColorAnimationDemo />
              </Show>
              <Show when={currentPage() === "gradients"}>
                <GradientAnimationDemo />
              </Show>
              <Show when={currentPage() === "3d"}>
                <ThreeJSAnimationDemo />
              </Show>
              <Show when={currentPage() === "performance"}>
                <PerformanceDemo />
              </Show>
              <Show when={currentPage() === "transformer-dance-club"}>
                <TransformerDanceClubDemo />
              </Show>
            </div>
          </main>

          <footer class="demo-footer">
            <p>
              Built with <span class="reynard-logo">🦊</span> Reynard Framework
            </p>
          </footer>
        </div>
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
