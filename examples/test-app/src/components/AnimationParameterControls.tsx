/**
 * 🦊 Animation Parameter Controls
 * Controls for adjusting animation and spiral parameters
 */

import { Component } from "solid-js";
import { Card, Button } from "reynard-components";
import type { GameConfig } from "./PhyllotacticSpiralLogic";

interface AnimationParameterControlsProps {
  config: GameConfig;
  animationConfig: {
    frameRate: number;
    maxFPS: number;
    enableVSync: boolean;
    enablePerformanceMonitoring: boolean;
  };
  onConfigChange: (config: Partial<GameConfig>) => void;
  onAnimationConfigChange: (
    config: Partial<AnimationParameterControlsProps["animationConfig"]>,
  ) => void;
}

export const AnimationParameterControls: Component<
  AnimationParameterControlsProps
> = (props) => {
  console.log("🦊 AnimationParameterControls: Component rendering with props", {
    config: props.config,
    animationConfig: props.animationConfig,
  });

  return (
    <Card class="parameter-controls">
      <div class="controls-header">
        <h3>🦊 Animation Parameters</h3>
        <p>Fine-tune the phyllotactic spiral animation</p>

        <div class="preset-buttons">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              props.onConfigChange({
                pointCount: 50,
                rotationSpeed: 0.1,
                spiralGrowth: 1.0,
                baseRadius: 10,
                dotSize: 1.0,
                angleFraction: 0.382,
                step: 0.5,
                rotationFraction: 0.382,
                lockRotation: false,
              });
              props.onAnimationConfigChange({ frameRate: 30 });
            }}
          >
            🐌 Slow & Minimal
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              props.onConfigChange({
                pointCount: 1000,
                rotationSpeed: 5.0,
                spiralGrowth: 8.0,
                baseRadius: 50,
                dotSize: 3.0,
                angleFraction: 0.382,
                step: 0.5,
                rotationFraction: 0.382,
                lockRotation: false,
              });
              props.onAnimationConfigChange({ frameRate: 120 });
            }}
          >
            ⚡ Hyper Dense
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              props.onConfigChange({
                pointCount: 200,
                rotationSpeed: 1.0,
                spiralGrowth: 2.5,
                baseRadius: 20,
                colorSaturation: 0.8,
                colorLightness: 0.9,
                dotSize: 2.0,
                angleFraction: 0.382,
                step: 0.5,
                rotationFraction: 0.382,
                lockRotation: false,
              });
              props.onAnimationConfigChange({ frameRate: 60 });
            }}
          >
            🌈 Vibrant
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              props.onConfigChange({
                pointCount: 2000,
                rotationSpeed: 0.01,
                spiralGrowth: 0.5,
                baseRadius: 5,
                dotSize: 0.5,
                angleFraction: 0.382,
                step: 0.5,
                rotationFraction: 0.382,
                lockRotation: false,
              });
              props.onAnimationConfigChange({ frameRate: 1 });
            }}
          >
            🐌 Ultra Slow
          </Button>
        </div>
      </div>

      <div class="controls-grid">
        {/* Spiral Parameters */}
        <div class="control-group">
          <h4>Spiral Configuration</h4>

          <div class="control-item">
            <label for="point-count">
              Point Count: {props.config.pointCount}
            </label>
            <input
              type="range"
              id="point-count"
              min="10"
              max="2000"
              step="5"
              value={props.config.pointCount}
              onInput={(e: any) =>
                props.onConfigChange({ pointCount: parseInt(e.target.value) })
              }
            />
            <div class="range-info">Range: 10 - 2000 points</div>
          </div>

          <div class="control-item">
            <label for="rotation-speed">
              Rotation Speed: {props.config.rotationSpeed.toFixed(2)}
            </label>
            <input
              type="range"
              id="rotation-speed"
              min="0.01"
              max="20.0"
              step="0.01"
              value={props.config.rotationSpeed}
              onInput={(e: any) =>
                props.onConfigChange({
                  rotationSpeed: parseFloat(e.target.value),
                })
              }
            />
            <div class="range-info">
              Range: 0.01 - 20.0 (ultra slow to hyper fast)
            </div>
          </div>

          <div class="control-item">
            <label for="spiral-growth">
              Spiral Growth: {props.config.spiralGrowth.toFixed(2)}
            </label>
            <input
              type="range"
              id="spiral-growth"
              min="0.1"
              max="15.0"
              step="0.05"
              value={props.config.spiralGrowth}
              onInput={(e: any) =>
                props.onConfigChange({
                  spiralGrowth: parseFloat(e.target.value),
                })
              }
            />
            <div class="range-info">
              Range: 0.1 - 15.0 (tight to extremely loose)
            </div>
          </div>

          <div class="control-item">
            <label for="base-radius">
              Base Radius: {props.config.baseRadius}
            </label>
            <input
              type="range"
              id="base-radius"
              min="1"
              max="200"
              step="1"
              value={props.config.baseRadius}
              onInput={(e: any) =>
                props.onConfigChange({ baseRadius: parseInt(e.target.value) })
              }
            />
            <div class="range-info">Range: 1 - 200 pixels</div>
          </div>

          <div class="control-item">
            <label for="dot-size">
              Dot Size: {props.config.dotSize.toFixed(1)}
            </label>
            <input
              type="range"
              id="dot-size"
              min="0.1"
              max="10.0"
              step="0.1"
              value={props.config.dotSize}
              onInput={(e: any) =>
                props.onConfigChange({ dotSize: parseFloat(e.target.value) })
              }
            />
            <div class="range-info">Range: 0.1 - 10.0 pixels</div>
          </div>
        </div>

        {/* Color Parameters */}
        <div class="control-group">
          <h4>Color Configuration</h4>

          <div class="control-item">
            <label for="color-saturation">
              Color Saturation:{" "}
              {(props.config.colorSaturation * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              id="color-saturation"
              min="0.01"
              max="1.0"
              step="0.01"
              value={props.config.colorSaturation}
              onInput={(e: any) =>
                props.onConfigChange({
                  colorSaturation: parseFloat(e.target.value),
                })
              }
            />
            <div class="range-info">Range: 1% - 100% (muted to vibrant)</div>
          </div>

          <div class="control-item">
            <label for="color-lightness">
              Color Lightness: {(props.config.colorLightness * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              id="color-lightness"
              min="0.01"
              max="1.0"
              step="0.01"
              value={props.config.colorLightness}
              onInput={(e: any) =>
                props.onConfigChange({
                  colorLightness: parseFloat(e.target.value),
                })
              }
            />
            <div class="range-info">Range: 1% - 100% (dark to bright)</div>
          </div>
        </div>

        {/* Advanced Phyllotactic Parameters */}
        <div class="control-group">
          <h4>Advanced Phyllotactic Parameters</h4>

          <div class="control-item">
            <label for="angle-fraction">
              Angle Fraction: {props.config.angleFraction.toFixed(5)}
            </label>
            <input
              id="angle-fraction"
              type="number"
              step="0.00001"
              value={props.config.angleFraction}
              onInput={(e) =>
                props.onConfigChange({
                  angleFraction: parseFloat(e.target.value),
                })
              }
            />
            <div class="range-info">
              Golden angle fraction (0.382 = golden angle)
            </div>
          </div>

          <div class="control-item">
            <label for="step">Step: {props.config.step.toFixed(2)}</label>
            <input
              id="step"
              type="number"
              step="0.05"
              value={props.config.step}
              onInput={(e) =>
                props.onConfigChange({ step: parseFloat(e.target.value) })
              }
            />
            <div class="range-info">Step size for spiral generation</div>
          </div>

          <div class="control-item">
            <label for="rotation-fraction">
              Rotation Fraction: {props.config.rotationFraction.toFixed(5)}
            </label>
            <input
              id="rotation-fraction"
              type="number"
              step="0.00001"
              value={props.config.rotationFraction}
              onInput={(e) =>
                props.onConfigChange({
                  rotationFraction: parseFloat(e.target.value),
                })
              }
              disabled={props.config.lockRotation}
            />
            <div class="range-info">Rotation angle fraction</div>
          </div>

          <div class="control-item">
            <label>
              <input
                type="checkbox"
                checked={props.config.lockRotation || false}
                onChange={(e) =>
                  props.onConfigChange({
                    lockRotation: e.currentTarget.checked,
                  })
                }
              />
              Lock Rotation
            </label>
          </div>
        </div>

        {/* Line Controls */}
        <div class="control-group">
          <h4>Line Controls</h4>

          <div class="line-controls-grid">
            <div class="line-control-section">
              <div class="control-item">
                <label>
                  <input
                    type="checkbox"
                    checked={props.config.enableLine1 || false}
                    onChange={(e) =>
                      props.onConfigChange({
                        enableLine1: e.currentTarget.checked,
                      })
                    }
                  />
                  <span class="line-label line-1">Line 1</span>
                </label>
              </div>
              <div class="control-item">
                <label for="line-step-1">Step: {props.config.lineStep1}</label>
                <input
                  id="line-step-1"
                  type="number"
                  min="1"
                  value={props.config.lineStep1}
                  onInput={(e) =>
                    props.onConfigChange({
                      lineStep1: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div class="control-item">
                <label>
                  <input
                    type="checkbox"
                    checked={props.config.fillGaps1 || false}
                    onChange={(e) =>
                      props.onConfigChange({
                        fillGaps1: e.currentTarget.checked,
                      })
                    }
                  />
                  Fill Gaps
                </label>
              </div>
            </div>

            <div class="line-control-section">
              <div class="control-item">
                <label>
                  <input
                    type="checkbox"
                    checked={props.config.enableLine2 || false}
                    onChange={(e) =>
                      props.onConfigChange({
                        enableLine2: e.currentTarget.checked,
                      })
                    }
                  />
                  <span class="line-label line-2">Line 2</span>
                </label>
              </div>
              <div class="control-item">
                <label for="line-step-2">Step: {props.config.lineStep2}</label>
                <input
                  id="line-step-2"
                  type="number"
                  min="1"
                  value={props.config.lineStep2}
                  onInput={(e) =>
                    props.onConfigChange({
                      lineStep2: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div class="control-item">
                <label>
                  <input
                    type="checkbox"
                    checked={props.config.fillGaps2 || false}
                    onChange={(e) =>
                      props.onConfigChange({
                        fillGaps2: e.currentTarget.checked,
                      })
                    }
                  />
                  Fill Gaps
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Animation Engine Parameters */}
        <div class="control-group">
          <h4>Animation Engine</h4>

          <div class="control-item">
            <label for="frame-rate">
              Frame Rate: {props.animationConfig.frameRate} FPS
            </label>
            <input
              type="range"
              id="frame-rate"
              min="1"
              max="160"
              step="1"
              value={props.animationConfig.frameRate}
              onInput={(e: any) =>
                props.onAnimationConfigChange({
                  frameRate: parseInt(e.target.value),
                })
              }
            />
            <div class="range-info">
              Range: 1 - 160 FPS (slideshow to ultra smooth)
            </div>
          </div>

          <div class="control-item">
            <label for="max-fps">Max FPS: {props.animationConfig.maxFPS}</label>
            <input
              type="range"
              id="max-fps"
              min="1"
              max="300"
              step="1"
              value={props.animationConfig.maxFPS}
              onInput={(e: any) =>
                props.onAnimationConfigChange({
                  maxFPS: parseInt(e.target.value),
                })
              }
            />
            <div class="range-info">Range: 1 - 300 FPS (performance limit)</div>
          </div>

          <div class="control-item">
            <label>
              <input
                type="checkbox"
                checked={props.animationConfig.enableVSync}
                onChange={(e) =>
                  props.onAnimationConfigChange({
                    enableVSync: e.currentTarget.checked,
                  })
                }
              />
              Enable VSync
            </label>
          </div>

          <div class="control-item">
            <label>
              <input
                type="checkbox"
                checked={props.animationConfig.enablePerformanceMonitoring}
                onChange={(e) =>
                  props.onAnimationConfigChange({
                    enablePerformanceMonitoring: e.currentTarget.checked,
                  })
                }
              />
              Performance Monitoring
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
};
