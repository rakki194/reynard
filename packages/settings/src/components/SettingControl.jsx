/**
 * Setting Control Component
 * Dynamic form control based on setting type
 */
import { createMemo, Show, For, splitProps } from "solid-js";
import { Button, TextField, Select, Slider, Toggle } from "reynard-components";;
export const SettingControl = (props) => {
  const [local, others] = splitProps(props, [
    "definition",
    "value",
    "onChange",
    "error",
    "disabled",
    "class",
  ]);
  // Memoized control ID
  const controlId = createMemo(() => `setting-${local.definition.key}`);
  // Handle change with type conversion
  const handleChange = (newValue) => {
    const { type } = local.definition;
    let convertedValue = newValue;
    // Type conversion based on setting type
    switch (type) {
      case "number":
      case "range":
        convertedValue =
          typeof newValue === "string" ? parseFloat(newValue) : newValue;
        break;
      case "boolean":
        convertedValue =
          typeof newValue === "string"
            ? newValue === "true"
            : Boolean(newValue);
        break;
      case "json":
        if (typeof newValue === "string") {
          try {
            convertedValue = JSON.parse(newValue);
          } catch {
            // Keep as string if invalid JSON - validation will catch it
            convertedValue = newValue;
          }
        }
        break;
      case "multiselect":
        if (!Array.isArray(convertedValue)) {
          convertedValue = [];
        }
        break;
    }
    local.onChange(convertedValue);
  };
  // Render control based on type
  const renderControl = () => {
    const { type, validation, options } = local.definition;
    const isDisabled = local.disabled || local.definition.readonly;
    switch (type) {
      case "boolean":
        return (
          <label class="setting-control__toggle">
            <Toggle
    size="sm"
  /> handleChange(e.target.checked)}
              disabled={isDisabled}
              class="setting-control__checkbox"
            />
            <span class="setting-control__slider"></span>
          </label>
        );
      case "string":
        return (
          <TextField
            id={controlId()}
            value={local.value || ""}
            onInput={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            placeholder={local.definition.description}
            error={!!local.error}
            minLength={validation?.minLength}
            maxLength={validation?.maxLength}
            pattern={validation?.pattern?.source}
          />
        );
      case "number":
        return (
          <TextField
            id={controlId()}
            type="number"
            value={local.value?.toString() || ""}
            onInput={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            placeholder={local.definition.description}
            error={!!local.error}
            min={validation?.min}
            max={validation?.max}
            step={validation?.step}
          />
        );
      case "range":
        return (
          <div class="setting-control__range">
            <Slider
              id={controlId()}
              value={local.value || validation?.min || 0}
              onChange={handleChange}
              disabled={isDisabled}
              min={validation?.min}
              max={validation?.max}
              step={validation?.step}
              class="setting-control__range-input"
            />
            <span class="setting-control__range-value">{local.value}</span>
          </div>
        );
      case "select":
        return (
          <Select
            id={controlId()}
            value={local.value}
            onChange={handleChange}
            disabled={isDisabled}
            placeholder="Select an option..."
            error={!!local.error}
            options={options || []}
          />
        );
      case "multiselect":
        return (
          <div class="setting-control__multiselect">
            <For each={options || []}>
              {(option) => (
                <label class="setting-control__checkbox-option">
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(local.value) &&
                      local.value.includes(option.value)
                    }
                    onChange={(e) => {
                      const currentValues = Array.isArray(local.value)
                        ? local.value
                        : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v) => v !== option.value);
                      handleChange(newValues);
                    }}
                    disabled={isDisabled || option.disabled}
                  />
                  <span class="setting-control__checkbox-label">
                    {option.label}
                  </span>
                </label>
              )}
            </For>
          </div>
        );
      case "color":
        return (
          <div class="setting-control__color">
            <input
              type="color"
              id={controlId()}
              value={local.value || "#000000"}
              onInput={(e) => handleChange(e.target.value)}
              disabled={isDisabled}
              class="setting-control__color-input"
            />
            <TextField
              value={local.value || ""}
              onInput={(e) => handleChange(e.target.value)}
              disabled={isDisabled}
              placeholder="#000000"
              error={!!local.error}
              class="setting-control__color-text"
            />
          </div>
        );
      case "date":
        return (
          <TextField
            id={controlId()}
            type="date"
            value={
              local.value
                ? local.value instanceof Date
                  ? local.value.toISOString().split("T")[0]
                  : local.value
                : ""
            }
            onInput={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            error={!!local.error}
          />
        );
      case "time":
        return (
          <TextField
            id={controlId()}
            type="time"
            value={local.value || ""}
            onInput={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            error={!!local.error}
          />
        );
      case "datetime":
        return (
          <TextField
            id={controlId()}
            type="datetime-local"
            value={
              local.value
                ? local.value instanceof Date
                  ? local.value.toISOString().slice(0, 16)
                  : local.value
                : ""
            }
            onInput={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            error={!!local.error}
          />
        );
      case "json":
        return (
          <textarea
            id={controlId()}
            value={
              typeof local.value === "string"
                ? local.value
                : JSON.stringify(local.value, null, 2)
            }
            onInput={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            placeholder="Enter JSON data..."
            class={`setting-control__textarea ${local.error ? "setting-control__textarea--error" : ""}`}
            rows={6}
          />
        );
      case "file":
      case "folder":
        return (
          <div class="setting-control__file">
            <TextField
              id={controlId()}
              value={local.value || ""}
              onInput={(e) => handleChange(e.target.value)}
              disabled={isDisabled}
              placeholder={
                type === "file" ? "Enter file path..." : "Enter folder path..."
              }
              error={!!local.error}
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={isDisabled}
              onClick={() => {
                // In a real app, you'd open a file/folder picker
                const input = document.createElement("input");
                input.type = "file";
                if (type === "folder") {
                  input.setAttribute("webkitdirectory", "");
                }
                input.onchange = (e) => {
                  const files = e.target.files;
                  if (files && files[0]) {
                    handleChange(files[0].name);
                  }
                };
                input.click();
              }}
            >
              Browse
            </Button>
          </div>
        );
      default:
        return (
          <TextField
            id={controlId()}
            value={local.value?.toString() || ""}
            onInput={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            placeholder={local.definition.description}
            error={!!local.error}
          />
        );
    }
  };
  return (
    <div class={`setting-control ${local.class || ""}`}>
      <div class="setting-control__header">
        <label
          for={controlId()}
          class={`setting-control__label ${local.definition.required ? "setting-control__label--required" : ""}`}
        >
          {local.definition.label}
          <Show when={local.definition.required}>
            <span class="setting-control__required">*</span>
          </Show>
        </label>

        <Show when={local.definition.help}>
          <button
            type="button"
            class="setting-control__help"
            title={local.definition.help}
            onClick={() => {
              // In a real app, you might show a tooltip or modal
              alert(local.definition.help);
            }}
          >
            ?
          </button>
        </Show>

        <Show when={local.definition.experimental}>
          <span class="setting-control__experimental">Experimental</span>
        </Show>
      </div>

      <Show when={local.definition.description}>
        <div class="setting-control__description">
          {local.definition.description}
        </div>
      </Show>

      <div class="setting-control__input">{renderControl()}</div>

      <Show when={local.error}>
        <div class="setting-control__error">{local.error}</div>
      </Show>

      <Show
        when={
          local.definition.validation?.min !== undefined ||
          local.definition.validation?.max !== undefined
        }
      >
        <div class="setting-control__hint">
          <Show
            when={
              local.definition.validation?.min !== undefined &&
              local.definition.validation?.max !== undefined
            }
          >
            Range: {local.definition.validation.min} -{" "}
            {local.definition.validation.max}
          </Show>
          <Show
            when={
              local.definition.validation?.min !== undefined &&
              local.definition.validation?.max === undefined
            }
          >
            Minimum: {local.definition.validation.min}
          </Show>
          <Show
            when={
              local.definition.validation?.min === undefined &&
              local.definition.validation?.max !== undefined
            }
          >
            Maximum: {local.definition.validation.max}
          </Show>
        </div>
      </Show>
    </div>
  );
};
