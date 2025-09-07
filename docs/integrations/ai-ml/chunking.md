# Chunking Utilities

This module provides content chunkers for RAG ingestion across documents, code, and captions. The design emphasizes semantic boundaries, approximate but stable token sizing, lightweight heuristics that avoid heavyweight tokenizer dependencies, and pragmatic fallbacks when ideal splits are not possible. Chunks carry metadata for downstream retrieval and highlighting.

## Document Chunking

The function `chunk_document(text, target_tokens=1000, min_tokens=800, max_tokens=1200, overlap_ratio=0.12)` splits text using markdown‑style headings first and then sentences within each block. It estimates token count using a blended heuristic that averages a whitespace word count with a character‑based approximation at roughly one token per four characters. Windows are built to target the specified token size, with overlap computed as a fraction of the target and clamped to approximately 10–15% of the window. If semantic grouping cannot reach the minimum or would exceed the maximum, the algorithm allows a small overshoot when the following unit is compact; otherwise, it falls back to a recursive character windowing strategy with a window size near `max_tokens * 4` characters and proportional overlap. Each chunk includes `text`, an approximate `tokens` count, `metadata` describing whether it was produced semantically or via character fallback, and a `chunk_index` for stable ordering.

In addition to splitting, `split_into_headings_and_sentences(text)` is used internally to segment content by markdown headings and then sentence punctuation boundaries. This preserves semantic coherence for retrieval while avoiding overly small fragments. For result presentation, `build_highlights_for_document(chunk_text, query_terms, max_snippets=3)` can extract sentence‑level highlights that contain query terms.

## Code Chunking

The function `chunk_code(code, language=None, min_loc=150, max_loc=400, overlap_loc=4)` returns a tuple `(chunks, symbol_map)`. It accepts an optional `language` parameter for future language‑aware parsing, but when tree‑sitter is unavailable the implementation falls back to a robust regex strategy that identifies `def`, `class`, and `import` boundaries. Source is flattened to lines and windowed up to `max_loc` lines of code with `overlap_loc` lines of overlap. Very small trailing windows are skipped except for the final segment when necessary. Each chunk includes metadata with `start_line` and `end_line` to support accurate mapping in viewers and tools. The returned `symbol_map` records approximate locations of functions, classes, and imports, enabling code‑aware highlighting and targeted retrieval. For small, symbol‑centric previews, `build_symbol_aware_snippets(code_text, symbol_map, symbol_names, context_lines=2)` can create compact snippets around selected symbols.

## Caption Chunking

The function `chunk_captions(captions, include_summary=True)` produces one chunk per caption, each with a token estimate and `metadata` set to `{ "method": "caption" }`, and assigns a `chunk_index` that matches the caption position. When `include_summary` is enabled and the input is non‑empty, an additional grouped summary chunk is appended by concatenating the first N captions with `metadata` set to `{ "method": "caption_summary", "count": <num> }`. This summary chunk can improve early recall for overview‑style queries.

## Utilities and Supporting Routines

The function `estimate_token_count(text)` provides a lightweight token count estimate by averaging a whitespace word count with a character‑based approximation at roughly one token per four characters. This blended approach improves robustness across languages and writing styles without incurring the cost of heavyweight tokenizer dependencies. The helper `window_slices(total, size, overlap)` computes index pairs that cover a sequence with the requested overlap, clamping overlap to ensure forward progress and making sure the final slice reaches the end. The function `make_idempotency_key(*parts)` computes a SHA‑256 hash over the provided parts with a null byte separator, suitable for deduplication and idempotent upserts.

## Integration and Ingestion Flow

The ingestion orchestrator invokes the document chunker and streams batches to embeddings and storage. For documents, the service splits text via `chunk_document`, persists the document and its chunks with stable indices, and then batches embeddings for the chunk texts before inserting vector rows. Integration follows this pattern: chunk the content, upsert document and chunk metadata to the database, compute vectors using the configured embedding model, and perform batched insert of embeddings. Similar patterns are used for image caption or code ingestion pipelines as they evolve, with symbol maps and metadata enabling code‑aware viewers and targeted retrieval.

## Defaults, Tuning, and Trade‑offs

Default parameters balance semantic coherence, retrieval recall, and embedding cost for common LLM context windows. For prose, targeting around one thousand tokens with roughly a tenth overlap preserves continuity across sections while avoiding unnecessary duplication. For source code, windows of roughly one to four hundred lines with a few lines of overlap perform well across many repositories, keeping symbol maps aligned and metadata stable. Increase overlap to improve cross‑chunk recall at the cost of more storage and slightly higher embedding compute. Decrease window sizes for smaller context models, latency‑sensitive applications, or when documents contain many short sections; increase sizes when queries require broader context or when using long‑context embedding models. The token estimator is intentionally approximate to maintain speed and portability.

## Notes on Best Practices

Use semantic‑first chunking for documents to preserve headings and sentence boundaries, falling back to character windows only when necessary. Include comments and docstrings within code chunks to retain explanatory context for retrieval. Carry structured metadata such as chunk indices, line ranges, and generation method for robust downstream processing and diagnostics. Prefer small, stable overlaps that reflect the structure of your data; excessive overlap can degrade retrieval precision and increase cost without proportional recall gains. The approach here aligns with common patterns such as recursive character or markdown splitting and language‑aware (or symbol‑aware) code segmentation widely used in RAG systems.

## Parameter Guidance and Sizing Rationale

