/**
 * RAG Documents Tab Component
 * 
 * Displays and manages documents in the RAG system
 * with document listing and deletion capabilities.
 */

import { For } from "solid-js";
import { Button, Card } from "reynard-components";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
import type { RAGDocument } from "./types";

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    return <div innerHTML={icon as unknown as string} />;
  }
  return null;
};

export interface DocumentsTabProps {
  documents: RAGDocument[];
  onRefresh: () => void;
  onDeleteDocument: (documentId: string) => void;
}

export function DocumentsTab(props: DocumentsTabProps) {
  return (
    <div class="documents-tab-content">
      <Card variant="elevated" padding="lg">
        <div class="documents-header">
          <h3>Documents</h3>
          <Button variant="secondary" size="sm" onClick={props.onRefresh}>
            Refresh
          </Button>
        </div>

        <div class="documents-list">
          <For each={props.documents}>
            {(doc) => (
              <Card variant="outlined" padding="md">
                <div class="document-item">
                  <div class="document-info">
                    <h4>{doc.title}</h4>
                    <div class="document-meta">
                      <span class="type-badge">{doc.document_type}</span>
                      <span>{doc.chunk_count} chunks</span>
                      <span>•</span>
                      <span>{doc.source}</span>
                    </div>
                  </div>
                  <div class="document-actions">
                    <Button variant="ghost" size="sm" iconOnly>
                      {getIcon("eye")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => props.onDeleteDocument(doc.id)}
                    >
                      {getIcon("delete")}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </For>
        </div>
      </Card>
    </div>
  );
}
