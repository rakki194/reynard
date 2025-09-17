/**
 * Batch Processing Example
 *
 * Comprehensive example demonstrating the BatchCaptionProcessor component
 * with real-time progress tracking, configuration options, and result management.
 */
import { createSignal, onMount, onCleanup } from "solid-js";
import { createAnnotationManager, BatchCaptionProcessor, } from "reynard-annotating";
import "reynard-annotating/components/BatchCaptionProcessor.css";
export const BatchProcessingExample = () => {
    const [manager, setManager] = createSignal(null);
    const [isInitialized, setIsInitialized] = createSignal(false);
    const [error, setError] = createSignal(null);
    // Initialize the annotation manager
    onMount(async () => {
        try {
            const annotationManager = createAnnotationManager({
                baseUrl: "http://localhost:8000", // Your FastAPI backend URL
                timeout: 30000,
                retryAttempts: 3,
                retryDelay: 1000,
            });
            await annotationManager.initialize();
            setManager(annotationManager);
            setIsInitialized(true);
            console.log("✅ Batch processing example initialized successfully");
        }
        catch (err) {
            console.error("❌ Failed to initialize batch processing example:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        }
    });
    // Cleanup on unmount
    onCleanup(async () => {
        const currentManager = manager();
        if (currentManager) {
            try {
                await currentManager.shutdown();
                console.log("🧹 Batch processing example cleaned up");
            }
            catch (err) {
                console.error("Error during cleanup:", err);
            }
        }
    });
    // Handle batch completion
    const handleBatchComplete = (results) => {
        console.log("🎉 Batch processing completed!", results);
        // Log summary statistics
        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;
        const totalTime = results.reduce((sum, r) => sum + (r.processingTime || 0), 0);
        console.log(`📊 Batch Summary:
      - Total files: ${results.length}
      - Successful: ${successful}
      - Failed: ${failed}
      - Success rate: ${Math.round((successful / results.length) * 100)}%
      - Total processing time: ${totalTime.toFixed(2)}s
      - Average time per file: ${(totalTime / results.length).toFixed(2)}s
    `);
        // You could also trigger additional actions here:
        // - Update a database
        // - Send notifications
        // - Trigger follow-up processing
        // - Update UI state
    };
    // Handle batch errors
    const handleBatchError = (error) => {
        console.error("💥 Batch processing failed:", error);
        setError(error.message);
        // You could also:
        // - Show user-friendly error messages
        // - Log to error tracking service
        // - Retry the batch automatically
        // - Fall back to individual processing
    };
    // Show loading state
    if (!isInitialized()) {
        return (<div class="batch-example-container">
        <div class="loading-state">
          <div class="loading-spinner">🦊</div>
          <h2>Initializing Batch Processing...</h2>
          <p>Connecting to caption generation backend...</p>
          {error() && (<div class="error-message">
              <strong>Error:</strong> {error()}
            </div>)}
        </div>
      </div>);
    }
    // Show error state
    if (error() && !manager()) {
        return (<div class="batch-example-container">
        <div class="error-state">
          <div class="error-icon">❌</div>
          <h2>Failed to Initialize</h2>
          <p>{error()}</p>
          <button onClick={() => window.location.reload()} class="retry-button">
            Retry
          </button>
        </div>
      </div>);
    }
    // Main batch processing interface
    return (<div class="batch-example-container">
      <div class="example-header">
        <h1>🦊 Batch Caption Processing</h1>
        <p>
          Advanced batch processing for caption generation with real-time
          progress tracking, multiple generator support, and comprehensive
          result management.
        </p>
      </div>

      <div class="example-content">
        <BatchCaptionProcessor manager={manager()} onComplete={handleBatchComplete} onError={handleBatchError} class="main-batch-processor"/>
      </div>

      <div class="example-info">
        <h3>Features Demonstrated</h3>
        <ul>
          <li>
            ✅ <strong>Drag & Drop Upload:</strong> Intuitive file selection
            with visual feedback
          </li>
          <li>
            ✅ <strong>Real-time Progress:</strong> Live updates during batch
            processing
          </li>
          <li>
            ✅ <strong>Multiple Generators:</strong> Support for JTP2,
            Florence2, WDv3, JoyCaption
          </li>
          <li>
            ✅ <strong>Configuration Options:</strong> Concurrency control,
            force regeneration, post-processing
          </li>
          <li>
            ✅ <strong>Error Handling:</strong> Comprehensive error tracking and
            recovery
          </li>
          <li>
            ✅ <strong>Results Export:</strong> JSON export of all generated
            captions
          </li>
          <li>
            ✅ <strong>Responsive Design:</strong> Works on desktop and mobile
            devices
          </li>
        </ul>

        <h3>Backend Integration</h3>
        <p>
          This component integrates with the Reynard backend's batch processing
          API:
        </p>
        <ul>
          <li>
            <code>POST /api/caption/batch</code> - Batch caption generation
            endpoint
          </li>
          <li>
            <code>GET /api/caption/generators</code> - Available generator
            information
          </li>
          <li>Progress callbacks for real-time status updates</li>
          <li>Concurrent processing with configurable limits</li>
        </ul>

        <h3>Usage Example</h3>
        <pre class="code-block">
          {`import { BatchCaptionProcessor, createAnnotationManager } from "reynard-annotating";

const manager = createAnnotationManager({
  baseUrl: "http://localhost:8000"
});

await manager.initialize();

<BatchCaptionProcessor
  manager={manager}
  onComplete={(results) => console.log("Batch completed!", results)}
  onError={(error) => console.error("Batch failed:", error)}
/>`}
        </pre>
      </div>
    </div>);
};
// Additional styles for the example
const exampleStyles = `
.batch-example-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.loading-spinner {
  font-size: 3rem;
  animation: spin 2s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-button:hover {
  background: #0056b3;
}

.example-header {
  text-align: center;
  margin-bottom: 2rem;
}

.example-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.example-header p {
  color: #6c757d;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.example-content {
  margin-bottom: 3rem;
}

.main-batch-processor {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.example-info {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.example-info h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1rem;
}

.example-info ul {
  margin-bottom: 2rem;
}

.example-info li {
  margin-bottom: 0.5rem;
  color: #495057;
}

.code-block {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 1rem 0;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  margin-top: 1rem;
}
`;
// Inject styles
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = exampleStyles;
    document.head.appendChild(styleSheet);
}
