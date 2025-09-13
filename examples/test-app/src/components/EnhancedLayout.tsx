/**
 * 🦊 Enhanced Layout Component
 * Layout for the integration demo
 */

import { Component } from "solid-js";
import { EnhancedControls } from "./EnhancedControls";
import { EnhancedStatus } from "./EnhancedStatus";
import { EnhancedMetrics } from "./EnhancedMetrics";
import { EnhancedVisualization } from "./EnhancedVisualization";
import { EnhancedInfo } from "./EnhancedInfo";

export interface LayoutProps {
  integration: any;
}

export const EnhancedLayout: Component<LayoutProps> = (props) => {
  return (
    <div class="enhanced-integration-demo">
      <div class="demo-content">
        <div class="demo-controls">
          <EnhancedControls
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
          
          <EnhancedStatus
            mode={props.integration.mode}
            patternType={props.integration.patternType}
            currentPoints={props.integration.engines.currentPoints}
            stroboscopicState={props.integration.engines.stroboscopicState}
            qualityLevel={props.integration.engines.qualityLevel}
            enablePerformanceOptimization={props.integration.enablePerformanceOptimization}
          />
          
          <EnhancedMetrics
            performanceMetrics={props.integration.engines.performanceMetrics}
          />
        </div>
        
        <EnhancedVisualization
          mode={props.integration.mode}
          patternType={props.integration.patternType}
          currentPoints={props.integration.engines.currentPoints}
          enableStroboscopic={props.integration.enableStroboscopic}
          stroboscopicState={props.integration.engines.stroboscopicState}
        />
      </div>
      
      <EnhancedInfo />
    </div>
  );
};
