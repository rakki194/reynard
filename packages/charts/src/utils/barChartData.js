/**
 * Bar Chart Data Processing Utilities
 * Handles data validation and processing for bar charts
 */
import { prepareDatasets, validateChartData } from "./index";
export const processBarChartData = (options) => {
    if (!options.labels || !options.datasets) {
        return null;
    }
    if (!validateChartData(options.datasets, options.labels)) {
        return null;
    }
    const processedDatasets = prepareDatasets(options.datasets);
    return {
        labels: options.labels,
        datasets: processedDatasets,
    };
};
