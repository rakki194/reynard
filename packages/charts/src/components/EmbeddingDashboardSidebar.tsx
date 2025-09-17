/**
 * Embedding Dashboard Sidebar Component
 *
 * Handles the dashboard sidebar with stats and method selector.
 */

import { Component } from "solid-js";
import { EmbeddingStatsPanel } from "./EmbeddingStatsPanel";
import { EmbeddingMethodSelector } from "./EmbeddingMethodSelector";

export interface EmbeddingDashboardSidebarProps {
  /** Embedding statistics */
  stats: unknown;
  /** Available methods */
  availableMethods: unknown;
  /** Current reduction method */
  reductionMethod: string;
  /** Current reduction parameters */
  reductionParams: Record<string, unknown>;
  /** Maximum samples */
  maxSamples: number;
  /** Whether loading */
  isLoading: boolean;
  /** Method change handler */
  onMethodChange: (method: string) => void;
  /** Parameter update handler */
  onParameterUpdate: (key: string, value: unknown) => void;
  /** Max samples change handler */
  onMaxSamplesChange: (samples: number) => void;
  /** Reduction perform handler */
  onPerformReduction: () => void;
}

export const EmbeddingDashboardSidebar: Component<EmbeddingDashboardSidebarProps> = props => {
  return (
    <div class="dashboard-sidebar">
      <EmbeddingStatsPanel stats={props.stats} />
      <EmbeddingMethodSelector
        availableMethods={props.availableMethods}
        reductionMethod={props.reductionMethod}
        reductionParams={props.reductionParams}
        maxSamples={props.maxSamples}
        isLoading={props.isLoading}
        onMethodChange={props.onMethodChange}
        onParameterUpdate={props.onParameterUpdate}
        onMaxSamplesChange={props.onMaxSamplesChange}
        onPerformReduction={props.onPerformReduction}
      />
    </div>
  );
};
