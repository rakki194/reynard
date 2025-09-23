/**
 * Embedding Information Component
 *
 * Displays embedding vector information and statistics
 */
import { Show } from "solid-js";
import { Card, Button } from "reynard-components-core";
import { Icon } from "reynard-components-core";
export const EmbeddingInfo = (props: any) => {
  const calculateMagnitude = (vector: any) => {
    return Math.sqrt(vector.reduce((sum: any, val: any) => sum + val * val, 0));
  };
  return (
    <Show when={props.isVisible && props.embeddingVector}>
      <Card class="embedding-card">
        <div class="card-header">
          <h4>Embedding Vector</h4>
          <Button variant="ghost" size="sm" onClick={props.onToggle} leftIcon={<Icon name="close" />} />
        </div>
        <div class="embedding-content">
          <div class="embedding-stats">
            <div class="stat-item">
              <span class="stat-label">Dimensions:</span>
              <span class="stat-value">{props.embeddingVector?.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Magnitude:</span>
              <span class="stat-value">
                {props.embeddingVector ? calculateMagnitude(props.embeddingVector).toFixed(4) : "N/A"}
              </span>
            </div>
          </div>

          <div class="embedding-preview">
            <div class="preview-label">First 10 dimensions:</div>
            <div class="preview-values">
              {props.embeddingVector?.slice(0, 10).map((val: any, index: any) => (
                <span class="dimension-value" title={`Dimension ${index + 1}: ${val.toFixed(6)}`}>
                  {val.toFixed(3)}
                </span>
              ))}
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={props.onCopyVector} leftIcon={<Icon name="copy" />} fullWidth>
            Copy Vector
          </Button>
        </div>
      </Card>
    </Show>
  );
};
