/**
 * 🎪 Transformer Visualization Component
 * 
 * Main visualization component for the transformer dance club
 */

import { Component, For } from "solid-js";
import { SparkleData } from "../composables/useDanceEffects";

interface ComponentData {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'input' | 'encoder' | 'decoder' | 'output';
  position: { x: number; y: number };
}

interface TransformerVisualizationProps {
  backgroundGradient: string;
  strobeBackground: string;
  strobeSpeed: number;
  danceFloorSpeed: number;
  danceFloorOpacity: number;
  sparkles: SparkleData[];
  onComponentClick: (componentId: string) => void;
}

export const TransformerVisualization: Component<TransformerVisualizationProps> = (props) => {
  const components = (): ComponentData[] => [
    { id: 'input-embedding', name: 'Input Embedding', icon: '🎵', description: 'Converts input tokens to vectors', type: 'input', position: { x: 0, y: 0 } },
    { id: 'positional-encoding', name: 'Positional Encoding', icon: '📍', description: 'Adds position information', type: 'input', position: { x: 0, y: 1 } },
    { id: 'attention', name: 'Multi-Head Attention', icon: '👀', description: 'Self-attention mechanism', type: 'encoder', position: { x: 1, y: 0 } },
    { id: 'add-norm-1', name: 'Add & Norm', icon: '➕', description: 'Residual connection and normalization', type: 'encoder', position: { x: 1, y: 1 } },
    { id: 'feed-forward', name: 'Feed Forward', icon: '🚀', description: 'Position-wise feed-forward network', type: 'encoder', position: { x: 1, y: 2 } },
    { id: 'add-norm-2', name: 'Add & Norm', icon: '➕', description: 'Residual connection and normalization', type: 'encoder', position: { x: 1, y: 3 } },
    { id: 'masked-attention', name: 'Masked Attention', icon: '🎭', description: 'Masked self-attention for decoder', type: 'decoder', position: { x: 2, y: 0 } },
    { id: 'cross-attention', name: 'Cross Attention', icon: '👀', description: 'Attention over encoder outputs', type: 'decoder', position: { x: 2, y: 1 } },
    { id: 'linear', name: 'Linear', icon: '📊', description: 'Linear transformation', type: 'output', position: { x: 3, y: 0 } },
    { id: 'softmax', name: 'Softmax', icon: '🎯', description: 'Probability distribution', type: 'output', position: { x: 3, y: 1 } }
  ];

  return (
    <div class="animation-card">
      <h2 class="card-title">
        <span>🎪</span>
        Transformer Architecture
      </h2>
      <div 
        class="transformer-visualization"
        style={{
          background: props.backgroundGradient
        }}
      >
        {/* Strobe Effect */}
        <div 
          class="strobe"
          style={{
            'animation-duration': `${props.strobeSpeed}ms`,
            background: props.strobeBackground
          }}
        />

        {/* Dance Floor */}
        <div 
          class="dance-floor"
          style={{
            'animation-duration': `${props.danceFloorSpeed}ms`,
            opacity: props.danceFloorOpacity
          }}
        />

        {/* Active Sparkles */}
        <For each={props.sparkles}>
          {(sparkle) => (
            <div
              class="sparkle"
              style={{
                position: 'fixed',
                left: `${sparkle.x}px`,
                top: `${sparkle.y}px`,
                width: `${sparkle.size}px`,
                height: `${sparkle.size}px`,
                background: sparkle.color,
                'border-radius': '50%',
                'pointer-events': 'none',
                animation: 'sparkle 1s ease-out forwards',
                'z-index': '1001'
              }}
            />
          )}
        </For>

        {/* Party Lights */}
        <div class="light" style={{ top: '10%', left: '10%', background: '#ff006e', 'animation-delay': '0s' }} />
        <div class="light" style={{ top: '10%', right: '10%', background: '#8338ec', 'animation-delay': '0.2s' }} />
        <div class="light" style={{ bottom: '10%', left: '10%', background: '#3a86ff', 'animation-delay': '0.4s' }} />
        <div class="light" style={{ bottom: '10%', right: '10%', background: '#06ffa5', 'animation-delay': '0.6s' }} />

        {/* Title */}
        <div class="transformer-title">
          🕺 TRANSFORMER DANCE CLUB 💃
        </div>

        {/* Disco Ball */}
        <div class="disco-ball" />

        {/* Speaker */}
        <div class="speaker" />

        {/* Transformer Components */}
        <div class="transformer-container">
          {/* Encoder Side */}
          <div class="encoder-section">
            <div 
              id="input-embedding"
              class="component input-embedding"
              onClick={() => props.onComponentClick('input-embedding')}
              title="Input Embedding - Converts input tokens to vectors"
            >
              🎵 Input<br/>Embedding
            </div>

            <div 
              id="positional-encoding"
              class="component positional-encoding"
              onClick={() => props.onComponentClick('positional-encoding')}
              title="Positional Encoding - Adds position information"
            >
              📍 Positional<br/>Encoding
            </div>

            <div class="encoder-block">
              <div class="nx-label">N×</div>

              <div 
                id="attention"
                class="component attention"
                onClick={() => props.onComponentClick('attention')}
                title="Multi-Head Attention - Self-attention mechanism"
              >
                👀 Multi-Head<br/>Attention
              </div>

              <div 
                id="add-norm-1"
                class="component add-norm"
                onClick={() => props.onComponentClick('add-norm-1')}
                title="Add & Norm - Residual connection and normalization"
              >
                ➕ Add & Norm
              </div>

              <div 
                id="feed-forward"
                class="component feed-forward"
                onClick={() => props.onComponentClick('feed-forward')}
                title="Feed Forward - Position-wise feed-forward network"
              >
                🚀 Feed<br/>Forward
              </div>

              <div 
                id="add-norm-2"
                class="component add-norm"
                onClick={() => props.onComponentClick('add-norm-2')}
                title="Add & Norm - Residual connection and normalization"
              >
                ➕ Add & Norm
              </div>
            </div>
          </div>

          {/* Decoder Side */}
          <div class="decoder-section">
            <div 
              id="linear"
              class="component linear"
              onClick={() => props.onComponentClick('linear')}
              title="Linear - Linear transformation"
            >
              📊 Linear
            </div>

            <div 
              id="softmax"
              class="component softmax"
              onClick={() => props.onComponentClick('softmax')}
              title="Softmax - Probability distribution"
            >
              🎯 Softmax
            </div>

            <div class="decoder-block">
              <div class="nx-label">N×</div>

              <div 
                id="add-norm-3"
                class="component add-norm"
                onClick={() => props.onComponentClick('add-norm-3')}
                title="Add & Norm - Residual connection and normalization"
              >
                ➕ Add & Norm
              </div>

              <div 
                id="feed-forward-2"
                class="component feed-forward"
                onClick={() => props.onComponentClick('feed-forward-2')}
                title="Feed Forward - Position-wise feed-forward network"
              >
                🚀 Feed<br/>Forward
              </div>

              <div 
                id="add-norm-4"
                class="component add-norm"
                onClick={() => props.onComponentClick('add-norm-4')}
                title="Add & Norm - Residual connection and normalization"
              >
                ➕ Add & Norm
              </div>

              <div 
                id="cross-attention"
                class="component attention"
                onClick={() => props.onComponentClick('cross-attention')}
                title="Cross Attention - Attention over encoder outputs"
              >
                👀 Cross<br/>Attention
              </div>

              <div 
                id="add-norm-5"
                class="component add-norm"
                onClick={() => props.onComponentClick('add-norm-5')}
                title="Add & Norm - Residual connection and normalization"
              >
                ➕ Add & Norm
              </div>

              <div 
                id="masked-attention"
                class="component masked-attention"
                onClick={() => props.onComponentClick('masked-attention')}
                title="Masked Multi-Head Attention - Masked self-attention for decoder"
              >
                🎭 Masked<br/>Multi-Head<br/>Attention
              </div>
            </div>

            <div 
              id="positional-encoding-2"
              class="component positional-encoding"
              onClick={() => props.onComponentClick('positional-encoding-2')}
              title="Positional Encoding - Adds position information"
            >
              📍 Positional<br/>Encoding
            </div>

            <div 
              id="output-embedding"
              class="component output-embedding"
              onClick={() => props.onComponentClick('output-embedding')}
              title="Output Embedding - Shifted right for autoregressive generation"
            >
              🎵 Output<br/>Embedding<br/>(shifted right)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
