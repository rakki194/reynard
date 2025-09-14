import { createSignal, For, Show, createEffect, onCleanup } from "solid-js";
import { Button, Card } from "reynard-components";
import { MarkdownRenderer } from "reynard-chat";
import { P2PChatDemo } from "./P2PChatDemo";
import { getIcon } from "reynard-fluent-icons";
import "./ChatDemo.css";

// Local streaming text implementation
function createStreamingText(text: string, options: any = {}) {
  const [currentText, setCurrentText] = createSignal("");
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [isPaused, setIsPaused] = createSignal(false);
  const [isComplete, setIsComplete] = createSignal(false);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [progress, setProgress] = createSignal(0);

  let streamTimer: number | null = null;

  const start = () => {
    if (isStreaming()) return;
    setIsStreaming(true);
    setIsPaused(false);
    setIsComplete(false);
    setCurrentIndex(0);
    setCurrentText("");
    setProgress(0);
    streamNext();
  };

  const pause = () => {
    if (streamTimer) {
      clearTimeout(streamTimer);
      streamTimer = null;
    }
    setIsPaused(true);
  };

  const resume = () => {
    if (isPaused() && !isComplete()) {
      setIsPaused(false);
      streamNext();
    }
  };

  const stop = () => {
    if (streamTimer) {
      clearTimeout(streamTimer);
      streamTimer = null;
    }
    setIsStreaming(false);
    setIsPaused(false);
    setIsComplete(false);
    setCurrentIndex(0);
    setCurrentText("");
    setProgress(0);
  };

  const restart = () => {
    stop();
    setTimeout(() => start(), 100);
  };

  const streamNext = () => {
    if (isPaused() || isComplete()) return;

    if (currentIndex() >= text.length) {
      setIsStreaming(false);
      setIsComplete(true);
      setProgress(100);
      return;
    }

    const char = text[currentIndex()];
    const nextText = currentText() + char;
    const nextIndex = currentIndex() + 1;
    const newProgress = (nextIndex / text.length) * 100;

    setCurrentText(nextText);
    setCurrentIndex(nextIndex);
    setProgress(newProgress);

    let delay = options.speed || 30;
    if (/[.!?;:]/.test(char)) {
      delay += options.pauseAtPunctuation || 200;
    } else if (char === "\n") {
      delay += options.pauseAtLineBreak || 500;
    }

    streamTimer = window.setTimeout(() => {
      streamNext();
    }, delay);
  };

  return {
    state: () => ({
      currentText: currentText(),
      isStreaming: isStreaming(),
      isPaused: isPaused(),
      isComplete: isComplete(),
      currentIndex: currentIndex(),
      progress: progress(),
      showCursor: options.showCursor !== false,
    }),
    start,
    pause,
    resume,
    stop,
    restart,
  };
}

