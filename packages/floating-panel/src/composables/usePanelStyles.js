/**
 * Panel Styles Composable
 *
 * Extracted style generation logic to maintain 140-line axiom.
 */
import { generatePanelStyles } from "./panel-styles/PanelStyleGenerator.js";
export const usePanelStyles = (props) => {
    const styles = generatePanelStyles(props.position, props.size, props.config);
    return {
        styles,
        getCSSVariables: () => generatePanelStyles(props.position, props.size, props.config),
    };
};
