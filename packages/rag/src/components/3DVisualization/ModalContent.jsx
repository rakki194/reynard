/**
 * Modal Content Component
 *
 * Contains the main content layout for the 3D visualization modal
 */
import { VisualizationControls, VisualizationDisplay, InfoPanel } from "./index";
export const ModalContent = props => {
    const createVisualizationSettings = () => ({
        pointSize: props.params.pointSize(),
        enableHighlighting: props.params.enableHighlighting(),
        showSimilarityPaths: props.params.showSimilarityPaths(),
        showSimilarityRadius: props.params.showSimilarityRadius(),
        radiusThreshold: props.params.radiusThreshold(),
    });
    return (<div class="rag-3d-visualization-container">
      <VisualizationControls reductionMethod={props.params.reductionMethod()} setReductionMethod={props.params.setReductionMethod} settings={createVisualizationSettings()} setPointSize={props.params.setPointSize} setEnableHighlighting={props.params.setEnableHighlighting} setShowSimilarityPaths={props.params.setShowSimilarityPaths} setShowSimilarityRadius={props.params.setShowSimilarityRadius} setRadiusThreshold={props.params.setRadiusThreshold} showParameterControls={props.params.showParameterControls()} setShowParameterControls={props.params.setShowParameterControls} tsneParams={props.params.tsneParams()} setTsneParams={props.params.setTsneParams} umapParams={props.params.umapParams()} setUmapParams={props.params.setUmapParams} pcaParams={props.params.pcaParams()} setPcaParams={props.params.setPcaParams} onRefresh={props.visualizationData.loadEmbeddingData} isLoading={props.visualizationData.isLoading()}/>

      <VisualizationDisplay isLoading={props.visualizationData.isLoading()} error={props.visualizationData.error()} embeddingPoints={props.visualizationData.embeddingPoints()} reductionMethod={props.params.reductionMethod()} searchQuery={props.searchQuery} searchResultsCount={props.searchResults.length} onRetry={props.visualizationData.loadEmbeddingData}/>

      <InfoPanel searchQuery={props.searchQuery} searchResultsCount={props.searchResults.length} reductionMethod={props.params.reductionMethod()} pointsCount={props.visualizationData.embeddingPoints().length}/>
    </div>);
};
