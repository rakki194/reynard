/**
 * IMAP Inbox Page for Email App
 *
 * This page displays received emails from IMAP with agent integration.
 */

import { createSignal, createEffect, For, Show } from "solid-js";
import { useImap } from "reynard-email";
import { Layout } from "../components/Layout";

export default function ImapInbox() {
  const imap = useImap();
  const [selectedEmail, setSelectedEmail] = createSignal<string | null>(null);
  const [viewMode, setViewMode] = createSignal<"unread" | "recent" | "all">("unread");

  // Auto-refresh status on mount
  createEffect(() => {
    imap.refreshStatus();
    imap.refreshSummary();
  });

  // Get emails based on view mode
  const getEmails = () => {
    switch (viewMode()) {
      case "unread":
        return imap.unreadEmails() || [];
      case "recent":
        return imap.recentEmails() || [];
      default:
        return [...(imap.unreadEmails() || []), ...(imap.recentEmails() || [])];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "text-blue-600";
      case "processed":
        return "text-green-600";
      case "replied":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    const success = await imap.markAsRead(messageId);
    if (success) {
      console.log("Email marked as read");
    }
  };

  const handleMarkAsProcessed = async (messageId: string) => {
    const success = await imap.markAsProcessed(messageId);
    if (success) {
      console.log("Email marked as processed");
    }
  };

  const handleTestConnection = async () => {
    const success = await imap.testConnection();
    if (success) {
      console.log("Connection test successful");
    }
  };

  const handleStartMonitoring = async () => {
    const success = await imap.startMonitoring(60);
    if (success) {
      console.log("Email monitoring started");
    }
  };

  return (
    <Layout>
      <div class="p-6">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">IMAP Inbox</h1>
          <p class="text-gray-600">Manage received emails with agent integration</p>
        </div>

        {/* Status Section */}
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">IMAP Status</h2>
            <div class="flex gap-2">
              <button
                onClick={handleTestConnection}
                disabled={imap.loading()}
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Test Connection
              </button>
              <button
                onClick={handleStartMonitoring}
                disabled={imap.loading()}
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Start Monitoring
              </button>
              <button onClick={imap.stopMonitoring} class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Stop Monitoring
              </button>
            </div>
          </div>

          <Show when={imap.status()}>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 bg-gray-50 rounded">
                <h3 class="font-medium text-gray-900">Connection Status</h3>
                <p class={`text-lg font-semibold ${imap.isConnected() ? "text-green-600" : "text-red-600"}`}>
                  {imap.status()?.status || "Unknown"}
                </p>
              </div>
              <div class="p-4 bg-gray-50 rounded">
                <h3 class="font-medium text-gray-900">Server</h3>
                <p class="text-sm text-gray-600">
                  {imap.status()?.config.imap_server}:{imap.status()?.config.imap_port}
                </p>
              </div>
              <div class="p-4 bg-gray-50 rounded">
                <h3 class="font-medium text-gray-900">Mailbox</h3>
                <p class="text-sm text-gray-600">{imap.status()?.config.mailbox}</p>
              </div>
            </div>
          </Show>

          <Show when={imap.error()}>
            <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <p class="text-red-800">{imap.error()}</p>
            </div>
          </Show>
        </div>

        {/* Email Summary */}
        <Show when={imap.emailSummary()}>
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Email Summary</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-blue-50 rounded">
                <div class="text-2xl font-bold text-blue-600">{imap.emailSummary()?.total_emails || 0}</div>
                <div class="text-sm text-gray-600">Total Emails</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded">
                <div class="text-2xl font-bold text-green-600">{imap.emailSummary()?.agent_emails || 0}</div>
                <div class="text-sm text-gray-600">Agent Emails</div>
              </div>
              <div class="text-center p-4 bg-yellow-50 rounded">
                <div class="text-2xl font-bold text-yellow-600">{imap.emailSummary()?.unread_emails || 0}</div>
                <div class="text-sm text-gray-600">Unread</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded">
                <div class="text-2xl font-bold text-purple-600">{imap.emailSummary()?.replied_emails || 0}</div>
                <div class="text-sm text-gray-600">Replied</div>
              </div>
            </div>
          </div>
        </Show>

        {/* View Mode Tabs */}
        <div class="bg-white rounded-lg shadow mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex">
              <button
                onClick={() => setViewMode("unread")}
                class={`py-2 px-4 border-b-2 font-medium text-sm ${
                  viewMode() === "unread"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Unread Emails
              </button>
              <button
                onClick={() => setViewMode("recent")}
                class={`py-2 px-4 border-b-2 font-medium text-sm ${
                  viewMode() === "recent"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Recent Emails
              </button>
              <button
                onClick={() => setViewMode("all")}
                class={`py-2 px-4 border-b-2 font-medium text-sm ${
                  viewMode() === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Emails
              </button>
            </nav>
          </div>

          {/* Email List */}
          <div class="divide-y divide-gray-200">
            <Show
              when={getEmails().length > 0}
              fallback={<div class="p-6 text-center text-gray-500">No emails found for the selected view.</div>}
            >
              <For each={getEmails()}>
                {email => (
                  <div class="p-4 hover:bg-gray-50">
                    <div class="flex items-start justify-between">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="text-sm font-medium text-gray-900 truncate">{email.subject}</h3>
                          <Show when={email.is_agent_email}>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Agent Email
                            </span>
                          </Show>
                          <span
                            class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}
                          >
                            {email.status}
                          </span>
                        </div>
                        <div class="text-sm text-gray-600 mb-1">
                          <span class="font-medium">From:</span> {email.sender}
                          <Show when={email.from_agent}>
                            <span class="text-blue-600"> (Agent: {email.from_agent})</span>
                          </Show>
                        </div>
                        <div class="text-sm text-gray-600 mb-1">
                          <span class="font-medium">To:</span> {email.recipient}
                          <Show when={email.to_agent}>
                            <span class="text-blue-600"> (Agent: {email.to_agent})</span>
                          </Show>
                        </div>
                        <div class="text-sm text-gray-500">{formatDate(email.date)}</div>
                        <Show when={email.body}>
                          <p class="text-sm text-gray-700 mt-2 line-clamp-2">{email.body.substring(0, 200)}...</p>
                        </Show>
                      </div>
                      <div class="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleMarkAsRead(email.message_id)}
                          disabled={imap.loading()}
                          class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Mark Read
                        </button>
                        <button
                          onClick={() => handleMarkAsProcessed(email.message_id)}
                          disabled={imap.loading()}
                          class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Mark Processed
                        </button>
                        <button
                          onClick={() => setSelectedEmail(email.message_id)}
                          class="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>

        {/* Email Detail Modal */}
        <Show when={selectedEmail()}>
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-xl font-semibold">Email Details</h2>
                  <button onClick={() => setSelectedEmail(null)} class="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>
                <Show when={getEmails().find(e => e.message_id === selectedEmail())}>
                  {email => (
                    <div class="space-y-4">
                      <div>
                        <h3 class="font-medium text-gray-900">Subject</h3>
                        <p class="text-gray-700">{email().subject}</p>
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">From</h3>
                        <p class="text-gray-700">
                          {email().sender}
                          <Show when={email().from_agent}>
                            <span class="text-blue-600"> (Agent: {email().from_agent})</span>
                          </Show>
                        </p>
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">To</h3>
                        <p class="text-gray-700">
                          {email().recipient}
                          <Show when={email().to_agent}>
                            <span class="text-blue-600"> (Agent: {email().to_agent})</span>
                          </Show>
                        </p>
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">Date</h3>
                        <p class="text-gray-700">{formatDate(email().date)}</p>
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">Status</h3>
                        <p class={`font-medium ${getStatusColor(email().status)}`}>{email().status}</p>
                      </div>
                      <Show when={email().body}>
                        <div>
                          <h3 class="font-medium text-gray-900">Body</h3>
                          <div class="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">{email().body}</div>
                        </div>
                      </Show>
                      <Show when={email().html_body}>
                        <div>
                          <h3 class="font-medium text-gray-900">HTML Body</h3>
                          <div class="text-gray-700 bg-gray-50 p-4 rounded" innerHTML={email().html_body} />
                        </div>
                      </Show>
                      <Show when={email().attachments && email().attachments!.length > 0}>
                        <div>
                          <h3 class="font-medium text-gray-900">Attachments</h3>
                          <ul class="list-disc list-inside text-gray-700">
                            <For each={email().attachments}>
                              {attachment => (
                                <li>
                                  {attachment.filename} ({attachment.content_type}, {attachment.size} bytes)
                                </li>
                              )}
                            </For>
                          </ul>
                        </div>
                      </Show>
                    </div>
                  )}
                </Show>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </Layout>
  );
}
