import { Component, createSignal, For } from 'solid-js';
import { type ChatUser } from '@reynard/components';

interface FeatureShowcaseProps {
  currentUser: ChatUser;
}

// Extended user type for presence demo
interface DemoUser extends ChatUser {
  isTyping: boolean;
}

export const FeatureShowcase: Component<FeatureShowcaseProps> = (props) => {
  const [activeFeature, setActiveFeature] = createSignal<string>('streaming');



  const features = [
    {
      id: 'streaming',
      title: 'Streaming Markdown',
      icon: '📝',
      description: 'Real-time markdown parsing with syntax highlighting',
      demoComponent: StreamingDemo,
    },
    {
      id: 'thinking',
      title: 'AI Thinking Sections',
      icon: '🧠',
      description: 'Visualize AI reasoning process in real-time',
      demoComponent: ThinkingDemo,
    },
    {
      id: 'tools',
      title: 'Tool Integration',
      icon: '🔧',
      description: 'Execute tools with progress tracking and results',
      demoComponent: ToolsDemo,
    },
    {
      id: 'presence',
      title: 'User Presence',
      icon: '👁️',
      description: 'Real-time status and typing indicators',
      demoComponent: PresenceDemo,
    },
    {
      id: 'reactions',
      title: 'Message Reactions',
      icon: '😊',
      description: 'Emoji reactions and rich interactions',
      demoComponent: ReactionsDemo,
    },
    {
      id: 'files',
      title: 'File Sharing',
      icon: '📎',
      description: 'Upload and share files with previews',
      demoComponent: FilesDemo,
    },
  ];

  const currentFeature = () => features.find(f => f.id === activeFeature());

  return (
    <div class="demo-container">
      <div class="demo-header">
        <div class="demo-title">
          <h2>✨ Interactive Feature Showcase</h2>
          <p>
            Explore Reynard's powerful chat features with live demonstrations 
            and interactive examples.
          </p>
        </div>
      </div>

      <div class="demo-content">
        <div class="showcase-layout">
          {/* Feature Navigation */}
          <div class="feature-nav">
            <h3 class="nav-title">Features</h3>
            <div class="feature-list">
              <For each={features}>
                {(feature) => (
                  <button
                    class={`feature-nav-item ${activeFeature() === feature.id ? 'active' : ''}`}
                    onClick={() => setActiveFeature(feature.id)}
                  >
                    <div class="feature-nav-icon">{feature.icon}</div>
                    <div class="feature-nav-content">
                      <div class="feature-nav-title">{feature.title}</div>
                      <div class="feature-nav-description">{feature.description}</div>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* Feature Demo Area */}
          <div class="feature-demo">
            <div class="demo-header-section">
              <div class="demo-icon">{currentFeature()?.icon}</div>
              <div class="demo-info">
                <h3 class="demo-title">{currentFeature()?.title}</h3>
                <p class="demo-description">{currentFeature()?.description}</p>
              </div>
            </div>

            <div class="demo-content-section">
              {activeFeature() === 'streaming' && <StreamingDemo />}
              {activeFeature() === 'thinking' && <ThinkingDemo />}
              {activeFeature() === 'tools' && <ToolsDemo />}
              {activeFeature() === 'presence' && <PresenceDemo currentUser={props.currentUser} />}
              {activeFeature() === 'reactions' && <ReactionsDemo />}
              {activeFeature() === 'files' && <FilesDemo />}
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div class="code-examples">
          <h4>💻 Code Example</h4>
          <div class="code-tabs">
            <button class="code-tab active">Usage</button>
            <button class="code-tab">Props</button>
            <button class="code-tab">Styling</button>
          </div>
          <div class="code-content">
            <pre class="code-block">
              <code>
                {getCodeExample(activeFeature())}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual feature demo components
const StreamingDemo: Component = () => {
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [content, setContent] = createSignal('');

  const streamText = async () => {
    setIsStreaming(true);
    setContent('');
    
    const text = `# Streaming Markdown Demo

This text is being **streamed** in real-time! 

## Features:
- *Italic* and **bold** formatting
- \`inline code\` with syntax highlighting
- [Links](https://example.com) with proper handling

### Code Block:
\`\`\`javascript
function streamMarkdown(text) {
  // Real-time parsing as content arrives
  return parser.parseChunk(text);
}
\`\`\`

> Blockquotes work too!

- List items
- Also stream properly
- With proper formatting

The parser handles **partial content** gracefully!`;

    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setContent(text.slice(0, i));
    }
    
    setIsStreaming(false);
  };

  return (
    <div class="streaming-demo">
      <div class="demo-controls">
        <button 
          class="demo-button primary"
          onClick={streamText}
          disabled={isStreaming()}
        >
          {isStreaming() ? '⏳ Streaming...' : '▶️ Start Streaming'}
        </button>
      </div>
      
      <div class="demo-output">
        <div class="markdown-preview">
          {content()}
          {isStreaming() && <span class="cursor">|</span>}
        </div>
      </div>
    </div>
  );
};

const ThinkingDemo: Component = () => {
  const [isThinking, setIsThinking] = createSignal(false);
  const [thinkingContent, setThinkingContent] = createSignal('');
  const [response, setResponse] = createSignal('');

  const simulateThinking = async () => {
    setIsThinking(true);
    setThinkingContent('');
    setResponse('');

    const thoughts = [
      'Let me think about this problem...',
      'I need to consider several approaches here.',
      'The user is asking about React patterns, so I should focus on modern best practices.',
      'I should mention hooks, state management, and performance considerations.',
      'Let me structure this response clearly with examples.'
    ];

    // Stream thinking content
    for (const thought of thoughts) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setThinkingContent(prev => prev + (prev ? '\n\n' : '') + thought);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsThinking(false);

    // Show final response
    setResponse(`Based on my analysis, here are the key React patterns you should know:

## Modern React Patterns

1. **Custom Hooks** - Extract reusable logic
2. **Compound Components** - Flexible component APIs  
3. **Render Props** - Share code between components
4. **Higher-Order Components** - Cross-cutting concerns

These patterns help create maintainable and reusable code!`);
  };

  return (
    <div class="thinking-demo">
      <div class="demo-controls">
        <button 
          class="demo-button primary"
          onClick={simulateThinking}
          disabled={isThinking()}
        >
          {isThinking() ? '🧠 AI is thinking...' : '🤔 Ask AI to Think'}
        </button>
      </div>
      
      <div class="demo-output">
        {thinkingContent() && (
          <div class="thinking-section">
            <div class="thinking-header">
              <span class="thinking-icon">🧠</span>
              <span class="thinking-label">AI Thinking Process</span>
              {isThinking() && <div class="thinking-dots">...</div>}
            </div>
            <div class="thinking-content">
              {thinkingContent()}
            </div>
          </div>
        )}
        
        {response() && (
          <div class="response-section">
            <div class="response-content">
              {response()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolsDemo: Component = () => {
  const [toolStatus, setToolStatus] = createSignal<'idle' | 'running' | 'complete'>('idle');
  const [progress, setProgress] = createSignal(0);
  const [result, setResult] = createSignal('');

  const runTool = async () => {
    setToolStatus('running');
    setProgress(0);
    setResult('');

    // Simulate tool execution with progress
    const steps = [
      { progress: 20, message: 'Connecting to API...' },
      { progress: 40, message: 'Fetching data...' },
      { progress: 60, message: 'Processing results...' },
      { progress: 80, message: 'Generating response...' },
      { progress: 100, message: 'Complete!' },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(step.progress);
      setResult(step.message);
    }

    setToolStatus('complete');
    setResult(`## Weather Data Retrieved

**Location:** San Francisco, CA  
**Temperature:** 72°F (22°C)  
**Conditions:** Partly cloudy  
**Humidity:** 65%  
**Wind:** 8 mph NW  

*Data retrieved from OpenWeatherMap API*`);
  };

  return (
    <div class="tools-demo">
      <div class="demo-controls">
        <button 
          class="demo-button primary"
          onClick={runTool}
          disabled={toolStatus() === 'running'}
        >
          {toolStatus() === 'running' ? '⚙️ Running Tool...' : '🌤️ Get Weather Data'}
        </button>
      </div>
      
      <div class="demo-output">
        {toolStatus() !== 'idle' && (
          <div class="tool-execution">
            <div class="tool-header">
              <span class="tool-icon">🔧</span>
              <span class="tool-name">Weather API Tool</span>
              <span class="tool-status">{toolStatus()}</span>
            </div>
            
            {toolStatus() === 'running' && (
              <div class="tool-progress">
                <div class="progress-bar">
                  <div 
                    class={`progress-fill ${getProgressWidthClass(progress())}`}
                  ></div>
                </div>
                <div class="progress-text">{progress()}%</div>
              </div>
            )}
            
            {result() && (
              <div class="tool-result">
                {result()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PresenceDemo: Component<{ currentUser: ChatUser }> = () => {
  const [users, setUsers] = createSignal<DemoUser[]>([
    { id: '1', name: 'Alice', status: 'online', avatar: '👩', isTyping: false },
    { id: '2', name: 'Bob', status: 'away', avatar: '👨', isTyping: false },
    { id: '3', name: 'Carol', status: 'busy', avatar: '👩‍💼', isTyping: false },
  ]);

  const toggleTyping = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isTyping: !user.isTyping }
        : user
    ));
  };

  const changeStatus = (userId: string, status: ChatUser['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
  };

  return (
    <div class="presence-demo">
      <div class="demo-output">
        <div class="users-list">
          <h4>Team Members</h4>
          <For each={users()}>
            {(user) => (
              <div class="user-item">
                <div class="user-avatar">{user.avatar}</div>
                <div class="user-info">
                  <div class="user-name">{user.name}</div>
                  <div class={`user-status status-${user.status}`}>
                    <div class="status-dot"></div>
                    <span>{user.status}</span>
                  </div>
                  {user.isTyping && (
                    <div class="typing-indicator">
                      <span>is typing</span>
                      <div class="typing-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}
                </div>
                <div class="user-actions">
                  <button 
                    class="action-button"
                    onClick={() => toggleTyping(user.id)}
                  >
                    {user.isTyping ? '⏹️' : '✏️'}
                  </button>
                  <select 
                    value={user.status}
                    onChange={(e) => changeStatus(user.id, e.target.value as ChatUser['status'])}
                    aria-label={`Change ${user.name}'s status`}
                  >
                    <option value="online">Online</option>
                    <option value="away">Away</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

const ReactionsDemo: Component = () => {
  const [reactions, setReactions] = createSignal(new Map([
    ['👍', 3],
    ['❤️', 2],
    ['😂', 1],
    ['😮', 1],
  ]));

  const [selectedReactions, setSelectedReactions] = createSignal(new Set<string>());

  const toggleReaction = (emoji: string) => {
    const current = selectedReactions();
    const newSelected = new Set(current);
    
    if (current.has(emoji)) {
      newSelected.delete(emoji);
      setReactions(prev => new Map(prev).set(emoji, Math.max(0, (prev.get(emoji) || 0) - 1)));
    } else {
      newSelected.add(emoji);
      setReactions(prev => new Map(prev).set(emoji, (prev.get(emoji) || 0) + 1));
    }
    
    setSelectedReactions(newSelected);
  };

  const availableEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉'];

  return (
    <div class="reactions-demo">
      <div class="demo-output">
        <div class="sample-message">
          <div class="message-content">
            Check out this amazing new feature we just shipped! 🚀
          </div>
          
          <div class="message-reactions">
            <For each={Array.from(reactions().entries())}>
              {([emoji, count]) => count > 0 && (
                <button 
                  class={`reaction-chip ${selectedReactions().has(emoji) ? 'selected' : ''}`}
                  onClick={() => toggleReaction(emoji)}
                >
                  <span class="reaction-emoji">{emoji}</span>
                  <span class="reaction-count">{count}</span>
                </button>
              )}
            </For>
            
            <div class="add-reaction">
              <button class="add-reaction-trigger">😊</button>
              <div class="emoji-picker">
                <For each={availableEmojis}>
                  {(emoji) => (
                    <button 
                      class="emoji-option"
                      onClick={() => toggleReaction(emoji)}
                    >
                      {emoji}
                    </button>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilesDemo: Component = () => {
  const [uploadProgress, setUploadProgress] = createSignal(0);
  const [isUploading, setIsUploading] = createSignal(false);
  const [uploadedFiles, setUploadedFiles] = createSignal<Array<{
    name: string;
    size: string;
    type: string;
    icon: string;
  }>>([]);

  const simulateUpload = async (fileName: string, fileSize: string, fileType: string, icon: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    setIsUploading(false);
    setUploadedFiles(prev => [...prev, { name: fileName, size: fileSize, type: fileType, icon }]);
  };

  const handleFileUpload = (type: 'image' | 'document' | 'code') => {
    const files = {
      image: { name: 'screenshot.png', size: '2.3 MB', type: 'image/png', icon: '🖼️' },
      document: { name: 'proposal.pdf', size: '1.8 MB', type: 'application/pdf', icon: '📄' },
      code: { name: 'component.tsx', size: '12 KB', type: 'text/typescript', icon: '💻' },
    };
    
    const file = files[type];
    simulateUpload(file.name, file.size, file.type, file.icon);
  };

  return (
    <div class="files-demo">
      <div class="demo-controls">
        <button 
          class="demo-button"
          onClick={() => handleFileUpload('image')}
          disabled={isUploading()}
        >
          🖼️ Upload Image
        </button>
        <button 
          class="demo-button"
          onClick={() => handleFileUpload('document')}
          disabled={isUploading()}
        >
          📄 Upload Document
        </button>
        <button 
          class="demo-button"
          onClick={() => handleFileUpload('code')}
          disabled={isUploading()}
        >
          💻 Upload Code
        </button>
      </div>
      
      <div class="demo-output">
        {isUploading() && (
          <div class="upload-progress">
            <div class="upload-info">
              <span class="upload-icon">📤</span>
              <span class="upload-text">Uploading file...</span>
            </div>
            <div class="progress-bar">
              <div 
                class={`progress-fill ${getProgressWidthClass(uploadProgress())}`}
              ></div>
            </div>
            <div class="progress-text">{uploadProgress()}%</div>
          </div>
        )}
        
        <div class="uploaded-files">
          <For each={uploadedFiles()}>
            {(file) => (
              <div class="file-item">
                <div class="file-icon">{file.icon}</div>
                <div class="file-info">
                  <div class="file-name">{file.name}</div>
                  <div class="file-meta">{file.size} • {file.type}</div>
                </div>
                <div class="file-actions">
                  <button class="file-action">📥</button>
                  <button class="file-action">👁️</button>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

// Helper function to get progress width class
function getProgressWidthClass(progress: number): string {
  const roundedProgress = Math.round(progress / 10) * 10;
  return `w-${roundedProgress}`;
}

// Helper function to get code examples for each feature
function getCodeExample(featureId: string): string {
  const examples = {
    streaming: `import { ChatContainer } from '@reynard/components';

<ChatContainer
  endpoint="/api/assistant"
  config={{
    enableStreaming: true,
    showProgress: true
  }}
  onMessageReceived={(message) => {
    console.log('Streaming:', message);
  }}
/>`,
    thinking: `<ChatContainer
  config={{
    enableThinking: true,
    showThinkingProcess: true
  }}
  onThinkingChanged={(isThinking) => {
    console.log('AI is thinking:', isThinking);
  }}
/>`,
    tools: `<ChatContainer
  config={{
    enableTools: true,
    availableTools: ['weather', 'calculator', 'search']
  }}
  onToolCall={(tool, args) => {
    console.log('Tool called:', tool, args);
  }}
/>`,
    presence: `import { useP2PChat } from '@reynard/components';

const chat = useP2PChat({
  currentUser: user,
  realtimeEndpoint: 'ws://localhost:8080',
  config: {
    enablePresence: true,
    enableTypingIndicators: true
  }
});`,
    reactions: `<P2PChatContainer
  config={{
    enableReactions: true,
    availableEmojis: ['👍', '❤️', '😂', '😮']
  }}
  onReaction={(messageId, emoji) => {
    console.log('Reaction added:', emoji);
  }}
/>`,
    files: `<P2PChatContainer
  config={{
    enableFileUploads: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'application/pdf']
  }}
  onFileUpload={(file, progress) => {
    console.log('Upload progress:', progress);
  }}
/>`
  };

  return examples[featureId as keyof typeof examples] || '// Code example not available';
}
