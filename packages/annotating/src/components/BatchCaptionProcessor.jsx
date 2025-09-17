/**
 * Batch Caption Processor Component
 *
 * Advanced batch processing UI for caption generation with drag-and-drop,
 * progress tracking, and comprehensive result management.
 */
import { createEffect, createSignal } from "solid-js";
import { BatchConfiguration } from "./BatchConfiguration";
import { BatchFileList } from "./BatchFileList";
import { BatchFileUpload } from "./BatchFileUpload";
import { BatchProgress as BatchProgressComponent } from "./BatchProgress";
import { BatchResults } from "./BatchResults";
export const BatchCaptionProcessor = props => {
    const [files, setFiles] = createSignal([]);
    const [isProcessing, setIsProcessing] = createSignal(false);
    const [progress, setProgress] = createSignal({
        total: 0,
        completed: 0,
        processing: 0,
        errors: 0,
        percentage: 0,
    });
    const [selectedGenerator, setSelectedGenerator] = createSignal("jtp2");
    const [availableGenerators, setAvailableGenerators] = createSignal([]);
    const [showResults, setShowResults] = createSignal(false);
    const [batchConfig, setBatchConfig] = createSignal({
        maxConcurrent: 4,
        force: false,
        postProcess: true,
    });
    // Initialize available generators
    createEffect(async () => {
        try {
            const generators = await props.manager.getAvailableGenerators();
            setAvailableGenerators(Object.keys(generators));
        }
        catch (error) {
            console.error("Failed to load available generators:", error);
        }
    });
    // Add files to batch
    const addFiles = (newFiles) => {
        const batchFiles = newFiles.map(file => ({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            path: file.name,
            generatorName: selectedGenerator(),
            config: {},
            force: batchConfig().force,
            postProcess: batchConfig().postProcess,
            status: "pending",
        }));
        setFiles(prev => [...prev, ...batchFiles]);
        updateProgress();
    };
    // Remove file from batch
    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        updateProgress();
    };
    // Update file configuration
    const updateFileConfig = (fileId, updates) => {
        setFiles(prev => prev.map(f => (f.id === fileId ? { ...f, ...updates } : f)));
    };
    // Update progress calculation
    const updateProgress = () => {
        const fileList = files();
        const total = fileList.length;
        const completed = fileList.filter(f => f.status === "completed").length;
        const processing = fileList.filter(f => f.status === "processing").length;
        const errors = fileList.filter(f => f.status === "error").length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        setProgress({
            total,
            completed,
            processing,
            errors,
            percentage,
        });
    };
    // Process batch
    const processBatch = async () => {
        const fileList = files();
        if (fileList.length === 0)
            return;
        setIsProcessing(true);
        setShowResults(false);
        try {
            // Reset all file statuses
            setFiles(prev => prev.map(f => ({ ...f, status: "pending" })));
            // Create tasks for batch processing
            const tasks = fileList.map(file => ({
                imagePath: file.path,
                generatorName: file.generatorName,
                config: file.config || {},
                force: file.force || false,
                postProcess: file.postProcess !== false,
            }));
            // Progress callback for real-time updates
            const progressCallback = (progressData) => {
                // Update overall progress
                setProgress({
                    total: progressData.total,
                    completed: progressData.completed,
                    processing: progressData.total - progressData.completed - progressData.failed,
                    errors: progressData.failed,
                    percentage: progressData.progress,
                    currentFile: progressData.current,
                    estimatedTimeRemaining: progressData.estimatedTimeRemaining,
                });
                updateProgress();
            };
            // Process batch with progress tracking
            const results = await props.manager.getService().generateBatchCaptions(tasks, progressCallback);
            // Update final results
            setFiles(prev => prev.map((file, index) => ({
                ...file,
                status: results[index]?.success ? "completed" : "error",
                result: results[index],
                error: results[index]?.error,
            })));
            setShowResults(true);
            props.onComplete?.(results);
        }
        catch (error) {
            console.error("Batch processing failed:", error);
            props.onError?.(error);
        }
        finally {
            setIsProcessing(false);
            updateProgress();
        }
    };
    // Clear batch
    const clearBatch = () => {
        setFiles([]);
        setShowResults(false);
        setProgress({
            total: 0,
            completed: 0,
            processing: 0,
            errors: 0,
            percentage: 0,
        });
    };
    // Export results
    const exportResults = () => {
        const completedFiles = files().filter(f => f.status === "completed" && f.result);
        const exportData = completedFiles.map(file => ({
            filename: file.file.name,
            generator: file.generatorName,
            caption: file.result?.caption,
            processingTime: file.result?.processingTime,
            captionType: file.result?.captionType,
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `batch-captions-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (<div class={`batch-caption-processor ${props.class || ""}`}>
      {/* Header */}
      <div class="batch-header">
        <h3>Batch Caption Processing</h3>
        <div class="batch-stats">
          <span class="stat">Total: {progress().total}</span>
          <span class="stat">Completed: {progress().completed}</span>
          <span class="stat">Processing: {progress().processing}</span>
          <span class="stat error">Errors: {progress().errors}</span>
        </div>
      </div>

      {/* Configuration Panel */}
      <BatchConfiguration selectedGenerator={selectedGenerator()} availableGenerators={availableGenerators()} maxConcurrent={batchConfig().maxConcurrent} force={batchConfig().force} postProcess={batchConfig().postProcess} disabled={isProcessing()} onGeneratorChange={setSelectedGenerator} onMaxConcurrentChange={value => setBatchConfig(prev => ({ ...prev, maxConcurrent: value }))} onForceChange={force => setBatchConfig(prev => ({ ...prev, force }))} onPostProcessChange={postProcess => setBatchConfig(prev => ({ ...prev, postProcess }))}/>

      {/* File Upload Area */}
      <BatchFileUpload onFilesAdded={addFiles} disabled={isProcessing()}/>

      {/* Progress Bar */}
      <BatchProgressComponent total={progress().total} completed={progress().completed} processing={progress().processing} errors={progress().errors} percentage={progress().percentage}/>

      {/* File List */}
      {files().length > 0 && (<BatchFileList files={files()} availableGenerators={availableGenerators()} isProcessing={isProcessing()} onRemoveFile={removeFile} onUpdateFileConfig={updateFileConfig} onProcessBatch={processBatch} onClearBatch={clearBatch}/>)}

      {/* Results Section */}
      <BatchResults files={files()} showResults={showResults()} onExportResults={exportResults}/>
    </div>);
};
