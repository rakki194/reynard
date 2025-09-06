# RAG File Navigation

This document describes the file navigation feature in the RAG Search & Ingest system, which allows users to navigate to and open source files directly from search results.

## Overview

The RAG file navigation feature enhances search results by providing direct access to source files. When you perform a search in the RAG system, each result now includes file information and navigation options that allow you to:

- View file details and metadata
- Open files in appropriate modals
- Navigate to files in the gallery
- Copy file paths to clipboard
- Preview chunk content

## Features

### File Information Display

Each search result now includes:

- **File Path**: The full path to the source file
- **File Content**: The complete content of the file
- **File Metadata**: Additional information about the file
- **Chunk Information**: Details about the specific chunk that matched the search
  - Chunk index (position in the file)
  - Chunk text (the actual matching text)
  - Token count
  - Chunk metadata

### Navigation Options

For each search result, you can:

1. **Open File**: Opens the file in a dedicated modal with syntax highlighting for code files
2. **Open in Gallery**: Navigates to the file's location in the gallery view
3. **Copy Path**: Copies the file path to your clipboard

### File Modal

When you click "Open" on a search result, a modal opens that displays:

- **File Header**: File name, path, size, line count, and detected language
- **Chunk Highlight**: The specific chunk that matched your search (if available)
- **Full Content**: The complete file content with syntax highlighting for code files
- **Actions**: Copy chunk content, copy full file content, or close modal

## Supported File Types

The file navigation feature works with all modalities except images:

- **Documents** (`docs` modality): Text files, markdown, PDFs, etc.
- **Code** (`code` modality): Source code files with syntax highlighting
- **Captions** (`captions` modality): Caption files and metadata

## Technical Implementation

### Backend Changes

The backend has been enhanced to include file information in search results:

1. **Enhanced Database Queries**: The `hybrid_search_documents` and `similar_document_chunks` functions now join with document and chunk tables to retrieve file information.

2. **API Response Structure**: The `/api/rag/query` endpoint now returns additional fields:

   ```json
   {
     "hits": [
       {
         "id": "chunk_id",
         "score": 0.88,
         "highlights": ["matched text"],
         "file_path": "/path/to/file.txt",
         "file_content": "full file content",
         "file_metadata": {"file_type": "text"},
         "chunk_index": 0,
         "chunk_text": "chunk content",
         "chunk_tokens": 10,
         "chunk_metadata": {"chunk_type": "paragraph"}
       }
     ]
   }
   ```

### Frontend Components

The frontend includes several new components:

1. **RAGFileNavigation**: Displays file information and navigation buttons in search results
2. **RAGFileModal**: Modal for viewing file content with syntax highlighting
3. **Enhanced RAGSearch**: Main search component that integrates file navigation

## Usage

### Basic Search with File Navigation

1. Navigate to the RAG Search page
2. Enter your search query
3. Select the appropriate modality (docs, code, captions)
4. View search results with file information
5. Click "Open" to view the full file content
6. Use "Gallery" to navigate to the file's location
7. Use "Copy Path" to copy the file path

### File Modal Features

When viewing a file in the modal:

- **Syntax Highlighting**: Code files are displayed with proper syntax highlighting
- **Chunk Highlighting**: The matching chunk is highlighted at the top of the modal
- **Copy Actions**: Copy either the chunk content or the full file content
- **File Statistics**: View file size, line count, and detected language
- **Keyboard Shortcuts**: Press Escape to close the modal

## Configuration

The file navigation feature is enabled by default when RAG is enabled. No additional configuration is required.

## Limitations

- **Image Modality**: File navigation is not available for image search results
- **Large Files**: Very large files may take time to load in the modal
- **Memory Usage**: File content is loaded into memory, so very large files may impact performance

## Future Enhancements

Potential future improvements include:

- **File Editing**: Direct editing of files from search results
- **Version Control**: Integration with git for file history
- **Advanced Search**: Search within specific files or directories
- **Batch Operations**: Perform operations on multiple files from search results
- **File Relationships**: Show related files and dependencies
