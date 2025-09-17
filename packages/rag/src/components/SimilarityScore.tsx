/**
 * Similarity Score Component
 *
 * Displays the similarity score with visual indicators
 */

import { Component } from "solid-js";
import { Card, Badge } from "reynard-components";
import { getScoreColor, getScoreLabel } from "../utils/image-modal-utils";

export interface SimilarityScoreProps {
  score: number;
}

export const SimilarityScore: Component<SimilarityScoreProps> = props => {
  return (
    <Card className="score-card">
      <div class="score-header">
        <h4>Similarity Score</h4>
        <Badge variant={getScoreColor(props.score)}>{getScoreLabel(props.score)}</Badge>
      </div>
      <div class="score-value">{(props.score * 100).toFixed(1)}%</div>
      <div class="score-bar">
        <div
          class="score-fill"
          style={{
            width: `${props.score * 100}%`,
            "background-color": `var(--color-${getScoreColor(props.score)})`,
          }}
        />
      </div>
    </Card>
  );
};
