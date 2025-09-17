export const RendererStats = (props) => {
    return (<div class="renderer-stats">
      <div class="stats-item">
        <span class="label">Materials:</span>
        <span class="value">{props.materialStats.cached}</span>
      </div>
      <div class="stats-item">
        <span class="label">Geometries:</span>
        <span class="value">{props.geometryStats.cached}</span>
      </div>
    </div>);
};
