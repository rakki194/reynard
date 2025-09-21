/**
 * Dashboard Header Component
 * 
 * Header section for the Code Quality Dashboard
 */

import { Component, Show } from "solid-js";

interface HeaderProps {
  lastUpdated: Date | null;
}

export const DashboardHeader: Component<HeaderProps> = props => {
  return (
    <header class="p-4 border-b">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">🦊 Reynard Code Quality</h1>
        <div class="text-sm text-gray-600">
          <Show when={props.lastUpdated}>
            Last updated: {props.lastUpdated?.toLocaleTimeString()}
          </Show>
        </div>
      </div>
    </header>
  );
};