Chunk sizes and overlap are chosen to balance semantic cohesion, retrieval recall, and embedding cost. For prose, targeting around one thousand tokens generally preserves paragraph continuity and section context while avoiding excessive duplication. The overlap is computed as a fraction of the target window and clamped to roughly a tenth to a seventh of the window to maintain continuity across adjacent chunks without degrading precision. For code, windows of one to four hundred lines work well across mixed repositories because they keep functions, classes, and related imports within the same view while remaining small enough for relevance scoring and paging in the UI. The small fixed overlap in lines helps preserve context across function boundaries without significantly inflating index size.

Token estimation is approximate by design to avoid heavyweight tokenizer dependencies, using a blended measure of whitespace word count and an approximately four‑characters‑per‑token ratio. This heuristic is stable enough for windowing logic across varied writing styles and languages and is intentionally conservative to prevent frequent oscillations between minimum and maximum thresholds.

For multilingual content, the blended estimator mitigates cases where character‑based heuristics alone would over‑ or under‑estimate tokens for scripts with different word boundary behavior. If highly precise budgeting is required for a specific model, the estimator can be swapped for a model‑aware tokenizer while preserving the same external function signatures described here.

For long‑context embedding models, increasing the window bounds and keeping a similar proportional overlap can improve early recall for queries that reference multi‑section narratives. For latency‑sensitive applications or smaller index budgets, trimming the target and tightening overlap reduces storage and compute at a modest cost to cross‑chunk recall.

## Code Chunking Details

The code path prefers language‑aware parsing when available but falls back to a robust regular‑expression strategy that identifies functions, classes, and import statements. Source is flattened into a single list of lines and windowed by line count. Very small trailing windows are skipped unless needed to include the final lines of a file to avoid low‑signal tail fragments. The symbol map is intentionally simple, recording naive names and line numbers so higher‑level systems can produce lightweight, context‑aware highlights or navigate to approximate definitions. When a tree‑sitter parser is available, the splitting function is designed to be swapped in without changing the public interface or downstream integrations.

## Caption Chunking and Summaries

Captions are chunked per item to retain their per‑image semantics. An optional summary chunk concatenates the first set of captions to improve early recall for overview queries such as “what’s in this album.” This grouped summary is marked distinctly in metadata so retrieval layers can prefer or down‑rank it depending on the use case. The summary position at the end preserves stable indices for per‑caption chunks.

## Integration Notes

The ingestion pipeline uses these chunkers directly. Documents are split via the document chunker and stored with stable indices, after which texts are embedded in batches and inserted with associated model identifiers and vector dimensions. The background indexing service streams progress and handles retries with exponential backoff, keeping an internal queue and dead‑letter path for failures. For synchronous ingestion, the RAG service accepts precomputed chunks, embeds them in order to preserve alignment with chunk indices, and upserts vectors with the recorded model and metric. These flows ensure determinism, idempotency via stable keys, and ordered embedding to match chunk ordering.

## Examples

Basic document usage creates semantically coherent chunks that target the configured token range and include a small overlap. Code usage returns chunks and a symbol map suitable for simple highlight generation.

```python
from app.managers import chunking as ch

text = """
# Title

This is an example document. It has multiple sentences. It also has headings.

## Section

More content here. Another sentence follows. And one more to reach the window.
"""

chunks = ch.chunk_document(text)
for c in chunks:
    print(c["metadata"], c["tokens"], len(c["text"]))

code = """
import os

def foo(x):
    return x + 1

class Bar:
    def baz(self, y):
        return y * 2
"""

code_chunks, symbol_map = ch.chunk_code(code, language="python")
print(symbol_map)
```

To construct small, context‑aware previews around selected symbols, use the symbol‑aware snippet builder. This yields narrow windows around target names with a few lines of context.

```python
snips = ch.build_symbol_aware_snippets(code, symbol_map, ["foo", "baz"], context_lines=1)
for s in snips:
    print("---\n" + s)
```

For caption collections, enable the grouped summary when overview queries are common; disable it for strict per‑item indexing when summaries would skew retrieval toward aggregated content.

```python
caps = ["a cat on a mat", "a dog in a fog", "a bird on a wire"]
cap_chunks = ch.chunk_captions(caps, include_summary=True)
```

## Evaluation and Tuning

Evaluate chunking quality by measuring retrieval recall and result coherence for representative queries. Increasing overlap can improve cross‑chunk recall at the expense of larger indexes and slightly higher embedding compute. Decreasing window sizes may reduce latency and storage but can fragment context if taken too far. For code, prefer preserving complete function or class bodies within individual windows where feasible; when not possible, ensure the overlap straddles boundaries where definitions span windows. For multilingual documents, validate that sentence segmentation remains coherent for your languages of interest and consider refining the sentence regex if specific punctuation rules dominate your corpus.

## References and Background

Common patterns in retrieval‑augmented systems include recursive character and markdown splitting and symbol‑aware code segmentation. Practical guidance on chunk sizes and overlaps is available in community resources and vector database vendor material such as Pinecone’s discussion of chunking strategies, and frameworks like LangChain document the RecursiveCharacterTextSplitter and Markdown‑aware splitters. Heuristics for token budgeting using approximately four characters per token are widely cited in tokenizer discussions and provide a portable baseline when model‑specific tokenizers are not available.

Files:

- `app/managers/chunking.py`
- `app/tests/test_chunking.py`
