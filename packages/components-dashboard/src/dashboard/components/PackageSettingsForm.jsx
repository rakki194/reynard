/**
 * Package Settings Form Component
 * Form for editing individual package settings
 */
import { For, Show } from "solid-js";
import { Button, TextField, Select } from "reynard-components-core/primitives";
import { Toggle } from "reynard-components-core/primitives";
import { Icon } from "reynard-fluent-icons";
export const PackageSettingsForm = props => {
    const handleSettingChange = (key, value) => {
        const updatedSettings = props.package.settings.map(setting => setting.key === key ? { ...setting, value } : setting);
        // This would typically update local state, but for now we'll just call onSave
        props.onSave(updatedSettings);
    };
    const renderSettingInput = (setting) => {
        switch (setting.type) {
            case "string":
                return (<TextField value={setting.value || ""} onInput={e => handleSettingChange(setting.key, e.currentTarget.value)} placeholder={setting.description} required={setting.required} size="sm"/>);
            case "number":
                return (<TextField type="number" value={setting.value || setting.defaultValue || ""} onInput={e => handleSettingChange(setting.key, Number(e.currentTarget.value))} min={setting.min} max={setting.max} step={setting.step} required={setting.required} size="sm"/>);
            case "boolean":
                return (<Toggle checked={setting.value ?? setting.defaultValue ?? false} onChange={checked => handleSettingChange(setting.key, checked)} size="sm"/>);
            case "select":
                return (<Select value={setting.value || setting.defaultValue || ""} onChange={value => handleSettingChange(setting.key, value)} options={setting.options?.map((opt) => ({
                        value: opt,
                        label: opt,
                    })) || []} required={setting.required} size="sm"/>);
            case "multiselect":
                return (<div class="reynard-multiselect">
            <For each={setting.options || []}>
              {option => (<label class="reynard-multiselect__option">
                  <input type="checkbox" checked={setting.value?.includes(option) || false} onChange={e => {
                            const currentValues = setting.value || [];
                            const newValues = e.currentTarget.checked
                                ? [...currentValues, option]
                                : currentValues.filter((v) => v !== option);
                            handleSettingChange(setting.key, newValues);
                        }}/>
                  {option}
                </label>)}
            </For>
          </div>);
            default:
                return <div>Unsupported setting type: {setting.type}</div>;
        }
    };
    return (<div class="reynard-package-settings-form">
      <div class="reynard-package-settings-form__header">
        <h3>Configure {props.package.name}</h3>
        <p class="reynard-package-settings-form__description">{props.package.description}</p>
      </div>

      <div class="reynard-package-settings-form__content">
        <Show when={props.package.settings.length > 0} fallback={<div class="reynard-package-settings-form__empty">
              <Icon name="settings" size="lg" variant="muted"/>
              <p>No settings available for this package</p>
            </div>}>
          <For each={props.package.settings}>
            {setting => (<div class="reynard-setting-field">
                <div class="reynard-setting-field__label">
                  <label for={setting.key}>{setting.label}</label>
                  {setting.required && <span class="reynard-required">*</span>}
                </div>
                <div class="reynard-setting-field__input">{renderSettingInput(setting)}</div>
                <div class="reynard-setting-field__description">{setting.description}</div>
              </div>)}
          </For>
        </Show>
      </div>

      <div class="reynard-package-settings-form__actions">
        <Button variant="secondary" onClick={props.onCancel} disabled={props.isSaving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => props.onSave(props.package.settings)} loading={props.isSaving}>
          Save Configuration
        </Button>
      </div>
    </div>);
};
