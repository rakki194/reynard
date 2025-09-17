/**
 * Parses NDJSON chunks from streaming responses
 * Handles both proper JSON and Python dict representations
 */
function parseNdjsonChunk(line) {
    const trimmed = line.trim();
    if (!trimmed)
        return null;
    try {
        return JSON.parse(trimmed);
    }
    catch {
        // Attempt to sanitize Python dict repr to JSON
        try {
            const sanitized = trimmed
                .replace(/'/g, '"')
                .replace(/\bNone\b/g, "null")
                .replace(/\bTrue\b/g, "true")
                .replace(/\bFalse\b/g, "false");
            return JSON.parse(sanitized);
        }
        catch {
            return { type: "raw", raw: trimmed };
        }
    }
}
/**
 * Creates a RAG ingest client for document ingestion
 *
 * @param authFetch Authenticated fetch function
 * @param ingestUrl Ingest endpoint URL
 * @returns Ingest client with document processing capabilities
 */
export function createRAGIngestClient(authFetch, ingestUrl) {
    const ingestDocuments = async (items, model, onEvent, signal) => {
        const res = await authFetch(ingestUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items, model }),
            signal,
        });
        if (!res.ok)
            throw new Error(`RAG ingest failed (${res.status})`);
        if (!res.body)
            return;
        const reader = res.body.getReader?.();
        const decoder = new TextDecoder();
        let buf = "";
        if (!reader)
            return;
        // Read NDJSON
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buf += decoder.decode(value, { stream: true });
            let idx;
            while ((idx = buf.indexOf("\n")) >= 0) {
                const line = buf.slice(0, idx);
                buf = buf.slice(idx + 1);
                const evt = parseNdjsonChunk(line);
                if (evt && onEvent)
                    onEvent(evt);
            }
        }
        if (buf) {
            const evt = parseNdjsonChunk(buf);
            if (evt && onEvent)
                onEvent(evt);
        }
    };
    return { ingestDocuments };
}
