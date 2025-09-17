/**
 * Interactive Dashboard Component
 * Orchestrates dashboard components to demonstrate Reynard's core features
 */
import { fluentIconsPackage } from "reynard-fluent-icons";
import { CounterDemo, StorageDemo, SystemStatus, ColorPicker, AdvancedFeatures, ThreeDDemo } from ".";
import { ChartsDemo } from "./ChartsDemo";
export const InteractiveDashboard = () => {
    return (<section class="dashboard-section">
      <div class="section-header">
        <h2>
          {fluentIconsPackage.getIcon("dashboard") && (<span class="section-icon">
              <div 
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={fluentIconsPackage.getIcon("dashboard")?.outerHTML}/>
            </span>)}
          Interactive Dashboard
        </h2>
        <p>Experience Reynard's reactive capabilities in real-time</p>
      </div>

      <div class="dashboard-grid">
        <CounterDemo />
        <StorageDemo />
        <SystemStatus />
        <ColorPicker />
        <ChartsDemo />
        <ThreeDDemo />
        <AdvancedFeatures />
      </div>
    </section>);
};
