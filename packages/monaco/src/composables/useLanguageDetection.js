import { createSignal, createMemo } from "solid-js";
import { languageDetectionService, } from "../services/LanguageDetectionService";
export function useLanguageDetection() {
    const [detectedNaturalLanguage, setDetectedNaturalLanguage] = createSignal("unknown");
    const [confidence, setConfidence] = createSignal(0);
    const [error, setError] = createSignal(null);
    const [isDetecting, setIsDetecting] = createSignal(false);
    const isNaturalLanguageDetectionAvailable = createMemo(() => languageDetectionService.isNaturalLanguageDetectionAvailable());
    const isProgrammingLanguageDetectionAvailable = createMemo(() => languageDetectionService.isProgrammingLanguageDetectionAvailable());
    const isLoading = createMemo(() => languageDetectionService.isLoading() || isDetecting());
    const detectNaturalLanguage = async (text) => {
        if (!isNaturalLanguageDetectionAvailable()) {
            setDetectedNaturalLanguage("unknown");
            setConfidence(0);
            setError("Natural language detection service not available");
            return;
        }
        setIsDetecting(true);
        setError(null);
        try {
            const result = await languageDetectionService.detectNaturalLanguage(text);
            if (result.success) {
                setDetectedNaturalLanguage(result.naturalLanguage);
                setConfidence(result.confidence);
                setError(null);
            }
            else {
                setDetectedNaturalLanguage("unknown");
                setConfidence(0);
                setError(result.error || "Natural language detection failed");
            }
        }
        catch (err) {
            setDetectedNaturalLanguage("unknown");
            setConfidence(0);
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        }
        finally {
            setIsDetecting(false);
        }
    };
    const detectProgrammingLanguageFromFile = (fileName) => {
        return languageDetectionService.detectProgrammingLanguageFromFile(fileName);
    };
    return {
        isNaturalLanguageDetectionAvailable,
        isProgrammingLanguageDetectionAvailable,
        isLoading,
        detectedNaturalLanguage,
        confidence,
        error,
        detectNaturalLanguage,
        detectProgrammingLanguageFromFile,
    };
}
