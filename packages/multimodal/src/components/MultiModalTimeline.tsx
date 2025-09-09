/**
 * Multi-Modal Timeline Component
 * 
 * Displays files in a timeline layout grouped by date.
 */

import { Component, For, createMemo } from "solid-js";
import type { MultiModalTimelineProps } from "../types/MultiModalTypes";
import { MultiModalFileCard } from "./MultiModalFileCard";

export const MultiModalTimeline: Component<MultiModalTimelineProps> = (props) => {
  // Group files by date
  const groupedFiles = createMemo(() => {
    const groups: Record<string, typeof props.files> = {};
    props.files.forEach(file => {
      const date = file.uploadedAt.toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(file);
    });
    return groups;
  });

  return (
    <div class="multi-modal-timeline">
      <For each={Object.entries(groupedFiles())}>
        {([date, files]) => (
          <div class="timeline-group">
            <h3 class="timeline-date">{date}</h3>
            <div class="timeline-files">
              <For each={files}>
                {(file) => (
                  <MultiModalFileCard
                    file={file}
                    isSelected={props.selectedFile?.id === file.id}
                    onSelect={() => props.onFileSelect(file)}
                    onRemove={() => props.onFileRemove(file.id)}
                    showMetadata={props.showMetadata}
                    size="small"
                  />
                )}
              </For>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};
