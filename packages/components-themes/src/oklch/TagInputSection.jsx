/**
 * Tag Input Section Component
 * Handles tag name input and intensity control
 */
import { Slider } from "reynard-components-core/primitives";
import "./TagComponents.css";
export const TagInputSection = props => {
    return (<div class="tag-input-section">
      <input type="text" placeholder="Enter tag name" value={props.tagInput()} onInput={e => props.setTagInput(e.target.value)}/>
      <Slider min={0.1} max={2.0} step={0.1} value={props.intensity()} onChange={props.setIntensity} aria-label="Color intensity"/>
      <span>Intensity: {props.intensity()}</span>
    </div>);
};
