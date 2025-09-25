/**
 * PackageDependencyGraph Component
 * Visual dependency graph and conflict resolution interface
 */
import { Show, For, createSignal, onMount } from "solid-js";
import { Button } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { log } from "reynard-error-boundaries";
export const PackageDependencyGraph = props => {
  const [dependencies, setDependencies] = createSignal([]);
  const [conflicts, setConflicts] = createSignal([]);
  const [selectedPackage, setSelectedPackage] = createSignal(null);
  const [isResolving, setIsResolving] = createSignal(false);
  onMount(() => {
    // Initial data load
    loadDependencyData();
  });
  const loadDependencyData = async () => {
    try {
      // Simulate API calls to backend dependency resolution endpoints
      const mockDependencies = [
        {
          name: "torch",
          version: "2.1.0",
          dependencies: ["numpy", "typing-extensions"],
          dependents: ["transformers", "scikit-learn"],
          conflicts: [],
          status: "resolved",
          isInstalled: true,
        },
        {
          name: "transformers",
          version: "4.35.0",
          dependencies: ["torch", "numpy", "tokenizers"],
          dependents: [],
          conflicts: [],
          status: "resolved",
          isInstalled: true,
        },
        {
          name: "numpy",
          version: "1.24.0",
          dependencies: [],
          dependents: ["torch", "transformers", "pandas", "scikit-learn"],
          conflicts: [],
          status: "resolved",
          isInstalled: true,
        },
        {
          name: "pandas",
          version: "2.0.0",
          dependencies: ["numpy", "python-dateutil"],
          dependents: [],
          conflicts: [],
          status: "resolved",
          isInstalled: true,
        },
        {
          name: "scikit-learn",
          version: "1.3.0",
          dependencies: ["numpy", "scipy"],
          dependents: [],
          conflicts: ["sklearn"],
          status: "conflict",
          isInstalled: false,
        },
        {
          name: "sklearn",
          version: "0.24.0",
          dependencies: ["numpy", "scipy"],
          dependents: [],
          conflicts: ["scikit-learn"],
          status: "conflict",
          isInstalled: true,
        },
        {
          name: "matplotlib",
          version: "3.7.0",
          dependencies: ["numpy", "pillow"],
          dependents: [],
          conflicts: [],
          status: "resolved",
          isInstalled: false,
        },
        {
          name: "tokenizers",
          version: "0.14.0",
          dependencies: [],
          dependents: ["transformers"],
          conflicts: [],
          status: "resolved",
          isInstalled: true,
        },
      ];
      const mockConflicts = [
        {
          package1: "scikit-learn",
          package2: "sklearn",
          conflictType: "version",
          description: "Both packages provide the same functionality but with different APIs",
          resolution: "manual",
        },
      ];
      setDependencies(mockDependencies);
      setConflicts(mockConflicts);
    } catch (error) {
      log.error("Failed to load dependency data", error instanceof Error ? error : new Error(String(error)), undefined, {
        component: "PackageDependencyGraph",
        function: "loadDependencyData"
      });
    }
  };
  const handleResolveConflict = async (package1, package2) => {
    setIsResolving(true);
    try {
      // In a real implementation, this would call the backend conflict resolution endpoint
      log.info(`Resolving conflict between ${package1} and ${package2}`, undefined, {
        component: "PackageDependencyGraph",
        function: "handleResolveConflict"
      });
      // Simulate conflict resolution
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Update dependencies to reflect resolution
      setDependencies(prev =>
        prev.map(dep =>
          dep.name === package1 || dep.name === package2 ? { ...dep, status: "resolved", conflicts: [] } : dep
        )
      );
      // Remove resolved conflict
      setConflicts(prev =>
        prev.filter(conflict => !(conflict.package1 === package1 && conflict.package2 === package2))
      );
    } catch (error) {
      log.error("Failed to resolve conflict", error instanceof Error ? error : new Error(String(error)), undefined, {
        component: "PackageDependencyGraph",
        function: "handleResolveConflict"
      });
    } finally {
      setIsResolving(false);
    }
  };
  const handleAutoResolveAll = async () => {
    setIsResolving(true);
    try {
      // In a real implementation, this would call the backend auto-resolution endpoint
      log.info("Auto-resolving all conflicts", undefined, {
        component: "PackageDependencyGraph",
        function: "handleAutoResolveAll"
      });
      // Simulate auto-resolution
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Update all conflicts to resolved
      setDependencies(prev =>
        prev.map(dep => (dep.status === "conflict" ? { ...dep, status: "resolved", conflicts: [] } : dep))
      );
      // Clear all conflicts
      setConflicts([]);
    } catch (error) {
      log.error("Failed to auto-resolve conflicts", error instanceof Error ? error : new Error(String(error)), undefined, {
        component: "PackageDependencyGraph",
        function: "handleAutoResolveAll"
      });
    } finally {
      setIsResolving(false);
    }
  };
  const getDependencyStatusIcon = status => {
    switch (status) {
      case "resolved":
        return "checkmark-circle";
      case "conflict":
        return "warning";
      case "missing":
        return "dismiss-circle";
      case "circular":
        return "arrow-sync";
      default:
        return "info";
    }
  };
  const getDependencyStatusColor = status => {
    switch (status) {
      case "resolved":
        return "success";
      case "conflict":
        return "warning";
      case "missing":
        return "error";
      case "circular":
        return "error";
      default:
        return "neutral";
    }
  };
  const getConflictTypeIcon = type => {
    switch (type) {
      case "version":
        return "number-symbol";
      case "dependency":
        return "link";
      case "circular":
        return "arrow-sync";
      default:
        return "warning";
    }
  };
  const getConflictTypeColor = type => {
    switch (type) {
      case "version":
        return "warning";
      case "dependency":
        return "error";
      case "circular":
        return "error";
      default:
        return "neutral";
    }
  };
  const getResolutionColor = resolution => {
    switch (resolution) {
      case "automatic":
        return "success";
      case "manual":
        return "warning";
      case "none":
        return "error";
      default:
        return "neutral";
    }
  };
  const filteredDependencies = () => {
    const deps = dependencies();
    if (selectedPackage()) {
      const selected = selectedPackage();
      return deps.filter(
        dep => dep.name === selected || dep.dependencies.includes(selected) || dep.dependents.includes(selected)
      );
    }
    return deps;
  };
  return (
    <div class="package-dependency-graph">
      {/* Header */}
      <div class="dependency-graph-header">
        <div class="dependency-graph-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("diagram")?.outerHTML || ""}
            />
          </span>
          <h3>Package Dependencies</h3>
        </div>

        <div class="dependency-graph-actions">
          <Show when={conflicts().length > 0}>
            <Button variant="primary" onClick={handleAutoResolveAll} disabled={isResolving()}>
              <Show when={isResolving()} fallback="Auto-Resolve All">
                <span class="spinner" />
                Resolving...
              </Show>
            </Button>
          </Show>

          <Button variant="secondary" onClick={loadDependencyData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div class="dependency-summary">
        <div class="summary-item">
          <span class="label">Total Packages:</span>
          <span class="value">{dependencies().length}</span>
        </div>
        <div class="summary-item">
          <span class="label">Resolved:</span>
          <span class="value success">{dependencies().filter(d => d.status === "resolved").length}</span>
        </div>
        <div class="summary-item">
          <span class="label">Conflicts:</span>
          <span class="value error">{dependencies().filter(d => d.status === "conflict").length}</span>
        </div>
        <div class="summary-item">
          <span class="label">Missing:</span>
          <span class="value error">{dependencies().filter(d => d.status === "missing").length}</span>
        </div>
      </div>

      {/* Package Filter */}
      <div class="package-filter">
        <select value={selectedPackage() || ""} onChange={e => setSelectedPackage(e.currentTarget.value || null)}>
          <option value="">All Packages</option>
          <For each={dependencies()}>{dep => <option value={dep.name}>{dep.name}</option>}</For>
        </select>
      </div>

      {/* Dependencies List */}
      <div class="dependencies-list">
        <For each={filteredDependencies()}>
          {dep => (
            <div class="dependency-item">
              <div class="dependency-header">
                <div class="dependency-info">
                  <span class="icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon(getDependencyStatusIcon(dep.status))?.outerHTML || ""}
                    />
                  </span>

                  <div class="dependency-details">
                    <span class="dependency-name">{dep.name}</span>
                    <span class="dependency-version">v{dep.version}</span>
                  </div>
                </div>

                <div class="dependency-status">
                  <span class="status-badge" classList={{ [getDependencyStatusColor(dep.status)]: true }}>
                    {dep.status}
                  </span>

                  <Show when={dep.isInstalled}>
                    <span class="installed-badge">Installed</span>
                  </Show>
                </div>
              </div>

              {/* Dependency Details */}
              <div class="dependency-details-expanded">
                <Show when={dep.dependencies.length > 0}>
                  <div class="detail-row">
                    <span class="label">Dependencies:</span>
                    <span class="value">{dep.dependencies.join(", ")}</span>
                  </div>
                </Show>

                <Show when={dep.dependents.length > 0}>
                  <div class="detail-row">
                    <span class="label">Dependents:</span>
                    <span class="value">{dep.dependents.join(", ")}</span>
                  </div>
                </Show>

                <Show when={dep.conflicts.length > 0}>
                  <div class="detail-row error">
                    <span class="label">Conflicts:</span>
                    <span class="value">{dep.conflicts.join(", ")}</span>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Conflicts Section */}
      <Show when={props.showConflicts && conflicts().length > 0}>
        <div class="conflicts-section">
          <h4>Dependency Conflicts</h4>
          <div class="conflicts-list">
            <For each={conflicts()}>
              {conflict => (
                <div class="conflict-item">
                  <div class="conflict-header">
                    <div class="conflict-info">
                      <span class="icon">
                        <div
                          // eslint-disable-next-line solid/no-innerhtml
                          innerHTML={
                            fluentIconsPackage.getIcon(getConflictTypeIcon(conflict.conflictType))?.outerHTML || ""
                          }
                        />
                      </span>

                      <div class="conflict-details">
                        <span class="conflict-packages">
                          {conflict.package1} ↔ {conflict.package2}
                        </span>
                        <span class="conflict-type">{conflict.conflictType}</span>
                      </div>
                    </div>

                    <div class="conflict-status">
                      <span
                        class="resolution-badge"
                        classList={{
                          [getResolutionColor(conflict.resolution)]: true,
                        }}
                      >
                        {conflict.resolution}
                      </span>
                    </div>
                  </div>

                  <div class="conflict-description">
                    <span class="label">Description:</span>
                    <span class="value">{conflict.description}</span>
                  </div>

                  <Show when={props.showResolution && conflict.resolution === "manual"}>
                    <div class="conflict-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResolveConflict(conflict.package1, conflict.package2)}
                        disabled={isResolving()}
                      >
                        Resolve Conflict
                      </Button>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* No Conflicts Message */}
      <Show when={conflicts().length === 0}>
        <div class="no-conflicts">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("checkmark-circle")?.outerHTML || ""}
            />
          </span>
          <span>No dependency conflicts detected</span>
        </div>
      </Show>
    </div>
  );
};
