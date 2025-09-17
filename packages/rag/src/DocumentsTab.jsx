/**
 * RAG Documents Tab Component
 *
 * Displays and manages documents in the RAG system
 * with document listing and deletion capabilities.
 */
import { For } from "solid-js";
import { Button, Card, Icon } from "reynard-components";
export function DocumentsTab(props) {
    return (<div class="documents-tab-content">
      <Card variant="elevated" padding="lg">
        <div class="documents-header">
          <h3>Documents</h3>
          <Button variant="secondary" size="sm" onClick={props.onRefresh}>
            Refresh
          </Button>
        </div>

        <div class="documents-list">
          <For each={props.documents}>
            {(doc) => (<Card variant="outlined" padding="md">
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
                      <Icon name="eye" size="sm"/>
                    </Button>
                    <Button variant="ghost" size="sm" iconOnly onClick={() => props.onDeleteDocument(doc.id)}>
                      <Icon name="delete" size="sm"/>
                    </Button>
                  </div>
                </div>
              </Card>)}
          </For>
        </div>
      </Card>
    </div>);
}
