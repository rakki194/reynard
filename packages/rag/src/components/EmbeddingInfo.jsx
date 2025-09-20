/**
 * Embedding Information Component
 *
 * Displays embedding vector information and statistics
 */
import { Show } from "solid-js";
import { Card, Button } from "reynard-components-core";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
// Helper function to get icon as JSX element
const getIcon = (name) => {
    const icon = getIconFromRegistry(name);
    if (icon) {
        // eslint-disable-next-line solid/no-innerhtml
        return <div class="icon-wrapper" innerHTML={icon.outerHTML}/>;
    }
    return null;
};
export const EmbeddingInfo = props => {
    const calculateMagnitude = (vector) => {
        return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    };
    return (<Show when={props.isVisible && props.embeddingVector}>
      <Card className="embedding-card">
        <div class="card-header">
          <h4>Embedding Vector</h4>
          <Button variant="ghost" size="small" onClick={props.onToggle} icon={getIcon("close")}/>
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
              {props.embeddingVector?.slice(0, 10).map((val, index) => (<span class="dimension-value" title={`Dimension ${index + 1}: ${val.toFixed(6)}`}>
                  {val.toFixed(3)}
                </span>))}
            </div>
          </div>

          <Button variant="secondary" size="small" onClick={props.onCopyVector} icon={getIcon("copy")} fullWidth>
            Copy Vector
          </Button>
        </div>
      </Card>
    </Show>);
};
