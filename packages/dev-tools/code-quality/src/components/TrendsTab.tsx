/**
 * Trends Tab Component
 * 
 * Trends tab content for the Code Quality Dashboard
 */

import { RealTimeChart } from "reynard-charts";
import { Grid, GridItem } from "reynard-ui";
import { Component, Show } from "solid-js";

interface TrendsTabProps {
  getTrendChartData: () => any;
}

export const TrendsTab: Component<TrendsTabProps> = props => {
  return (
    <Grid columns={{ xs: 1 }} gap="1rem">
      <GridItem>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Trend Analysis</h2>
          <Show when={props.getTrendChartData()}>
            <RealTimeChart
              type="line"
              data={props.getTrendChartData()!}
              title="Code Quality Trends"
              width={800}
              height={400}
              useOKLCH={true}
            />
          </Show>
        </div>
      </GridItem>
    </Grid>
  );
};
