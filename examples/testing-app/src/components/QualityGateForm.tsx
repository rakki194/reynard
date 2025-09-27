/**
 * Quality Gate Form Component
 * 
 * 🦊 *whiskers twitch with form precision* Form for creating and editing
 * quality gates with dynamic condition management.
 */

import { Component, createSignal, For, Show } from 'solid-js';
import type { 
  QualityGate, 
  QualityGateCondition, 
  CreateQualityGateRequest, 
  UpdateQualityGateRequest 
} from '../types/quality-gates';

interface QualityGateFormProps {
  gate?: QualityGate;
  onSubmit: (data: CreateQualityGateRequest | UpdateQualityGateRequest) => void;
  onCancel: () => void;
}

export const QualityGateForm: Component<QualityGateFormProps> = (props) => {
  const [formData, setFormData] = createSignal({
    gateId: props.gate?.gateId || '',
    name: props.gate?.name || '',
    description: props.gate?.description || '',
    environment: props.gate?.environment || 'development' as const,
    enabled: props.gate?.enabled ?? true,
    isDefault: props.gate?.isDefault ?? false,
  });

  const [conditions, setConditions] = createSignal<QualityGateCondition[]>(
    props.gate?.conditions || []
  );

  const [newCondition, setNewCondition] = createSignal<Partial<QualityGateCondition>>({
    metric: '',
    operator: 'GT' as const,
    threshold: 0,
    errorThreshold: 0,
    warningThreshold: 0,
    description: '',
    enabled: true,
  });

  const [errors, setErrors] = createSignal<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData().gateId.trim()) {
      newErrors.gateId = 'Gate ID is required';
    }
    
    if (!formData().name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (conditions().length === 0) {
      newErrors.conditions = 'At least one condition is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData(),
      conditions: conditions().map(condition => ({
        metric: condition.metric,
        operator: condition.operator,
        threshold: condition.threshold,
        errorThreshold: condition.errorThreshold,
        warningThreshold: condition.warningThreshold,
        description: condition.description,
      })),
    };

    props.onSubmit(submitData);
  };

  const addCondition = () => {
    const condition = newCondition();
    if (!condition.metric || !condition.operator || condition.threshold === undefined) {
      return;
    }

    setConditions(prev => [...prev, condition as QualityGateCondition]);
    setNewCondition({
      metric: '',
      operator: 'GT' as const,
      threshold: 0,
      errorThreshold: 0,
      warningThreshold: 0,
      description: '',
      enabled: true,
    });
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof QualityGateCondition, value: any) => {
    setConditions(prev => prev.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    ));
  };

  const getOperatorSymbol = (operator: string) => {
    switch (operator) {
      case 'GT': return '>';
      case 'LT': return '<';
      case 'EQ': return '=';
      case 'NE': return '≠';
      case 'GTE': return '≥';
      case 'LTE': return '≤';
      default: return operator;
    }
  };

  return (
    <form class="quality-gate-form" onSubmit={handleSubmit}>
      <div class="form-section">
        <h3>Basic Information</h3>
        
        <div class="form-group">
          <label for="gateId">Gate ID *</label>
          <input
            id="gateId"
            type="text"
            value={formData().gateId}
            onInput={(e) => setFormData(prev => ({ ...prev, gateId: e.currentTarget.value }))}
            placeholder="e.g., reynard-development"
            disabled={!!props.gate} // Don't allow editing ID for existing gates
            class={errors().gateId ? 'error' : ''}
          />
          <Show when={errors().gateId}>
            <span class="error-message">{errors().gateId}</span>
          </Show>
        </div>

        <div class="form-group">
          <label for="name">Name *</label>
          <input
            id="name"
            type="text"
            value={formData().name}
            onInput={(e) => setFormData(prev => ({ ...prev, name: e.currentTarget.value }))}
            placeholder="e.g., Reynard Development Gate"
            class={errors().name ? 'error' : ''}
          />
          <Show when={errors().name}>
            <span class="error-message">{errors().name}</span>
          </Show>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            value={formData().description}
            onInput={(e) => setFormData(prev => ({ ...prev, description: e.currentTarget.value }))}
            placeholder="Optional description of this quality gate"
            rows="3"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="environment">Environment</label>
            <select
              id="environment"
              value={formData().environment}
              onChange={(e) => setFormData(prev => ({ ...prev, environment: e.currentTarget.value as any }))}
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
              <option value="all">All Environments</option>
            </select>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={formData().enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.currentTarget.checked }))}
              />
              Enabled
            </label>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={formData().isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.currentTarget.checked }))}
              />
              Default Gate
            </label>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>Conditions</h3>
        
        <Show when={errors().conditions}>
          <div class="error-message">{errors().conditions}</div>
        </Show>

        <div class="conditions-list">
          <For each={conditions()}>
            {(condition, index) => (
              <div class="condition-item">
                <div class="condition-inputs">
                  <input
                    type="text"
                    value={condition.metric}
                    onInput={(e) => updateCondition(index(), 'metric', e.currentTarget.value)}
                    placeholder="Metric name"
                    class="condition-metric"
                  />
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(index(), 'operator', e.currentTarget.value)}
                    class="condition-operator"
                  >
                    <option value="GT">Greater Than (>)</option>
                    <option value="LT">Less Than (<)</option>
                    <option value="EQ">Equal (=)</option>
                    <option value="NE">Not Equal (≠)</option>
                    <option value="GTE">Greater or Equal (≥)</option>
                    <option value="LTE">Less or Equal (≤)</option>
                  </select>
                  <input
                    type="number"
                    value={condition.threshold}
                    onInput={(e) => updateCondition(index(), 'threshold', parseFloat(e.currentTarget.value) || 0)}
                    placeholder="Threshold"
                    class="condition-threshold"
                  />
                </div>
                <div class="condition-advanced">
                  <input
                    type="number"
                    value={condition.errorThreshold || ''}
                    onInput={(e) => updateCondition(index(), 'errorThreshold', parseFloat(e.currentTarget.value) || undefined)}
                    placeholder="Error threshold"
                    class="condition-error-threshold"
                  />
                  <input
                    type="number"
                    value={condition.warningThreshold || ''}
                    onInput={(e) => updateCondition(index(), 'warningThreshold', parseFloat(e.currentTarget.value) || undefined)}
                    placeholder="Warning threshold"
                    class="condition-warning-threshold"
                  />
                  <input
                    type="text"
                    value={condition.description || ''}
                    onInput={(e) => updateCondition(index(), 'description', e.currentTarget.value)}
                    placeholder="Description"
                    class="condition-description"
                  />
                </div>
                <button
                  type="button"
                  class="remove-condition"
                  onClick={() => removeCondition(index())}
                  title="Remove condition"
                >
                  🗑️
                </button>
              </div>
            )}
          </For>
        </div>

        <div class="add-condition">
          <div class="condition-inputs">
            <input
              type="text"
              value={newCondition().metric || ''}
              onInput={(e) => setNewCondition(prev => ({ ...prev, metric: e.currentTarget.value }))}
              placeholder="Metric name"
              class="condition-metric"
            />
            <select
              value={newCondition().operator || 'GT'}
              onChange={(e) => setNewCondition(prev => ({ ...prev, operator: e.currentTarget.value as any }))}
              class="condition-operator"
            >
              <option value="GT">Greater Than (>)</option>
              <option value="LT">Less Than (<)</option>
              <option value="EQ">Equal (=)</option>
              <option value="NE">Not Equal (≠)</option>
              <option value="GTE">Greater or Equal (≥)</option>
              <option value="LTE">Less or Equal (≤)</option>
            </select>
            <input
              type="number"
              value={newCondition().threshold || ''}
              onInput={(e) => setNewCondition(prev => ({ ...prev, threshold: parseFloat(e.currentTarget.value) || 0 }))}
              placeholder="Threshold"
              class="condition-threshold"
            />
          </div>
          <button
            type="button"
            class="add-condition-button"
            onClick={addCondition}
          >
            ➕ Add Condition
          </button>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="cancel-button" onClick={props.onCancel}>
          Cancel
        </button>
        <button type="submit" class="submit-button">
          {props.gate ? 'Update Gate' : 'Create Gate'}
        </button>
      </div>
    </form>
  );
};
