/**
 * OKLCH Buttons Demo Component
 * Shows OKLCH button component examples
 */

import { Component } from "solid-js";
import { OKLCHButton } from ".";

export const OKLCHButtonsDemo: Component = () => {
  return (
    <div class="oklch-buttons-demo">
      <h3>OKLCH Button Components</h3>
      <div class="button-grid">
        <OKLCHButton variant="primary">Primary</OKLCHButton>
        <OKLCHButton variant="secondary">Secondary</OKLCHButton>
        <OKLCHButton variant="accent">Accent</OKLCHButton>
        <OKLCHButton variant="success">Success</OKLCHButton>
        <OKLCHButton variant="warning">Warning</OKLCHButton>
        <OKLCHButton variant="error">Error</OKLCHButton>
        <OKLCHButton variant="info">Info</OKLCHButton>
        <OKLCHButton variant="primary" size="small">
          Small
        </OKLCHButton>
        <OKLCHButton variant="primary" size="large">
          Large
        </OKLCHButton>
        <OKLCHButton variant="primary" disabled>
          Disabled
        </OKLCHButton>
      </div>
    </div>
  );
};
