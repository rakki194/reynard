import { Component, createSignal } from "solid-js";
import { GalleryService } from "reynard-gallery-dl";
import type { GalleryServiceConfig } from "reynard-gallery-dl";

interface DownloadManagerProps {
  onDownload: (url: string) => void;
  isLoading: boolean;
  service: GalleryService | null;
}

export const DownloadManager: Component<DownloadManagerProps> = props => {
  const [url, setUrl] = createSignal("");
  const [isValidating, setIsValidating] = createSignal(false);
  const [validationResult, setValidationResult] = createSignal<{
    isValid: boolean;
    extractor?: string;
    error?: string;
  } | null>(null);

  const handleUrlChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setUrl(target.value);
    setValidationResult(null);
  };

  const validateUrl = async () => {
    if (!url().trim() || !props.service) return;

    setIsValidating(true);
    try {
      const result = await props.service.validateUrl(url());
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        isValid: false,
        error: error instanceof Error ? error.message : "Validation failed",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    if (url().trim() && !props.isLoading) {
      props.onDownload(url().trim());
      setUrl("");
      setValidationResult(null);
    }
  };

  const exampleUrls = [
    "https://www.instagram.com/p/example/",
    "https://twitter.com/user/status/123456789",
    "https://www.reddit.com/r/example/comments/abc123/",
    "https://www.pixiv.net/en/artworks/12345678",
  ];

  return (
    <div class="download-manager">
      <form onSubmit={handleSubmit} class="url-input-container">
        <input
          type="url"
          class="url-input"
          placeholder="Enter gallery URL (Instagram, Twitter, Reddit, Pixiv, etc.)"
          value={url()}
          onInput={handleUrlChange}
          disabled={props.isLoading}
        />
        <button
          type="button"
          class="download-button"
          onClick={validateUrl}
          disabled={!url().trim() || isValidating() || props.isLoading}
        >
          {isValidating() ? "Validating..." : "Validate"}
        </button>
        <button
          type="submit"
          class="download-button"
          disabled={!url().trim() || props.isLoading || !validationResult()?.isValid}
        >
          {props.isLoading ? "Starting..." : "Download"}
        </button>
      </form>

      {validationResult() && (
        <div class={`validation-result ${validationResult()!.isValid ? "success" : "error"}`}>
          {validationResult()!.isValid ? (
            <div>
              ✅ URL is valid
              {validationResult()!.extractor && <span> • Detected extractor: {validationResult()!.extractor}</span>}
            </div>
          ) : (
            <div>❌ {validationResult()!.error || "Invalid URL"}</div>
          )}
        </div>
      )}

      <div class="example-urls">
        <h3>Example URLs:</h3>
        <ul>
          {exampleUrls.map(exampleUrl => (
            <li>
              <button
                type="button"
                class="example-url-button"
                onClick={() => setUrl(exampleUrl)}
                disabled={props.isLoading}
              >
                {exampleUrl}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
