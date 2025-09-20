/**
 * OKLCH Showcase Advanced Components
 * Advanced features and theme components for the OKLCH showcase
 */
import { ThemeComparison, CustomTagGenerator, OKLCHAdvancedFeatures as AdvancedFeatures } from "./";
export const AdvancedComponents = props => {
    return (<>
      <ThemeComparison availableThemes={props.computedValues.availableThemes} selectedTheme={props.state.selectedTheme()} themeTagColors={props.computedValues.themeTagColors()} onThemeChange={theme => {
            props.state.setSelectedTheme(theme);
            props.state.themeContext.setTheme(theme);
        }}/>

      <CustomTagGenerator availableThemes={props.computedValues.availableThemes} customTag={props.state.customTag()} tagIntensity={props.state.tagIntensity()} onTagChange={props.state.setCustomTag} onIntensityChange={props.state.setTagIntensity}/>

      <AdvancedFeatures showAdvanced={props.state.showAdvanced()} onToggleAdvanced={() => props.state.setShowAdvanced(!props.state.showAdvanced())}/>
    </>);
};
export { AdvancedComponents as OKLCHShowcaseAdvanced };
