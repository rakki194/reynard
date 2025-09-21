/**
 * Security Tab Component
 * 
 * Security tab content for the Code Quality Dashboard
 */

import { Grid, GridItem } from "reynard-ui";
import { Component, Show } from "solid-js";
import { SecurityAnalysisResult } from "../SecurityAnalysisIntegration";

interface SecurityTabProps {
  securityAnalysis: SecurityAnalysisResult | null;
  getRatingColor: (rating: string) => string;
}

export const SecurityTab: Component<SecurityTabProps> = props => {
  return (
    <Grid columns={{ xs: 1, md: 2 }} gap="1rem">
      <GridItem colSpan={{ xs: 1, md: 2 }}>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Security Analysis</h2>
          <Show when={props.securityAnalysis}>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-3xl font-bold text-red-600">
                  {props.securityAnalysis?.summary.totalVulnerabilities || 0}
                </div>
                <div class="text-sm text-gray-600">Vulnerabilities</div>
              </div>
              <div class="text-center">
                      <div class="text-3xl font-bold text-orange-600">
                        {props.securityAnalysis?.summary.totalHotspots || 0}
                      </div>
                <div class="text-sm text-gray-600">Security Hotspots</div>
              </div>
              <div class="text-center">
                <div
                  class={`text-3xl font-bold ${props.getRatingColor(
                    props.securityAnalysis?.summary.securityRating || "E"
                  )}`}
                >
                  {props.securityAnalysis?.summary.securityRating || "E"}
                </div>
                <div class="text-sm text-gray-600">Security Rating</div>
              </div>
            </div>
          </Show>
        </div>
      </GridItem>
    </Grid>
  );
};
