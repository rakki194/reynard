/**
 * HomeButton Component
 * Home button for breadcrumb navigation
 */

import { Component } from "solid-js";
import { Button } from "reynard-components";

export interface HomeButtonProps {
  onHomeClick: () => void;
}

export const HomeButton: Component<HomeButtonProps> = props => {
  return (
    <li class="reynard-breadcrumb-navigation__item">
      <Button
        variant="ghost"
        size="sm"
        onClick={props.onHomeClick}
        class="reynard-breadcrumb-navigation__home-button"
        aria-label="Go to home"
      >
        🏠
      </Button>
    </li>
  );
};
