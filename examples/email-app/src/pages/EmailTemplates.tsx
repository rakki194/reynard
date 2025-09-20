import { createSignal, For } from "solid-js";
import { useEmail } from "reynard-email/composables";

export function EmailTemplates() {
  const emailComposable = useEmail();

  const [showCreateForm, setShowCreateForm] = createSignal(false);
  const [editingTemplate, setEditingTemplate] = createSignal<any>(null);

  const [newTemplate, setNewTemplate] = createSignal({
    name: "",
    subject: "",
    body: "",
    html_body: "",
    category: "admin" as "agent" | "admin" | "notification" | "system",
    variables: [] as string[],
  });

  const handleCreateTemplate = async () => {
    if (!newTemplate().name || !newTemplate().subject || !newTemplate().body) {
      alert("Please fill in all required fields");
      return;
    }

    const success = await emailComposable.saveTemplate(newTemplate());

    if (success) {
      setNewTemplate({
        name: "",
        subject: "",
        body: "",
        html_body: "",
        category: "admin",
        variables: [],
      });
      setShowCreateForm(false);
      alert("Template created successfully!");
    } else {
      alert("Failed to create template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const success = await emailComposable.deleteTemplate(templateId);

      if (success) {
        alert("Template deleted successfully!");
      } else {
        alert("Failed to delete template");
      }
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      body: template.body,
      html_body: template.html_body || "",
      category: template.category,
      variables: template.variables || [],
    });
    setShowCreateForm(true);
  };

  return (
    <div class="email-templates">
      <div class="page-header">
        <h1>Email Templates</h1>
        <p>Create and manage email templates for automated communications</p>
      </div>

      <div class="templates-controls">
        <button class="email-button email-button-primary" onClick={() => setShowCreateForm(true)}>
          Create Template
        </button>

        <button class="email-button email-button-secondary" onClick={() => emailComposable.refreshTemplates()}>
          Refresh
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm() && (
        <div class="template-form-overlay">
          <div class="template-form">
            <div class="form-header">
              <h3>{editingTemplate() ? "Edit Template" : "Create Template"}</h3>
              <button
                class="close-button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTemplate(null);
                  setNewTemplate({
                    name: "",
                    subject: "",
                    body: "",
                    html_body: "",
                    category: "admin",
                    variables: [],
                  });
                }}
              >
                ×
              </button>
            </div>

            <div class="email-form">
              <div class="email-form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  value={newTemplate().name}
                  onInput={e => setNewTemplate(prev => ({ ...prev, name: e.currentTarget.value }))}
                  placeholder="Enter template name..."
                />
              </div>

              <div class="email-form-group">
                <label>Category</label>
                <select
                  value={newTemplate().category}
                  onChange={e => setNewTemplate(prev => ({ ...prev, category: e.currentTarget.value as any }))}
                >
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                  <option value="notification">Notification</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div class="email-form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={newTemplate().subject}
                  onInput={e => setNewTemplate(prev => ({ ...prev, subject: e.currentTarget.value }))}
                  placeholder="Enter email subject..."
                />
              </div>

              <div class="email-form-group">
                <label>Body *</label>
                <textarea
                  value={newTemplate().body}
                  onInput={e => setNewTemplate(prev => ({ ...prev, body: e.currentTarget.value }))}
                  placeholder="Enter email body..."
                  rows={6}
                />
              </div>

              <div class="email-form-group">
                <label>HTML Body</label>
                <textarea
                  value={newTemplate().html_body}
                  onInput={e => setNewTemplate(prev => ({ ...prev, html_body: e.currentTarget.value }))}
                  placeholder="Enter HTML email body (optional)..."
                  rows={6}
                />
              </div>

              <div class="email-form-group">
                <label>Variables</label>
                <input
                  type="text"
                  placeholder="Enter variables separated by commas (e.g., name, email, date)..."
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      const variables = e.currentTarget.value
                        .split(",")
                        .map(v => v.trim())
                        .filter(v => v);
                      setNewTemplate(prev => ({ ...prev, variables }));
                      e.currentTarget.value = "";
                    }
                  }}
                />
                {newTemplate().variables.length > 0 && (
                  <div class="variables-list">
                    <For each={newTemplate().variables}>
                      {variable => (
                        <span class="variable-tag">
                          {`{${variable}}`}
                          <button
                            type="button"
                            onClick={() =>
                              setNewTemplate(prev => ({
                                ...prev,
                                variables: prev.variables.filter(v => v !== variable),
                              }))
                            }
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </For>
                  </div>
                )}
              </div>

              <div class="form-actions">
                <button
                  class="email-button email-button-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTemplate(null);
                  }}
                >
                  Cancel
                </button>
                <button class="email-button email-button-primary" onClick={handleCreateTemplate}>
                  {editingTemplate() ? "Update Template" : "Create Template"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div class="templates-list">
        {emailComposable.templates().length > 0 ? (
          <For each={emailComposable.templates()}>
            {template => (
              <div class="template-card">
                <div class="template-header">
                  <div class="template-info">
                    <h3 class="template-name">{template.name}</h3>
                    <span class={`template-category ${template.category}`}>{template.category}</span>
                  </div>
                  <div class="template-actions">
                    <button class="email-button email-button-secondary" onClick={() => handleEditTemplate(template)}>
                      Edit
                    </button>
                    <button class="email-button email-button-danger" onClick={() => handleDeleteTemplate(template.id)}>
                      Delete
                    </button>
                  </div>
                </div>

                <div class="template-content">
                  <div class="template-subject">
                    <strong>Subject:</strong> {template.subject}
                  </div>
                  <div class="template-body">
                    <strong>Body:</strong> {template.body.substring(0, 200)}
                    {template.body.length > 200 ? "..." : ""}
                  </div>

                  {template.variables.length > 0 && (
                    <div class="template-variables">
                      <strong>Variables:</strong>
                      <div class="variables-list">
                        <For each={template.variables}>
                          {variable => <span class="variable-tag">{`{${variable}}`}</span>}
                        </For>
                      </div>
                    </div>
                  )}
                </div>

                <div class="template-meta">
                  <span class="template-created">Created: {new Date(template.created_at).toLocaleDateString()}</span>
                  <span class="template-updated">Updated: {new Date(template.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </For>
        ) : (
          <div class="templates-empty">
            <div class="empty-icon">📝</div>
            <div class="empty-text">
              <h3>No templates found</h3>
              <p>Create your first email template to get started.</p>
            </div>
          </div>
        )}
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
