-- RAG embeddings schema
-- Idempotent: safe to run multiple times

-- Documents table
CREATE TABLE IF NOT EXISTS rag_documents (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document chunks table
CREATE TABLE IF NOT EXISTS rag_document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    text TEXT NOT NULL,
    tokens INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document embeddings table
CREATE TABLE IF NOT EXISTS rag_document_embeddings (
    id SERIAL PRIMARY KEY,
    chunk_id INTEGER REFERENCES rag_document_chunks(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    dim INTEGER NOT NULL,
    embedding VECTOR(768),  -- Default to 768 dimensions for embeddinggemma
    metric TEXT DEFAULT 'cosine',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code embeddings table
CREATE TABLE IF NOT EXISTS rag_code_embeddings (
    id SERIAL PRIMARY KEY,
    chunk_id INTEGER REFERENCES rag_document_chunks(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    dim INTEGER NOT NULL,
    embedding VECTOR(768),
    metric TEXT DEFAULT 'cosine',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Caption embeddings table
CREATE TABLE IF NOT EXISTS rag_caption_embeddings (
    id SERIAL PRIMARY KEY,
    chunk_id INTEGER REFERENCES rag_document_chunks(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    dim INTEGER NOT NULL,
    embedding VECTOR(768),
    metric TEXT DEFAULT 'cosine',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Image embeddings table (CLIP)
CREATE TABLE IF NOT EXISTS rag_image_embeddings (
    id SERIAL PRIMARY KEY,
    image_path TEXT NOT NULL,
    model_id TEXT NOT NULL,
    dim INTEGER NOT NULL,
    embedding VECTOR(768),  -- CLIP typically uses 768 dimensions
    metric TEXT DEFAULT 'cosine',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rag_documents_source ON rag_documents(source);
CREATE INDEX IF NOT EXISTS idx_rag_document_chunks_document_id ON rag_document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_rag_document_chunks_chunk_index ON rag_document_chunks(chunk_index);
CREATE INDEX IF NOT EXISTS idx_rag_document_embeddings_chunk_id ON rag_document_embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS idx_rag_document_embeddings_model_id ON rag_document_embeddings(model_id);
CREATE INDEX IF NOT EXISTS idx_rag_code_embeddings_chunk_id ON rag_code_embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS idx_rag_code_embeddings_model_id ON rag_code_embeddings(model_id);
CREATE INDEX IF NOT EXISTS idx_rag_caption_embeddings_chunk_id ON rag_caption_embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS idx_rag_caption_embeddings_model_id ON rag_caption_embeddings(model_id);
CREATE INDEX IF NOT EXISTS idx_rag_image_embeddings_image_path ON rag_image_embeddings(image_path);
CREATE INDEX IF NOT EXISTS idx_rag_image_embeddings_model_id ON rag_image_embeddings(model_id);
