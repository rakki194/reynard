/**
 * Overview Tab Component
 *
 * Overview tab content for the Code Quality Dashboard
 */

import { Chart } from "reynard-charts";
import { Grid, GridItem } from "reynard-ui";
import { Component, Show } from "solid-js";
import { AnalysisResult } from "../types";

interface OverviewTabProps {
  currentAnalysis: AnalysisResult | null;
  getRatingColor: (rating: string) => string;
  getMetricsChartData: () => any;
}

export const OverviewTab: Component<OverviewTabProps> = props => {
  return (
    <Grid columns={{ xs: 1, md: 2, lg: 3 }} gap="1rem">
      {/* Key Metrics */}
      <GridItem colSpan={{ xs: 1, md: 2, lg: 3 }}>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Key Metrics</h2>
          <Show when={props.currentAnalysis}>
            <Grid columns={{ xs: 2, md: 4 }} gap="1rem">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">
                  {props.currentAnalysis?.metrics.linesOfCode.toLocaleString()}
                </div>
                <div class="text-sm text-gray-600">Lines of Code</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-red-600">{props.currentAnalysis?.issues.length || 0}</div>
                <div class="text-sm text-gray-600">Total Issues</div>
              </div>
              <div class="text-center">
                <div
                  class={`text-3xl font-bold ${props.getRatingColor(
                    props.currentAnalysis?.metrics.reliabilityRating || "E"
                  )}`}
                >
                  {props.currentAnalysis?.metrics.reliabilityRating || "E"}
                </div>
                <div class="text-sm text-gray-600">Reliability</div>
              </div>
              <div class="text-center">
                <div
                  class={`text-3xl font-bold ${props.getRatingColor(
                    props.currentAnalysis?.metrics.securityRating || "E"
                  )}`}
                >
                  {props.currentAnalysis?.metrics.securityRating || "E"}
                </div>
                <div class="text-sm text-gray-600">Security</div>
              </div>
            </Grid>
          </Show>
        </div>
      </GridItem>

      {/* Issues Chart */}
      <GridItem colSpan={{ xs: 1, md: 2 }}>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Issues Breakdown</h2>
          <Show when={props.getMetricsChartData()}>
            <Chart type="doughnut" data={props.getMetricsChartData()!} width={400} height={300} useOKLCH={true} />
          </Show>
        </div>
      </GridItem>

      {/* Quality Ratings */}
      <GridItem>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Quality Ratings</h2>
          <Show when={props.currentAnalysis}>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span>Reliability</span>
                <span
                  class={`font-bold ${props.getRatingColor(props.currentAnalysis?.metrics.reliabilityRating || "E")}`}
                >
                  {props.currentAnalysis?.metrics.reliabilityRating || "E"}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span>Security</span>
                <span class={`font-bold ${props.getRatingColor(props.currentAnalysis?.metrics.securityRating || "E")}`}>
                  {props.currentAnalysis?.metrics.securityRating || "E"}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span>Maintainability</span>
                <span
                  class={`font-bold ${props.getRatingColor(
                    props.currentAnalysis?.metrics.maintainabilityRating || "E"
                  )}`}
                >
                  {props.currentAnalysis?.metrics.maintainabilityRating || "E"}
                </span>
              </div>
            </div>
          </Show>
        </div>
      </GridItem>
    </Grid>
  );
};
