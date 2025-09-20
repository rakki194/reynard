import { createSignal, For } from "solid-js";
import { useEmail } from "reynard-email/composables";

export function EmailInbox() {
  const emailComposable = useEmail();
  
  const [selectedMessage, setSelectedMessage] = createSignal<any>(null);
  const [filter, setFilter] = createSignal<"all" | "unread" | "sent">("all");

  const filteredMessages = () => {
    const messages = emailComposable.messages();
    switch (filter()) {
      case "unread":
        return messages.filter(m => m.status === "unread");
      case "sent":
        return messages.filter(m => m.status === "sent");
      default:
        return messages;
    }
  };

  return (
    <div class="email-inbox">
      <div class="page-header">
        <h1>Email Inbox</h1>
        <p>View and manage your email messages</p>
      </div>

      <div class="inbox-controls">
        <div class="inbox-filters">
          <button
            class={`filter-button ${filter() === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Messages
          </button>
          <button
            class={`filter-button ${filter() === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread
          </button>
          <button
            class={`filter-button ${filter() === "sent" ? "active" : ""}`}
            onClick={() => setFilter("sent")}
          >
            Sent
          </button>
        </div>
        
        <button
          class="email-button email-button-primary"
          onClick={() => emailComposable.refreshMessages()}
        >
          Refresh
        </button>
      </div>

      <div class="inbox-content">
        <div class="message-list">
          {filteredMessages().length > 0 ? (
            <For each={filteredMessages()}>
              {(message) => (
                <div 
                  class={`message-item ${message.status === "unread" ? "unread" : ""}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div class="message-meta">
                    <div class="message-sender">
                      {message.status === "sent" ? "To: " : "From: "}
                      {message.to_emails.join(", ")}
                    </div>
                    <div class="message-date">
                      {message.sent_at ? new Date(message.sent_at).toLocaleString() : "Draft"}
                    </div>
                  </div>
                  <div class="message-subject">{message.subject || "No Subject"}</div>
                  <div class="message-preview">
                    {message.body.substring(0, 100)}
                    {message.body.length > 100 ? "..." : ""}
                  </div>
                  <div class={`message-status ${message.status}`}>
                    {message.status}
                  </div>
                </div>
              )}
            </For>
          ) : (
            <div class="message-empty">
              <div class="empty-icon">📭</div>
              <div class="empty-text">
                <h3>No messages found</h3>
                <p>No messages match your current filter.</p>
              </div>
            </div>
          )}
        </div>

        {selectedMessage() && (
          <div class="message-detail">
            <div class="message-detail-header">
              <h3>{selectedMessage().subject || "No Subject"}</h3>
              <button
                class="email-button email-button-secondary"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
            
            <div class="message-detail-meta">
              <div class="meta-item">
                <span class="meta-label">From:</span>
                <span class="meta-value">{selectedMessage().to_emails.join(", ")}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Date:</span>
                <span class="meta-value">
                  {selectedMessage().sent_at ? new Date(selectedMessage().sent_at).toLocaleString() : "Draft"}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Status:</span>
                <span class={`meta-value status-${selectedMessage().status}`}>
                  {selectedMessage().status}
                </span>
              </div>
            </div>
            
            <div class="message-detail-body">
              <pre>{selectedMessage().body}</pre>
            </div>
            
            {selectedMessage().html_body && (
              <div class="message-detail-html">
                <h4>HTML Version:</h4>
                <div innerHTML={selectedMessage().html_body} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

