/**
 * Batch Download Manager Component
 *
 * Manages multiple gallery downloads in batches with progress tracking,
 * queue management, and batch operations.
 */
import { Component, createSignal, onMount, Show, For } from "solid-js";
import { Card, Button, TextField, Icon } from "reynard-components-core";
import { GalleryService } from "../services/GalleryService";
import { useGalleryWebSocket } from "../composables/useGalleryWebSocket";

export interface BatchDownloadManagerProps {
  service: GalleryService;
  onBatchComplete?: (results: BatchResult[]) => void;
  onBatchError?: (error: string) => void;
  class?: string;
}

export interface BatchItem {
  id: string;
  url: string;
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'cancelled';
  progress: number;
  error?: string;
}

export interface BatchDownload {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  total_items: number;
  completed_items: number;
  failed_items: number;
  created_at: Date;
  items: BatchItem[];
}

export interface BatchResult {
  id: string;
  url: string;
  success: boolean;
  files: string[];
  error?: string;
}

export const BatchDownloadManager: Component<BatchDownloadManagerProps> = (props) => {
  const [batches, setBatches] = createSignal<BatchDownload[]>([]);
  const [urls, setUrls] = createSignal("");
  const [batchName, setBatchName] = createSignal("");
  const [isCreating, setIsCreating] = createSignal(false);
  const [selectedBatch, setSelectedBatch] = createSignal<BatchDownload | null>(null);

  // WebSocket for real-time updates
  const { isConnected, subscribe, unsubscribe } = useGalleryWebSocket({
    url: "ws://localhost:8000/ws/gallery",
  });

  // Load initial data
  onMount(async () => {
    await loadBatches();
  });

  const loadBatches = async () => {
    try {
      // Mock data for now - replace with actual service call
      const mockBatches: BatchDownload[] = [
        {
          id: "batch_1",
          name: "Twitter Gallery Batch",
          status: "completed",
          total_items: 5,
          completed_items: 5,
          failed_items: 0,
          created_at: new Date(),
          items: [
            {
              id: "item_1",
              url: "https://twitter.com/user/status/123",
              status: "completed",
              progress: 100,
            },
            {
              id: "item_2",
              url: "https://twitter.com/user/status/124",
              status: "completed",
              progress: 100,
            },
          ],
        },
        {
          id: "batch_2",
          name: "Instagram Gallery Batch",
          status: "running",
          total_items: 3,
          completed_items: 1,
          failed_items: 0,
          created_at: new Date(),
          items: [
            {
              id: "item_3",
              url: "https://instagram.com/p/abc123",
              status: "completed",
              progress: 100,
            },
            {
              id: "item_4",
              url: "https://instagram.com/p/def456",
              status: "downloading",
              progress: 45,
            },
            {
              id: "item_5",
              url: "https://instagram.com/p/ghi789",
              status: "pending",
              progress: 0,
            },
          ],
        },
      ];
      setBatches(mockBatches);
    } catch (error) {
      console.error("Failed to load batches:", error);
    }
  };

  const createBatch = async () => {
    if (!urls().trim() || !batchName().trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const urlList = urls()
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const newBatch: BatchDownload = {
        id: `batch_${Date.now()}`,
        name: batchName(),
        status: 'idle',
        total_items: urlList.length,
        completed_items: 0,
        failed_items: 0,
        created_at: new Date(),
        items: urlList.map((url, index) => ({
          id: `item_${Date.now()}_${index}`,
          url,
          status: 'pending',
          progress: 0,
        })),
      };

      setBatches(prev => [newBatch, ...prev]);
      setUrls("");
      setBatchName("");
      
    } catch (error) {
      props.onBatchError?.(error instanceof Error ? error.message : "Failed to create batch");
    } finally {
      setIsCreating(false);
    }
  };

  const startBatch = async (batchId: string) => {
    try {
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'running' }
          : batch
      ));
      
      // Subscribe to batch updates
      subscribe(batchId);
      
      // Mock batch processing
      simulateBatchProcessing(batchId);
      
    } catch (error) {
      props.onBatchError?.(error instanceof Error ? error.message : "Failed to start batch");
    }
  };

  const pauseBatch = async (batchId: string) => {
    try {
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'paused' }
          : batch
      ));
    } catch (error) {
      console.error("Failed to pause batch:", error);
    }
  };

  const cancelBatch = async (batchId: string) => {
    try {
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { 
              ...batch, 
              status: 'error',
              items: batch.items.map(item => 
                item.status === 'downloading' 
                  ? { ...item, status: 'cancelled' }
                  : item
              )
            }
          : batch
      ));
      
      unsubscribe(batchId);
    } catch (error) {
      console.error("Failed to cancel batch:", error);
    }
  };

  const retryBatch = async (batchId: string) => {
    try {
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { 
              ...batch, 
              status: 'idle',
              items: batch.items.map(item => 
                item.status === 'error' || item.status === 'cancelled'
                  ? { ...item, status: 'pending', progress: 0, error: undefined }
                  : item
              )
            }
          : batch
      ));
    } catch (error) {
      console.error("Failed to retry batch:", error);
    }
  };

  const simulateBatchProcessing = (batchId: string) => {
    const batch = batches().find(b => b.id === batchId);
    if (!batch) return;

    let currentIndex = 0;
    const processNext = () => {
      if (currentIndex >= batch.items.length) {
        // Batch completed
        setBatches(prev => prev.map(b => 
          b.id === batchId 
            ? { ...b, status: 'completed' }
            : b
        ));
        return;
      }

      const item = batch.items[currentIndex];
      if (item.status === 'pending') {
        // Start processing this item
        setBatches(prev => prev.map(b => 
          b.id === batchId 
            ? {
                ...b,
                items: b.items.map(i => 
                  i.id === item.id 
                    ? { ...i, status: 'downloading' }
                    : i
                )
              }
            : b
        ));

        // Simulate download progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Mark item as completed
            setBatches(prev => prev.map(b => 
              b.id === batchId 
                ? {
                    ...b,
                    completed_items: b.completed_items + 1,
                    items: b.items.map(i => 
                      i.id === item.id 
                        ? { ...i, status: 'completed', progress: 100 }
                        : i
                    )
                  }
                : b
            ));
            
            currentIndex++;
            setTimeout(processNext, 1000);
          } else {
            setBatches(prev => prev.map(b => 
              b.id === batchId 
                ? {
                    ...b,
                    items: b.items.map(i => 
                      i.id === item.id 
                        ? { ...i, progress }
                        : i
                    )
                  }
                : b
            ));
          }
        }, 200);
      } else {
        currentIndex++;
        setTimeout(processNext, 100);
      }
    };

    processNext();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'primary';
      case 'paused': return 'warning';
      case 'error': return 'error';
      default: return 'muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'running': return 'Play';
      case 'paused': return 'Pause';
      case 'error': return 'AlertCircle';
      default: return 'Circle';
    }
  };

  return (
    <div class={`batch-download-manager ${props.class || ""}`}>
      <Card class="batch-header">
        <div class="header-content">
          <div class="header-title">
            <Icon name="Layers" class="header-icon" />
            <h2>Batch Download Manager</h2>
          </div>
          
          <div class="connection-status">
            <Icon 
              name={isConnected() ? "Wifi" : "WifiOff"} 
              class={`status-icon ${isConnected() ? 'connected' : 'disconnected'}`}
            />
            <span>{isConnected() ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </Card>

      <Card class="create-batch-section">
        <h3>Create New Batch</h3>
        
        <div class="batch-form">
          <div class="form-group">
            <label>Batch Name</label>
            <TextField
              value={batchName()}
              onInput={(e) => setBatchName(e.currentTarget.value)}
              placeholder="Enter batch name..."
            />
          </div>
          
          <div class="form-group">
            <label>URLs (one per line)</label>
            <textarea
              value={urls()}
              onInput={(e) => setUrls(e.currentTarget.value)}
              placeholder="https://twitter.com/user/status/123&#10;https://instagram.com/p/abc123&#10;https://example.com/gallery"
              rows={5}
            />
          </div>
          
          <Button
            onClick={createBatch}
            disabled={!urls().trim() || !batchName().trim() || isCreating()}
            variant="primary"
          >
            <Icon name="Plus" />
            {isCreating() ? "Creating..." : "Create Batch"}
          </Button>
        </div>
      </Card>

      <Card class="batches-section">
        <div class="section-header">
          <h3>Batch Downloads</h3>
          <span class="batches-count">{batches().length} batches</span>
        </div>
        
        <div class="batches-list">
          <For each={batches()}>
            {(batch) => (
              <div class={`batch-item ${batch.status}`}>
                <div class="batch-info">
                  <div class="batch-header">
                    <Icon 
                      name={getStatusIcon(batch.status)} 
                      class={`status-icon ${getStatusColor(batch.status)}`}
                    />
                    <span class="batch-name">{batch.name}</span>
                    <span class="batch-status">{batch.status}</span>
                  </div>
                  
                  <div class="batch-details">
                    <span class="batch-items">
                      {batch.completed_items}/{batch.total_items} items
                    </span>
                    <span class="batch-date">
                      {batch.created_at.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div class="batch-progress">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        style={{ width: `${(batch.completed_items / batch.total_items) * 100}%` }}
                      />
                    </div>
                    <span class="progress-text">
                      {Math.round((batch.completed_items / batch.total_items) * 100)}%
                    </span>
                  </div>
                  
                  <Show when={batch.failed_items > 0}>
                    <div class="batch-errors">
                      <Icon name="AlertCircle" class="error-icon" />
                      <span class="error-text">{batch.failed_items} failed items</span>
                    </div>
                  </Show>
                </div>
                
                <div class="batch-actions">
                  <Show when={batch.status === 'idle'}>
                    <Button
                      onClick={() => startBatch(batch.id)}
                      variant="primary"
                      size="sm"
                    >
                      <Icon name="Play" />
                      Start
                    </Button>
                  </Show>
                  
                  <Show when={batch.status === 'running'}>
                    <Button
                      onClick={() => pauseBatch(batch.id)}
                      variant="secondary"
                      size="sm"
                    >
                      <Icon name="Pause" />
                      Pause
                    </Button>
                    <Button
                      onClick={() => cancelBatch(batch.id)}
                      variant="danger"
                      size="sm"
                    >
                      <Icon name="Square" />
                      Cancel
                    </Button>
                  </Show>
                  
                  <Show when={batch.status === 'paused'}>
                    <Button
                      onClick={() => startBatch(batch.id)}
                      variant="primary"
                      size="sm"
                    >
                      <Icon name="Play" />
                      Resume
                    </Button>
                    <Button
                      onClick={() => cancelBatch(batch.id)}
                      variant="danger"
                      size="sm"
                    >
                      <Icon name="Square" />
                      Cancel
                    </Button>
                  </Show>
                  
                  <Show when={batch.status === 'error' && batch.failed_items > 0}>
                    <Button
                      onClick={() => retryBatch(batch.id)}
                      variant="secondary"
                      size="sm"
                    >
                      <Icon name="RefreshCw" />
                      Retry
                    </Button>
                  </Show>
                  
                  <Button
                    onClick={() => setSelectedBatch(batch)}
                    variant="secondary"
                    size="sm"
                  >
                    <Icon name="Eye" />
                    View
                  </Button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Card>

      <Show when={selectedBatch()}>
        <Card class="batch-details-section">
          <div class="section-header">
            <h3>Batch Details: {selectedBatch()?.name}</h3>
            <Button
              onClick={() => setSelectedBatch(null)}
              variant="secondary"
              size="sm"
            >
              <Icon name="X" />
              Close
            </Button>
          </div>
          
          <div class="items-list">
            <For each={selectedBatch()?.items || []}>
              {(item) => (
                <div class={`item-row ${item.status}`}>
                  <div class="item-info">
                    <Icon 
                      name={
                        item.status === 'completed' ? 'CheckCircle' :
                        item.status === 'downloading' ? 'Clock' :
                        item.status === 'error' ? 'AlertCircle' :
                        'Circle'
                      }
                      class={`item-icon ${getStatusColor(item.status)}`}
                    />
                    <span class="item-url">{item.url}</span>
                    <span class="item-status">{item.status}</span>
                  </div>
                  
                  <Show when={item.status === 'downloading'}>
                    <div class="item-progress">
                      <div class="progress-bar">
                        <div 
                          class="progress-fill" 
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span class="progress-text">{Math.round(item.progress)}%</span>
                    </div>
                  </Show>
                  
                  <Show when={item.error}>
                    <div class="item-error">
                      <Icon name="AlertCircle" class="error-icon" />
                      <span class="error-text">{item.error}</span>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Card>
      </Show>
    </div>
  );
};
