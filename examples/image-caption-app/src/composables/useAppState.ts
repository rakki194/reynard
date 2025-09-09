/**
 * Main app state management composable
 */

import { createSignal, type Accessor, type Setter } from "solid-js";
import type { ImageItem, SystemStatistics, BatchProgress } from "../types";

export interface UseAppStateReturn {
  images: Accessor<ImageItem[]>;
  setImages: Setter<ImageItem[]>;
  selectedImage: Accessor<ImageItem | null>;
  setSelectedImage: Setter<ImageItem | null>;
  activeTab: Accessor<string>;
  setActiveTab: Setter<string>;
  isModalOpen: Accessor<boolean>;
  setIsModalOpen: Setter<boolean>;
  selectedModel: Accessor<string>;
  setSelectedModel: Setter<string>;
  systemStats: Accessor<SystemStatistics | null>;
  setSystemStats: Setter<SystemStatistics | null>;
  isGenerating: Accessor<boolean>;
  setIsGenerating: Setter<boolean>;
  batchProgress: Accessor<BatchProgress | null>;
  setBatchProgress: Setter<BatchProgress | null>;
  backendUrl: Accessor<string>;
}

/**
 * Composable for managing main application state
 */
export function useAppState(): UseAppStateReturn {
  const [images, setImages] = createSignal<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = createSignal<ImageItem | null>(
    null,
  );
  const [activeTab, setActiveTab] = createSignal("gallery");
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [selectedModel, setSelectedModel] = createSignal("jtp2");
  const [systemStats, setSystemStats] = createSignal<SystemStatistics | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [batchProgress, setBatchProgress] = createSignal<BatchProgress | null>(
    null,
  );
  const [backendUrl] = createSignal("http://localhost:8000");

  return {
    images,
    setImages,
    selectedImage,
    setSelectedImage,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    selectedModel,
    setSelectedModel,
    systemStats,
    setSystemStats,
    isGenerating,
    setIsGenerating,
    batchProgress,
    setBatchProgress,
    backendUrl,
  };
}
