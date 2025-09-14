/**
 * 🦊 3D Data Visualization Component
 * Three.js-based 3D visualization with OKLCH colors and shared data processing
 */

import { Component, createSignal, createMemo } from "solid-js";
import { Card } from "reynard-components";
import { type DataPoint, type VisualizationConfig } from "./VisualizationCore";
import { DataProcessor } from "./DataProcessor";
import { Visualization3DControls } from "./Visualization3DControls";
import { Visualization3DCanvas } from "./Visualization3DCanvas";

interface Visualization3DProps {
  data: DataPoint[];
  config?: Partial<VisualizationConfig>;
  width?: number;
  height?: number;
  enableAnimation?: boolean;
  showControls?: boolean;
}

export const Visualization3D: Component<Visualization3DProps> = (props) => {
  // State for controls
  const [isAnimating, setIsAnimating] = createSignal(false);

  // Process data when props change
  const processedDataMemo = createMemo(() => {
    if (!props.data.length) return null;
    
    const processed = DataProcessor.processData(props.data, {
      normalize: true,
      enableClustering: true,
      clusterCount: 5,
    });
    
    return processed;
  });


  // Animation controls
  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  // Reset camera
  const resetCamera = () => {
    // This will be handled by the canvas component
  };

  return (
    <div class="visualization-3d">
      <Card class="visualization-container">
        <div class="visualization-header">
          <h3>🦊 3D Data Visualization</h3>
          <p>Interactive 3D visualization with Three.js and OKLCH colors</p>
        </div>

        <div class="visualization-content">
          <Visualization3DCanvas
            data={props.data}
            config={props.config}
            width={props.width}
            height={props.height}
            isAnimating={isAnimating}
            processedData={processedDataMemo}
          />

          {props.showControls && (
            <Visualization3DControls
              isAnimating={isAnimating}
              onStartAnimation={startAnimation}
              onStopAnimation={stopAnimation}
              onResetCamera={resetCamera}
              processedData={processedDataMemo}
            />
          )}
        </div>
      </Card>
    </div>
  );
};
