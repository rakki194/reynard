import { Component, createSignal } from "solid-js";
import {
  ChatContainer,
  P2PChatContainer,
  type ChatUser,
} from "@reynard/components";

interface DualChatDemoProps {
  currentUser: ChatUser;
}

export const DualChatDemo: Component<DualChatDemoProps> = (props) => {
  const [layout, setLayout] = createSignal<"horizontal" | "vertical">(
    "horizontal",
  );
  const [assistantConfig, setAssistantConfig] = createSignal({
    enableThinking: true,
    enableTools: true,
    showTimestamps: true,
  });

  const [p2pConfig, setP2pConfig] = createSignal({
    enableReactions: true,
    enableTypingIndicators: true,
    enableReadReceipts: true,
  });

  // Mock data for P2P demo
  const sampleRooms = [
    {
      id: "room-collab",
      name: "AI Collaboration",
      type: "group" as const,
      description: "Discussing AI assistant integration",
      participants: [
        props.currentUser,
        {
          id: "user-team-1",
          name: "Sarah Wilson",
          status: "online" as const,
          avatar: "👩‍💻",
        },
        {
          id: "user-team-2",
          name: "Mike Chen",
          status: "away" as const,
          avatar: "👨‍💼",
        },
      ],
      lastMessage: {
        id: "msg-collab-1",
        role: "user" as const,
        content:
          "The AI assistant responses look great! Should we integrate this with our main app?",
        timestamp: Date.now() - 180000, // 3 minutes ago
        roomId: "room-collab",
        sender: {
          id: "user-team-1",
          name: "Sarah Wilson",
          status: "online" as const,
        },
      },
    },
    {
      id: "dm-product",
      name: "Product Manager",
      type: "direct" as const,
      participants: [
        props.currentUser,
        {
          id: "user-pm",
          name: "Jessica Taylor",
          status: "online" as const,
          avatar: "👩‍💼",
        },
      ],
      lastMessage: {
        id: "msg-pm-1",
        role: "user" as const,
        content: "Can you show me the latest chat features in action?",
        timestamp: Date.now() - 60000, // 1 minute ago
        roomId: "dm-product",
        sender: {
          id: "user-pm",
          name: "Jessica Taylor",
          status: "online" as const,
        },
      },
    },
  ];

  return (
    <div class="demo-container">
      <div class="demo-header">
        <div class="demo-title">
          <h2>⚡ Dual Chat Experience</h2>
          <p>
            Experience both AI assistant and team chat side-by-side. Perfect for
            collaborative AI workflows and team coordination.
          </p>
        </div>

        <div class="demo-controls">
          {/* Layout Controls */}
          <div class="control-group">
            <label class="control-label">Layout</label>
            <div class="button-group">
              <button
                class={`button-group-item ${layout() === "horizontal" ? "active" : ""}`}
                onClick={() => setLayout("horizontal")}
              >
                ↔️ Horizontal
              </button>
              <button
                class={`button-group-item ${layout() === "vertical" ? "active" : ""}`}
                onClick={() => setLayout("vertical")}
              >
                ↕️ Vertical
              </button>
            </div>
          </div>

          {/* Quick Feature Toggles */}
          <div class="control-group">
            <label class="control-label">AI Features</label>
            <div class="toggle-group">
              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={assistantConfig().enableThinking}
                  onChange={(e) =>
                    setAssistantConfig((prev) => ({
                      ...prev,
                      enableThinking: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">🧠 Thinking</span>
              </label>

              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={assistantConfig().enableTools}
                  onChange={(e) =>
                    setAssistantConfig((prev) => ({
                      ...prev,
                      enableTools: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">🔧 Tools</span>
              </label>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label">Team Features</label>
            <div class="toggle-group">
              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={p2pConfig().enableReactions}
                  onChange={(e) =>
                    setP2pConfig((prev) => ({
                      ...prev,
                      enableReactions: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">😊 Reactions</span>
              </label>

              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={p2pConfig().enableTypingIndicators}
                  onChange={(e) =>
                    setP2pConfig((prev) => ({
                      ...prev,
                      enableTypingIndicators: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">✏️ Typing</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-content">
        <div class={`dual-chat-container ${layout()}`}>
          {/* AI Assistant Chat */}
          <div class="chat-panel assistant-panel">
            <div class="panel-header">
              <div class="panel-title">
                <span class="panel-icon">🤖</span>
                <span class="panel-text">AI Assistant</span>
              </div>
              <div class="panel-status">
                <div class="status-dot connected"></div>
                <span>GPT-4</span>
              </div>
            </div>

            <div class="panel-content">
              <ChatContainer
                endpoint="/api/assistant"
                height={layout() === "horizontal" ? "500px" : "300px"}
                config={assistantConfig()}
                authHeaders={{
                  Authorization: "Bearer demo-token-123",
                  "X-Demo-Mode": "dual-chat",
                }}
                onMessageSent={(message) => {
                  console.log("AI message sent:", message);
                }}
                onMessageReceived={(message) => {
                  console.log("AI message received:", message);
                }}
                onError={(error) => {
                  console.error("AI chat error:", error);
                }}
              />
            </div>
          </div>

          {/* Team Chat */}
          <div class="chat-panel team-panel">
            <div class="panel-header">
              <div class="panel-title">
                <span class="panel-icon">👥</span>
                <span class="panel-text">Team Chat</span>
              </div>
              <div class="panel-status">
                <div class="status-dot connected"></div>
                <span>3 online</span>
              </div>
            </div>

            <div class="panel-content">
              <P2PChatContainer
                currentUser={props.currentUser}
                realtimeEndpoint="ws://localhost:8080/chat"
                apiEndpoint="/api/chat"
                authHeaders={{
                  Authorization: "Bearer demo-token-123",
                  "X-Demo-Mode": "dual-chat",
                }}
                initialRooms={sampleRooms}
                initialRoomId="room-collab"
                config={{
                  ...p2pConfig(),
                  enableFileUploads: true,
                  enableReadReceipts: true,
                }}
                ui={{
                  showUserList: layout() === "horizontal",
                  showRoomList: true,
                  compact: layout() === "vertical",
                }}
                onMessageReceived={(message) => {
                  console.log("Team message received:", message);
                }}
                onError={(error) => {
                  console.error("Team chat error:", error);
                }}
              />
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div class="use-cases">
          <h4>💡 Dual Chat Use Cases</h4>
          <div class="use-case-grid">
            <div class="use-case-card">
              <div class="use-case-icon">🚀</div>
              <div class="use-case-title">Product Development</div>
              <div class="use-case-description">
                Use AI for code generation and analysis while coordinating with
                your team in real-time
              </div>
            </div>

            <div class="use-case-card">
              <div class="use-case-icon">📝</div>
              <div class="use-case-title">Content Creation</div>
              <div class="use-case-description">
                Get AI assistance for writing while collaborating with editors
                and reviewers
              </div>
            </div>

            <div class="use-case-card">
              <div class="use-case-icon">🎓</div>
              <div class="use-case-title">Learning & Teaching</div>
              <div class="use-case-description">
                Students can ask AI questions while participating in group
                discussions
              </div>
            </div>

            <div class="use-case-card">
              <div class="use-case-icon">🔬</div>
              <div class="use-case-title">Research Projects</div>
              <div class="use-case-description">
                Leverage AI for research assistance while maintaining team
                communication
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Example */}
        <div class="workflow-example">
          <h4>🔄 Example Workflow</h4>
          <div class="workflow-steps">
            <div class="workflow-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <div class="step-title">Ask AI for Help</div>
                <div class="step-description">
                  Request code review, brainstorming, or analysis from the AI
                  assistant
                </div>
              </div>
            </div>

            <div class="workflow-arrow">→</div>

            <div class="workflow-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <div class="step-title">Share with Team</div>
                <div class="step-description">
                  Discuss AI suggestions and get team feedback in the chat
                </div>
              </div>
            </div>

            <div class="workflow-arrow">→</div>

            <div class="workflow-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <div class="step-title">Iterate Together</div>
                <div class="step-description">
                  Refine ideas using both AI assistance and human collaboration
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
