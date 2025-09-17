/**
 * Quick Actions - Sidebar component with common actions
 */

import { Component } from "solid-js";
import { Button, Card } from "reynard-components";
import "./QuickActions.css";

const QuickActions: Component = () => {
  const actions = [
    {
      icon: "📝",
      label: "New Note",
      description: "Create a new note",
      action: () => console.log("New note"),
    },
    {
      icon: "📚",
      label: "New Notebook",
      description: "Create a new notebook",
      action: () => console.log("New notebook"),
    },
    {
      icon: "🔍",
      label: "Search Notes",
      description: "Find notes quickly",
      action: () => console.log("Search"),
    },
    {
      icon: "🤖",
      label: "AI Assistant",
      description: "Get help with AI",
      action: () => console.log("AI assistant"),
    },
    {
      icon: "📊",
      label: "Analytics",
      description: "View your stats",
      action: () => console.log("Analytics"),
    },
    {
      icon: "⚙️",
      label: "Settings",
      description: "App preferences",
      action: () => console.log("Settings"),
    },
  ];

  return (
    <Card class="quick-actions" padding="lg">
      <h3>⚡ Quick Actions</h3>
      <div class="actions-grid">
        {actions.map(action => (
          <button class="action-button" onClick={action.action} title={action.description}>
            <span class="action-icon">{action.icon}</span>
            <span class="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export { QuickActions };
