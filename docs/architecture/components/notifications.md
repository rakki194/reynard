# Notification System

## Table of Contents

---

- [Notification System](#notification-system)
  - [Table of Contents](#table-of-contents)
  - [Components](#components)
    - [NotificationContainer (`NotificationContainer.tsx`)](#notificationcontainer-notificationcontainertsx)
    - [Notification (`Notification.tsx`)](#notification-notificationtsx)
  - [Public API](#public-api)
  - [Styling](#styling)
  - [Usage](#usage)
    - [Advanced updates and grouping](#advanced-updates-and-grouping)
    - [Streaming examples (Diffusion LLM)](#streaming-examples-diffusion-llm)
    - [NLWeb Integration Notifications](#nlweb-integration-notifications)
    - [TTS and Crawl Integration Notifications](#tts-and-crawl-integration-notifications)
    - [RAG Ingest and Progress Notifications](#rag-ingest-and-progress-notifications)
  - [Features](#features)
  - [Best Practices](#best-practices)
  - [Implementation Details](#implementation-details)
  - [Customization](#customization)
  - [Accessibility](#accessibility)
  - [Testing](#testing)

The notification system in yipyap provides a flexible and accessible way to
display toast notifications. It consists of two main components:

## Components

---

### NotificationContainer (`NotificationContainer.tsx`)

The `NotificationContainer` serves as a global container component that manages
all notifications in the application. It handles the stacking and positioning of
notifications as they appear and disappear. The container is responsible for
managing the full lifecycle of notifications, including their entrance and exit
animations.

### Notification (`Notification.tsx`)

The `Notification` component represents an individual notification element that
can be displayed to the user. It provides support for different notification
types including error, success, info, and warning messages. Each notification
includes appropriate progress indicators and icons based on its type and state.

## Public API

---

Notifications are created primarily via the app context's `notify` function,
which also integrates translations. The container exposes a small global API
used internally by the app context and that can be used for advanced flows.

- App context API (recommended):

```ts
// Signature
notify(
  message: string,
  type?: "error" | "success" | "info" | "warning",
  group?: string,
  icon?: "spinner" | "success" | "error" | "info" | "warning",
  progress?: number
): void
```

Messages pass through the translator `t(message)` automatically. If a `group` is
provided, existing notifications in that group are updated in-place when
possible. When `icon` is omitted, it is derived from `type`; supplying
`"spinner"` pins the toast (no auto-dismiss) and shows a spinning icon. The
`progress` value is clamped to [0, 100] and renders an ARIA progressbar.

- Container global API (advanced): The `NotificationContainer` registers a
  global object on `window`:

```ts
interface NotificationItem {
  id: string;
  message: string;
  type: "error" | "success" | "info" | "warning";
  group?: string;
  icon?: "spinner" | "success" | "error" | "info" | "warning";
  progress?: number;
}

// available on window under __notificationContainer
addNotification(notification: NotificationItem): void
removeNotification(id: string): void
removeNotificationByGroup(group: string): void
getNotificationIdByGroup(group: string): string | undefined
```

This API is used by `notify(...)` behind the scenes to add or update
notifications by group, and can be used directly when you need low-level control
(e.g., fixed IDs or batch removal by group).

## Styling

---

The notification system uses the following styles:

- `Notification.module.css`: Individual notification styling and variants
- `NotificationContainer.css`: Container and layout styling

## Usage

---

Notifications can be created through the app context:

```typescript
const { notify } = useAppContext();

// Basic usage
notify("Operation completed", "success");

// With custom icon and group
notify("Processing...", "info", "upload", "spinner");

// With progress tracking
notify("Uploading...", "info", "upload", "spinner", 45);
```

### Advanced updates and grouping

Use groups to update or replace ongoing operations. The app context attempts to
update an existing grouped notification rather than creating a new one.

```ts
const group = `upload-${file.id}`;
// Start
notify(`Uploading ${file.name}...`, "info", group, "spinner", 0);

// Progress updates (call as progress arrives)
notify(`Uploading ${file.name}...`, "info", group, "spinner", percent);

// Complete or error
notify(`${file.name} uploaded`, "success", group);
// or
notify(`Upload failed: ${reason}`, "error", group);
```

### Streaming examples (Diffusion LLM)

When consuming SSE streams (e.g., diffusion text generation), create a grouped
notification before starting, update UI on steps, and replace with a success or
error on completion. For batch mode, use a shared group for the whole batch and
per-item subgroups:

```typescript
const group = `diffusion-generate-${Date.now()}`;
notify(
  t("notifications.generatingCaption") || "Generating...",
  "info",
  group,
  "spinner",
);

await llm.generateStream(request, {
  onStep: (_i, text) => setOutput((prev) => prev + text),
  onComplete: async (final) => {
    setOutput((p) => (p || "") + final);
    try {
      await navigator.clipboard?.writeText(final);
      notify("Generation complete (copied)", "success", group);
    } catch {
      notify("Generation complete", "success", group);
    }
  },
  onError: (message) => notify(message || "Generation failed", "error", group),
});

// Batch mode example
const batchGroup = `diffusion-batch-${Date.now()}`;
notify(`Starting batch (${items.length})`, "info", batchGroup, "spinner");
for (let i = 0; i < items.length; i++) {
  const itemGroup = `${batchGroup}:${i}`;
  notify(`Item ${i + 1}...`, "info", itemGroup, "spinner");
}
```

### NLWeb Integration Notifications

When NLWeb integration is enabled, the system may display notifications for
router selections and tool executions. These notifications help users understand
what tools are being suggested and executed based on their natural language
queries:

```typescript
// Router selection notifications (optional)
notify(
  "Analyzing query for tool suggestions...",
  "info",
  "nlweb-router",
  "info",
);

// Tool execution notifications
notify("Executing git status...", "info", "nlweb-tools", "info");
notify("Git status completed", "success", "nlweb-tools");

// Error notifications for failed tool suggestions
notify("No suitable tools found for query", "warning", "nlweb-router");

// Tool execution progress
notify("Processing image captions...", "info", "nlweb-tools", "spinner");
notify("Caption generation complete", "success", "nlweb-tools");
```

The NLWeb integration uses specific notification groups (`nlweb-router` and
`nlweb-tools`) to organize related notifications and allow users to dismiss them
as a group when needed.

### TTS and Crawl Integration Notifications

The TTS and Crawl integration system provides comprehensive progress tracking
through notifications for the complete pipeline from URL input to audio
playback. These notifications help users understand the current stage of
processing and any issues that arise:

```typescript
// Crawl progress notifications
const crawlGroup = `crawl-${url}`;
notify("Starting web crawl...", "info", crawlGroup, "spinner", 0);

// Crawl progress updates (from SSE stream)
notify("Crawling webpage...", "info", crawlGroup, "spinner", 25);
notify("Extracting content...", "info", crawlGroup, "spinner", 75);
notify("Crawl completed", "success", crawlGroup);

// Summarization progress notifications
const summaryGroup = `summary-${summaryId}`;
notify("Summarizing content...", "info", summaryGroup, "spinner", 0);

// Summarization progress updates
notify("Cleaning markdown...", "info", summaryGroup, "spinner", 20);
notify("Generating summary...", "info", summaryGroup, "spinner", 60);
notify("Creating outline...", "info", summaryGroup, "spinner", 80);
notify("Summary completed", "success", summaryGroup);

// TTS synthesis notifications
const ttsGroup = `tts-${summaryId}`;
notify("Synthesizing speech...", "info", ttsGroup, "spinner", 0);

// TTS progress updates (for chunked synthesis)
notify("Processing text chunks...", "info", ttsGroup, "spinner", 30);
notify("Generating audio...", "info", ttsGroup, "spinner", 70);
notify("TTS completed", "success", ttsGroup);

// Audio ingestion notifications
const ingestGroup = `ingest-${audioId}`;
notify("Ingesting audio...", "info", ingestGroup, "spinner");
notify("Audio ingested successfully", "success", ingestGroup);

// Error notifications for each stage
notify("Crawl failed: URL not accessible", "error", crawlGroup);
notify("Summarization failed: Content too large", "error", summaryGroup);
notify("TTS failed: Backend unavailable", "error", ttsGroup);
notify("Ingestion failed: File not found", "error", ingestGroup);

// Batch processing notifications
const batchGroup = `batch-${Date.now()}`;
notify("Processing 5 URLs...", "info", batchGroup, "spinner", 0);

// Individual item progress within batch
for (let i = 0; i < urls.length; i++) {
  const itemGroup = `${batchGroup}:${i}`;
  notify(`URL ${i + 1}: Crawling...`, "info", itemGroup, "spinner");
  // ... processing ...
  notify(`URL ${i + 1}: Completed`, "success", itemGroup);
}

notify("Batch processing completed", "success", batchGroup);
```

The TTS and Crawl integration uses hierarchical notification groups to organize
related operations:

- `crawl-{url}`: Crawl-specific notifications
- `summary-{summaryId}`: Summarization-specific notifications
- `tts-{summaryId}`: TTS synthesis notifications
- `ingest-{audioId}`: Audio ingestion notifications
- `batch-{timestamp}`: Batch processing notifications with item subgroups

This grouping allows users to track progress at multiple levels and dismiss
related notifications together when operations complete.

### RAG Ingest and Progress Notifications

When consuming NDJSON progress from the RAG ingestion endpoints, use a stable
notification `group` and update it as events arrive. Prefer a spinner icon and
optional `progress` percentage derived from `processed/total`.

```typescript
import { useAppContext } from "~/contexts/app";
import { useRAG } from "~/composables/useRAG";

const app = useAppContext();
const rag = useRAG();

const group = "rag-ingest";
app.notify("Starting ingest…", "info", group, "spinner", 0);

await rag.ingestDocuments(
  [{ source: "manual", content: "Some text" }],
  "mxbai-embed-large",
  (evt) => {
    const processed = evt.processed ?? 0;
    const total = evt.total ?? 0;
    const percent =
      total > 0 ? Math.round((processed / total) * 100) : undefined;
    app.notify(
      `Ingest ${processed}/${total}`,
      "info",
      group,
      "spinner",
      percent,
    );
    if (evt.type === "error") {
      app.notify(evt.error || "Ingest error", "error", group);
    }
  },
);

app.notify("Ingest complete", "success", group);
```

For CLIP image ingestion, reuse the same approach and group (or a
modality‑specific group like `rag-ingest-clip`). On completion, replace the
spinner with a success or error toast.

## Features

---

The notification system supports several notification types including error
messages for failures, success notifications for completed operations, info
messages for general updates, and warning notifications for cautionary alerts.
Each type is visually distinct and appropriately styled.

Progress tracking is a key feature, allowing notifications to display progress
indicators that automatically update as operations proceed. Users can cancel
in-progress operations when supported.

Notifications can be grouped together logically, with the ability to replace or
update existing notifications in a group. This enables batch operations like
dismissing all related notifications at once.

The system is built with accessibility in mind, implementing proper ARIA roles
and labels for screen readers. Notifications can be navigated and dismissed
using the keyboard for full accessibility support.

Smooth animations enhance the user experience, with enter/exit transitions,
progress indicator animations, and subtle hover effects that provide visual
feedback without being distracting.

## Best Practices

---

When creating notification messages, keep the content concise while ensuring it
provides actionable information. Choose the appropriate notification type to
match the message severity and purpose.

Different notification types have recommended display durations - success and
info messages typically show for 3 seconds, while errors and warnings remain
visible for 5 seconds. Progress notifications stay until the operation
completes.

Use notification grouping judiciously to organize related operations together.
Update existing notifications rather than creating new ones when possible, and
avoid spamming users with too many notifications at once.

For long-running operations, show progress indicators that update frequently to
keep users informed. Ensure progress notifications can be cancelled when the
underlying operation supports cancellation.

Keep in mind auto-dismiss behavior in the implementation: non-error
notifications without a spinner auto-dismiss after about three seconds, while
errors and spinner notifications stay until dismissed or updated. Hovering a
notification pauses auto-dismiss and resets the timer when hover ends.

Prefer `group` updates over multiple separate toasts for streamed or batch
processes so the UI remains calm and readable.

## Implementation Details

---

The notification system is implemented using SolidJS's fine-grained reactivity:

```typescript
// Creating notifications
export const createNotification = (notification: NotificationProps) => {
  const id = generateId();
  notifications.set(id, { ...notification, id });
  return id;
};

// Updating notifications
export const updateNotification = (
  id: string,
  updates: Partial<NotificationProps>,
) => {
  const notification = notifications.get(id);
  if (notification) {
    notifications.set(id, { ...notification, ...updates });
  }
};

// Removing notifications
export const removeNotification = (id: string) => {
  notifications.delete(id);
};
```

## Customization

---

The notification system offers several customization options. The visual
appearance can be adjusted using CSS variables to match the application's theme
and styling needs. Component props provide control over notification behavior
and interactions. Global defaults for the notification system can be configured
through the app context settings to ensure consistent behavior across the
application.

Theme variables commonly used by notifications include `--card-bg`,
`--text-primary`, `--border-color`, `--accent`, and semantic color tokens for
each variant such as `--info`, `--success`, `--warning`, and `--error` along
with their `-bg` and `-text` counterparts. See the theming documentation for
guidance.

## Accessibility

---

Notifications use appropriate ARIA semantics to be announced without stealing
focus. The component renders a container with `role="alert"` and
`aria-live="polite"`, and the progress indicator uses `role="progressbar"` with
`aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.

For non-urgent updates, a `status` live region (`role="status"`,
`aria-live="polite"`) is typically sufficient; for high-urgency errors, `alert`
can be used to ensure announcement. Avoid interrupting users or moving focus.
Provide a visible, focusable close button with an `aria-label`; the
implementation shows the close button on error or on hover for other types. Keep
messages short and avoid flooding the live region by updating the same group
rather than emitting many new toasts.

These align with WAI-ARIA guidance for live regions and toast notifications in
modern web apps.

## Testing

---

There is a dedicated module (`src/modules/notifications.ts`) with accompanying
tests (`src/modules/notifications.test.ts`) that validate creation, grouping,
and removal behaviors at the data level. When adding new functionality, mirror
logic in the module and extend tests to cover default types and timestamping,
group-based clearing and in-place updates, and unique ID generation and removal
flows.
