import { createSignal, createMemo } from "solid-js";
import { languageDetectionService, type NaturalLanguageDetectionResult } from "../services/LanguageDetectionService";
import type { UseLanguageDetectionReturn } from "../types";

export function useLanguageDetection(): UseLanguageDetectionReturn {
  const [detectedNaturalLanguage, setDetectedNaturalLanguage] = createSignal<string>("unknown");
  const [confidence, setConfidence] = createSignal<number>(0);
  const [error, setError] = createSignal<string | null>(null);
  const [isDetecting, setIsDetecting] = createSignal<boolean>(false);

  const isNaturalLanguageDetectionAvailable = createMemo(() =>
    languageDetectionService.isNaturalLanguageDetectionAvailable()
  );
  const isProgrammingLanguageDetectionAvailable = createMemo(() =>
    languageDetectionService.isProgrammingLanguageDetectionAvailable()
  );
  const isLoading = createMemo(() => languageDetectionService.isLoading() || isDetecting());

  const detectNaturalLanguage = async (text: string): Promise<void> => {
    if (!isNaturalLanguageDetectionAvailable()) {
      setDetectedNaturalLanguage("unknown");
      setConfidence(0);
      setError("Natural language detection service not available");
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      const result: NaturalLanguageDetectionResult = await languageDetectionService.detectNaturalLanguage(text);

      if (result.success) {
        setDetectedNaturalLanguage(result.naturalLanguage);
        setConfidence(result.confidence);
        setError(null);
      } else {
        setDetectedNaturalLanguage("unknown");
        setConfidence(0);
        setError(result.error || "Natural language detection failed");
      }
    } catch (err) {
      setDetectedNaturalLanguage("unknown");
      setConfidence(0);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsDetecting(false);
    }
  };

  const detectProgrammingLanguageFromFile = (fileName: string): string => {
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
