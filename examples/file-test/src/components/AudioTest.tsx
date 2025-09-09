import { createSignal } from "solid-js";
import { ThumbnailGenerator } from "reynard-file-processing";

interface AudioTestProps {
  thumbnailGenerator: ThumbnailGenerator;
}

export default function AudioTest(props: AudioTestProps) {
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = createSignal<string>("");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [processingTime, setProcessingTime] = createSignal(0);
  const [error, setError] = createSignal<string>("");

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setThumbnailUrl("");
      setError("");
    }
  };

  const generateThumbnail = async () => {
    const file = selectedFile();
    if (!file) return;

    setIsProcessing(true);
    setError("");

    try {
      const startTime = Date.now();
      const result = await props.thumbnailGenerator.generateThumbnail(file, {
        size: [200, 200],
        format: "webp",
        quality: 85,
      });
      const duration = Date.now() - startTime;

      setProcessingTime(duration);

      if (result.success && result.data instanceof Blob) {
        const url = URL.createObjectURL(result.data);
        setThumbnailUrl(url);
        console.log("Thumbnail generated successfully:", result);
      } else {
        const errorMsg = result.error || "Failed to generate thumbnail";
        setError(errorMsg);
        console.error("Thumbnail generation failed:", result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div class="audio-test">
      <h3>Test Audio Waveform Generation</h3>

      <div class="audio-file-input">
        <label for="audio-file-input" class="file-input-label">
          Select Audio File:
        </label>
        <input
          id="audio-file-input"
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          class="file-input-margin"
        />
      </div>

      {selectedFile() && (
        <div class="file-info-container">
          <p>
            <strong>Selected File:</strong> {selectedFile()!.name}
          </p>
          <p>
            <strong>Size:</strong> {formatFileSize(selectedFile()!.size)}
          </p>
          <p>
            <strong>Type:</strong> {selectedFile()!.type}
          </p>
        </div>
      )}

      {selectedFile() && (
        <button
          class="upload-button upload-button-margin"
          onClick={generateThumbnail}
          disabled={isProcessing()}
        >
          {isProcessing() ? "Generating..." : "Generate Waveform Thumbnail"}
        </button>
      )}

      {processingTime() > 0 && (
        <div class="processing-time">Processing time: {processingTime()}ms</div>
      )}

      {error() && <div class="processing-status error">Error: {error()}</div>}

      {thumbnailUrl() && (
        <div>
          <h4>Generated Waveform Thumbnail:</h4>
          <img
            src={thumbnailUrl()}
            alt="Audio waveform thumbnail"
            class="audio-thumbnail"
          />
        </div>
      )}

      <div class="instructions-container">
        <h4>Test Instructions:</h4>
        <ol>
          <li>Select an audio file (MP3, WAV, etc.)</li>
          <li>Click "Generate Waveform Thumbnail"</li>
          <li>
            The thumbnail will show a waveform visualization based on the actual
            audio data
          </li>
          <li>Try different audio files to see how the waveform changes</li>
        </ol>
        <p>
          <strong>Note:</strong> The waveform is generated using the Web Audio
          API to analyze real audio data, not random patterns.
        </p>
      </div>
    </div>
  );
}
