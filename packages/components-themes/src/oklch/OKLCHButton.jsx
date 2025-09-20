/**
 * OKLCH Button Component
 * Example component demonstrating OKLCH color usage
 */
import { useThemeColors } from "reynard-themes";
import "./OKLCHButton.css";
export const OKLCHButton = props => {
    const themeColors = useThemeColors();
    const variant = () => props.variant || "primary";
    const size = () => props.size || "medium";
    const getButtonStyles = () => {
        const baseColor = themeColors.getColor(variant());
        const hoverColor = themeColors.getColorVariant(variant(), "hover");
        const activeColor = themeColors.getColorVariant(variant(), "active");
        return {
            "--button-bg": baseColor,
            "--button-hover": hoverColor,
            "--button-active": activeColor,
            "--button-text": themeColors.getContrastColor(baseColor),
        };
    };
    return (<button class={`oklch-button oklch-button--${variant()} oklch-button--${size()} ${props.class || ""}`} ref={el => {
            if (el) {
                const styles = getButtonStyles();
                Object.entries(styles).forEach(([key, value]) => {
                    el.style.setProperty(key, value);
                });
            }
        }} onClick={() => props.onClick?.()} disabled={props.disabled}>
      {props.children}
    </button>);
};
