/**
 * RAG File Modal Component
 * 
 * Modal for displaying file content with syntax highlighting
 * and chunk navigation for RAG search results.
 */

import { Component, createSignal, createEffect, Show, For } from 'solid-js';
import { Modal, Button, Select } from 'reynard-components';
import { getIcon as getIconFromRegistry } from 'reynard-fluent-icons';
import type { FileModalState, RAGModality } from '../types';

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    return <div innerHTML={icon as unknown as string} />;
  }
  return null;
};

export interface RAGFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  fileName: string;
  fileContent: string;
  chunkIndex?: number;
  chunkText?: string;
  modality: RAGModality;
}

export const RAGFileModal: Component<RAGFileModalProps> = (props) => {
  const [selectedChunk, setSelectedChunk] = createSignal<number | null>(props.chunkIndex || null);
  const [showLineNumbers, setShowLineNumbers] = createSignal(true);
  const [wrapLines, setWrapLines] = createSignal(false);
  const [fontSize, setFontSize] = createSignal(14);

  // Split content into chunks for navigation
  const contentChunks = createSignal<string[]>([]);
  
  createEffect(() => {
    if (props.fileContent) {
      // Simple chunking by lines (in real implementation, this would be more sophisticated)
      const lines = props.fileContent.split('\n');
      const chunkSize = 50; // lines per chunk
      const chunks: string[] = [];
      
      for (let i = 0; i < lines.length; i += chunkSize) {
        chunks.push(lines.slice(i, i + chunkSize).join('\n'));
      }
      
      contentChunks[1](chunks);
    }
  });

  const getFileExtension = () => {
    return props.fileName.split('.').pop()?.toLowerCase() || 'txt';
  };

  const getLanguageFromExtension = (ext: string): string => {
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'fish': 'bash',
    };
    return languageMap[ext] || 'text';
  };

  const downloadFile = () => {
    const blob = new Blob([props.fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = props.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(props.fileContent);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={`File: ${props.fileName}`}
      size="large"
      className="rag-file-modal"
    >
      <div class="rag-file-modal-container">
        {/* Header with file info and controls */}
        <div class="rag-file-header">
          <div class="file-info">
            <div class="file-path">{props.filePath}</div>
            <div class="file-stats">
              {props.fileContent.split('\n').length} lines • {props.fileContent.length} characters
            </div>
          </div>
          
          <div class="file-controls">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowLineNumbers(!showLineNumbers())}
              icon={getIcon('list')}
            >
              {showLineNumbers() ? 'Hide' : 'Show'} Line Numbers
            </Button>
            
            <Button
              variant="secondary"
              size="small"
              onClick={() => setWrapLines(!wrapLines())}
              icon={getIcon('text-wrap')}
            >
              {wrapLines() ? 'Unwrap' : 'Wrap'} Lines
            </Button>
            
            <Select
              value={fontSize()}
              onChange={(value) => setFontSize(Number(value))}
              options={[
                { value: 12, label: '12px' },
                { value: 14, label: '14px' },
                { value: 16, label: '16px' },
                { value: 18, label: '18px' },
                { value: 20, label: '20px' },
              ]}
              size="small"
            />
            
            <Button
              variant="secondary"
              size="small"
              onClick={copyToClipboard}
              icon={getIcon('copy')}
            >
              Copy
            </Button>
            
            <Button
              variant="secondary"
              size="small"
              onClick={downloadFile}
              icon={getIcon('download')}
            >
              Download
            </Button>
          </div>
        </div>

        {/* Chunk navigation */}
        <Show when={contentChunks[0]().length > 1}>
          <div class="rag-file-chunk-nav">
            <label>Chunk:</label>
            <Select
              value={selectedChunk() || 0}
              onChange={(value) => setSelectedChunk(Number(value))}
              options={contentChunks[0]().map((_, index) => ({
                value: index,
                label: `Chunk ${index + 1}`,
              }))}
              size="small"
            />
            <span class="chunk-info">
              {contentChunks[0]().length} chunks total
            </span>
          </div>
        </Show>

        {/* Highlighted chunk text if available */}
        <Show when={props.chunkText && props.chunkIndex !== undefined}>
          <div class="rag-file-chunk-highlight">
            <h4>Highlighted Chunk {props.chunkIndex + 1}</h4>
            <div class="chunk-text">
              <pre>{props.chunkText}</pre>
            </div>
          </div>
        </Show>

        {/* File content */}
        <div class="rag-file-content">
          <div
            class="file-content-editor"
            style={{
              'font-size': `${fontSize()}px`,
              'white-space': wrapLines() ? 'pre-wrap' : 'pre',
            }}
          >
            <Show when={showLineNumbers()}>
              <div class="line-numbers">
                <For each={Array.from({ length: props.fileContent.split('\n').length }, (_, i) => i + 1)}>
                  {(lineNumber) => (
                    <div class="line-number">{lineNumber}</div>
                  )}
                </For>
              </div>
            </Show>
            
            <div class="file-text">
              <pre class={`language-${getLanguageFromExtension(getFileExtension())}`}>
                {props.fileContent}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer with additional info */}
        <div class="rag-file-footer">
          <div class="file-metadata">
            <span>Language: {getLanguageFromExtension(getFileExtension())}</span>
            <span>Modality: {props.modality}</span>
            <Show when={props.chunkIndex !== undefined}>
              <span>Chunk: {props.chunkIndex + 1}</span>
            </Show>
          </div>
        </div>
      </div>
    </Modal>
  );
};
