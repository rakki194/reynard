/**
 * CaptionInput Component
 * 
 * A comprehensive caption input component that supports different caption types
 * including textarea, tags, and specialized editors.
 */

import { Component, createSignal, createEffect, createMemo, onMount, onCleanup, Show, For } from 'solid-js';
import { CaptionInputProps, CaptionType, CaptionData } from '../types/index.js';
import { TagBubble } from './TagBubble.js';
import { splitAndCleanTags } from '../utils/tagUtils.js';
import './CaptionInput.css';

export const CaptionInput: Component<CaptionInputProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(props.state === 'expanded');
  const [caption, setCaption] = createSignal(props.caption);
  const [isDirty, setIsDirty] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();
  
  let textareaRef: HTMLTextAreaElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  // Computed values
  const captionType = createMemo(() => caption().type);
  const captionContent = createMemo(() => caption().content);
  
  const isTagInput = createMemo(() => captionType() === CaptionType.TAGS);
  // isE621Input and isTomlInput removed as they're not used
  const isTextareaInput = createMemo(() => captionType() === CaptionType.CAPTION);

  const tags = createMemo(() => {
    if (isTagInput()) {
      return splitAndCleanTags(captionContent());
    }
    return [];
  });

  // Effects
  createEffect(() => {
    if (props.caption !== caption()) {
      setCaption(props.caption);
      setIsDirty(false);
    }
  });

  createEffect(() => {
    if (props.shouldAutoFocus && isExpanded()) {
      setTimeout(() => {
        if (textareaRef && isTextareaInput()) {
          textareaRef.focus();
        }
      }, 100);
    }
  });

  // Event handlers
  const handleClick = () => {
    if (!isExpanded()) {
      setIsExpanded(true);
      props.onClick();
    }
  };

  const handleCaptionChange = (newCaption: CaptionData) => {
    setCaption(newCaption);
    setIsDirty(true);
    setError(undefined);
    props.onCaptionChange(newCaption);
  };

  const handleTextareaInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    const newContent = target.value;
    
    if (newContent !== captionContent()) {
      handleCaptionChange({
        type: captionType(),
        content: newContent
      } as CaptionData);
    }
  };

  const handleTextareaKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleTagEdit = (index: number, newTag: string) => {
    const currentTags = tags();
    const updatedTags = [...currentTags];
    updatedTags[index] = newTag;
    
    handleCaptionChange({
      type: CaptionType.TAGS,
      content: updatedTags.join(', ')
    } as CaptionData);
  };

  const handleTagRemove = (index: number) => {
    const currentTags = tags();
    const updatedTags = currentTags.filter((_, i) => i !== index);
    
    handleCaptionChange({
      type: CaptionType.TAGS,
      content: updatedTags.join(', ')
    } as CaptionData);
  };

  const handleTagAdd = (newTag: string) => {
    if (newTag.trim()) {
      const currentTags = tags();
      const updatedTags = [...currentTags, newTag.trim()];
      
      handleCaptionChange({
        type: CaptionType.TAGS,
        content: updatedTags.join(', ')
      });
    }
  };

  const handleSave = async () => {
    if (isSaving()) return;
    
    setIsSaving(true);
    setError(undefined);
    
    try {
      if (props.onSave) {
        await props.onSave(caption());
      }
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save caption');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    } else {
      // Reset to original caption
      setCaption(props.caption);
      setIsDirty(false);
      setError(undefined);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Auto-resize textarea
  const autoResizeTextarea = () => {
    if (textareaRef) {
      textareaRef.style.height = 'auto';
      textareaRef.style.height = `${textareaRef.scrollHeight}px`;
    }
  };

  createEffect(() => {
    if (isTextareaInput() && textareaRef) {
      autoResizeTextarea();
    }
  });

  // Global keyboard shortcuts
  onMount(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isExpanded() && (e.ctrlKey || e.metaKey)) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            if (e.shiftKey) {
              // Redo - not implemented yet
            } else {
              // Undo - not implemented yet
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    onCleanup(() => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    });
  });

  return (
    <div
      ref={containerRef}
      class="caption-input"
      classList={{
        'caption-input--expanded': isExpanded(),
        'caption-input--collapsed': !isExpanded(),
        'caption-input--dirty': isDirty(),
        'caption-input--saving': isSaving(),
        'caption-input--error': !!error(),
        'caption-input--disabled': props.disabled,
        'caption-input--readonly': props.readonly
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div class="caption-editor">
        <div class="caption-input-wrapper">
          <Show
            when={isTextareaInput()}
            fallback={
              <Show
                when={isTagInput()}
                fallback={
                  <div class="caption-placeholder">
                    <span class="caption-type-indicator">
                      {captionType().toUpperCase()}
                    </span>
                    <span class="caption-content-preview">
                      {captionContent() || props.placeholder || 'No content'}
                    </span>
                  </div>
                }
              >
                <div class="tags-container">
                  <div class="tags-list">
                    <For each={tags()}>
                      {(tag, index) => (
                        <TagBubble
                          tag={tag}
                          index={index()}
                          onEdit={(newTag) => handleTagEdit(index(), newTag)}
                          onRemove={() => handleTagRemove(index())}
                          editable={!props.readonly}
                          removable={!props.readonly}
                        />
                      )}
                    </For>
                  </div>
                  <Show when={!props.readonly}>
                    <div class="new-tag-input">
                      <input
                        type="text"
                        placeholder="Add tag..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            handleTagAdd(target.value);
                            target.value = '';
                          }
                        }}
                      />
                    </div>
                  </Show>
                </div>
              </Show>
            }
          >
            <textarea
              ref={textareaRef}
              class="caption-textarea"
              value={captionContent()}
              placeholder={props.placeholder || 'Enter caption...'}
              maxLength={props.maxLength}
              disabled={props.disabled}
              readonly={props.readonly}
              onInput={handleTextareaInput}
              onKeyDown={handleTextareaKeyDown}
              rows={3}
            />
          </Show>

          <div class="caption-icons">
            <Show when={isDirty() && !props.readonly}>
              <button
                class="caption-icon caption-icon--save"
                onClick={handleSave}
                disabled={isSaving()}
                title="Save caption (Ctrl+S)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/>
                </svg>
              </button>
            </Show>

            <Show when={isDirty() && !props.readonly}>
              <button
                class="caption-icon caption-icon--cancel"
                onClick={handleCancel}
                title="Cancel changes (Esc)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
              </button>
            </Show>

            <Show when={isSaving()}>
              <div class="caption-icon caption-icon--loading">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2z" opacity="0.3"/>
                  <path d="M8 0a8 8 0 0 1 8 8h-2a6 6 0 0 0-6-6V0z">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 8 8"
                      to="360 8 8"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
              </div>
            </Show>
          </div>
        </div>

        <Show when={error()}>
          <div class="caption-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <span>{error()}</span>
          </div>
        </Show>
      </div>
    </div>
  );
};
