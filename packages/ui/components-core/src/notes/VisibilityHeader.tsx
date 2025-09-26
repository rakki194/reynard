/**
 * Visibility Header Component
 *
 * Displays the header for the visibility control section.
 */

import { Component } from "solid-js";
import { Icon } from "../icons/Icon";

export const VisibilityHeader: Component = () => {
  return (
    <div style={{ display: "flex", "align-items": "center", "margin-bottom": "16px" }}>
      <Icon name="shield" style={{ "margin-right": "8px" }} />
      <span style={{ "font-weight": "600" }}>Visibility & Access Control</span>
    </div>
  );
};

export default VisibilityHeader;
