/**
 * Recent Notes - Shows recently accessed notes
 */

import { Component, For } from "solid-js";
import { Card } from "reynard-components";
import "./RecentNotes.css";

interface RecentNote {
  id: string;
  title: string;
  notebookTitle: string;
  updatedAt: Date;
  preview: string;
}

const RecentNotes: Component = () => {
  // Mock data for demonstration
  const recentNotes: RecentNote[] = [
    {
      id: "1",
      title: "Meeting Notes - Q1 Planning",
      notebookTitle: "Work Projects",
      updatedAt: new Date("2024-01-20T10:30:00"),
      preview: "Discussed Q1 objectives and key deliverables for the upcoming quarter...",
    },
    {
      id: "2",
      title: "JavaScript Learning Path",
      notebookTitle: "Learning Resources",
      updatedAt: new Date("2024-01-19T15:45:00"),
      preview: "Advanced JavaScript concepts including closures, prototypes, and async programming...",
    },
    {
      id: "3",
      title: "Weekend Trip Ideas",
      notebookTitle: "Personal Notes",
      updatedAt: new Date("2024-01-18T20:15:00"),
      preview: "Researching destinations for the upcoming weekend getaway...",
    },
  ];

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div class="recent-notes">
      <h3>🕒 Recent Notes</h3>
      <div class="notes-list">
        <For each={recentNotes}>
          {note => (
            <Card class="note-item" padding="md" interactive>
              <div class="note-header">
                <h4 class="note-title">{note.title}</h4>
                <span class="note-time">{formatRelativeTime(note.updatedAt)}</span>
              </div>
              <p class="note-notebook">{note.notebookTitle}</p>
              <p class="note-preview">{note.preview}</p>
            </Card>
          )}
        </For>
      </div>
    </div>
  );
};

export { RecentNotes };
