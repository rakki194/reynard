/**
 * Embedding Dashboard Sidebar Component
 *
 * Handles the dashboard sidebar with stats and method selector.
 */
import { EmbeddingStatsPanel } from "./EmbeddingStatsPanel";
import { EmbeddingMethodSelector } from "./EmbeddingMethodSelector";
interface EmbeddingDashboardSidebarProps {
  stats?: any;
  availableMethods?: any;
  reductionMethod?: string;
  reductionParams?: any;
  maxSamples?: number;
  isLoading?: boolean;
  onMethodChange?: (method: string) => void;
  onParameterUpdate?: (params: any) => void;
  onMaxSamplesChange?: (samples: number) => void;
  onPerformReduction?: () => void;
  class?: string;
  [key: string]: any;
}

export const EmbeddingDashboardSidebar = (props: EmbeddingDashboardSidebarProps) => {
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
