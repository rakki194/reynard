/**
 * Query Stats Component
 *
 * Displays performance metrics for RAG queries
 * including query time, embedding time, and search time.
 */

import { Component } from "solid-js";
import { Icon } from "reynard-components";
import type { RAGQueryResponse } from "../types";

export interface QueryStatsProps {
  queryResponse: RAGQueryResponse;
}

export const QueryStats: Component<QueryStatsProps> = (props) => {
  return (
    <div class="query-stats">
      <div class="stat-item">
        <div class="stat-icon">
          <Icon name="refresh" size="sm" />
        </div>
        <span>
          Query: {props.queryResponse.query_time.toFixed(2)}ms
        </span>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <Icon name="server" size="sm" />
        </div>
        <span>
          Embedding: {props.queryResponse.embedding_time.toFixed(2)}ms
        </span>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <Icon name="refresh" size="sm" />
        </div>
        <span>
          Search: {props.queryResponse.search_time.toFixed(2)}ms
        </span>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <Icon name="server" size="sm" />
        </div>
        <span>{props.queryResponse.total_results} results</span>
      </div>
    </div>
  );
};
