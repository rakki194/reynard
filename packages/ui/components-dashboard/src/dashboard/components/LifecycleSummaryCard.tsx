/**
 * Lifecycle Summary Card Component
 * Displays summary statistics for package lifecycle management
 */
import { Button } from "reynard-primitives";
import { Icon } from "reynard-fluent-icons";
export const LifecycleSummaryCard = props => {
  const formatMemoryUsage = bytes => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const formatLoadTime = ms => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };
  return (
    <div class="reynard-lifecycle-summary-card">
      <div class="reynard-lifecycle-summary-card__header">
        <h3>Package Lifecycle Summary</h3>
        <Button variant="secondary" size="sm" onClick={props.onRefresh} loading={props.isRefreshing} leftIcon="refresh">
          Refresh
        </Button>
      </div>

      <div class="reynard-lifecycle-summary-card__content">
        <div class="reynard-summary-grid">
          <div class="reynard-summary-item">
            <div class="reynard-summary-item__icon">
              <Icon name="package" variant="primary" />
            </div>
            <div class="reynard-summary-item__content">
              <div class="reynard-summary-item__value">{props.summary.totalPackages}</div>
              <div class="reynard-summary-item__label">Total Packages</div>
            </div>
          </div>

          <div class="reynard-summary-item">
            <div class="reynard-summary-item__icon">
              <Icon name="checkmark-circle" variant="success" />
            </div>
            <div class="reynard-summary-item__content">
              <div class="reynard-summary-item__value">{props.summary.loadedPackages}</div>
              <div class="reynard-summary-item__label">Loaded</div>
            </div>
          </div>

          <div class="reynard-summary-item">
            <div class="reynard-summary-item__icon">
              <Icon name="circle" variant="muted" />
            </div>
            <div class="reynard-summary-item__content">
              <div class="reynard-summary-item__value">{props.summary.unloadedPackages}</div>
              <div class="reynard-summary-item__label">Unloaded</div>
            </div>
          </div>

          <div class="reynard-summary-item">
            <div class="reynard-summary-item__icon">
              <Icon name="loading" variant="info" />
            </div>
            <div class="reynard-summary-item__content">
              <div class="reynard-summary-item__value">{props.summary.loadingPackages}</div>
              <div class="reynard-summary-item__label">Loading</div>
            </div>
          </div>

          <div class="reynard-summary-item">
            <div class="reynard-summary-item__icon">
              <Icon name="warning" variant="warning" />
            </div>
            <div class="reynard-summary-item__content">
              <div class="reynard-summary-item__value">{props.summary.errorPackages}</div>
              <div class="reynard-summary-item__label">Errors</div>
            </div>
          </div>

          <div class="reynard-summary-item">
            <div class="reynard-summary-item__icon">
              <Icon name="memory" variant="info" />
            </div>
            <div class="reynard-summary-item__content">
              <div class="reynard-summary-item__value">{formatMemoryUsage(props.summary.totalMemoryUsage)}</div>
              <div class="reynard-summary-item__label">Memory Usage</div>
            </div>
          </div>

          <div class="reynard-summary-item">
            <div class="reynard-summary-item__icon">
              <Icon name="clock" variant="primary" />
            </div>
            <div class="reynard-summary-item__content">
              <div class="reynard-summary-item__value">{formatLoadTime(props.summary.averageLoadTime)}</div>
              <div class="reynard-summary-item__label">Avg Load Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
