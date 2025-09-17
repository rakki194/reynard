/**
 * RAG Search Event Handlers Composable
 *
 * Manages event handlers for the RAG search component
 * following Reynard composable conventions.
 */
export function useRAGSearchHandlers(config) {
    const handleSearch = () => {
        config.search();
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
    };
    const handleResultClick = (result) => {
        config.onResultClick?.(result);
    };
    const handleFileSelect = (e) => {
        const target = e.target;
        const file = target.files?.[0];
        if (file) {
            config.uploadFile(file, config.apiBaseUrl || "http://localhost:8000", config.onDocumentUpload);
        }
    };
    return {
        handleSearch,
        handleKeyPress,
        handleResultClick,
        handleFileSelect,
    };
}
