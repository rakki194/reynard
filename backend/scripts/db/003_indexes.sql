-- HNSW vector indexes for RAG embeddings with cosine distance
-- Idempotent: safe to run multiple times

-- Documents
CREATE INDEX IF NOT EXISTS idx_document_embeddings_hnsw
ON rag_document_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m=16, ef_construction=200);

-- Code
CREATE INDEX IF NOT EXISTS idx_code_embeddings_hnsw
ON rag_code_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m=16, ef_construction=200);

-- Captions
CREATE INDEX IF NOT EXISTS idx_caption_embeddings_hnsw
ON rag_caption_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m=16, ef_construction=200);

-- Images (CLIP)
CREATE INDEX IF NOT EXISTS idx_image_embeddings_hnsw
ON rag_image_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m=16, ef_construction=200);
