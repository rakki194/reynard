/**
 * System Status Component
 * Displays real-time system information and connection status
 */

import { Component } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";
import {
  useOnlineStatus,
  useCurrentTime,
  useThemeContext,
} from "./composables";
import { StatusItem } from "./StatusDisplay";

export const SystemStatus: Component = () => {
  const themeContext = useThemeContext();
  const isOnline = useOnlineStatus();
  const currentTime = useCurrentTime();

  return (
    <div class="dashboard-card">
      <div class="card-header">
        <h3>
          {fluentIconsPackage.getIcon("server") && (
            <span class="card-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("server")?.outerHTML}
              />
            </span>
          )}
          System Status
        </h3>
      </div>
      <div class="card-content">
        <StatusItem
          label="Connection"
          value={isOnline() ? "Online" : "Offline"}
          statusClass={isOnline() ? "online" : "offline"}
        />
        <StatusItem label="Current Time" value={currentTime()} />
        <StatusItem label="Theme" value={themeContext().theme} />
      </div>
    </div>
  );
};