function createMarkdownStreaming(text: string, options: any = {}) {
  const stream = createStreamingText(text, options);
  const [parsedContent, setParsedContent] = createSignal("");

  createEffect(() => {
    const currentText = stream.state().currentText;
    if (currentText) {
      const parsed = currentText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/^### (.*$)/gm, "<h3>$1</h3>")
        .replace(/^## (.*$)/gm, "<h2>$1</h2>")
        .replace(/^# (.*$)/gm, "<h1>$1</h1>")
        .replace(/^- (.*$)/gm, "<li>$1</li>")
        .replace(/\n/g, "<br>");
      setParsedContent(parsed);
    }
  });

  return {
    ...stream,
    parsedContent,
  };
}

export function ChatDemo() {
  const [activeChatDemo, setActiveChatDemo] = createSignal("basic");
  const [currentDemoIndex, setCurrentDemoIndex] = createSignal(0);

  // Streaming demo content
  const streamingDemos = [
    {
      title: "Basic Streaming",
      content:
        "This is a demonstration of **streaming text** that appears character by character. Notice how the text flows naturally with appropriate pauses at punctuation marks and line breaks.",
      options: { speed: 50, pauseAtPunctuation: 300, showCursor: true },
    },
    {
      title: "Markdown Streaming",
      content:
        '# Streaming Markdown\n\nThis demonstrates **streaming markdown** rendering with:\n\n- **Bold text**\n- *Italic text*\n- `Inline code`\n- [Links](https://example.com)\n\n## Code Blocks\n\n```javascript\nconst greeting = "Hello, World!";\nconsole.log(greeting);\n```\n\n> This is a blockquote that streams in real-time.',
      options: {
        speed: 30,
        pauseAtPunctuation: 200,
        pauseAtLineBreak: 500,
        showCursor: true,
      },
    },
    {
      title: "Technical Documentation",
      content:
        "## Reynard Streaming Markdown Parser\n\nThe `StreamingMarkdownParser` class provides real-time markdown parsing with the following features:\n\n### Core Features\n- **Incremental parsing** - Process content as it streams\n- **Error recovery** - Graceful handling of malformed markdown\n- **Performance optimization** - Efficient buffering and processing\n- **TypeScript support** - Full type safety and IntelliSense\n\n### Supported Elements\n1. Headers (H1-H6)\n2. Code blocks with syntax highlighting\n3. Lists (ordered and unordered)\n4. Blockquotes\n5. Tables\n6. Task lists\n7. Math expressions\n8. Thinking sections\n\n### Usage Example\n\n```typescript\nconst parser = createStreamingMarkdownParser();\nconst result = parser.parseChunk(chunk);\nconst final = parser.finalize();\n```",
      options: {
        speed: 25,
        pauseAtPunctuation: 250,
        pauseAtLineBreak: 400,
        showCursor: true,
      },
    },
  ];

  // Create streaming text instance
  const currentDemo = () => streamingDemos[currentDemoIndex()];
  const stream = createMarkdownStreaming(
    currentDemo().content,
    currentDemo().options,
  );

  // Auto-restart streaming demo
  let restartTimer: number | null = null;

  const startStreamingDemo = () => {
    stream.start();
  };

  const pauseStreamingDemo = () => {
    stream.pause();
  };

  const restartStreamingDemo = () => {
    stream.restart();
  };

  const nextDemo = () => {
    const nextIndex = (currentDemoIndex() + 1) % streamingDemos.length;
    setCurrentDemoIndex(nextIndex);
    stream.restart();
  };

  const previousDemo = () => {
    const prevIndex =
      currentDemoIndex() === 0
        ? streamingDemos.length - 1
        : currentDemoIndex() - 1;
    setCurrentDemoIndex(prevIndex);
    stream.restart();
  };

  // Auto-restart after completion
  createEffect(() => {
    if (stream.state().isComplete) {
      restartTimer = window.setTimeout(() => {
        nextDemo();
      }, 3000);
    }
  });

  onCleanup(() => {
    if (restartTimer) {
      clearTimeout(restartTimer);
    }
  });

  const demoMessages = [
    {
      id: "1",
      type: "user" as const,
      content: "Hello! Can you help me understand how the chat system works?",
      timestamp: Date.now() - 300000,
    },
    {
      id: "2",
      type: "assistant" as const,
      content: `Of course! The Reynard chat system provides a comprehensive messaging interface with features like:

- **Real-time streaming**
- **Markdown rendering** 
- **Tool integration**
- **Thinking indicators**
- **P2P messaging**

Would you like me to demonstrate any specific feature?`,
      timestamp: Date.now() - 240000,
    },
    {
      id: "3",
      type: "user" as const,
      content: "That sounds great! Can you show me how tool integration works?",
      timestamp: Date.now() - 180000,
    },
    {
      id: "4",
      type: "assistant" as const,
      content: `I'd be happy to demonstrate tool integration! Let me search for some information about Reynard framework.

Here's what I found:

## Key Features

1. **Streaming Markdown Parser** - Real-time markdown processing
2. **Component Library** - Pre-built UI components
3. **TypeScript Support** - Full type safety

### Code Example

\`\`\`typescript
const parser = createStreamingMarkdownParser();
const result = parser.parseChunk(content);
\`\`\`

The system handles **bold text**, *italic text*, and \`inline code\` seamlessly!`,
      timestamp: Date.now() - 120000,
      thinking: "Searching for Reynard framework documentation...",
      tools: [
        {
          name: "web_search",
          input: { query: "Reynard SolidJS framework documentation" },
          status: "completed" as const,
          result:
            "Found comprehensive documentation for Reynard framework including components, theming, and utilities.",
        },
      ],
    },
  ];

  return (
    <div class="chat-demo">
      <Card class="demo-section">
        <h3>Chat System Overview</h3>
        <p>
          Demonstrates the comprehensive chat system with streaming, markdown,
          and tool integration.
        </p>

        <div class="chat-demo-tabs">
          <div class="demo-tab-buttons">
            <Button
              variant={activeChatDemo() === "basic" ? "primary" : "secondary"}
              onClick={() => setActiveChatDemo("basic")}
            >
              Basic Chat
            </Button>
            <Button
              variant={
                activeChatDemo() === "advanced" ? "primary" : "secondary"
              }
              onClick={() => setActiveChatDemo("advanced")}
            >
              Advanced Features
            </Button>
            <Button
              variant={activeChatDemo() === "p2p" ? "primary" : "secondary"}
              onClick={() => setActiveChatDemo("p2p")}
            >
              P2P Chat
            </Button>
          </div>
        </div>
      </Card>

      {activeChatDemo() === "basic" && (
        <Card class="demo-section">
          <h3>Basic Chat Interface</h3>
          <p>
            Simple chat interface with message history and basic functionality.
          </p>

          <div class="chat-container-demo">
            <div class="chat-messages">
              <For each={demoMessages}>
                {(message) => (
                  <div class={`chat-message chat-message--${message.type}`}>
                    <div class="message-header">
                      <span class="message-sender">
                        {message.type === "user" ? "You" : "Assistant"}
                      </span>
                      <span class="message-time">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div class="message-content">
                      <MarkdownRenderer
                        content={message.content}
                        streaming={false}
                        enableMath={false}
                        enableDiagrams={false}
                      />
                    </div>
                    {message.thinking && (
                      <div class="message-thinking">
                        <div class="thinking-indicator">
                          <span
                            innerHTML={(() => {
                              const icon = getIcon("brain");
                              if (!icon) return "";
                              return typeof icon === "string"
                                ? icon
                                : icon.outerHTML;
                            })()}
                          ></span>{" "}
                          {message.thinking}
                        </div>
                      </div>
                    )}
                    {message.tools && (
                      <div class="message-tools">
                        <For each={message.tools}>
                          {(tool) => (
                            <div class="tool-call">
                              <div class="tool-header">
                                <span class="tool-name">{tool.name}</span>
                                <span
                                  class={`tool-status tool-status--${tool.status}`}
                                >
                                  {tool.status}
                                </span>
                              </div>
                              <div class="tool-input">
                                <strong>Input:</strong>{" "}
                                {JSON.stringify(tool.input)}
                              </div>
                              <div class="tool-result">
                                <strong>Result:</strong> {tool.result}
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    )}
                  </div>
                )}
              </For>
            </div>

            <div class="chat-input-demo">
              <div class="input-container">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  class="chat-input"
                />
                <Button>Send</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeChatDemo() === "advanced" && (
        <Card class="demo-section">
          <h3>Advanced Chat Features</h3>
          <p>
            Demonstrates advanced features like streaming, thinking indicators,
            and tool integration.
          </p>

          <div class="advanced-features">
            <div class="feature-demo">
              <h4>Streaming Markdown Rendering</h4>
              <p>
                Real-time markdown streaming with configurable speed, pauses,
                and auto-restart.
              </p>

              <div class="streaming-controls">
                <Button
                  variant={stream.state().isStreaming ? "secondary" : "primary"}
                  onClick={
                    stream.state().isStreaming
                      ? pauseStreamingDemo
                      : startStreamingDemo
                  }
                >
                  {stream.state().isStreaming ? "Pause" : "Start"} Streaming
                </Button>
                <Button
                  variant="secondary"
                  onClick={restartStreamingDemo}
                  disabled={
                    !stream.state().isStreaming && !stream.state().isComplete
                  }
                >
                  Restart
                </Button>
                <Button variant="secondary" onClick={previousDemo}>
                  ← Previous
                </Button>
                <Button variant="secondary" onClick={nextDemo}>
                  Next →
                </Button>
              </div>

              <div class="streaming-info">
                <span class="demo-title">{currentDemo().title}</span>
                <span class="streaming-status">
                  {stream.state().isStreaming
                    ? "Streaming"
                    : stream.state().isPaused
                      ? "Paused"
                      : stream.state().isComplete
                        ? "Complete"
                        : "Stopped"}
                </span>
                <span class="progress">
                  {Math.round(stream.state().progress)}% complete
                </span>
              </div>

              <div class="streaming-demo">
                <div class="streaming-content">
                  <div
                    class="streaming-text"
                    innerHTML={stream.parsedContent()}
                  />
                  <Show
                    when={
                      stream.state().showCursor &&
                      stream.state().isStreaming &&
                      !stream.state().isComplete
                    }
                  >
                    <span class="streaming-cursor">|</span>
                  </Show>
                </div>
              </div>
            </div>

            <div class="feature-demo">
              <h4>Thinking Indicators</h4>
              <p>
                Visual indicators when the assistant is processing or
                "thinking".
              </p>
              <div class="thinking-demo">
                <div class="thinking-indicator">
                  <div class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Processing your request...</span>
                </div>
              </div>
            </div>

            <div class="feature-demo">
              <h4>Tool Integration</h4>
              <p>Seamless integration with external tools and APIs.</p>
              <div class="tool-demo">
                <div class="tool-call">
                  <div class="tool-header">
                    <span class="tool-name">web_search</span>
                    <span class="tool-status tool-status--completed">
                      completed
                    </span>
                  </div>
                  <div class="tool-progress">
                    <div class="progress-bar">
                      <div class="progress-fill progress-fill--complete"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="feature-demo">
              <h4>Markdown Rendering</h4>
              <p>
                Full markdown support including code blocks, tables, and
                formatting.
              </p>
              <div class="markdown-demo">
                <div class="markdown-content">
                  <h5>Code Example:</h5>
                  <pre>
                    <code>const greeting = "Hello, World!";</code>
                  </pre>
                  <p>
                    <strong>Bold text</strong> and <em>italic text</em>
                  </p>
                  <ul>
                    <li>List item 1</li>
                    <li>List item 2</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeChatDemo() === "p2p" && <P2PChatDemo />}

      <Card class="demo-section">
        <h3>Chat System Configuration</h3>
        <p>Overview of available configuration options and customization.</p>

        <div class="config-options">
          <div class="config-section">
            <h4>Basic Configuration</h4>
            <ul>
              <li>
                <strong>endpoint:</strong> API endpoint for chat messages
              </li>
              <li>
                <strong>height:</strong> Chat container height
              </li>
              <li>
                <strong>placeholder:</strong> Input placeholder text
              </li>
              <li>
                <strong>maxMessages:</strong> Maximum messages to display
              </li>
            </ul>
          </div>

          <div class="config-section">
            <h4>Advanced Features</h4>
            <ul>
              <li>
                <strong>enableThinking:</strong> Show thinking indicators
              </li>
              <li>
                <strong>enableTools:</strong> Enable tool integration
              </li>
              <li>
                <strong>showTimestamps:</strong> Display message timestamps
              </li>
              <li>
                <strong>enableMarkdown:</strong> Render markdown content
              </li>
            </ul>
          </div>

          <div class="config-section">
            <h4>P2P Configuration</h4>
            <ul>
              <li>
                <strong>roomId:</strong> Unique room identifier
              </li>
              <li>
                <strong>username:</strong> User display name
              </li>
              <li>
                <strong>enableVideo:</strong> Video call support
              </li>
              <li>
                <strong>enableAudio:</strong> Audio call support
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
