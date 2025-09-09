import { RAGIngestItem, RAGStreamEvent, RAGClientOptions } from "./rag-types";

/**
 * Parses NDJSON chunks from streaming responses
 * Handles both proper JSON and Python dict representations
 */
function parseNdjsonChunk(line: string): RAGStreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // Attempt to sanitize Python dict repr to JSON
    try {
      const sanitized = trimmed
        .replace(/'/g, '"')
        .replace(/\bNone\b/g, "null")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false");
      return JSON.parse(sanitized);
    } catch {
      return { type: "raw", raw: trimmed } as RAGStreamEvent;
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
export function createRAGIngestClient(
  authFetch: RAGClientOptions["authFetch"],
  ingestUrl: string,
) {
  const ingestDocuments = async (
    items: RAGIngestItem[],
    model: string,
    onEvent?: (evt: RAGStreamEvent) => void,
    signal?: globalThis.AbortSignal,
  ): Promise<void> => {
    const res = await authFetch(ingestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, model }),
      signal,
    });

    if (!res.ok) throw new Error(`RAG ingest failed (${res.status})`);
    if (!res.body) return;

    const reader = (res.body as ReadableStream).getReader?.();
    const decoder = new TextDecoder();
    let buf = "";
    if (!reader) return;

    // Read NDJSON
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        const evt = parseNdjsonChunk(line);
        if (evt && onEvent) onEvent(evt);
      }
    }
    if (buf) {
      const evt = parseNdjsonChunk(buf);
      if (evt && onEvent) onEvent(evt);
    }
  };

  return { ingestDocuments };
}
