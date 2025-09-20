/**
 * Model Manager Component
 *
 * Comprehensive dashboard for managing AI models, monitoring system health,
 * and viewing usage statistics. Provides real-time updates and model control.
 *
 * Features:
 * - Model loading/unloading controls
 * - Health status monitoring
 * - Usage statistics display
 * - System performance metrics
 * - Real-time event updates
 */
import { Show } from "solid-js";
import { HealthOverview, ModelsGrid } from "./ModelManagerComponents";
import { useModelManager } from "./useModelManager";
import "./ModelManager.css";
export const ModelManager = props => {
    const { models, systemHealth, error, loadModel, unloadModel, clearError } = useModelManager({
        baseUrl: props.backendConfig?.baseUrl || "http://localhost:8000",
        apiKey: props.backendConfig?.apiKey,
    });
    return (<div class={`model-manager ${props.className || ""}`}>
      <div class="manager-header">
        <h3 class="manager-title">Model Manager</h3>
        <p class="manager-description">Manage AI models, monitor system health, and view usage statistics</p>
      </div>

      <div class="manager-content">
        <HealthOverview systemHealth={systemHealth()}/>
        <ModelsGrid models={models()} onLoad={loadModel} onUnload={unloadModel}/>

        <Show when={error()}>
          <div class="error-message">
            <div class="error-icon">⚠️</div>
            <div class="error-text">{error()}</div>
            <button type="button" class="error-dismiss" onClick={clearError}>
              Dismiss
            </button>
          </div>
        </Show>
      </div>
    </div>);
};
