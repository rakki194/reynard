import { createSignal, createMemo } from 'solid-js';
import { Gallery as GalleryComponent, useGalleryState, useFileUpload } from '@reynard/gallery';
import { Card, Button } from '@reynard/components';
import { useI18n, useNotifications } from '@reynard/core';
import type { GalleryItem } from '@reynard/gallery';

export function Gallery() {
  const { t } = useI18n();
  const { addNotification } = useNotifications();
  const [currentPath, setCurrentPath] = createSignal<string[]>([]);
  
  // Sample gallery items
  const sampleItems = createMemo((): GalleryItem[] => [
    {
      id: '1',
      name: 'landscape.jpg',
      type: 'image',
      size: 1024000,
      url: 'https://picsum.photos/400/300?random=1',
      thumbnail: 'https://picsum.photos/200/150?random=1',
      createdAt: new Date('2023-01-15'),
      metadata: {
        dimensions: { width: 1920, height: 1080 },
        format: 'JPEG'
      }
    },
    {
      id: '2',
      name: 'Photos',
      type: 'folder',
      size: 0,
      createdAt: new Date('2023-01-10'),
      children: [
        {
          id: '3',
          name: 'vacation.jpg',
          type: 'image',
          size: 2048000,
          url: 'https://picsum.photos/400/300?random=2',
          thumbnail: 'https://picsum.photos/200/150?random=2',
          createdAt: new Date('2023-01-12'),
          metadata: {
            dimensions: { width: 2560, height: 1440 },
            format: 'JPEG'
          }
        }
      ]
    },
    {
      id: '4',
      name: 'document.pdf',
      type: 'document',
      size: 512000,
      url: '#',
      createdAt: new Date('2023-01-08')
    },
    {
      id: '5',
      name: 'nature.jpg',
      type: 'image',
      size: 1536000,
      url: 'https://picsum.photos/400/300?random=3',
      thumbnail: 'https://picsum.photos/200/150?random=3',
      createdAt: new Date('2023-01-05'),
      metadata: {
        dimensions: { width: 1920, height: 1280 },
        format: 'JPEG'
      }
    },
    {
      id: '6',
      name: 'city.jpg',
      type: 'image',
      size: 1792000,
      url: 'https://picsum.photos/400/300?random=4',
      thumbnail: 'https://picsum.photos/200/150?random=4',
      createdAt: new Date('2023-01-03'),
      metadata: {
        dimensions: { width: 2048, height: 1365 },
        format: 'JPEG'
      }
    }
  ]);

  const galleryState = useGalleryState({
    items: sampleItems(),
    onNavigate: (path) => {
      setCurrentPath(path);
      addNotification({
        type: 'info',
        message: t('gallery.navigated', { path: path.join(' / ') || 'Root' })
      });
    },
    onSelect: (items) => {
      addNotification({
        type: 'success',
        message: t('gallery.selected', { count: items.length })
      });
    }
  });

  const fileUpload = useFileUpload({
    accept: 'image/*,application/pdf',
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    onUpload: async (files) => {
      addNotification({
        type: 'info',
        message: t('gallery.uploading', { count: files.length })
      });
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification({
        type: 'success',
        message: t('gallery.uploaded', { count: files.length })
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        message: t('gallery.uploadError', { error: error.message })
      });
    }
  });

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{t('gallery.title')}</h1>
        <div class="flex gap-4">
          <Button
            variant="secondary"
            onClick={() => galleryState.selectAll()}
          >
            {t('gallery.selectAll')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => galleryState.clearSelection()}
          >
            {t('gallery.clearSelection')}
          </Button>
          <Button
            variant="primary"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            {t('gallery.upload')}
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            accept={fileUpload.accept}
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                fileUpload.handleUpload(files);
              }
            }}
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-1">
          <Card>
            <div class="p-4">
              <h2 class="text-lg font-semibold mb-4">{t('gallery.info.title')}</h2>
              <div class="space-y-3 text-sm">
                <div>
                  <span class="font-medium">{t('gallery.info.totalItems')}:</span>
                  <span class="ml-2">{galleryState.totalItems()}</span>
                </div>
                <div>
                  <span class="font-medium">{t('gallery.info.selectedItems')}:</span>
                  <span class="ml-2">{galleryState.selectedItems().length}</span>
                </div>
                <div>
                  <span class="font-medium">{t('gallery.info.currentPath')}:</span>
                  <span class="ml-2">{currentPath().join(' / ') || 'Root'}</span>
                </div>
                <div>
                  <span class="font-medium">{t('gallery.info.viewMode')}:</span>
                  <span class="ml-2">{galleryState.viewMode()}</span>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  class="w-full"
                  onClick={() => galleryState.setViewMode('grid')}
                >
                  {t('gallery.viewModes.grid')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  class="w-full"
                  onClick={() => galleryState.setViewMode('list')}
                >
                  {t('gallery.viewModes.list')}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div class="lg:col-span-3">
          <Card>
            <div class="p-6">
              <GalleryComponent
                items={galleryState.currentItems()}
                selectedItems={galleryState.selectedItems()}
                viewMode={galleryState.viewMode()}
                onItemClick={galleryState.toggleSelection}
                onItemDoubleClick={(item) => {
                  if (item.type === 'folder') {
                    galleryState.navigateToFolder(item);
                  } else {
                    addNotification({
                      type: 'info',
                      message: t('gallery.opened', { name: item.name })
                    });
                  }
                }}
                onBreadcrumbClick={galleryState.navigateToPath}
                currentPath={currentPath()}
                onFileUpload={fileUpload.handleUpload}
                uploadProgress={fileUpload.progress()}
                isUploading={fileUpload.isUploading()}
                maxFileSize={fileUpload.maxSize}
                acceptedFileTypes={fileUpload.accept}
              />
            </div>
          </Card>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div class="p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">
              {sampleItems().filter(item => item.type === 'image').length}
            </div>
            <div class="text-sm text-gray-600">{t('gallery.stats.images')}</div>
          </div>
        </Card>
        
        <Card>
          <div class="p-4 text-center">
            <div class="text-2xl font-bold text-green-600">
              {sampleItems().filter(item => item.type === 'folder').length}
            </div>
            <div class="text-sm text-gray-600">{t('gallery.stats.folders')}</div>
          </div>
        </Card>
        
        <Card>
          <div class="p-4 text-center">
            <div class="text-2xl font-bold text-purple-600">
              {sampleItems().filter(item => item.type === 'document').length}
            </div>
            <div class="text-sm text-gray-600">{t('gallery.stats.documents')}</div>
          </div>
        </Card>
        
        <Card>
          <div class="p-4 text-center">
            <div class="text-2xl font-bold text-orange-600">
              {Math.round(sampleItems().reduce((sum, item) => sum + item.size, 0) / 1024 / 1024 * 100) / 100}MB
            </div>
            <div class="text-sm text-gray-600">{t('gallery.stats.totalSize')}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
