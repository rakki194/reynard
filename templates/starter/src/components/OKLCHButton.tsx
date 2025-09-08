/**
 * OKLCH Button Component
 * Example component demonstrating OKLCH color usage
 */

import { Component, JSX } from "solid-js";
import { useThemeColors } from "reynard-themes";

interface OKLCHButtonProps {
  children: JSX.Element;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  class?: string;
}

export const OKLCHButton: Component<OKLCHButtonProps> = (props) => {
  const themeColors = useThemeColors();
  
  const variant = () => props.variant || 'primary';
  const size = () => props.size || 'medium';
  
  const getButtonStyles = () => {
    const baseColor = themeColors.getColor(variant());
    const hoverColor = themeColors.getColorVariant(variant(), 'hover');
    const activeColor = themeColors.getColorVariant(variant(), 'active');
    
    return {
      '--button-bg': baseColor,
      '--button-hover': hoverColor,
      '--button-active': activeColor,
      '--button-text': themeColors.getContrastColor(baseColor),
    };
  };
  
  const getSizeStyles = () => {
    switch (size()) {
      case 'small':
        return { padding: '0.5rem 1rem', fontSize: '0.875rem' };
      case 'large':
        return { padding: '1rem 2rem', fontSize: '1.125rem' };
      default:
        return { padding: '0.75rem 1.5rem', fontSize: '1rem' };
    }
  };

  return (
    <button
      class={`oklch-button oklch-button--${variant()} oklch-button--${size()} ${props.class || ''}`}
      style={{
        ...getButtonStyles(),
        ...getSizeStyles(),
        opacity: props.disabled ? 0.6 : 1,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};
