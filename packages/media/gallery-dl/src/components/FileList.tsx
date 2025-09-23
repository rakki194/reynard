/**
 * File List Component
 *
 * Displays downloaded files with filtering, sorting, and management capabilities.
 */
import { Component, createSignal, createMemo, For, Show } from "solid-js";
import { Card, Button, TextField, Icon } from "reynard-components-core";

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  extension: string;
  downloadDate: Date;
  url?: string;
  metadata?: Record<string, any>;
}

export interface FileListProps {
  files: FileItem[];
  onFileSelect?: (file: FileItem) => void;
  onFileDelete?: (file: FileItem) => void;
  onFileDownload?: (file: FileItem) => void;
  onFileShare?: (file: FileItem) => void;
  class?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string): string => {
  switch (type) {
    case 'image': return 'Image';
    case 'video': return 'Video';
    case 'audio': return 'Music';
    case 'document': return 'Document';
    default: return 'File';
  }
};

const getFileTypeColor = (type: string): string => {
  switch (type) {
    case 'image': return 'blue';
    case 'video': return 'purple';
    case 'audio': return 'green';
    case 'document': return 'orange';
    default: return 'gray';
  }
};

export const FileList: Component<FileListProps> = (props) => {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [sortBy, setSortBy] = createSignal<'name' | 'size' | 'date' | 'type'>('date');
  const [sortOrder, setSortOrder] = createSignal<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = createSignal<string>('all');
  const [viewMode, setViewMode] = createSignal<'list' | 'grid'>('list');

  // Filter and sort files
  const filteredAndSortedFiles = createMemo(() => {
    let filtered = props.files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm().toLowerCase());
      const matchesType = filterType() === 'all' || file.type === filterType();
      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy()) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'date':
          comparison = a.downloadDate.getTime() - b.downloadDate.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder() === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  const handleSort = (newSortBy: 'name' | 'size' | 'date' | 'type') => {
    if (sortBy() === newSortBy) {
      setSortOrder(sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const fileTypes = createMemo(() => {
    const types = new Set(props.files.map(file => file.type));
    return Array.from(types);
  });

  return (
    <div class={`file-list ${props.class || ""}`}>
      <Card class="file-list-header">
        <div class="header-controls">
          <div class="search-section">
            <TextField
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.currentTarget.value)}
              placeholder="Search files..."
              class="file-search"
            />
          </div>
          
          <div class="filter-section">
            <select 
              value={filterType()} 
              onChange={(e) => setFilterType(e.currentTarget.value)}
              class="type-filter"
            >
              <option value="all">All Types</option>
              <For each={fileTypes()}>
                {(type) => (
                  <option value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                )}
              </For>
            </select>
          </div>
          
          <div class="sort-section">
            <Button
              onClick={() => handleSort('name')}
              variant={sortBy() === 'name' ? 'primary' : 'secondary'}
              size="sm"
            >
              Name {sortBy() === 'name' && (sortOrder() === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              onClick={() => handleSort('size')}
              variant={sortBy() === 'size' ? 'primary' : 'secondary'}
              size="sm"
            >
              Size {sortBy() === 'size' && (sortOrder() === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              onClick={() => handleSort('date')}
              variant={sortBy() === 'date' ? 'primary' : 'secondary'}
              size="sm"
            >
              Date {sortBy() === 'date' && (sortOrder() === 'asc' ? '↑' : '↓')}
            </Button>
          </div>
          
          <div class="view-section">
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode() === 'list' ? 'primary' : 'secondary'}
              size="sm"
            >
              <Icon name="List" />
            </Button>
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode() === 'grid' ? 'primary' : 'secondary'}
              size="sm"
            >
              <Icon name="Grid" />
            </Button>
          </div>
        </div>
        
        <div class="file-count">
          {filteredAndSortedFiles().length} of {props.files.length} files
        </div>
      </Card>

      <Card class="file-list-content">
        <Show when={filteredAndSortedFiles().length === 0}>
          <div class="empty-state">
            <Icon name="File" class="empty-icon" />
            <p>No files found</p>
            <Show when={searchTerm()}>
              <Button onClick={() => setSearchTerm("")} variant="secondary">
                Clear search
              </Button>
            </Show>
          </div>
        </Show>
        
        <Show when={filteredAndSortedFiles().length > 0}>
          <div class={`file-items ${viewMode()}`}>
            <For each={filteredAndSortedFiles()}>
              {(file) => (
                <div class="file-item" onClick={() => props.onFileSelect?.(file)}>
                  <div class="file-icon">
                    <Icon 
                      name={getFileIcon(file.type)} 
                      class={`file-type-icon ${getFileTypeColor(file.type)}`}
                    />
                  </div>
                  
                  <div class="file-info">
                    <div class="file-name" title={file.name}>
                      {file.name}
                    </div>
                    <div class="file-details">
                      <span class="file-size">{formatFileSize(file.size)}</span>
                      <span class="file-date">
                        {file.downloadDate.toLocaleDateString()}
                      </span>
                      <span class="file-type">{file.type}</span>
                    </div>
                  </div>
                  
                  <div class="file-actions">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onFileDownload?.(file);
                      }}
                      variant="secondary"
                      size="sm"
                      title="Download"
                    >
                      <Icon name="Download" />
                    </Button>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onFileShare?.(file);
                      }}
                      variant="secondary"
                      size="sm"
                      title="Share"
                    >
                      <Icon name="Share" />
                    </Button>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onFileDelete?.(file);
                      }}
                      variant="secondary"
                      size="sm"
                      title="Delete"
                    >
                      <Icon name="Trash" />
                    </Button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Card>
    </div>
  );
};