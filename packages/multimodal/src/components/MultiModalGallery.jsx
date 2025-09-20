/**
 * Multi-Modal Gallery Component for Reynard Caption System
 *
 * Orchestrates multi-modal file handling and display using
 * modular components and utilities.
 */
import { useFileHandling } from "../composables/useFileHandling";
import { useFileUpload } from "../composables/useFileUpload";
import { MultiModalGalleryView } from "./MultiModalGalleryView";
export const MultiModalGallery = props => {
    // Use composables for state management
    const { setFiles, selectedFile, setSelectedFile, currentView, setCurrentView, filterType, setFilterType, filteredFiles, fileCounts, handleFileSelect, handleFileRemove, handleFileModify, } = useFileHandling(props.initialFiles || [], props.defaultView || "grid", props.onFileSelect, props.onFileRemove, props.onFileModify);
    const { isLoading, error, handleFileUpload } = useFileUpload();
    // Handle file upload with max files
    const handleFileUploadWithMax = (event) => {
        handleFileUpload(event, setFiles, props.maxFiles);
    };
    return (<MultiModalGalleryView class={props.class} fileCounts={fileCounts()} filterType={filterType()} onFilterChange={setFilterType} currentView={currentView()} onViewChange={setCurrentView} onFileUpload={handleFileUploadWithMax} isLoading={isLoading()} error={error()} filteredFiles={filteredFiles()} selectedFile={selectedFile()} onFileSelect={handleFileSelect} onFileRemove={handleFileRemove} onFileModify={handleFileModify} onCloseDetail={() => setSelectedFile(null)} showMetadata={props.showMetadata} editable={props.editable}/>);
};
