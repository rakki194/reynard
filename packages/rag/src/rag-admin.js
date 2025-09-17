/**
 * Creates a RAG admin client for administrative operations
 *
 * @param authFetch Authenticated fetch function
 * @param adminUrl Admin endpoint URL
 * @param metricsUrl Metrics endpoint URL
 * @returns Admin client with operational capabilities
 */
export function createRAGAdminClient(authFetch, adminUrl, metricsUrl) {
    const getIndexingStatus = async () => {
        const res = await authFetch(`${adminUrl}/status`);
        if (!res.ok)
            throw new Error(`Failed to get indexing status (${res.status})`);
        return await res.json();
    };
    const getMetrics = async () => {
        const res = await authFetch(metricsUrl);
        if (!res.ok)
            throw new Error(`Failed to get metrics (${res.status})`);
        return await res.json();
    };
    const admin = {
        pause: async () => {
            const res = await authFetch(`${adminUrl}/pause`, { method: "POST" });
            if (!res.ok)
                throw new Error("Pause failed");
            return res.json();
        },
        resume: async () => {
            const res = await authFetch(`${adminUrl}/resume`, { method: "POST" });
            if (!res.ok)
                throw new Error("Resume failed");
            return res.json();
        },
        drain: async () => {
            const res = await authFetch(`${adminUrl}/drain`, { method: "POST" });
            if (!res.ok)
                throw new Error("Drain failed");
            return res.json();
        },
        clearAllData: async () => {
            const res = await authFetch(`${adminUrl}/clear-all-data`, {
                method: "POST",
            });
            if (!res.ok)
                throw new Error("Clear all data failed");
            return res.json();
        },
        status: async () => {
            const res = await authFetch(`${adminUrl}/status`, { method: "GET" });
            if (!res.ok)
                throw new Error("Status failed");
            return res.json();
        },
        deadLetter: async () => {
            const res = await authFetch(`${adminUrl}/dead_letter`, { method: "GET" });
            if (!res.ok)
                throw new Error("Dead-letter failed");
            return res.json();
        },
        requeueDeadLetter: async () => {
            const res = await authFetch(`${adminUrl}/dead_letter/requeue`, {
                method: "POST",
            });
            if (!res.ok)
                throw new Error("Requeue failed");
            return res.json();
        },
    };
    return { admin, getIndexingStatus, getMetrics };
}
