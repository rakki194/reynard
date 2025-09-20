/**
 * Theme Details Component
 * Current theme info and color details toggle
 */
import { fluentIconsPackage } from "reynard-fluent-icons";
import { ColorDetails } from "./ColorDetails";
import { ThemeFeatures } from "./ThemeFeatures";
export const ThemeDetails = props => {
    return (<div class="theme-details-panel">
      <div class="current-theme-info">
        <h3>Current Theme: {props.currentThemeName}</h3>
        <button class="button button--secondary" onClick={() => props.onToggleColorDetails()}>
          {fluentIconsPackage.getIcon(props.showColorDetails ? "eye-off" : "eye") && (<span 
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={fluentIconsPackage.getIcon(props.showColorDetails ? "eye-off" : "eye")?.outerHTML}/>)}
          {props.showColorDetails ? "Hide" : "Show"} Color Details
        </button>
      </div>

      {props.showColorDetails && <ColorDetails colors={props.themeColors} onCopyColor={props.onCopyColor}/>}

      <ThemeFeatures />
    </div>);
};
