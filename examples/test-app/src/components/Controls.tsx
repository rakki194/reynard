/**
 * 🦊 Controls Component
 * Control panel for the integration demo
 */

import { Component } from "solid-js";
import { Card, Button, Select } from "reynard-primitives";

export interface ControlsProps {
  mode: () => "2d" | "3d";
  setMode: (mode: "2d" | "3d") => void;
  patternType: () => "vogel" | "rotase" | "bernoulli" | "fibonacci-sibling";
  setPatternType: (type: "vogel" | "rotase" | "bernoulli" | "fibonacci-sibling") => void;
  pointCount: () => number;
  setPointCount: (count: number) => void;
  rotationSpeed: () => number;
  setRotationSpeed: (speed: number) => void;
  enableStroboscopic: () => boolean;
  setEnableStroboscopic: (enabled: boolean) => void;
  enableMorphing: () => boolean;
  setEnableMorphing: (enabled: boolean) => void;
  enablePerformanceOptimization: () => boolean;
  setEnablePerformanceOptimization: (enabled: boolean) => void;
  isRunning: () => boolean;
  onRegeneratePattern: () => void;
  onToggleAnimation: () => void;
  onConfigUpdate: () => void;
}

export const Controls: Component<ControlsProps> = props => {
  const handleModeChange = (e: any) => {
    props.setMode(e.currentTarget.value as "2d" | "3d");
    props.onConfigUpdate();
  };

  const handlePatternTypeChange = (e: any) => {
    props.setPatternType(e.currentTarget.value as any);
    props.onConfigUpdate();
  };

  return (
    <Card class="integration-controls">
      <h3>System Configuration</h3>

      <div class="control-group">
        <label>Mode</label>
        <Select
          value={props.mode()}
          onChange={handleModeChange}
          options={[
            { value: "2d", label: "2D Mode" },
            { value: "3d", label: "3D Mode" },
          ]}
        />
      </div>

      <div class="control-group">
        <label>Pattern Type</label>
        <Select
          value={props.patternType()}
          onChange={handlePatternTypeChange}
          options={[
            { value: "vogel", label: "Vogel" },
            { value: "rotase", label: "ROTASE Model" },
            { value: "bernoulli", label: "Bernoulli Lattice" },
            { value: "fibonacci-sibling", label: "Fibonacci Sibling" },
          ]}
        />
      </div>

      <div class="control-group">
        <label>Point Count: {props.pointCount()}</label>
        <input
          type="range"
          min="500"
          max="10000"
          step="500"
          value={props.pointCount()}
          onInput={(e: any) => props.setPointCount(parseInt(e.currentTarget.value))}
        />
      </div>

      <div class="control-group">
        <label>Rotation Speed: {props.rotationSpeed().toFixed(2)}</label>
        <input
          type="range"
          min="0.1"
          max="5.0"
          step="0.1"
          value={props.rotationSpeed()}
          onInput={(e: any) => props.setRotationSpeed(parseFloat(e.currentTarget.value))}
        />
      </div>

      <div class="control-group">
        <input
          type="checkbox"
          checked={props.enableStroboscopic()}
          onChange={e => props.setEnableStroboscopic(e.currentTarget.checked)}
        />
        <label>Enable Stroboscopic Effects</label>
      </div>

      <div class="control-group">
        <input
          type="checkbox"
          checked={props.enableMorphing()}
          onChange={e => props.setEnableMorphing(e.currentTarget.checked)}
        />
        <label>Enable Morphing Effects</label>
      </div>

      <div class="control-group">
        <input
          type="checkbox"
          checked={props.enablePerformanceOptimization()}
          onChange={e => props.setEnablePerformanceOptimization(e.currentTarget.checked)}
        />
        <label>Enable Performance Optimization</label>
      </div>

      <div class="control-group">
        <Button variant="secondary" onClick={props.onRegeneratePattern} class="control-button">
          🔄 Regenerate Pattern
        </Button>
      </div>

      <div class="control-group">
        <Button
          variant={props.isRunning() ? "danger" : "primary"}
          onClick={props.onToggleAnimation}
          class="control-button"
        >
          {props.isRunning() ? "⏹️ Stop Animation" : "▶️ Start Animation"}
        </Button>
      </div>
    </Card>
  );
};
