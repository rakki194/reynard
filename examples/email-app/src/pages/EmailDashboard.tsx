import { createSignal, createEffect, For } from "solid-js";
import { useEmail } from "reynard-email/composables";
import { Link } from "@solidjs/router";

export function EmailDashboard() {
  const emailComposable = useEmail();
  
  const [stats, setStats] = createSignal({
    totalSent: 0,
    totalReceived: 0,
    unreadCount: 0,
    lastActivity: null as string | null,
  });

  createEffect(() => {
    // Update stats when messages change
    const messages = emailComposable.messages();
    const sent = messages.filter(m => m.status === "sent").length;
    const received = messages.filter(m => m.status === "received").length;
    const unread = messages.filter(m => m.status === "unread").length;
    
    setStats({
      totalSent: sent,
      totalReceived: received,
      unreadCount: unread,
      lastActivity: messages.length > 0 ? messages[0].sent_at : null,
    });
  });

  const quickActions = [
    {
      title: "Compose Email",
      description: "Send a new email message",
      icon: "✏️",
      link: "/compose",
      color: "primary"
    },
    {
      title: "View Inbox",
      description: "Check received messages",
      icon: "📥",
      link: "/inbox",
      color: "secondary"
    },
    {
      title: "Manage Templates",
      description: "Create and edit email templates",
      icon: "📝",
      link: "/templates",
      color: "success"
    },
    {
      title: "Agent Center",
      description: "Agent-to-agent communication",
      icon: "🤖",
      link: "/agents",
      color: "warning"
    },
  ];

  return (
    <div class="email-dashboard">
      <div class="dashboard-header">
        <h1>Email Dashboard</h1>
        <p>Manage your email communications and agent interactions</p>
      </div>

      {/* Status Overview */}
      <div class="dashboard-status">
        <div class="status-card">
          <div class="status-icon">📊</div>
          <div class="status-content">
            <h3>Email Status</h3>
            <div class="status-details">
              {emailComposable.status() ? (
                <div class="status-item">
                  <span class="status-label">Service:</span>
                  <span class={`status-value ${emailComposable.status()?.service_configured ? "success" : "error"}`}>
                    {emailComposable.status()?.service_configured ? "Configured" : "Not Configured"}
                  </span>
                </div>
              ) : (
                <div class="status-item">
                  <span class="status-label">Service:</span>
                  <span class="status-value loading">Loading...</span>
                </div>
              )}
              
              {emailComposable.status()?.test_connection && (
                <div class="status-item">
                  <span class="status-label">Connection:</span>
                  <span class="status-value success">Connected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div class="status-card">
          <div class="status-icon">📈</div>
          <div class="status-content">
            <h3>Statistics</h3>
            <div class="status-details">
              <div class="status-item">
                <span class="status-label">Sent:</span>
                <span class="status-value">{stats().totalSent}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Received:</span>
                <span class="status-value">{stats().totalReceived}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Unread:</span>
                <span class="status-value">{stats().unreadCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div class="dashboard-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <For each={quickActions}>
            {(action) => (
              <Link href={action.link} class="action-card">
                <div class={`action-icon ${action.color}`}>
                  {action.icon}
                </div>
                <div class="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </Link>
            )}
          </For>
        </div>
      </div>

      {/* Recent Activity */}
      <div class="dashboard-activity">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          {emailComposable.messages().length > 0 ? (
            <For each={emailComposable.messages().slice(0, 5)}>
              {(message) => (
                <div class="activity-item">
                  <div class="activity-icon">
                    {message.status === "sent" ? "📤" : "📥"}
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">
                      {message.subject || "No Subject"}
                    </div>
                    <div class="activity-meta">
                      <span class="activity-recipients">
                        {message.status === "sent" ? "To: " : "From: "}
                        {message.to_emails.join(", ")}
                      </span>
                      <span class="activity-time">
                        {message.sent_at ? new Date(message.sent_at).toLocaleString() : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div class={`activity-status ${message.status}`}>
                    {message.status}
                  </div>
                </div>
              )}
            </For>
          ) : (
            <div class="activity-empty">
              <div class="activity-empty-icon">📭</div>
              <div class="activity-empty-text">
                <h3>No recent activity</h3>
                <p>Start by composing your first email or checking your inbox.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {emailComposable.error() && (
        <div class="email-status email-status-error">
          <span class="error-icon">⚠️</span>
          {emailComposable.error()}
        </div>
      )}
    </div>
  );
}

