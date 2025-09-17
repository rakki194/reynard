/**
 * ServiceRestartPanel Component
 * Service restart functionality with bulk actions and recovery options
 */
import { For, Show, createSignal } from "solid-js";
import { Button } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
export const ServiceRestartPanel = props => {
    const [selectedServices, setSelectedServices] = createSignal([]);
    const [isRestarting, setIsRestarting] = createSignal(false);
    const [restartProgress, setRestartProgress] = createSignal({});
    // Mock service data
    const [services] = createSignal([
        {
            name: "caption-service",
            status: "running",
            health: "healthy",
            canRestart: true,
            lastRestart: new Date(Date.now() - 3600000),
            restartCount: 2,
        },
        {
            name: "nlweb-service",
            status: "running",
            health: "healthy",
            canRestart: true,
            lastRestart: new Date(Date.now() - 7200000),
            restartCount: 1,
        },
        {
            name: "summarization-service",
            status: "running",
            health: "degraded",
            canRestart: true,
            lastRestart: new Date(Date.now() - 1800000),
            restartCount: 3,
        },
        {
            name: "comfy-service",
            status: "failed",
            health: "unhealthy",
            canRestart: true,
            lastRestart: new Date(Date.now() - 300000),
            restartCount: 5,
        },
    ]);
    const filteredServices = () => {
        const serviceList = services();
        if (props.showFailedOnly) {
            return serviceList.filter(s => s.status === "failed" || s.health === "unhealthy");
        }
        return serviceList;
    };
    const handleServiceSelect = (serviceName) => {
        const selected = selectedServices();
        if (selected.includes(serviceName)) {
            setSelectedServices(selected.filter(name => name !== serviceName));
        }
        else {
            setSelectedServices([...selected, serviceName]);
        }
    };
    const handleSelectAll = () => {
        const filtered = filteredServices();
        const selected = selectedServices();
        if (selected.length === filtered.length) {
            setSelectedServices([]);
        }
        else {
            setSelectedServices(filtered.map(s => s.name));
        }
    };
    const handleRestartService = async (serviceName) => {
        setIsRestarting(true);
        setRestartProgress({ [serviceName]: 0 });
        // Simulate restart progress
        for (let i = 0; i <= 100; i += 10) {
            setRestartProgress({ [serviceName]: i });
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        // Clear progress after completion
        setTimeout(() => {
            setRestartProgress({});
            setIsRestarting(false);
        }, 1000);
    };
    const handleBulkRestart = async () => {
        const selected = selectedServices();
        if (selected.length === 0)
            return;
        setIsRestarting(true);
        for (const serviceName of selected) {
            setRestartProgress(prev => ({ ...prev, [serviceName]: 0 }));
            // Simulate restart progress
            for (let i = 0; i <= 100; i += 10) {
                setRestartProgress(prev => ({ ...prev, [serviceName]: i }));
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        // Clear progress after completion
        setTimeout(() => {
            setRestartProgress({});
            setIsRestarting(false);
            setSelectedServices([]);
        }, 1000);
    };
    const getStatusIcon = (service) => {
        if (service.status === "failed")
            return "dismiss-circle";
        if (service.status === "running" && service.health === "healthy")
            return "checkmark-circle";
        if (service.status === "running" && service.health === "degraded")
            return "warning";
        if (service.status === "starting")
            return "spinner";
        if (service.status === "stopping")
            return "warning";
        return "info";
    };
    const getStatusColor = (service) => {
        if (service.status === "failed")
            return "error";
        if (service.status === "running" && service.health === "healthy")
            return "success";
        if (service.status === "running" && service.health === "degraded")
            return "warning";
        if (service.status === "starting")
            return "info";
        if (service.status === "stopping")
            return "warning";
        return "neutral";
    };
    return (<div class="service-restart-panel">
      {/* Header */}
      <div class="restart-panel-header">
        <div class="restart-panel-title">
          <span class="icon">
            <div 
    // eslint-disable-next-line solid/no-innerhtml
    innerHTML={fluentIconsPackage.getIcon("arrow-clockwise")?.outerHTML || ""}/>
          </span>
          <h3>Service Restart</h3>
        </div>

        <div class="restart-panel-actions">
          <Show when={props.showBulkActions && selectedServices().length > 0}>
            <Button variant="primary" onClick={handleBulkRestart} disabled={isRestarting()}>
              Restart Selected ({selectedServices().length})
            </Button>
          </Show>
        </div>
      </div>

      {/* Bulk Actions */}
      <Show when={props.showBulkActions}>
        <div class="bulk-actions">
          <Button variant="secondary" size="sm" onClick={handleSelectAll}>
            {selectedServices().length === filteredServices().length ? "Deselect All" : "Select All"}
          </Button>
        </div>
      </Show>

      {/* Services List */}
      <div class="restart-services-list">
        <For each={filteredServices()}>
          {service => (<div class="restart-service-item">
              <div class="service-header">
                <div class="service-info">
                  <Show when={props.showBulkActions}>
                    <input type="checkbox" id={`service-checkbox-${service.name}`} checked={selectedServices().includes(service.name)} onChange={() => handleServiceSelect(service.name)} aria-label={`Select ${service.name} for bulk operations`}/>
                  </Show>

                  <span class="icon">
                    <div 
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={fluentIconsPackage.getIcon(getStatusIcon(service))?.outerHTML || ""}/>
                  </span>

                  <span class="service-name">{service.name}</span>

                  <span class="status-badge" classList={{ [getStatusColor(service)]: true }}>
                    {service.status}
                  </span>
                </div>

                <div class="service-actions">
                  <Show when={service.canRestart}>
                    <Button variant="secondary" size="sm" onClick={() => handleRestartService(service.name)} disabled={isRestarting()}>
                      Restart
                    </Button>
                  </Show>
                </div>
              </div>

              {/* Service Details */}
              <div class="service-details">
                <div class="detail-item">
                  <span class="label">Health:</span>
                  <span class="value">{service.health}</span>
                </div>

                <Show when={service.lastRestart}>
                  <div class="detail-item">
                    <span class="label">Last Restart:</span>
                    <span class="value">{service.lastRestart.toLocaleString()}</span>
                  </div>
                </Show>

                <div class="detail-item">
                  <span class="label">Restart Count:</span>
                  <span class="value">{service.restartCount}</span>
                </div>
              </div>

              {/* Restart Progress */}
              <Show when={restartProgress()[service.name] !== undefined}>
                <div class="restart-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" data-progress={restartProgress()[service.name]}/>
                  </div>
                  <span class="progress-text">{restartProgress()[service.name]}%</span>
                </div>
              </Show>
            </div>)}
        </For>
      </div>

      {/* Recovery Options */}
      <Show when={props.showRecoveryOptions}>
        <div class="recovery-options">
          <h4>Recovery Options</h4>
          <div class="recovery-actions">
            <Button variant="secondary" size="sm">
              Restart All Failed Services
            </Button>
            <Button variant="secondary" size="sm">
              Restart All Services
            </Button>
            <Button variant="secondary" size="sm">
              Clear Service Cache
            </Button>
          </div>
        </div>
      </Show>
    </div>);
};
