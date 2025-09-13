/**
 * Embedding Method Selector Component
 *
 * Handles dimensionality reduction method selection and parameter configuration.
 */

import { Component, For, Show } from "solid-js";

export interface EmbeddingMethodSelectorProps {
  /** Available reduction methods */
  availableMethods: any;
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
  onParameterUpdate: (key: string, value: any) => void;
  /** Max samples change handler */
  onMaxSamplesChange: (samples: number) => void;
  /** Reduction perform handler */
  onPerformReduction: () => void;
}

export const EmbeddingMethodSelector: Component<
  EmbeddingMethodSelectorProps
> = (props) => {
  if (!props.availableMethods) return null;

  return (
    <div class="method-selector">
      <h3>Dimensionality Reduction</h3>
      <div class="method-controls">
        <div class="method-select">
          <label>Method:</label>
          <select
            value={props.reductionMethod}
            onChange={(e) => props.onMethodChange(e.currentTarget.value)}
            title="Select reduction method"
          >
            <For each={Object.keys(props.availableMethods.methods)}>
              {(method) => (
                <option value={method}>
                  {props.availableMethods.methods[method].name}
                </option>
              )}
            </For>
          </select>
        </div>

        <div class="samples-control">
          <label>Max Samples:</label>
          <input
            type="number"
            value={props.maxSamples}
            min="100"
            max="10000"
            step="100"
            onChange={(e) =>
              props.onMaxSamplesChange(parseInt(e.currentTarget.value))
            }
            title="Maximum number of samples"
            placeholder="1000"
          />
        </div>

        <button
          class="reduce-button"
          onClick={props.onPerformReduction}
          disabled={props.isLoading}
        >
          {props.isLoading ? "Processing..." : "Perform Reduction"}
        </button>
      </div>

      <Show when={props.availableMethods.methods[props.reductionMethod]}>
        <div class="method-parameters">
          <h4>Parameters</h4>
          <For
            each={Object.entries(
              props.availableMethods.methods[props.reductionMethod].parameters,
            )}
          >
            {([paramName, paramInfo]: [string, any]) => (
              <div class="parameter-control">
                <label>{paramInfo.description}:</label>
                <Show when={paramInfo.type === "integer"}>
                  <input
                    type="number"
                    value={
                      props.reductionParams[paramName] || paramInfo.default
                    }
                    min={paramInfo.min}
                    max={paramInfo.max}
                    onChange={(e) =>
                      props.onParameterUpdate(
                        paramName,
                        parseInt(e.currentTarget.value),
                      )
                    }
                    title={`${paramInfo.description} (${paramInfo.min}-${paramInfo.max})`}
                    placeholder={paramInfo.default?.toString()}
                  />
                </Show>
                <Show when={paramInfo.type === "float"}>
                  <input
                    type="number"
                    step="0.1"
                    value={
                      props.reductionParams[paramName] || paramInfo.default
                    }
                    min={paramInfo.min}
                    max={paramInfo.max}
                    onChange={(e) =>
                      props.onParameterUpdate(
                        paramName,
                        parseFloat(e.currentTarget.value),
                      )
                    }
                    title={`${paramInfo.description} (${paramInfo.min}-${paramInfo.max})`}
                    placeholder={paramInfo.default?.toString()}
                  />
                </Show>
                <Show when={paramInfo.type === "boolean"}>
                  <input
                    type="checkbox"
                    checked={
                      props.reductionParams[paramName] || paramInfo.default
                    }
                    onChange={(e) =>
                      props.onParameterUpdate(
                        paramName,
                        e.currentTarget.checked,
                      )
                    }
                    title={paramInfo.description}
                  />
                </Show>
                <Show when={paramInfo.type === "string" && paramInfo.options}>
                  <select
                    value={
                      props.reductionParams[paramName] || paramInfo.default
                    }
                    onChange={(e) =>
                      props.onParameterUpdate(paramName, e.currentTarget.value)
                    }
                    title={paramInfo.description}
                  >
                    <For each={paramInfo.options}>
                      {(option: string) => (
                        <option value={option}>{option}</option>
                      )}
                    </For>
                  </select>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
