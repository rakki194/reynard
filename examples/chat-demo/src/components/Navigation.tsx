import { Component } from 'solid-js';
import type { DemoView } from '../App';

interface NavigationProps {
  currentView: DemoView;
  onViewChange: (view: DemoView) => void;
}

export const Navigation: Component<NavigationProps> = (props) => {
  const navItems = [
    {
      id: 'assistant' as const,
      label: 'AI Assistant',
      icon: '🤖',
      description: 'Streaming AI chat with thinking sections and tool calls'
    },
    {
      id: 'p2p' as const,
      label: 'Team Chat',
      icon: '👥',
      description: 'Real-time user messaging with rooms and presence'
    },
    {
      id: 'dual' as const,
      label: 'Dual View',
      icon: '⚡',
      description: 'Side-by-side AI assistant and team chat'
    },
    {
      id: 'features' as const,
      label: 'Features',
      icon: '✨',
      description: 'Interactive feature demonstrations'
    }
  ];

  return (
    <nav class="app-nav">
      <div class="nav-header">
        <h3 class="nav-title">Chat Demos</h3>
        <p class="nav-subtitle">
          Explore Reynard's powerful chat capabilities
        </p>
      </div>

      <div class="nav-items">
        {navItems.map(item => (
          <button
            class={`nav-item ${props.currentView === item.id ? 'active' : ''}`}
            onClick={() => props.onViewChange(item.id)}
          >
            <div class="nav-item-icon">{item.icon}</div>
            <div class="nav-item-content">
              <div class="nav-item-label">{item.label}</div>
              <div class="nav-item-description">{item.description}</div>
            </div>
          </button>
        ))}
      </div>

      <div class="nav-footer">
        <div class="feature-highlights">
          <h4 class="highlights-title">Key Features</h4>
          <ul class="highlights-list">
            <li>🎯 Streaming markdown parsing</li>
            <li>🧠 AI thinking sections</li>
            <li>🔧 Tool call integration</li>
            <li>💬 Real-time messaging</li>
            <li>📱 Mobile responsive</li>
            <li>🎨 Theming support</li>
            <li>♿ Accessibility compliant</li>
          </ul>
        </div>

        <div class="github-link">
          <a 
            href="https://github.com/your-org/reynard" 
            target="_blank" 
            rel="noopener noreferrer"
            class="github-button"
          >
            <span>⭐ Star on GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
};
