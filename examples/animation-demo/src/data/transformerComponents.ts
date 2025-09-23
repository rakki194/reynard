/**
 * 🤖 Transformer Components Data
 * 
 * Data definitions for transformer architecture components
 */

export interface ComponentData {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'input' | 'encoder' | 'decoder' | 'output';
  position: { x: number; y: number };
}

export const transformerComponents: ComponentData[] = [
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
