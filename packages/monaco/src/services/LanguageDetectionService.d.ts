import type { NaturalLanguageDetectionResult } from "../types";
export type { NaturalLanguageDetectionResult };
/**
 * Language detection service for both natural and programming languages
 */
export declare class LanguageDetectionService {
    private isNaturalLanguageDetectionAvailableFlag;
    private isProgrammingLanguageDetectionAvailableFlag;
    private isLoadingFlag;
    constructor();
    private initialize;
    /**
     * Check if natural language detection is available
     */
    isNaturalLanguageDetectionAvailable(): boolean;
    /**
     * Check if programming language detection is available
     */
    isProgrammingLanguageDetectionAvailable(): boolean;
    /**
     * Check if the service is currently loading
     */
    isLoading(): boolean;
    /**
     * Detect natural language from text content
     */
    detectNaturalLanguage(text: string): Promise<NaturalLanguageDetectionResult>;
    /**
     * Detect programming language from file name/extension
     */
    detectProgrammingLanguageFromFile(fileName: string): string;
    /**
     * Simple heuristic-based natural language detection
     */
    private heuristicLanguageDetection;
}
export declare const languageDetectionService: LanguageDetectionService;
