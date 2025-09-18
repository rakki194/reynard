/**
 * App Main Content Component - Handles the main content area and demo selection
 */

import { Component } from "solid-js";
import { DemoSelector } from "./DemoSelector";
import { DemoInfo } from "./DemoInfo";
import { DemoContainer } from "./DemoContainer";
import type { DemoType } from "../App";

interface AppMainProps {
  currentDemo: () => DemoType;
  onDemoSelect: (demo: DemoType) => void;
  onStatsUpdate: (stats: unknown) => void;
  onBackToMenu: () => void;
}

export const AppMain: Component<AppMainProps> = props => {
  return (
    <main class="app-main">
      {props.currentDemo() === "none" ? (
        <div class="demo-selection">
          <DemoSelector onDemoSelect={props.onDemoSelect} />
          <DemoInfo />
        </div>
      ) : (
        <DemoContainer
          demo={props.currentDemo()}
          onStatsUpdate={props.onStatsUpdate}
          onBackToMenu={props.onBackToMenu}
        />
      )}
    </main>
  );
};
