/**
 * 🦊 Layout Component
 * Layout for the integration demo
 */

import { Component } from "solid-js";
import { Controls } from "./Controls";
import { Status } from "./Status";
import { Metrics } from "./Metrics";
import { Visualization } from "./Visualization";
import { Info } from "./Info";

export interface LayoutProps {
  integration: any;
}

export const Layout: Component<LayoutProps> = props => {
  return (
    <div class="integration-demo">
      <div class="demo-content">
        <div class="demo-controls">
          <Controls
            mode={props.integration.mode}
            setMode={props.integration.setMode}
            patternType={props.integration.patternType}
            setPatternType={props.integration.setPatternType}
            pointCount={props.integration.pointCount}
            setPointCount={props.integration.setPointCount}
            rotationSpeed={props.integration.rotationSpeed}
            setRotationSpeed={props.integration.setRotationSpeed}
            enableStroboscopic={props.integration.enableStroboscopic}
            setEnableStroboscopic={props.integration.setEnableStroboscopic}
            enableMorphing={props.integration.enableMorphing}
            setEnableMorphing={props.integration.setEnableMorphing}
            enablePerformanceOptimization={props.integration.enablePerformanceOptimization}
            setEnablePerformanceOptimization={props.integration.setEnablePerformanceOptimization}
            isRunning={props.integration.isRunning}
            onRegeneratePattern={props.integration.generatePattern}
            onToggleAnimation={props.integration.toggleAnimation}
            onConfigUpdate={props.integration.updateConfig}
          />

          <Status
            mode={props.integration.mode}
            patternType={props.integration.patternType}
            currentPoints={props.integration.engines.currentPoints}
            stroboscopicState={props.integration.engines.stroboscopicState}
            qualityLevel={props.integration.engines.qualityLevel}
            enablePerformanceOptimization={props.integration.enablePerformanceOptimization}
          />

          <Metrics performanceMetrics={props.integration.engines.performanceMetrics} />
        </div>

        <Visualization
          mode={props.integration.mode}
          patternType={props.integration.patternType}
          currentPoints={props.integration.engines.currentPoints}
          enableStroboscopic={props.integration.enableStroboscopic}
          stroboscopicState={props.integration.engines.stroboscopicState}
        />
      </div>

      <Info />
    </div>
  );
};
