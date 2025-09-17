/**
 * Search History Utility Functions
 *
 * Utility functions for formatting, colors, and icons in search history.
 */
import type { RAGModality } from "../types";
export declare const getIcon: (name: string) => any;
export declare const formatTimestamp: (timestamp: Date) => string;
export declare const getModalityIcon: (modality: RAGModality) => any;
export declare const getModalityColor: (modality: RAGModality) => string;
export declare const getScoreColor: (score: number) => string;
