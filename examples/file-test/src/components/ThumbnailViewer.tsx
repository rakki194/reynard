import { createSignal, createEffect } from 'solid-js';

interface ProcessedFile {
  file: File;
  thumbnail: Blob | string;
  processingTime: number;
  error?: string;
}

interface ThumbnailViewerProps {
  processedFile: ProcessedFile;
}

export default function ThumbnailViewer(props: ThumbnailViewerProps) {
  const [thumbnailUrl, setThumbnailUrl] = createSignal<string>('');
  const [showError, setShowError] = createSignal(false);

  createEffect(() => {
    const { thumbnail, error } = props.processedFile;
    
    if (error) {
      setShowError(true);
      return;
    }

    if (thumbnail instanceof Blob) {
      const url = URL.createObjectURL(thumbnail);
      setThumbnailUrl(url);
      
      // Cleanup URL when component unmounts
      return () => URL.revokeObjectURL(url);
    } else if (typeof thumbnail === 'string') {
      setThumbnailUrl(thumbnail);
    }
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension || '')) {
      return '🖼️';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '')) {
      return '🎥';
    } else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(extension || '')) {
      return '🎵';
    } else if (['txt', 'md', 'json', 'xml', 'csv'].includes(extension || '')) {
      return '📄';
    } else if (['js', 'ts', 'jsx', 'tsx', 'css', 'html', 'py', 'java', 'cpp', 'c'].includes(extension || '')) {
      return '💻';
    } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) {
      return '📋';
    } else {
      return '📁';
    }
  };

  return (
    <div class="file-item">
      {showError() ? (
        <div style="height: 150px; display: flex; align-items: center; justify-content: center; background: #f8d7da; color: #721c24; border-radius: 4px; margin-bottom: 0.5rem;">
          <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">❌</div>
            <div style="font-size: 0.75rem;">Error</div>
          </div>
        </div>
      ) : (
        <img
          src={thumbnailUrl()}
          alt={`Thumbnail for ${props.processedFile.file.name}`}
          class="file-thumbnail"
          onError={() => setShowError(true)}
        />
      )}
      
      <div class="file-info">
        <div class="file-name" title={props.processedFile.file.name}>
          {getFileTypeIcon(props.processedFile.file.name)} {props.processedFile.file.name}
        </div>
        <div class="file-size">
          {formatFileSize(props.processedFile.file.size)} • {props.processedFile.processingTime}ms
        </div>
        {props.processedFile.error && (
          <div style="color: #dc3545; font-size: 0.75rem; margin-top: 0.25rem;">
            {props.processedFile.error}
          </div>
        )}
      </div>
    </div>
  );
}
