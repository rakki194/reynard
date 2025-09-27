/**
 * Filter Panel Component
 * 
 * 🦦 *splashes with filtering enthusiasm* Provides comprehensive filtering
 * options for test runs with real-time updates.
 */

import { Component, createSignal, For, Show } from 'solid-js';
import type { FilterOptions } from '../types/testing';

interface FilterPanelProps {
  onFiltersChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const FilterPanel: Component<FilterPanelProps> = (props) => {
  const [filters, setFilters] = createSignal<FilterOptions>(props.initialFilters || {});
  const [isExpanded, setIsExpanded] = createSignal(false);

  const testTypes = [
    { value: 'pytest', label: 'Pytest', icon: '🐍' },
    { value: 'vitest', label: 'Vitest', icon: '⚡' },
    { value: 'e2e', label: 'E2E Tests', icon: '🎭' },
    { value: 'benchmark', label: 'Benchmarks', icon: '📊' },
    { value: 'performance', label: 'Performance', icon: '⚡' },
    { value: 'coverage', label: 'Coverage', icon: '📈' },
    { value: 'tracing', label: 'Tracing', icon: '🔍' },
  ];

  const environments = [
    { value: 'development', label: 'Development' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' },
    { value: 'test', label: 'Test' },
  ];

  const statuses = [
    { value: 'running', label: 'Running' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    const newFilters = { ...filters(), [key]: value };
    setFilters(newFilters);
    props.onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {};
    setFilters(emptyFilters);
    props.onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = () => {
    const current = filters();
    return Object.values(current).some(value => value !== undefined && value !== null && value !== '');
  };

  return (
    <div class="filter-panel">
      <div class="filter-header">
        <button 
          class="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded())}
        >
          <span class="filter-icon">🔍</span>
          <span class="filter-title">Filters</span>
          <Show when={hasActiveFilters()}>
            <span class="active-indicator">●</span>
          </Show>
          <span class="expand-icon">{isExpanded() ? '▲' : '▼'}</span>
        </button>
        
        <Show when={hasActiveFilters()}>
          <button class="clear-filters" onClick={clearFilters}>
            Clear All
          </button>
        </Show>
      </div>

      <Show when={isExpanded()}>
        <div class="filter-content">
          <div class="filter-section">
            <h4 class="filter-section-title">Test Type</h4>
            <div class="filter-options">
              <For each={testTypes}>
                {(type) => (
                  <label class="filter-option">
                    <input
                      type="radio"
                      name="test_type"
                      value={type.value}
                      checked={filters().test_type === type.value}
                      onChange={(e) => updateFilter('test_type', e.currentTarget.value || undefined)}
                    />
                    <span class="option-icon">{type.icon}</span>
                    <span class="option-label">{type.label}</span>
                  </label>
                )}
              </For>
              <label class="filter-option">
                <input
                  type="radio"
                  name="test_type"
                  value=""
                  checked={!filters().test_type}
                  onChange={() => updateFilter('test_type', undefined)}
                />
                <span class="option-label">All Types</span>
              </label>
            </div>
          </div>

          <div class="filter-section">
            <h4 class="filter-section-title">Environment</h4>
            <div class="filter-options">
              <For each={environments}>
                {(env) => (
                  <label class="filter-option">
                    <input
                      type="radio"
                      name="environment"
                      value={env.value}
                      checked={filters().environment === env.value}
                      onChange={(e) => updateFilter('environment', e.currentTarget.value || undefined)}
                    />
                    <span class="option-label">{env.label}</span>
                  </label>
                )}
              </For>
              <label class="filter-option">
                <input
                  type="radio"
                  name="environment"
                  value=""
                  checked={!filters().environment}
                  onChange={() => updateFilter('environment', undefined)}
                />
                <span class="option-label">All Environments</span>
              </label>
            </div>
          </div>

          <div class="filter-section">
            <h4 class="filter-section-title">Status</h4>
            <div class="filter-options">
              <For each={statuses}>
                {(status) => (
                  <label class="filter-option">
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={filters().status === status.value}
                      onChange={(e) => updateFilter('status', e.currentTarget.value || undefined)}
                    />
                    <span class="option-label">{status.label}</span>
                  </label>
                )}
              </For>
              <label class="filter-option">
                <input
                  type="radio"
                  name="status"
                  value=""
                  checked={!filters().status}
                  onChange={() => updateFilter('status', undefined)}
                />
                <span class="option-label">All Statuses</span>
              </label>
            </div>
          </div>

          <div class="filter-section">
            <h4 class="filter-section-title">Branch</h4>
            <input
              type="text"
              class="filter-input"
              placeholder="Enter branch name..."
              value={filters().branch || ''}
              onInput={(e) => updateFilter('branch', e.currentTarget.value || undefined)}
            />
          </div>

          <div class="filter-section">
            <h4 class="filter-section-title">Date Range</h4>
            <div class="date-inputs">
              <div class="date-input-group">
                <label class="date-label">From:</label>
                <input
                  type="datetime-local"
                  class="filter-input"
                  value={filters().date_from || ''}
                  onInput={(e) => updateFilter('date_from', e.currentTarget.value || undefined)}
                />
              </div>
              <div class="date-input-group">
                <label class="date-label">To:</label>
                <input
                  type="datetime-local"
                  class="filter-input"
                  value={filters().date_to || ''}
                  onInput={(e) => updateFilter('date_to', e.currentTarget.value || undefined)}
                />
              </div>
            </div>
          </div>

          <div class="filter-section">
            <h4 class="filter-section-title">Results Limit</h4>
            <select
              class="filter-select"
              value={filters().limit || 50}
              onChange={(e) => updateFilter('limit', parseInt(e.currentTarget.value))}
            >
              <option value={25}>25 results</option>
              <option value={50}>50 results</option>
              <option value={100}>100 results</option>
              <option value={200}>200 results</option>
            </select>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default FilterPanel;
