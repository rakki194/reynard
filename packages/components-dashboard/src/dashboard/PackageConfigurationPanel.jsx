/**
 * Package Configuration Panel Component
 * Main component for package configuration management
 * Refactored to be modular and under 140 lines
 */
import { Show } from "solid-js";
import { Button } from "reynard-components-core/primitives";
import { Icon } from "reynard-fluent-icons";
import { PackageList } from "./components/PackageList";
import { PackageSettingsForm } from "./components/PackageSettingsForm";
import { usePackageConfiguration } from "./composables/usePackageConfiguration";
export const PackageConfigurationPanel = (props) => {
    const { state, refreshConfigurationData, savePackageConfiguration, saveGlobalConfiguration, selectPackage, setSearchQuery, setSelectedCategory, } = usePackageConfiguration();
    const selectedPackageData = () => {
        const selected = state().selectedPackage;
        return selected
            ? state().packages.find((pkg) => pkg.name === selected)
            : null;
    };
    const handleSavePackageSettings = async (settings) => {
        const selected = state().selectedPackage;
        if (selected) {
            await savePackageConfiguration(selected, settings);
        }
    };
    const handleSaveGlobalSettings = async (config) => {
        await saveGlobalConfiguration(config);
    };
    const handleCancelPackageSettings = () => {
        selectPackage(null);
    };
    const handleCancelGlobalSettings = () => {
        // Reset to original config or close modal
    };
    return (<div class="reynard-package-configuration-panel">
      <div class="reynard-package-configuration-panel__header">
        <div class="reynard-package-configuration-panel__title">
          <Icon name="settings" size="lg"/>
          <h2>Package Configuration</h2>
        </div>
        <div class="reynard-package-configuration-panel__actions">
          <Show when={props.showGlobalSettings}>
            <Button variant="secondary" size="sm" leftIcon="globe">
              Global Settings
            </Button>
          </Show>
          <Button variant="primary" size="sm" leftIcon="refresh" onClick={refreshConfigurationData} loading={state().isRefreshing}>
            Refresh
          </Button>
        </div>
      </div>

      <div class="reynard-package-configuration-panel__content">
        <Show when={selectedPackageData()} fallback={<PackageList packages={state().packages} selectedPackage={state().selectedPackage} onSelectPackage={selectPackage} searchQuery={state().searchQuery} onSearchChange={setSearchQuery} selectedCategory={state().selectedCategory} onCategoryChange={setSelectedCategory} isRefreshing={state().isRefreshing} onRefresh={refreshConfigurationData}/>}>
          <PackageSettingsForm package={selectedPackageData()} onSave={handleSavePackageSettings} onCancel={handleCancelPackageSettings} isSaving={state().isSaving}/>
        </Show>
      </div>

      <Show when={state().lastUpdate}>
        <div class="reynard-package-configuration-panel__footer">
          <small>Last updated: {state().lastUpdate?.toLocaleString()}</small>
        </div>
      </Show>
    </div>);
};
