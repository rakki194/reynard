import { lazy } from "solid-js";
import { Router, RouteDefinition } from "@solidjs/router";
import ToolConfigPage from "./pages/ToolConfigPage";

// Lazy load components for code splitting
const TrackerPage = lazy(() => import("./pages/TrackerPage"));

// Route definitions
const routes: RouteDefinition[] = [
  {
    path: "/",
    component: TrackerPage,
  },
  {
    path: "/config",
    component: ToolConfigPage,
  },
];

// Main App component with routing
export function App() {
  return <Router>{routes}</Router>;
}
