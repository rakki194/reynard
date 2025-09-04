import { Component, createSignal, onMount } from "solid-js";
import { ChatContainer } from "@reynard/components";

export const AssistantChatDemo: Component = () => {
  const [config, setConfig] = createSignal({
    enableThinking: true,
    enableTools: true,
    showTimestamps: true,
    showTokenCounts: false,
    autoScroll: true,
    maxHistoryLength: 50,
  });

  const [selectedModel, setSelectedModel] = createSignal("gpt-4");
  const [isConnected, setIsConnected] = createSignal(false);

  const models = [
    { id: "gpt-4", name: "GPT-4", description: "Most capable model" },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      description: "Fast and efficient",
    },
    {
      id: "claude-3",
      name: "Claude 3",
      description: "Anthropic's latest model",
    },
  ];

  onMount(() => {
    // Simulate connection status
    setTimeout(() => setIsConnected(true), 1000);
  });

  return (
    <div class="demo-container">
      <div class="demo-header">
        <div class="demo-title">
          <h2>🤖 AI Assistant Chat</h2>
          <p>
            Experience streaming AI conversations with thinking sections, tool
            calls, and advanced markdown rendering.
          </p>
        </div>

        <div class="demo-controls">
          {/* Model Selection */}
          <div class="control-group">
            <label class="control-label" for="model-select">
              AI Model
            </label>
            <select
              id="model-select"
              class="control-select"
              value={selectedModel()}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map((model) => (
                <option value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>

          {/* Configuration Toggles */}
          <div class="control-group">
            <label class="control-label">Features</label>
            <div class="toggle-group">
              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={config().enableThinking}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      enableThinking: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">🧠 Thinking Sections</span>
              </label>

              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={config().enableTools}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      enableTools: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">🔧 Tool Calls</span>
              </label>

              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={config().showTimestamps}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      showTimestamps: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">⏰ Timestamps</span>
              </label>

              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={config().showTokenCounts}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      showTokenCounts: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">🔢 Token Counts</span>
              </label>
            </div>
          </div>

          {/* Connection Status */}
          <div class="connection-status">
            <div
              class={`status-indicator ${isConnected() ? "connected" : "connecting"}`}
            >
              {isConnected() ? "🟢" : "🟡"}
            </div>
            <span class="status-text">
              {isConnected() ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      <div class="demo-content">
        <div class="chat-container-wrapper">
          <ChatContainer
            endpoint="/api/assistant"
            height="600px"
            config={config()}
            authHeaders={{
              Authorization: "Bearer demo-token-123",
              "X-Demo-Mode": "true",
            }}
            onMessageSent={(message) => {
              console.log("Message sent:", message);
            }}
            onMessageReceived={(message) => {
              console.log("Message received:", message);
            }}
            onError={(error) => {
              console.error("Chat error:", error);
            }}
          />
        </div>

        {/* Example Prompts */}
        <div class="example-prompts">
          <h4>💡 Try these example prompts:</h4>
          <div class="prompt-grid">
            <button
              class="prompt-card"
              onClick={() => {
                // This would send the prompt to the chat
                console.log("Sending example prompt");
              }}
            >
              <div class="prompt-title">🧮 Math Problem</div>
              <div class="prompt-text">
                Calculate the compound interest on $10,000 at 5% annual rate for
                3 years
              </div>
            </button>

            <button
              class="prompt-card"
              onClick={() => {
                console.log("Sending example prompt");
              }}
            >
              <div class="prompt-title">📊 Data Analysis</div>
              <div class="prompt-text">
                Create a Python script to analyze sales data and generate
                insights
              </div>
            </button>

            <button
              class="prompt-card"
              onClick={() => {
                console.log("Sending example prompt");
              }}
            >
              <div class="prompt-title">🎨 Creative Writing</div>
              <div class="prompt-text">
                Write a short story about a time-traveling software engineer
              </div>
            </button>

            <button
              class="prompt-card"
              onClick={() => {
                console.log("Sending example prompt");
              }}
            >
              <div class="prompt-title">🔍 Research Help</div>
              <div class="prompt-text">
                Explain quantum computing in simple terms with practical
                examples
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
