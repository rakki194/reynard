/**
 * useScrapingConfig Composable
 * Manages scraping configuration
 */
import { createEffect, createSignal } from "solid-js";
export function useScrapingConfig(options = {}) {
    const { autoSave = true, saveDelay = 1000 } = options;
    const [configs, setConfigs] = createSignal({});
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    let saveTimeout = null;
    const getConfig = (type) => {
        return configs()[type];
    };
    const updateConfig = async (type, config) => {
        try {
            setConfigs(prev => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    ...config,
                },
            }));
            if (autoSave) {
                if (saveTimeout) {
                    clearTimeout(saveTimeout);
                }
                saveTimeout = setTimeout(saveConfigs, saveDelay);
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    const resetConfig = async (type) => {
        try {
            const response = await fetch(`/api/scraping/configs/${type}/reset`, {
                method: "POST",
            });
            const result = await response.json();
            if (result.success && result.data) {
                setConfigs(prev => ({
                    ...prev,
                    [type]: result.data,
                }));
            }
            else {
                throw new Error(result.error || "Failed to reset config");
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    const saveConfigs = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("/api/scraping/configs", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(configs()),
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || "Failed to save configs");
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadConfigs = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("/api/scraping/configs");
            const result = await response.json();
            if (result.success && result.data) {
                setConfigs(result.data);
            }
            else {
                setError(result.error || "Failed to load configs");
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        }
        finally {
            setIsLoading(false);
        }
    };
    createEffect(() => {
        loadConfigs();
    });
    return {
        configs: configs(),
        isLoading,
        error,
        getConfig,
        updateConfig,
        resetConfig,
        saveConfigs,
        loadConfigs,
    };
}
