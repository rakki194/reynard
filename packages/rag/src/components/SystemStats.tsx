/**
 * System Statistics Component
 *
 * Displays RAG system statistics including document counts,
 * embedding coverage, and model information.
 */

import { Show } from "solid-js";
import { Card } from "reynard-components";
import type { RAGStats } from "../types";

export interface SystemStatsProps {
  stats: RAGStats | null;
}

export function SystemStats(props: SystemStatsProps) {
  return (
    <Show when={props.stats}>
      <Card variant="elevated" padding="lg">
        <h3>System Statistics</h3>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Documents</div>
            <div class="stat-value">{props.stats!.total_documents}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Chunks</div>
            <div class="stat-value">{props.stats!.total_chunks}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Embedding Coverage</div>
            <div class="stat-value">
              {(props.stats!.embedding_coverage * 100).toFixed(1)}%
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Default Model</div>
            <div class="stat-model">{props.stats!.default_model}</div>
          </div>
        </div>
      </Card>
    </Show>
  );
}
