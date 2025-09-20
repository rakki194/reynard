/**
 * Audio Grid Component for Reynard Caption System
 *
 * Leverages existing AudioPlayer, AudioWaveformVisualizer, and AudioThumbnailGenerator
 * infrastructure for comprehensive audio file handling and display.
 */
import { createSignal, createEffect, For, Show } from "solid-js";
import { AudioThumbnailGenerator, AudioMetadataExtractor } from "reynard-file-processing";
import { AudioPlayer } from "./AudioPlayer";
import { AudioWaveformVisualizer } from "./AudioWaveformVisualizer";
export const AudioGrid = props => {
    const [audioFiles, setAudioFiles] = createSignal(props.initialFiles || []);
    const [selectedFile, setSelectedFile] = createSignal(null);
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    // Initialize processors using existing infrastructure
    const thumbnailGenerator = new AudioThumbnailGenerator({
        size: [200, 200],
        format: "webp",
        quality: 85,
        waveformStyle: "bars",
        barCount: 50,
    });
    const metadataExtractor = new AudioMetadataExtractor();
    // Handle file selection
    const handleFileSelect = (file) => {
        setSelectedFile(file);
        props.onFileSelect?.(file);
    };
    // Handle file removal
    const handleFileRemove = (fileId) => {
        setAudioFiles(prev => prev.filter(f => f.id !== fileId));
        if (selectedFile()?.id === fileId) {
            setSelectedFile(null);
        }
        props.onFileRemove?.(fileId);
    };
    // Handle audio analysis
    const handleAnalyzeAudio = (file) => {
        props.onAnalyzeAudio?.(file);
    };
    // Process uploaded files
    const processAudioFile = async (file) => {
        setIsLoading(true);
        setError(null);
        try {
            // Generate waveform thumbnail using existing infrastructure
            const thumbnailResult = await thumbnailGenerator.generateThumbnail(file);
            if (!thumbnailResult.success) {
                throw new Error(thumbnailResult.error || "Failed to generate waveform thumbnail");
            }
            // Extract metadata using existing infrastructure
            const metadata = await metadataExtractor.extractMetadata(file);
            const audioFile = {
                id: crypto.randomUUID(),
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file),
                thumbnail: thumbnailResult.data,
                metadata,
                uploadedAt: new Date(),
            };
            return audioFile;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to process audio file";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Handle file upload
    const handleFileUpload = async (event) => {
        const input = event.target;
        const files = input.files;
        if (!files || files.length === 0)
            return;
        const maxFiles = props.maxFiles || 20;
        const filesToProcess = Array.from(files).slice(0, maxFiles);
        try {
            const processedFiles = await Promise.all(filesToProcess.map(processAudioFile));
            setAudioFiles(prev => [...prev, ...processedFiles]);
        }
        catch (err) {
            console.error("Failed to process audio files:", err);
        }
    };
    // Cleanup on unmount
    createEffect(() => {
        return () => {
            thumbnailGenerator.destroy();
        };
    });
    return (<div class={`audio-grid ${props.class || ""}`}>
      {/* File Upload */}
      <div class="audio-upload-section">
        <label for="audio-upload" class="upload-label">
          Upload Audio Files
        </label>
        <input id="audio-upload" type="file" multiple accept="audio/*" onChange={handleFileUpload} class="audio-upload-input" disabled={isLoading()} title="Select audio files to upload"/>
        <Show when={isLoading()}>
          <div class="loading-indicator">Processing audio files...</div>
        </Show>
        <Show when={error()}>
          <div class="error-message">{error()}</div>
        </Show>
      </div>

      {/* Audio Files Grid */}
      <div class="audio-files-grid">
        <For each={audioFiles()}>
          {file => (<AudioFileCard file={file} isSelected={selectedFile()?.id === file.id} onSelect={() => handleFileSelect(file)} onRemove={() => handleFileRemove(file.id)} onAnalyze={() => handleAnalyzeAudio(file)} showMetadata={props.showMetadata} isAnalyzing={props.isAnalyzing}/>)}
        </For>
      </div>

      {/* Selected Audio Player */}
      <Show when={selectedFile()}>
        <AudioPlayerModal file={selectedFile()} onClose={() => setSelectedFile(null)} onAnalyze={() => handleAnalyzeAudio(selectedFile())} isAnalyzing={props.isAnalyzing}/>
      </Show>
    </div>);
};
const AudioFileCard = props => {
    const [thumbnailUrl, setThumbnailUrl] = createSignal(null);
    // Create thumbnail URL
    createEffect(() => {
        if (props.file.thumbnail) {
            const url = URL.createObjectURL(props.file.thumbnail);
            setThumbnailUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    });
    return (<div class="audio-file-card" classList={{ selected: props.isSelected }} onClick={props.onSelect}>
      <div class="audio-thumbnail">
        <Show when={thumbnailUrl()} fallback={<div class="thumbnail-placeholder">🎵</div>}>
          <img src={thumbnailUrl()} alt={props.file.name}/>
        </Show>
        <div class="audio-overlay">
          <div class="audio-actions">
            <button class="action-button play-button" onClick={e => {
            e.stopPropagation();
            props.onSelect();
        }}>
              ▶️
            </button>
            <button class="action-button analyze-button" onClick={e => {
            e.stopPropagation();
            props.onAnalyze();
        }} disabled={props.isAnalyzing}>
              {props.isAnalyzing ? "⏳" : "📊"}
            </button>
            <button class="action-button remove-button" onClick={e => {
            e.stopPropagation();
            props.onRemove();
        }}>
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div class="audio-info">
        <h4 class="audio-name" title={props.file.name}>
          {props.file.name}
        </h4>
        <div class="audio-size">{(props.file.size / (1024 * 1024)).toFixed(2)} MB</div>

        <Show when={props.showMetadata && props.file.metadata}>
          <div class="audio-metadata">
            <div class="metadata-item">
              <span class="label">Duration:</span>
              <span class="value">
                {Math.floor(props.file.metadata.duration / 60)}:
                {Math.floor(props.file.metadata.duration % 60)
            .toString()
            .padStart(2, "0")}
              </span>
            </div>
            <div class="metadata-item">
              <span class="label">Format:</span>
              <span class="value">{props.file.metadata.format}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Sample Rate:</span>
              <span class="value">{props.file.metadata.sampleRate} Hz</span>
            </div>
            <div class="metadata-item">
              <span class="label">Channels:</span>
              <span class="value">{props.file.metadata.channels}</span>
            </div>
          </div>
        </Show>
      </div>
    </div>);
};
const AudioPlayerModal = props => {
    return (<div class="audio-player-modal">
      <div class="audio-player-content">
        <button class="close-button" onClick={props.onClose}>
          ×
        </button>

        <div class="audio-player-header">
          <h2>{props.file.name}</h2>
          <div class="audio-player-actions">
            <button class="analyze-button" onClick={props.onAnalyze} disabled={props.isAnalyzing}>
              {props.isAnalyzing ? "⏳ Analyzing..." : "📊 Analyze Audio"}
            </button>
          </div>
        </div>

        <div class="audio-player-body">
          {/* Audio Player */}
          <div class="audio-player-section">
            <AudioPlayer audioFiles={[props.file.url]} playerConfig={{
            showWaveform: true,
            showPlaylist: false,
            autoPlayNext: false,
            loopTrack: false,
        }}/>
          </div>

          {/* Waveform Visualizer */}
          <div class="waveform-section">
            <h3>Waveform Visualization</h3>
            <AudioWaveformVisualizer audioSrc={props.file.url} waveformConfig={{
            bars: 100,
            height: 200,
            color: "oklch(var(--primary-color))",
            backgroundColor: "oklch(var(--surface-color))",
        }} playbackConfig={{
            showControls: true,
            volume: 0.8,
        }} interactionConfig={{
            enableZoom: true,
            enablePan: true,
            enableSeeking: true,
            showProgress: true,
        }}/>
          </div>

          {/* Audio Metadata */}
          <Show when={props.file.metadata}>
            <div class="audio-metadata-panel">
              <h3>Audio Information</h3>
              <div class="metadata-grid">
                <div class="metadata-item">
                  <span class="label">Duration:</span>
                  <span class="value">
                    {Math.floor(props.file.metadata.duration / 60)}:
                    {Math.floor(props.file.metadata.duration % 60)
            .toString()
            .padStart(2, "0")}
                  </span>
                </div>
                <div class="metadata-item">
                  <span class="label">Format:</span>
                  <span class="value">{props.file.metadata.format}</span>
                </div>
                <div class="metadata-item">
                  <span class="label">Sample Rate:</span>
                  <span class="value">{props.file.metadata.sampleRate} Hz</span>
                </div>
                <div class="metadata-item">
                  <span class="label">Channels:</span>
                  <span class="value">{props.file.metadata.channels}</span>
                </div>
                <div class="metadata-item">
                  <span class="label">Bit Rate:</span>
                  <span class="value">{props.file.metadata.bitRate} kbps</span>
                </div>
                <div class="metadata-item">
                  <span class="label">File Size:</span>
                  <span class="value">{(props.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>);
};
