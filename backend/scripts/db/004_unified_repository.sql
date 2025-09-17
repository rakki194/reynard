-- Unified Repository Database Schema
-- Implements best practices for multimodal dataset management
-- Based on 2024-2025 research on unified repositories and vector databases

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text similarity
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes

-- ============================================================================
-- Core Dataset Management Tables
-- ============================================================================

-- Datasets table - central registry for all datasets
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'processing', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,

    -- Statistics (computed fields)
    total_files INTEGER DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    file_type_counts JSONB DEFAULT '{}',
    modality_counts JSONB DEFAULT '{}',
    last_ingested TIMESTAMPTZ,

    -- Constraints
    UNIQUE(name, version)
);

-- Dataset versions for lineage tracking
CREATE TABLE IF NOT EXISTS dataset_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    changes JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    parent_version VARCHAR(50),
    tags TEXT[] DEFAULT '{}',

    UNIQUE(dataset_id, version)
);

-- Dataset dependencies for lineage
CREATE TABLE IF NOT EXISTS dataset_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    depends_on_dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    depends_on_version VARCHAR(50),
    dependency_type VARCHAR(20) NOT NULL CHECK (dependency_type IN ('source', 'derived', 'reference')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(dataset_id, depends_on_dataset_id, depends_on_version)
);

-- ============================================================================
-- Unified File Registry
-- ============================================================================

-- Files table - unified registry for all file types
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    modality VARCHAR(20) NOT NULL CHECK (modality IN ('text', 'image', 'audio', 'video', 'data', 'code', 'document')),
    size BIGINT NOT NULL,
    hash VARCHAR(64) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- File-specific metadata
    title VARCHAR(500),
    description TEXT,
    author VARCHAR(255),
    language VARCHAR(10),
    encoding VARCHAR(50),

    -- Media-specific metadata
    dimensions JSONB, -- {width, height} for images/videos
    duration DECIMAL(10,3), -- for audio/video in seconds
    bitrate INTEGER, -- for audio/video
    sample_rate INTEGER, -- for audio

    -- Data-specific metadata
    schema_info JSONB, -- for parquet, CSV, etc.
    row_count BIGINT, -- for structured data
    column_count INTEGER, -- for structured data

    -- Document-specific metadata
    page_count INTEGER, -- for PDFs, documents
    word_count INTEGER, -- for text documents

    -- Technical metadata
    last_modified TIMESTAMPTZ,
    checksum VARCHAR(64),

    -- Custom metadata
    custom_metadata JSONB DEFAULT '{}',

    UNIQUE(dataset_id, path)
);

-- ============================================================================
-- Multimodal Embeddings
-- ============================================================================

-- Universal embeddings table for all modalities
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    modality VARCHAR(20) NOT NULL CHECK (modality IN ('text', 'image', 'audio', 'video', 'data', 'multimodal')),
    model_id VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    dimensions INTEGER NOT NULL,
    embedding VECTOR(1536) NOT NULL, -- Default to 1536 dimensions (OpenAI compatible)
    quality_score DECIMAL(3,2) DEFAULT 0.0 CHECK (quality_score >= 0.0 AND quality_score <= 1.0),
    processing_time DECIMAL(10,6), -- in seconds
    parameters JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure one embedding per file per model
    UNIQUE(file_id, modality, model_id)
);

-- ============================================================================
-- Data Schema Management
-- ============================================================================

-- Data schemas for structured data files
CREATE TABLE IF NOT EXISTS data_schemas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    schema_name VARCHAR(255),
    schema_version VARCHAR(50) DEFAULT '1.0.0',
    columns JSONB NOT NULL DEFAULT '[]',
    primary_key TEXT[],
    indexes JSONB DEFAULT '[]',
    constraints JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(file_id, schema_name, schema_version)
);

-- Column statistics for data files
CREATE TABLE IF NOT EXISTS column_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schema_id UUID NOT NULL REFERENCES data_schemas(id) ON DELETE CASCADE,
    column_name VARCHAR(255) NOT NULL,
    column_type VARCHAR(100) NOT NULL,
    nullable BOOLEAN NOT NULL DEFAULT true,
    min_value JSONB,
    max_value JSONB,
    mean_value DECIMAL(20,10),
    median_value DECIMAL(20,10),
    std_dev DECIMAL(20,10),
    null_count BIGINT DEFAULT 0,
    distinct_count BIGINT DEFAULT 0,
    top_values JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(schema_id, column_name)
);

-- ============================================================================
-- Search and Indexing
-- ============================================================================

-- Search history for analytics
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    query TEXT NOT NULL,
    modalities TEXT[],
    file_types TEXT[],
    filters JSONB DEFAULT '{}',
    results_count INTEGER NOT NULL,
    response_time DECIMAL(10,6), -- in seconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Search analytics
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_searches INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    avg_response_time DECIMAL(10,6),
    top_queries JSONB DEFAULT '[]',
    modality_usage JSONB DEFAULT '{}',
    file_type_usage JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(date)
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================

