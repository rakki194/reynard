/**
 * 🦊 Golden Angle Color Distribution Demo
 * Visual demonstration of how the golden angle creates distinct colors
 */

import { Component, For, createSignal, onMount } from "solid-js";

const GOLDEN_ANGLE = (137.507 * Math.PI) / 180;

interface ColorPoint {
  index: number;
  hue: number;
  x: number;
  y: number;
  color: string;
}

export const GoldenAngleDemo: Component = () => {
  const [colorPoints, setColorPoints] = createSignal<ColorPoint[]>([]);
  const [showNumbers, setShowNumbers] = createSignal(true);
  const [pointCount, setPointCount] = createSignal(50);
  const [sunflowerMode, setSunflowerMode] = createSignal(true);

  const generateColorPoints = (count: number): ColorPoint[] => {
    const points: ColorPoint[] = [];
    const centerX = 300;
    const centerY = 300;
    const maxRadius = 250;

    for (let i = 0; i < count; i++) {
      const hue = ((i * GOLDEN_ANGLE * 180) / Math.PI) % 360;
      const angle = (i * GOLDEN_ANGLE) % (2 * Math.PI);

      // Choose pattern based on mode
      let radius;
      if (sunflowerMode()) {
        // Sunflower pattern: distance proportional to index
        radius = Math.sqrt(i) * 8; // Scale factor for nice distribution
      } else {
        // Circle pattern: all points on same radius
        radius = maxRadius;
      }
      const clampedRadius = Math.min(radius, maxRadius);

      const x = centerX + Math.cos(angle) * clampedRadius;
      const y = centerY + Math.sin(angle) * clampedRadius;

      points.push({
        index: i,
        hue,
        x,
        y,
        color: `hsl(${hue}, 70%, 60%)`,
      });
    }

    return points;
  };

  onMount(() => {
    setColorPoints(generateColorPoints(pointCount()));
  });

  const updatePoints = () => {
    setColorPoints(generateColorPoints(pointCount()));
  };

  return (
    <div class="golden-angle-demo">
      <h3>🦊 Golden Angle Color Distribution</h3>
      <p>
        Each dot represents a color generated using the golden angle (137.507°).
        The sunflower pattern shows how colors are distributed with perfect
        mathematical spacing!
      </p>

      <div class="demo-controls">
        <div class="control-group">
          <label for="point-count">Points: {pointCount()}</label>
          <input
            id="point-count"
            type="range"
            min="10"
            max="200"
            step="10"
            value={pointCount()}
            onInput={(e) => {
              setPointCount(parseInt(e.target.value));
              updatePoints();
            }}
          />
        </div>

        <div class="control-group">
          <label>
            <input
              type="checkbox"
              checked={showNumbers()}
              onChange={(e) => setShowNumbers(e.target.checked)}
            />
            Show Index Numbers
          </label>
        </div>

        <div class="control-group">
          <label>
            <input
              type="checkbox"
              checked={sunflowerMode()}
              onChange={(e) => {
                setSunflowerMode(e.target.checked);
                updatePoints();
              }}
            />
            Sunflower Pattern
          </label>
        </div>
      </div>

      <div class="demo-visualization">
        <svg width="600" height="600" class="color-circle">
          <circle
            cx="300"
            cy="300"
            r="250"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            opacity="0.3"
          />

          <For each={colorPoints()}>
            {(point) => (
              <g>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill={point.color}
                  stroke="white"
                  stroke-width="2"
                />
                {showNumbers() && (
                  <text
                    x={point.x}
                    y={point.y + 3}
                    text-anchor="middle"
                    font-size="10"
                    fill="white"
                    font-weight="bold"
                  >
                    {point.index}
                  </text>
                )}
              </g>
            )}
          </For>
        </svg>
      </div>

      <div class="demo-explanation">
        <div class="explanation-grid">
          <div class="explanation-card">
            <h4>🎯 Maximum Separation</h4>
            <p>
              Each new color is positioned as far as possible from all previous
              colors in hue space.
            </p>
          </div>
          <div class="explanation-card">
            <h4>♾️ No Repetition</h4>
            <p>
              The irrational golden angle ensures the sequence never repeats,
              even with millions of colors.
            </p>
          </div>
          <div class="explanation-card">
            <h4>🌻 Natural Distribution</h4>
            <p>
              Same principle used in nature for optimal packing (sunflower
              seeds, pinecones).
            </p>
          </div>
          <div class="explanation-card">
            <h4>🎨 Visual Harmony</h4>
            <p>
              Creates aesthetically pleasing color palettes with perfect visual
              balance.
            </p>
          </div>
        </div>
      </div>

      <div class="math-formula">
        <h4>Mathematical Formula:</h4>
        <code>hue = (index × 137.507°) mod 360°</code>
        <p>Where 137.507° = 360° / φ² (golden ratio squared)</p>
      </div>
    </div>
  );
};
