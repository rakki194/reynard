/**
 * 🦊 3D Phyllotactic Demo Layout
 * Layout component for 3D phyllotactic demo
 */

import { Component } from "solid-js";
import { Phyllotactic3DControls } from "./Phyllotactic3DControls";
import { Phyllotactic3DRotationControls } from "./Phyllotactic3DRotationControls";
import { Phyllotactic3DPerformancePanel } from "./Phyllotactic3DPerformancePanel";
import { Phyllotactic3DCanvas } from "./Phyllotactic3DCanvas";
import { Phyllotactic3DInfoPanel } from "./Phyllotactic3DInfoPanel";

interface Phyllotactic3DDemoLayoutProps {
  demo: {
    pointCount: () => number;
    setPointCount: (value: number) => void;
    baseRadius: () => number;
    setBaseRadius: (value: number) => void;
    height: () => number;
    setHeight: (value: number) => void;
    spiralPitch: () => number;
    setSpiralPitch: (value: number) => void;
    enableSphericalProjection: () => boolean;
    setEnableSphericalProjection: (value: boolean) => void;
    enableStroboscopic3D: () => boolean;
    setEnableStroboscopic3D: (value: boolean) => void;
    rotationSpeedX: () => number;
    setRotationSpeedX: (value: number) => void;
    rotationSpeedY: () => number;
    setRotationSpeedY: (value: number) => void;
    rotationSpeedZ: () => number;
    setRotationSpeedZ: (value: number) => void;
    isRunning: () => boolean;
    currentPoints: () => any[];
    performanceMetrics: () => any;
    updateConfig: () => void;
    generate3DPattern: () => void;
    toggleAnimation: () => void;
    handleCanvasReady: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
  };
}

export const Phyllotactic3DDemoLayout: Component<Phyllotactic3DDemoLayoutProps> = (props) => {
  return (
    <div class="phyllotactic-3d-demo">
      <div class="demo-header">
        <h2>🦊 3D Phyllotactic System</h2>
        <p>Demonstrates 3D phyllotactic structures with rotation and stroboscopic effects</p>
      </div>
      
      <div class="demo-content">
        <div class="demo-controls">
          <Phyllotactic3DControls
            pointCount={props.demo.pointCount}
            setPointCount={props.demo.setPointCount}
            baseRadius={props.demo.baseRadius}
            setBaseRadius={props.demo.setBaseRadius}
            height={props.demo.height}
            setHeight={props.demo.setHeight}
            spiralPitch={props.demo.spiralPitch}
            setSpiralPitch={props.demo.setSpiralPitch}
            enableSphericalProjection={props.demo.enableSphericalProjection}
            setEnableSphericalProjection={props.demo.setEnableSphericalProjection}
            enableStroboscopic3D={props.demo.enableStroboscopic3D}
            setEnableStroboscopic3D={props.demo.setEnableStroboscopic3D}
            onConfigUpdate={props.demo.updateConfig}
          />
          
          <Phyllotactic3DRotationControls
            rotationSpeedX={props.demo.rotationSpeedX}
            setRotationSpeedX={props.demo.setRotationSpeedX}
            rotationSpeedY={props.demo.rotationSpeedY}
            setRotationSpeedY={props.demo.setRotationSpeedY}
            rotationSpeedZ={props.demo.rotationSpeedZ}
            setRotationSpeedZ={props.demo.setRotationSpeedZ}
            isRunning={props.demo.isRunning}
            onConfigUpdate={props.demo.updateConfig}
            onRegenerate={props.demo.generate3DPattern}
            onToggleAnimation={props.demo.toggleAnimation}
          />
          
          <Phyllotactic3DPerformancePanel
            performanceMetrics={props.demo.performanceMetrics}
          />
        </div>
        
        <div class="demo-visualization">
          <Phyllotactic3DCanvas
            currentPoints={props.demo.currentPoints}
            height={props.demo.height}
            spiralPitch={props.demo.spiralPitch}
            onCanvasReady={props.demo.handleCanvasReady}
          />
        </div>
      </div>
      
      <div class="demo-info">
        <Phyllotactic3DInfoPanel />
      </div>
    </div>
  );
};