-- Dataset indexes
CREATE INDEX IF NOT EXISTS idx_datasets_name ON datasets(name);
CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status);
CREATE INDEX IF NOT EXISTS idx_datasets_created_by ON datasets(created_by);
CREATE INDEX IF NOT EXISTS idx_datasets_tags ON datasets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_datasets_metadata ON datasets USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at);

-- File indexes
CREATE INDEX IF NOT EXISTS idx_files_dataset_id ON files(dataset_id);
CREATE INDEX IF NOT EXISTS idx_files_file_type ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_modality ON files(modality);
CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
CREATE INDEX IF NOT EXISTS idx_files_hash ON files(hash);
CREATE INDEX IF NOT EXISTS idx_files_size ON files(size);
CREATE INDEX IF NOT EXISTS idx_files_metadata ON files USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_files_custom_metadata ON files USING GIN(custom_metadata);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);

-- Embedding indexes
CREATE INDEX IF NOT EXISTS idx_embeddings_file_id ON embeddings(file_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_modality ON embeddings(modality);
CREATE INDEX IF NOT EXISTS idx_embeddings_model_id ON embeddings(model_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_quality ON embeddings(quality_score);

-- HNSW vector indexes for similarity search
CREATE INDEX IF NOT EXISTS idx_embeddings_text_hnsw
ON embeddings USING hnsw (embedding vector_cosine_ops)
WHERE modality = 'text'
WITH (m=16, ef_construction=200);

CREATE INDEX IF NOT EXISTS idx_embeddings_image_hnsw
ON embeddings USING hnsw (embedding vector_cosine_ops)
WHERE modality = 'image'
WITH (m=16, ef_construction=200);

CREATE INDEX IF NOT EXISTS idx_embeddings_audio_hnsw
ON embeddings USING hnsw (embedding vector_cosine_ops)
WHERE modality = 'audio'
WITH (m=16, ef_construction=200);

CREATE INDEX IF NOT EXISTS idx_embeddings_data_hnsw
ON embeddings USING hnsw (embedding vector_cosine_ops)
WHERE modality = 'data'
WITH (m=16, ef_construction=200);

CREATE INDEX IF NOT EXISTS idx_embeddings_multimodal_hnsw
ON embeddings USING hnsw (embedding vector_cosine_ops)
WHERE modality = 'multimodal'
WITH (m=16, ef_construction=200);

-- Search history indexes
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history USING GIN(query gin_trgm_ops);

-- ============================================================================
-- Triggers for Automatic Updates
-- ============================================================================

-- Update dataset statistics when files change
CREATE OR REPLACE FUNCTION update_dataset_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE datasets SET
            total_files = (
                SELECT COUNT(*) FROM files WHERE dataset_id = NEW.dataset_id
            ),
            total_size = (
                SELECT COALESCE(SUM(size), 0) FROM files WHERE dataset_id = NEW.dataset_id
            ),
            file_type_counts = (
                SELECT jsonb_object_agg(file_type, count)
                FROM (
                    SELECT file_type, COUNT(*) as count
                    FROM files WHERE dataset_id = NEW.dataset_id
                    GROUP BY file_type
                ) t
            ),
            modality_counts = (
                SELECT jsonb_object_agg(modality, count)
                FROM (
                    SELECT modality, COUNT(*) as count
                    FROM files WHERE dataset_id = NEW.dataset_id
                    GROUP BY modality
                ) t
            ),
            last_ingested = NOW(),
            updated_at = NOW()
        WHERE id = NEW.dataset_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE datasets SET
            total_files = (
                SELECT COUNT(*) FROM files WHERE dataset_id = OLD.dataset_id
            ),
            total_size = (
                SELECT COALESCE(SUM(size), 0) FROM files WHERE dataset_id = OLD.dataset_id
            ),
            file_type_counts = (
                SELECT jsonb_object_agg(file_type, count)
                FROM (
                    SELECT file_type, COUNT(*) as count
                    FROM files WHERE dataset_id = OLD.dataset_id
                    GROUP BY file_type
                ) t
            ),
            modality_counts = (
                SELECT jsonb_object_agg(modality, count)
                FROM (
                    SELECT modality, COUNT(*) as count
                    FROM files WHERE dataset_id = OLD.dataset_id
                    GROUP BY modality
                ) t
            ),
            updated_at = NOW()
        WHERE id = OLD.dataset_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dataset_statistics
    AFTER INSERT OR UPDATE OR DELETE ON files
    FOR EACH ROW EXECUTE FUNCTION update_dataset_statistics();

-- Update file updated_at timestamp
CREATE OR REPLACE FUNCTION update_file_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_file_timestamp
    BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_file_timestamp();

-- ============================================================================
-- Views for Common Queries
-- ============================================================================

-- Dataset overview with file counts
CREATE OR REPLACE VIEW dataset_overview AS
SELECT
    d.id,
    d.name,
    d.description,
    d.version,
    d.status,
    d.tags,
    d.total_files,
    d.total_size,
    d.file_type_counts,
    d.modality_counts,
    d.created_at,
    d.updated_at,
    d.created_by,
    COUNT(f.id) as actual_file_count,
    COALESCE(SUM(f.size), 0) as actual_total_size
FROM datasets d
LEFT JOIN files f ON d.id = f.dataset_id
GROUP BY d.id, d.name, d.description, d.version, d.status, d.tags,
         d.total_files, d.total_size, d.file_type_counts, d.modality_counts,
         d.created_at, d.updated_at, d.created_by;

-- File details with embeddings
CREATE OR REPLACE VIEW file_details AS
SELECT
    f.*,
    d.name as dataset_name,
    d.version as dataset_version,
    COUNT(e.id) as embedding_count,
    array_agg(DISTINCT e.modality) as embedding_modalities,
    array_agg(DISTINCT e.model_id) as embedding_models
FROM files f
JOIN datasets d ON f.dataset_id = d.id
LEFT JOIN embeddings e ON f.id = e.file_id
GROUP BY f.id, f.dataset_id, f.path, f.file_type, f.modality, f.size, f.hash,
         f.mime_type, f.metadata, f.created_at, f.updated_at, f.title, f.description,
         f.author, f.language, f.encoding, f.dimensions, f.duration, f.bitrate,
         f.sample_rate, f.schema_info, f.row_count, f.column_count, f.page_count,
         f.word_count, f.last_modified, f.checksum, f.custom_metadata,
         d.name, d.version;

-- ============================================================================
-- Functions for Common Operations
-- ============================================================================

-- Search files with similarity
CREATE OR REPLACE FUNCTION search_files_similarity(
    query_embedding VECTOR(1536),
    modality_filter VARCHAR(20) DEFAULT NULL,
    similarity_threshold DECIMAL DEFAULT 0.7,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    file_id UUID,
    similarity_score DECIMAL,
    file_path TEXT,
    file_type VARCHAR(50),
    modality VARCHAR(20),
    dataset_name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        1 - (e.embedding <=> query_embedding) as similarity_score,
        f.path,
        f.file_type,
        f.modality,
        d.name
    FROM embeddings e
    JOIN files f ON e.file_id = f.id
    JOIN datasets d ON f.dataset_id = d.id
    WHERE (modality_filter IS NULL OR e.modality = modality_filter)
    AND 1 - (e.embedding <=> query_embedding) >= similarity_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get dataset statistics
CREATE OR REPLACE FUNCTION get_dataset_statistics(dataset_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'dataset_id', d.id,
        'name', d.name,
        'version', d.version,
        'status', d.status,
        'total_files', d.total_files,
        'total_size', d.total_size,
        'file_type_distribution', d.file_type_counts,
        'modality_distribution', d.modality_counts,
        'created_at', d.created_at,
        'updated_at', d.updated_at,
        'last_ingested', d.last_ingested,
        'version_count', (
            SELECT COUNT(*) FROM dataset_versions dv WHERE dv.dataset_id = d.id
        ),
        'dependency_count', (
            SELECT COUNT(*) FROM dataset_dependencies dd WHERE dd.dataset_id = d.id
        )
    )
    INTO result
    FROM datasets d
    WHERE d.id = dataset_uuid;

    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE datasets IS 'Central registry for all datasets in the unified repository';
COMMENT ON TABLE files IS 'Unified file registry supporting all modalities and file types';
COMMENT ON TABLE embeddings IS 'Multimodal vector embeddings for semantic search';
COMMENT ON TABLE data_schemas IS 'Schema definitions for structured data files';
COMMENT ON TABLE search_history IS 'Search query history for analytics and optimization';

COMMENT ON COLUMN datasets.metadata IS 'Flexible metadata storage for dataset-specific information';
COMMENT ON COLUMN files.metadata IS 'File-specific metadata including technical and content information';
COMMENT ON COLUMN embeddings.embedding IS 'Vector embedding for similarity search (1536 dimensions)';
COMMENT ON COLUMN data_schemas.columns IS 'Column definitions for structured data files';

-- ============================================================================
-- Initial Data and Configuration
-- ============================================================================

-- Insert default configuration
INSERT INTO search_analytics (date, total_searches, unique_users, avg_response_time)
VALUES (CURRENT_DATE::DATE, 0, 0, 0.000000)
ON CONFLICT (date) DO NOTHING;
