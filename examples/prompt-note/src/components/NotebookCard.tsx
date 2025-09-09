/**
 * Notebook Card - Displays notebook information in a card format
 */

import { Component, Show } from "solid-js";
import { Card } from "reynard-components";
import "./NotebookCard.css";

interface Notebook {
  id: string;
  title: string;
  description?: string;
  color: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  pageCount: number;
}

interface NotebookCardProps {
  notebook: Notebook;
  onClick: () => void;
}

const NotebookCard: Component<NotebookCardProps> = (props) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card
      class="notebook-card"
      onClick={props.onClick}
      interactive
      padding="lg"
    >
      <div class="notebook-header">
        <div
          class="notebook-color"
          style={{ "background-color": props.notebook.color }}
        />
        <div class="notebook-info">
          <h3 class="notebook-title">{props.notebook.title}</h3>
          <div class="notebook-meta">
            <span class="page-count">{props.notebook.pageCount} pages</span>
            <span class="visibility">
              {props.notebook.isPublic ? "🌐 Public" : "🔒 Private"}
            </span>
          </div>
        </div>
      </div>

      <Show when={props.notebook.description}>
        <p class="notebook-description">{props.notebook.description}</p>
      </Show>

      <div class="notebook-footer">
        <span class="last-updated">
          Updated {formatDate(props.notebook.updatedAt)}
        </span>
      </div>
    </Card>
  );
};

export { NotebookCard };
