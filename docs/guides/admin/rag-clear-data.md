# Clearing RAG Data

This document explains how to clear all RAG data while preserving the database
structure in Reynard.

## Overview

The RAG system stores data across multiple tables including documents, code
files, captions, images, and their embeddings. Sometimes you may want to start
fresh with your data while keeping the database schema intact.

## Methods to Clear RAG Data

### 1. Using the Web Interface (Recommended)

1. Navigate to **Settings** → **RAG Settings**
2. Scroll down to the **Queue Management** section
3. Click the **"Clear All Data"** button
4. Confirm the action when prompted

This will:

- Stop any ongoing indexing operations
- Clear all data from RAG tables
- Reset sequence counters
- Preserve all table structures, indexes, and triggers

### 2. Using the API Endpoint

You can also clear the data programmatically using the admin API:

```bash
curl -X POST "http://localhost:7000/api/rag/admin/clear-all-data" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**

```json
{
  "status": "success",
  "message": "All RAG data cleared successfully",
  "total_records_deleted": 1250,
  "deletion_counts": {
    "rag_document_embeddings": 500,
    "rag_code_embeddings": 300,
    "rag_caption_embeddings": 200,
    "rag_image_embeddings": 100,
    "rag_document_chunks": 400,
    "rag_code_chunks": 250,
    "rag_documents": 150,
    "rag_code_files": 100,
    "rag_captions": 200,
    "rag_images": 100,
    "rag_file_tracking": 50,
    "rag_indexing_sessions": 10
  }
}
```

### 3. Using the Standalone Script (Recommended for Automation)

For automation, maintenance scripts, or when the backend is not running, use the
standalone script:

```bash
# Using environment variable
export PG_DSN="postgresql://reynard:reynard@localhost:5432/reynard"
python scripts/clear_rag_data.py

# Using command line argument
python scripts/clear_rag_data.py --dsn "postgresql://reynard:reynard@localhost:5432/reynard"

# Using config file
python scripts/clear_rag_data.py --config config.json

# Using environment file
python scripts/clear_rag_data.py --env-file .env

# Preview what would be deleted (dry run)
python scripts/clear_rag_data.py --dsn "postgresql://..." --dry-run

# Skip confirmation prompt
python scripts/clear_rag_data.py --dsn "postgresql://..." --force
```

**Script Features:**

- **No backend required**: Works independently of the Reynard application
- **Multiple config sources**: Supports DSN, config files, and environment files
- **Safety features**: Confirmation prompts and dry-run mode
- **Comprehensive logging**: Detailed output of all operations
- **Error handling**: Proper transaction management and rollback on errors

### 4. Using PostgreSQL Directly

If you prefer to clear data directly in the database:

```sql
-- Stop any ongoing operations first
-- Then run these commands in order:

-- Clear embeddings (they reference chunks)
DELETE FROM rag_document_embeddings;
DELETE FROM rag_code_embeddings;
DELETE FROM rag_caption_embeddings;
DELETE FROM rag_image_embeddings;

-- Clear chunks (they reference documents/files)
DELETE FROM rag_document_chunks;
DELETE FROM rag_code_chunks;

-- Clear main content tables
DELETE FROM rag_documents;
DELETE FROM rag_code_files;
DELETE FROM rag_captions;
DELETE FROM rag_images;

-- Clear tracking tables
DELETE FROM rag_file_tracking;
DELETE FROM rag_indexing_sessions;

-- Reset sequences to start from 1
ALTER SEQUENCE rag_documents_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_document_chunks_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_document_embeddings_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_code_files_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_code_chunks_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_code_embeddings_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_captions_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_caption_embeddings_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_images_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_image_embeddings_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_file_tracking_id_seq RESTART WITH 1;
ALTER SEQUENCE rag_indexing_sessions_id_seq RESTART WITH 1;
```

## What Gets Cleared

The following data is removed:

- **Documents**: All ingested text documents and their chunks
- **Code**: All code files and their chunks
- **Captions**: All image captions
- **Images**: All image metadata and CLIP embeddings
- **Embeddings**: All vector embeddings for text, code, captions, and images
- **File Tracking**: All file modification tracking data
- **Indexing Sessions**: All indexing session history

## What Gets Preserved

The following database structure remains intact:

- All table schemas and columns
- All indexes (including HNSW vector indexes)
- All triggers and functions
- All foreign key constraints
- All sequences (though they are reset to start from 1)

## After Clearing Data

Once you've cleared the data:

1. **Re-enable indexing** if you want to start fresh indexing
2. **Re-ingest documents** using the RAG ingestion endpoints
3. **Monitor the indexing process** through the RAG settings interface

## Safety Considerations

- **Backup first**: Consider backing up your database before clearing data
- **Confirm action**: The web interface requires confirmation before clearing
- **Admin only**: Only admin users can clear RAG data
- **Irreversible**: This action cannot be undone

## Troubleshooting

If you encounter issues:

1. **Check permissions**: Ensure you have admin access
2. **Verify database connection**: Make sure the PostgreSQL connection is
   working
3. **Check logs**: Look for error messages in the application logs
4. **Restart services**: If needed, restart the RAG services

## Related Documentation

- [RAG Operations Guide](rag-ops.md) - General RAG operations and maintenance
- [Embeddings and Vector DB](embeddings-and-vector-db.md) - Technical details
  about the vector database
- [RAG Demo Flows](rag-demo-flows.md) - Example usage patterns
