import { createSignal, For } from 'solid-js';
import { ThumbnailGenerator } from '@reynard/file-processing';
import FileUploader from './components/FileUploader';
import ThumbnailViewer from './components/ThumbnailViewer';
import AudioTest from './components/AudioTest';

interface ProcessedFile {
  file: File;
  thumbnail: Blob | string;
  processingTime: number;
  error?: string;
}

export default function App() {
  const [processedFiles, setProcessedFiles] = createSignal<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [thumbnailGenerator] = createSignal(new ThumbnailGenerator({
    size: [200, 200],
    format: 'webp',
    quality: 85,
    maintainAspectRatio: true,
    backgroundColor: '#ffffff',
    maxThumbnailSize: 10 * 1024 * 1024 // 10MB limit for testing
  }));

  const handleFilesSelected = async (files: FileList) => {
    setIsProcessing(true);
    const newProcessedFiles: ProcessedFile[] = [];

    for (const file of Array.from(files)) {
      try {
        const startTime = Date.now();
        const result = await thumbnailGenerator().generateThumbnail(file);
        const processingTime = Date.now() - startTime;

        if (result.success && result.data) {
          newProcessedFiles.push({
            file,
            thumbnail: result.data,
            processingTime
          });
        } else {
          newProcessedFiles.push({
            file,
            thumbnail: '',
            processingTime,
            error: result.error || 'Unknown error'
          });
        }
      } catch (error) {
        newProcessedFiles.push({
          file,
          thumbnail: '',
          processingTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setProcessedFiles(prev => [...prev, ...newProcessedFiles]);
    setIsProcessing(false);
  };

  const clearFiles = () => {
    setProcessedFiles([]);
  };

  return (
    <div class="app">
      <header class="header">
        <h1>Reynard File Processing Test</h1>
        <p>Test thumbnail generation for various file types</p>
      </header>

      <section class="test-section">
        <h2>File Upload & Thumbnail Generation</h2>
        <FileUploader 
          onFilesSelected={handleFilesSelected}
          disabled={isProcessing()}
        />
        
        {isProcessing() && (
          <div class="processing-status loading">
            Processing files... Please wait.
          </div>
        )}

        {processedFiles().length > 0 && (
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3>Processed Files ({processedFiles().length})</h3>
              <button 
                class="upload-button" 
                onClick={clearFiles}
                style="background: #dc3545;"
              >
                Clear All
              </button>
            </div>
            <div class="file-list">
              <For each={processedFiles()}>
                {(processedFile) => (
                  <ThumbnailViewer processedFile={processedFile} />
                )}
              </For>
            </div>
          </div>
        )}
      </section>

      <section class="test-section">
        <h2>Audio Waveform Test</h2>
        <AudioTest thumbnailGenerator={thumbnailGenerator()} />
      </section>
    </div>
  );
}
