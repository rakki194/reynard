/**
 * Component Playground
 * Interactive playground for testing Reynard components and features
 */

import { Component, createSignal } from "solid-js";
import { PlaygroundHeader } from "./PlaygroundHeader";
import { PlaygroundTabs } from "./PlaygroundTabs";
import { NotificationControls } from "./NotificationControls";
import { IconShowcase } from "./IconShowcase";
import { ThemeDemo } from "./ThemeDemo";
import { StorageDemo } from "./StorageDemo";
import { PlaygroundCodeSection } from "./PlaygroundCodeSection";

export const ComponentPlayground: Component = () => {
  const [activeTab, setActiveTab] = createSignal("notifications");
  const [showCode, setShowCode] = createSignal(false);

  const tabs = [
    { id: "notifications", name: "Notifications", icon: "service-bell" },
    { id: "icons", name: "Icons", icon: "grid" },
    { id: "themes", name: "Themes", icon: "palette" },
    { id: "storage", name: "Storage", icon: "save" },
  ];

  return (
    <section class="playground-section">
      <PlaygroundHeader />

      <div class="playground-container">
        <PlaygroundTabs tabs={tabs} activeTab={activeTab()} onTabChange={setActiveTab} />

        <div class="playground-content">
          {activeTab() === "notifications" && <NotificationControls />}
          {activeTab() === "icons" && <IconShowcase />}
          {activeTab() === "themes" && <ThemeDemo />}
          {activeTab() === "storage" && <StorageDemo />}
        </div>

        <PlaygroundCodeSection
          activeTab={activeTab()}
          showCode={showCode()}
          onToggleCode={() => setShowCode(!showCode())}
        />
      </div>
    </section>
  );
};
