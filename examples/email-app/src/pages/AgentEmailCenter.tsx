import { createSignal, createEffect, For } from "solid-js";
import { useAgentEmail } from "reynard-email/composables";

export function AgentEmailCenter() {
  const [selectedAgent, setSelectedAgent] = createSignal<string>("");
  const [agentEmailComposable] = createSignal(useAgentEmail({ agentId: selectedAgent() }));

  const [agents] = createSignal([
    { id: "agent-1", name: "Sharp-Grandmaster-89", email: "sharp-grandmaster-89@reynard.ai", spirit: "fox" },
    { id: "agent-2", name: "Pack-Scribe-16", email: "pack-scribe-16@reynard.ai", spirit: "wolf" },
    { id: "agent-3", name: "River-Bubbles-5", email: "river-bubbles-5@reynard.ai", spirit: "otter" },
  ]);

  const [newMessage, setNewMessage] = createSignal({
    subject: "",
    body: "",
    targetAgent: "",
  });

  const handleSendToAgent = async () => {
    if (!selectedAgent() || !newMessage().targetAgent || !newMessage().subject || !newMessage().body) {
      alert("Please fill in all fields");
      return;
    }

    const success = await agentEmailComposable().sendToAgent(newMessage().targetAgent, {
      subject: newMessage().subject,
      body: newMessage().body,
    });

    if (success) {
      setNewMessage({ subject: "", body: "", targetAgent: "" });
      alert("Email sent successfully!");
    } else {
      alert("Failed to send email");
    }
  };

  const handleTriggerAutomatedEmail = async (eventType: string) => {
    if (!selectedAgent()) {
      alert("Please select an agent first");
      return;
    }

    const success = await agentEmailComposable().triggerAutoEmail(eventType, {
      timestamp: new Date().toISOString(),
      source: "manual_trigger",
    });

    if (success) {
      alert(`Automated email triggered for event: ${eventType}`);
    } else {
      alert("Failed to trigger automated email");
    }
  };

  return (
    <div class="agent-email-center">
      <div class="page-header">
        <h1>Agent Email Center</h1>
        <p>Manage agent-to-agent communication and automated emails</p>
      </div>

      <div class="agent-email-grid">
        {/* Agent Selection */}
        <div class="agent-email-card">
          <h3>Select Agent</h3>
          <div class="agent-selection">
            <For each={agents()}>
              {(agent) => (
                <div 
                  class={`agent-option ${selectedAgent() === agent.id ? "selected" : ""}`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <div class="agent-avatar">
                    {agent.spirit === "fox" ? "🦊" : agent.spirit === "wolf" ? "🐺" : "🦦"}
                  </div>
                  <div class="agent-info">
                    <div class="agent-name">{agent.name}</div>
                    <div class="agent-email">{agent.email}</div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>

        {/* Agent Stats */}
        {selectedAgent() && (
          <div class="agent-email-card">
            <h3>Agent Statistics</h3>
            <div class="agent-email-stats">
              <div class="agent-email-stat">
                <div class="agent-email-stat-value">
                  {agentEmailComposable().stats()?.total_sent || 0}
                </div>
                <div class="agent-email-stat-label">Sent</div>
              </div>
              <div class="agent-email-stat">
                <div class="agent-email-stat-value">
                  {agentEmailComposable().stats()?.total_received || 0}
                </div>
                <div class="agent-email-stat-label">Received</div>
              </div>
              <div class="agent-email-stat">
                <div class="agent-email-stat-value">
                  {agentEmailComposable().stats()?.unread_count || 0}
                </div>
                <div class="agent-email-stat-label">Unread</div>
              </div>
              <div class="agent-email-stat">
                <div class="agent-email-stat-value">
                  {agentEmailComposable().stats()?.active_conversations || 0}
                </div>
                <div class="agent-email-stat-label">Active</div>
              </div>
            </div>
          </div>
        )}

        {/* Send Message */}
        {selectedAgent() && (
          <div class="agent-email-card">
            <h3>Send Message</h3>
            <div class="email-form">
              <div class="email-form-group">
                <label>Target Agent</label>
                <select
                  value={newMessage().targetAgent}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, targetAgent: e.currentTarget.value }))}
                >
                  <option value="">Select target agent...</option>
                  <For each={agents().filter(a => a.id !== selectedAgent())}>
                    {(agent) => (
                      <option value={agent.id}>{agent.name}</option>
                    )}
                  </For>
                </select>
              </div>
              
              <div class="email-form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={newMessage().subject}
                  onInput={(e) => setNewMessage(prev => ({ ...prev, subject: e.currentTarget.value }))}
                  placeholder="Enter subject..."
                />
              </div>
              
              <div class="email-form-group">
                <label>Message</label>
                <textarea
                  value={newMessage().body}
                  onInput={(e) => setNewMessage(prev => ({ ...prev, body: e.currentTarget.value }))}
                  placeholder="Enter message..."
                  rows={4}
                />
              </div>
              
              <button
                class="email-button email-button-primary"
                onClick={handleSendToAgent}
                disabled={!newMessage().targetAgent || !newMessage().subject || !newMessage().body}
              >
                Send Message
              </button>
            </div>
          </div>
        )}

        {/* Automated Email Triggers */}
        {selectedAgent() && (
          <div class="agent-email-card">
            <h3>Automated Email Triggers</h3>
            <div class="trigger-actions">
              <button
                class="email-button email-button-secondary"
                onClick={() => handleTriggerAutomatedEmail("agent_interaction")}
              >
                Trigger Agent Interaction
              </button>
              <button
                class="email-button email-button-secondary"
                onClick={() => handleTriggerAutomatedEmail("system_alert")}
              >
                Trigger System Alert
              </button>
              <button
                class="email-button email-button-secondary"
                onClick={() => handleTriggerAutomatedEmail("scheduled")}
              >
                Trigger Scheduled Email
              </button>
            </div>
          </div>
        )}

        {/* Agent Templates */}
        {selectedAgent() && (
          <div class="agent-email-card">
            <h3>Email Templates</h3>
            <div class="template-list">
              {agentEmailComposable().templates().length > 0 ? (
                <For each={agentEmailComposable().templates()}>
                  {(template) => (
                    <div class="template-item">
                      <div class="template-name">{template.name}</div>
                      <div class="template-subject">{template.subject}</div>
                      <div class="template-actions">
                        <button class="email-button email-button-secondary">Edit</button>
                        <button class="email-button email-button-danger">Delete</button>
                      </div>
                    </div>
                  )}
                </For>
              ) : (
                <div class="template-empty">
                  <p>No templates found for this agent.</p>
                  <button class="email-button email-button-primary">Create Template</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Messages */}
        {selectedAgent() && (
          <div class="agent-email-card">
            <h3>Recent Messages</h3>
            <div class="message-list">
              {agentEmailComposable().messages().length > 0 ? (
                <For each={agentEmailComposable().messages().slice(0, 5)}>
                  {(message) => (
                    <div class="message-item">
                      <div class="message-subject">{message.subject}</div>
                      <div class="message-meta">
                        <span class="message-recipients">
                          To: {message.to_emails.join(", ")}
                        </span>
                        <span class="message-time">
                          {message.sent_at ? new Date(message.sent_at).toLocaleString() : "Draft"}
                        </span>
                      </div>
                    </div>
                  )}
                </For>
              ) : (
                <div class="message-empty">
                  <p>No messages found for this agent.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {agentEmailComposable().error() && (
        <div class="email-status email-status-error">
          <span class="error-icon">⚠️</span>
          {agentEmailComposable().error()}
        </div>
      )}
    </div>
  );
}

