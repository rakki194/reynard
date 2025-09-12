import { Component } from "solid-js";
import { useI18n } from "reynard-i18n";

export interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: Component<LoadingSpinnerProps> = (props) => {
  const { t } = useI18n();
  
  return (
    <div class="threejs-loading">
      <div class="loading-spinner" />
      <span>{props.message || t('3d.loading3DVisualization')}</span>
    </div>
  );
};
