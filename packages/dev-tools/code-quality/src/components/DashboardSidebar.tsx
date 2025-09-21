/**
 * Dashboard Sidebar Component
 *
 * Navigation sidebar for the Code Quality Dashboard
 */

import { Button } from "reynard-components-core";
import { Component } from "solid-js";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

export const DashboardSidebar: Component<SidebarProps> = props => {
  return (
    <nav class="p-4 space-y-2">
      <h3 class="font-semibold text-lg mb-4">Code Quality Dashboard</h3>

      <button
        class={`w-full text-left px-3 py-2 rounded-md transition-colors ${
          props.activeTab === "overview" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
        }`}
        onClick={() => props.onTabChange("overview")}
      >
        📊 Overview
      </button>

      <button
        class={`w-full text-left px-3 py-2 rounded-md transition-colors ${
          props.activeTab === "security" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
        }`}
        onClick={() => props.onTabChange("security")}
      >
        🛡️ Security
      </button>

      <button
        class={`w-full text-left px-3 py-2 rounded-md transition-colors ${
          props.activeTab === "quality-gates" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
        }`}
        onClick={() => props.onTabChange("quality-gates")}
      >
        🎯 Quality Gates
      </button>

      <button
        class={`w-full text-left px-3 py-2 rounded-md transition-colors ${
          props.activeTab === "trends" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
        }`}
        onClick={() => props.onTabChange("trends")}
      >
        📈 Trends
      </button>

      <div class="mt-8 pt-4 border-t">
        <Button onClick={props.onRefresh} disabled={props.isLoading} class="w-full">
          {props.isLoading ? "Analyzing..." : "Refresh Analysis"}
        </Button>

        <Button onClick={props.onToggleAutoRefresh} variant="secondary" class="w-full mt-2">
          {props.autoRefresh ? "Stop Auto-Refresh" : "Start Auto-Refresh"}
        </Button>
      </div>
    </nav>
  );
};
