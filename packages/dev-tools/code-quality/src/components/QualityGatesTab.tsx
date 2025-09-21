/**
 * Quality Gates Tab Component
 * 
 * Quality Gates tab content for the Code Quality Dashboard
 */

import { Grid, GridItem } from "reynard-ui";
import { Component, For, Show } from "solid-js";
import { QualityGateResult } from "../QualityGateManager";

interface QualityGatesTabProps {
  qualityGateResults: QualityGateResult[];
  getQualityGateColor: (status: string) => string;
}

export const QualityGatesTab: Component<QualityGatesTabProps> = props => {
  return (
    <Grid columns={{ xs: 1 }} gap="1rem">
      <GridItem>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Quality Gates</h2>
          <Show when={props.qualityGateResults.length > 0}>
            <div class="space-y-3">
              <For each={props.qualityGateResults}>
                {gate => (
                  <div class={`p-4 rounded-md ${props.getQualityGateColor(gate.status)}`}>
                    <div class="flex justify-between items-center">
                      <div>
                        <h3 class="font-semibold">{gate.gateName}</h3>
                        <p class="text-sm opacity-75">Gate ID: {gate.gateId}</p>
                      </div>
                      <div class="text-right">
                        <div class="font-bold">{gate.status}</div>
                        <div class="text-sm opacity-75">
                          {gate.passedConditions}/{gate.totalConditions} conditions
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </GridItem>
    </Grid>
  );
};
