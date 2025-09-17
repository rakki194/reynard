import { Component } from "solid-js";
import type { BasePointCloudRendererProps } from "../types/rendering";
import { RendererInfo } from "./RendererInfo";
import { RendererControls } from "./RendererControls";
import { RendererStats } from "./RendererStats";

interface RendererUIProps {
  props: BasePointCloudRendererProps;
  pointCloudRenderer: any;
  onConfigChange: (newConfig: any) => void;
}

export const RendererUI: Component<RendererUIProps> = uiProps => {
  return (
    <div class="base-point-cloud-renderer">
      <RendererInfo
        pointCount={uiProps.props.points.length}
        config={uiProps.props.config}
        materialStats={
          uiProps.pointCloudRenderer()?.materialManager()?.getStats() || {
            cached: 0,
          }
        }
        geometryStats={
          uiProps.pointCloudRenderer()?.geometryManager()?.getStats() || {
            cached: 0,
          }
        }
      />

      <RendererControls config={uiProps.props.config} onConfigChange={uiProps.onConfigChange} />

      <RendererStats
        materialStats={
          uiProps.pointCloudRenderer()?.materialManager()?.getStats() || {
            cached: 0,
          }
        }
        geometryStats={
          uiProps.pointCloudRenderer()?.geometryManager()?.getStats() || {
            cached: 0,
          }
        }
      />
    </div>
  );
};
