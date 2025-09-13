/**
 * 🦊 3D Phyllotactic Controls
 * Configuration controls for 3D phyllotactic system
 */

import { Component } from "solid-js";
import { Card, Slider } from "reynard-components";

interface Phyllotactic3DControlsProps {
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
  onConfigUpdate: () => void;
}

export const Phyllotactic3DControls: Component<Phyllotactic3DControlsProps> = (props) => {
  const handleSliderChange = (setter: (value: number) => void) => (e: any) => {
    setter(parseFloat(e.currentTarget.value));
    props.onConfigUpdate();
  };


  return (
    <Card class="3d-controls">
      <h3>3D Configuration</h3>
      
      <div class="control-group">
        <label>Point Count: {props.pointCount()}</label>
        <Slider
          min={100}
          max={3000}
          step={100}
          value={props.pointCount()}
          onChange={handleSliderChange(props.setPointCount)}
        />
      </div>
      
      <div class="control-group">
        <label>Base Radius: {props.baseRadius()}</label>
        <Slider
          min={5}
          max={50}
          step={1}
          value={props.baseRadius()}
          onChange={handleSliderChange(props.setBaseRadius)}
        />
      </div>
      
      <div class="control-group">
        <label>Height: {props.height()}</label>
        <Slider
          min={50}
          max={300}
          step={10}
          value={props.height()}
          onChange={handleSliderChange(props.setHeight)}
        />
      </div>
      
      <div class="control-group">
        <label>Spiral Pitch: {props.spiralPitch().toFixed(2)}</label>
        <Slider
          min={0.05}
          max={0.5}
          step={0.01}
          value={props.spiralPitch()}
          onChange={handleSliderChange(props.setSpiralPitch)}
        />
      </div>
      
      <div class="control-group">
        <input
          type="checkbox"
          checked={props.enableSphericalProjection()}
          onChange={(e) => {
            props.setEnableSphericalProjection(e.currentTarget.checked);
            props.onConfigUpdate();
          }}
        />
        <label>Enable Spherical Projection</label>
      </div>
      
      <div class="control-group">
        <input
          type="checkbox"
          checked={props.enableStroboscopic3D()}
          onChange={(e) => {
            props.setEnableStroboscopic3D(e.currentTarget.checked);
            props.onConfigUpdate();
          }}
        />
        <label>Enable 3D Stroboscopic Effects</label>
      </div>
    </Card>
  );
};
