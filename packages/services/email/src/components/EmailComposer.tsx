/**
 * Email Composer Component
 *
 * Provides a rich email composition interface with support for
 * templates, attachments, and agent integration.
 */
import { createSignal, createEffect, For } from "solid-js";
import { useEmail } from "../composables/useEmail";
export function EmailComposer(props) {
  const emailComposable = useEmail();
  // Form state
  const [toEmails, setToEmails] = createSignal([]);
  const [ccEmails, setCcEmails] = createSignal([]);
  const [bccEmails, setBccEmails] = createSignal([]);
  const [subject, setSubject] = createSignal("");
  const [body, setBody] = createSignal("");
  const [htmlBody, setHtmlBody] = createSignal("");
  const [replyTo, setReplyTo] = createSignal("");
  const [attachments, setAttachments] = createSignal([]);
  const [selectedTemplate, setSelectedTemplate] = createSignal("");
  const [isHtmlMode, setIsHtmlMode] = createSignal(false);
  const [isSending, setIsSending] = createSignal(false);
  // Initialize with props
  createEffect(() => {
    if (props.initialMessage) {
      setToEmails(props.initialMessage.to_emails || []);
      setCcEmails(props.initialMessage.cc_emails || []);
      setBccEmails(props.initialMessage.bcc_emails || []);
      setSubject(props.initialMessage.subject || "");
      setBody(props.initialMessage.body || "");
      setHtmlBody(props.initialMessage.html_body || "");
      setReplyTo(props.initialMessage.reply_to || "");
    }
  });
  // Handle template selection
  const handleTemplateSelect = templateId => {
    const template = emailComposable.templates().find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setHtmlBody(template.html_body || "");
      setSelectedTemplate(templateId);
    }
  };
  // Handle file attachment
  const handleFileAttach = event => {
    const input = event.target;
    if (input.files) {
      setAttachments(prev => [...prev, ...Array.from(input.files)]);
    }
  };
  // Remove attachment
  const removeAttachment = index => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  // Add email to list
  const addEmailToList = (email, list) => {
    if (!email.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }
    switch (list) {
      case "to":
        setToEmails(prev => [...prev, email]);
        break;
      case "cc":
        setCcEmails(prev => [...prev, email]);
        break;
      case "bcc":
        setBccEmails(prev => [...prev, email]);
        break;
    }
  };
  // Remove email from list
  const removeEmailFromList = (email, list) => {
    switch (list) {
      case "to":
        setToEmails(prev => prev.filter(e => e !== email));
        break;
      case "cc":
        setCcEmails(prev => prev.filter(e => e !== email));
        break;
      case "bcc":
        setBccEmails(prev => prev.filter(e => e !== email));
        break;
    }
  };
  // Send email
  const handleSend = async () => {
    if (toEmails().length === 0) {
      alert("Please enter at least one recipient");
      return;
    }
    if (!subject().trim()) {
      alert("Please enter a subject");
      return;
    }
    if (!body().trim() && !htmlBody().trim()) {
      alert("Please enter a message body");
      return;
    }
    setIsSending(true);
    try {
      const message = {
        to_emails: toEmails(),
        subject: subject(),
        body: body(),
        html_body: htmlBody() || undefined,
        cc_emails: ccEmails().length > 0 ? ccEmails() : undefined,
        bcc_emails: bccEmails().length > 0 ? bccEmails() : undefined,
        reply_to: replyTo() || undefined,
        attachments: attachments().map(file => ({
          file_path: file.name,
          filename: file.name,
          content_type: file.type,
          size: file.size,
        })),
      };
      const success = await emailComposable.sendEmail(message);
      if (success) {
        props.onSend?.(message);
        // Reset form
        setToEmails([]);
        setCcEmails([]);
        setBccEmails([]);
        setSubject("");
        setBody("");
        setHtmlBody("");
        setReplyTo("");
        setAttachments([]);
        setSelectedTemplate("");
      }
    } catch (error) {
      console.error("Failed to send email:", error);
    } finally {
      setIsSending(false);
    }
  };
  // Save draft
  const handleSave = () => {
    const message = {
      to_emails: toEmails(),
      subject: subject(),
      body: body(),
      html_body: htmlBody() || undefined,
      cc_emails: ccEmails().length > 0 ? ccEmails() : undefined,
      bcc_emails: bccEmails().length > 0 ? bccEmails() : undefined,
      reply_to: replyTo() || undefined,
      status: "draft",
    };
    props.onSave?.(message);
  };
  return (
    <div class={`email-composer ${props.className || ""}`}>
      <div class="email-composer-header">
        <h2>Compose Email</h2>
        <div class="email-composer-actions">
          <button type="button" class="email-button email-button-secondary" onClick={handleSave} disabled={isSending()}>
            Save Draft
          </button>
          <button
            type="button"
            class="email-button email-button-secondary"
            onClick={props.onCancel}
            disabled={isSending()}
          >
            Cancel
          </button>
          <button
            type="button"
            class="email-button email-button-primary"
            onClick={handleSend}
            disabled={isSending() || toEmails().length === 0}
          >
            {isSending() ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      <div class="email-composer-content">
        {/* Template Selection */}
        {emailComposable.templates().length > 0 && (
          <div class="email-form-group">
            <label>Template</label>
            <select value={selectedTemplate()} onChange={e => handleTemplateSelect(e.currentTarget.value)}>
              <option value="">Select a template...</option>
              <For each={emailComposable.templates()}>
                {template => <option value={template.id}>{template.name}</option>}
              </For>
            </select>
          </div>
        )}

        {/* Recipients */}
        <div class="email-form-group">
          <label>To</label>
          <div class="email-recipients">
            <For each={toEmails()}>
              {email => (
                <span class="email-tag">
                  {email}
                  <button type="button" onClick={() => removeEmailFromList(email, "to")} class="email-tag-remove">
                    ×
                  </button>
                </span>
              )}
            </For>
            <input
              type="email"
              placeholder="Enter email address..."
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addEmailToList(e.currentTarget.value, "to");
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        </div>

        <div class="email-form-group">
          <label>CC</label>
          <div class="email-recipients">
            <For each={ccEmails()}>
              {email => (
                <span class="email-tag">
                  {email}
                  <button type="button" onClick={() => removeEmailFromList(email, "cc")} class="email-tag-remove">
                    ×
                  </button>
                </span>
              )}
            </For>
            <input
              type="email"
              placeholder="Enter CC email address..."
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addEmailToList(e.currentTarget.value, "cc");
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        </div>

        <div class="email-form-group">
          <label>BCC</label>
          <div class="email-recipients">
            <For each={bccEmails()}>
              {email => (
                <span class="email-tag">
                  {email}
                  <button type="button" onClick={() => removeEmailFromList(email, "bcc")} class="email-tag-remove">
                    ×
                  </button>
                </span>
              )}
            </For>
            <input
              type="email"
              placeholder="Enter BCC email address..."
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addEmailToList(e.currentTarget.value, "bcc");
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        </div>

        {/* Subject */}
        <div class="email-form-group">
          <label>Subject</label>
          <input
            type="text"
            value={subject()}
            onInput={e => setSubject(e.currentTarget.value)}
            placeholder="Enter email subject..."
          />
        </div>

        {/* Reply To */}
        <div class="email-form-group">
          <label>Reply To</label>
          <input
            type="email"
            value={replyTo()}
            onInput={e => setReplyTo(e.currentTarget.value)}
            placeholder="Enter reply-to email address..."
          />
        </div>

        {/* Attachments */}
        <div class="email-form-group">
          <label>Attachments</label>
          <input type="file" multiple onChange={handleFileAttach} class="email-file-input" />
          <div class="email-attachments">
            <For each={attachments()}>
              {(file, index) => (
                <div class="email-attachment">
                  <span>{file.name}</span>
                  <span class="email-attachment-size">({(file.size / 1024).toFixed(1)} KB)</span>
                  <button type="button" onClick={() => removeAttachment(index())} class="email-attachment-remove">
                    ×
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>

        {/* Message Body */}
        <div class="email-form-group">
          <div class="email-body-header">
            <label>Message</label>
            <div class="email-body-actions">
              <button
                type="button"
                class={`email-button ${isHtmlMode() ? "email-button-secondary" : "email-button-primary"}`}
                onClick={() => setIsHtmlMode(false)}
              >
                Text
              </button>
              <button
                type="button"
                class={`email-button ${isHtmlMode() ? "email-button-primary" : "email-button-secondary"}`}
                onClick={() => setIsHtmlMode(true)}
              >
                HTML
              </button>
            </div>
          </div>

          {isHtmlMode() ? (
            <textarea
              value={htmlBody()}
              onInput={e => setHtmlBody(e.currentTarget.value)}
              placeholder="Enter HTML message..."
              rows={10}
            />
          ) : (
            <textarea
              value={body()}
              onInput={e => setBody(e.currentTarget.value)}
              placeholder="Enter message..."
              rows={10}
            />
          )}
        </div>
      </div>

      {/* Error Display */}
      {emailComposable.error() && <div class="email-status email-status-error">{emailComposable.error()}</div>}
    </div>
  );
}
