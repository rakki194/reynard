import { onCleanup, createSignal } from 'solid-js';

export interface DragAndDropOptions {
  onDragStateChange: (isDragging: boolean) => void;
  onFilesDropped?: (files: FileList) => void;
  onItemsDropped?: (items: any[], targetPath: string) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  uploadFiles?: (files: FileList) => Promise<void>;
  moveItems?: (items: string[], sourcePath: string, targetPath: string) => Promise<any>;
  notify?: (message: string, type?: 'error' | 'success' | 'info' | 'warning') => void;
}

interface DragItem {
  type: 'directory' | 'image' | 'file';
  name: string;
  path: string;
  idx: number;
}

/**
 * Drag and Drop composable for handling file uploads and item movement
 * 
 * @param options Configuration options for drag and drop behavior
 * @returns Object with drag and drop handlers and state
 */
export function useDragAndDrop(options: DragAndDropOptions) {
  const {
    onDragStateChange,
    onFilesDropped,
    onItemsDropped,
    maxFileSize = 100 * 1024 * 1024, // 100MB default
    allowedFileTypes,
    uploadFiles,
    moveItems,
    notify
  } = options;

  let dragCounter = 0;
  const [isMoving, setIsMoving] = createSignal(false);
  const [movingItems, setMovingItems] = createSignal<Set<string>>(new Set());

  // Validate file size and type
  const validateFile = (file: File): boolean => {
    if (file.size > maxFileSize) {
      notify?.(`File ${file.name} is too large. Maximum size is ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`, 'error');
      return false;
    }

    if (allowedFileTypes && allowedFileTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
        notify?.(`File type .${fileExtension} is not allowed`, 'error');
        return false;
      }
    }

    return true;
  };

  // Handle drag enter
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer?.types.includes('Files')) {
      dragCounter++;
      onDragStateChange(true);
    }
  };

  // Handle drag leave
  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer?.types.includes('Files')) {
      dragCounter--;
      if (dragCounter === 0) {
        onDragStateChange(false);
      }
    }

    // Remove drag-target class from directory items
    const target = e.target as HTMLElement;
    const directoryItem = target.closest('.directory');
    if (directoryItem) {
      directoryItem.classList.remove('drag-target');
    }
  };

  // Handle drag over
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer) return;

    // Check if this is a custom item drag
    if (
      e.dataTransfer.types.includes('application/x-custom-item') ||
      e.dataTransfer.types.includes('application/x-custom-items')
    ) {
      e.dataTransfer.dropEffect = 'move';
      const target = e.target as HTMLElement;
      const directoryItem = target.closest('.directory');
      if (directoryItem) {
        directoryItem.classList.add('drag-target');
      }
    } else if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  // Handle drop
  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    onDragStateChange(false);
    dragCounter = 0;

    if (!e.dataTransfer) return;

    // Handle custom item drops
    if (
      e.dataTransfer.types.includes('application/x-custom-item') ||
      e.dataTransfer.types.includes('application/x-custom-items')
    ) {
      if (isMoving()) {
        notify?.('Move operation already in progress', 'warning');
        return;
      }

      const itemData = e.dataTransfer.getData('application/x-custom-item');
      const itemsData = e.dataTransfer.getData('application/x-custom-items');

      try {
        setIsMoving(true);
        const item = JSON.parse(itemData);
        const items = itemsData ? JSON.parse(itemsData) : [item];

        const itemsToMove = items.map((item: DragItem) => item.name);
        const alreadyMoving = itemsToMove.filter((name: string) => movingItems().has(name));
        if (alreadyMoving.length > 0) {
          notify?.('Move operation already in progress', 'warning');
          return;
        }

        // Mark items as being moved
        setMovingItems(prev => {
          const newSet = new Set(prev);
          itemsToMove.forEach((name: string) => newSet.add(name));
          return newSet;
        });

        // Get target path
        const targetElement = e.target as HTMLElement;
        const directoryItem = targetElement.closest('.item.directory') as HTMLElement;
        let targetPath = '';
        
        if (directoryItem) {
          const dirPath = directoryItem.getAttribute('data-path') || '';
          const dirName = directoryItem.getAttribute('data-name') || '';
          targetPath = dirPath ? `${dirPath}/${dirName}` : dirName;
        }

        const sourcePath = item.path || '';
        if (sourcePath === targetPath) {
          console.info('Skipping same directory:', { sourcePath, targetPath });
          return;
        }

        if (moveItems) {
          const result = await moveItems(itemsToMove, sourcePath, targetPath);
          onItemsDropped?.(items, targetPath);
          notify?.(`Moved ${result.moved?.length || itemsToMove.length} items successfully`, 'success');
        } else {
          onItemsDropped?.(items, targetPath);
        }
      } catch (err) {
        console.error('Move failed:', err);
        notify?.(
          `Move failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          'error'
        );
      } finally {
        setIsMoving(false);
        setMovingItems(new Set<string>());
      }
      return;
    }

    // Handle external file drops
    if (e.dataTransfer.items) {
      const items = Array.from(e.dataTransfer.items);
      const entries = items.filter(item => item.kind === 'file').map(item => item.webkitGetAsEntry());

      const files: File[] = [];

      const processEntry = async (entry: any, path: string = '') => {
        if (!entry) return;

        if (entry.isFile) {
          return new Promise<void>(resolve => {
            entry.file((file: File) => {
              if (validateFile(file)) {
                files.push(file);
              }
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          const dirPath = path ? `${path}/${entry.name}` : entry.name;

          return new Promise<void>(resolve => {
            const readEntries = () => {
              dirReader.readEntries(async (entries: any[]) => {
                if (entries.length === 0) {
                  resolve();
                  return;
                }

                await Promise.all(entries.map(e => processEntry(e, dirPath)));
                readEntries();
              });
            };
            readEntries();
          });
        }
      };

      try {
        await Promise.all(entries.map(entry => processEntry(entry)));

        if (files.length > 0) {
          const fileList = new DataTransfer();
          files.forEach(file => fileList.items.add(file));

          if (uploadFiles) {
            await uploadFiles(fileList.files);
          } else {
            onFilesDropped?.(fileList.files);
          }
        }
      } catch (err) {
        console.error('Failed to process dropped files:', err);
        notify?.(
          `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          'error'
        );
      }
    } else {
      // Fallback to simple FileList
      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        if (validateFile(files[i])) {
          validFiles.push(files[i]);
        }
      }

      if (validFiles.length > 0) {
        const fileList = new DataTransfer();
        validFiles.forEach(file => fileList.items.add(file));

        if (uploadFiles) {
          await uploadFiles(fileList.files);
        } else {
          onFilesDropped?.(fileList.files);
        }
      }
    }
  };

  // Handle drag start
  const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    const draggableItem = target.closest('.item');
    if (!draggableItem) return;

    const idx = parseInt(draggableItem.getAttribute('data-idx') || '');
    if (isNaN(idx)) return;

    const itemName = draggableItem.getAttribute('data-name') || '';

    if (movingItems().has(itemName)) {
      e.preventDefault();
      return;
    }

    draggableItem.classList.add('being-dragged');

    if (!e.dataTransfer) return;

    e.dataTransfer.effectAllowed = 'move';

    const isDraggingDirectory = draggableItem.classList.contains('directory');
    const itemData = {
      type: isDraggingDirectory ? ('directory' as const) : ('file' as const),
      name: draggableItem.getAttribute('data-name') || '',
      path: draggableItem.getAttribute('data-path') || '',
      idx: idx,
    };

    e.dataTransfer.setData('application/x-custom-item', JSON.stringify(itemData));
  };

  // Handle drag end
  const handleDragEnd = (e: DragEvent) => {
    document.querySelectorAll('.being-dragged, .drag-target').forEach(el => {
      el.classList.remove('being-dragged', 'drag-target');
    });
  };

  // Add document-level event listeners
  document.addEventListener('dragenter', handleDragEnter);
  document.addEventListener('dragleave', handleDragLeave);
  document.addEventListener('dragover', handleDragOver);
  document.addEventListener('drop', handleDrop);
  document.addEventListener('dragstart', handleDragStart);
  document.addEventListener('dragend', handleDragEnd);

  onCleanup(() => {
    document.removeEventListener('dragenter', handleDragEnter);
    document.removeEventListener('dragleave', handleDragLeave);
    document.removeEventListener('dragover', handleDragOver);
    document.removeEventListener('drop', handleDrop);
    document.removeEventListener('dragstart', handleDragStart);
    document.removeEventListener('dragend', handleDragEnd);
  });

  return {
    isMoving,
    movingItems,
  };
}