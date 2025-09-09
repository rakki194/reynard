/**
 * BreadcrumbActions Component
 * Action buttons for breadcrumb navigation
 */

import { Component } from "solid-js";
import { Button } from "reynard-components";

export interface BreadcrumbActionsProps {
  showFullPaths: boolean;
  onToggleFullPaths: () => void;
  onRefreshClick: () => void;
  onSettingsClick: () => void;
}

export const BreadcrumbActions: Component<BreadcrumbActionsProps> = (props) => {
  return (
    <div class="reynard-breadcrumb-navigation__actions">
      <Button
        size="sm"
        variant="secondary"
        onClick={props.onToggleFullPaths}
        title={props.showFullPaths ? "Show short paths" : "Show full paths"}
      >
        {props.showFullPaths ? "Short" : "Full"}
      </Button>

      <Button
        size="sm"
        variant="secondary"
        onClick={props.onRefreshClick}
        title="Refresh current location"
      >
        🔄
      </Button>

      <Button
        size="sm"
        variant="secondary"
        onClick={props.onSettingsClick}
        title="Breadcrumb settings"
      >
        ⚙️
      </Button>
    </div>
  );
};
