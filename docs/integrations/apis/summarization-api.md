# Summarization API Documentation

The Summarization API provides comprehensive text summarization capabilities powered by Ollama models. The system supports multiple content types, summary levels, streaming responses, and batch processing.

## Overview

The summarization system is built on a modular architecture with specialized summarizers for different content types:

- **Article Summarizer**: Optimized for web articles, blog posts, and news content
- **Code Summarizer**: Specialized for source code files and programming documentation
- **Document Summarizer**: General-purpose summarizer for reports, papers, and documents
- **Contextual Summarizer**: Personalized summaries based on user preferences and history
- **Cross-Language Summarizer**: Multi-language support with language detection

## Base URL

All endpoints are prefixed with `/api/summarize`

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```text
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. URL Summarization

Summarize content from a URL by first crawling the content, then generating a summary.

#### `POST /api/summarize/url`

**Request Body:**

```json
{
  "url": "https://example.com/article",
  "max_age_days": 5,
  "include_outline": false,
  "include_highlights": false
}
```

**Parameters:**

- `url` (string, required): The URL to summarize
- `max_age_days` (integer, optional): Maximum age of cached content in days (default: 5)
- `include_outline` (boolean, optional): Include structured outline in summary (default: false)
- `include_highlights` (boolean, optional): Include key highlights in summary (default: false)

**Response:**

```json
{
  "summary_id": "uuid-string",
  "url": "https://example.com/article",
  "title": "Article Title",
  "summary": "Generated summary text...",
  "outline": ["Key point 1", "Key point 2"],
  "highlights": ["Important highlight 1", "Important highlight 2"],
  "metadata": {
    "content_type": "article",
    "word_count": 1500,
    "processing_time": 2.5,
    "model_used": "qwen3:8b",
    "quality_score": 0.85
  },
  "cached": false
}
```

### 2. Text Summarization

Summarize provided text content directly.

#### `POST /api/summarize/text`

**Request Body:**

```json
{
  "text": "Text content to summarize...",
  "include_outline": false,
  "include_highlights": false,
  "content_type": "article",
  "summary_level": "detailed",
  "model": "qwen3:8b",
  "temperature": 0.7,
  "top_p": 0.9
}
```

**Parameters:**

- `text` (string, required): Text content to summarize
- `include_outline` (boolean, optional): Include structured outline (default: false)
- `include_highlights` (boolean, optional): Include key highlights (default: false)
- `content_type` (string, optional): Content type - "article", "code", "document", "technical", "general"
- `summary_level` (string, optional): Summary level - "brief", "detailed", "comprehensive"
- `model` (string, optional): Ollama model to use (default: "qwen3:8b")
- `temperature` (float, optional): Generation temperature 0.0-1.0 (default: 0.7)
- `top_p` (float, optional): Top-p sampling parameter 0.0-1.0 (default: 0.9)

**Response:**

```json
{
  "summary_id": "uuid-string",
  "summary": "Generated summary text...",
  "outline": ["Key point 1", "Key point 2"],
  "highlights": ["Important highlight 1", "Important highlight 2"],
  "metadata": {
    "content_type": "article",
    "summary_level": "detailed",
    "word_count": 800,
    "processing_time": 1.8,
    "model_used": "qwen3:8b",
    "quality_score": 0.88
  }
}
```

### 3. Streaming Summarization

Stream summarization progress and results in real-time using Server-Sent Events (SSE).

#### `GET /api/summarize/stream`

**Query Parameters:**

- `url` (string, optional): URL to summarize
- `text` (string, optional): Text to summarize
- `include_outline` (boolean, optional): Include outline (default: false)
- `include_highlights` (boolean, optional): Include highlights (default: false)
- `content_type` (string, optional): Content type
- `summary_level` (string, optional): Summary level
- `model` (string, optional): Model to use

**SSE Events:**

1. **Start Event:**

   ```json
   event: start
   data: {"content_type": "article", "model": "qwen3:8b"}
   ```

2. **Crawl Progress (URL only):**

   ```json
   event: crawl_progress
   data: {"status": "fetching", "progress": 0.5}
   ```

3. **Cleaning Event:**

   ```json
   event: cleaning
   data: {"status": "processing_markdown"}
   ```

4. **Token Stream:**

   ```json
   event: tokens
   data: {"content": "Generated", "partial_summary": "Generated summary so far..."}
   ```

5. **Completion Event:**

   ```json
   event: done
   data: {
   "result": {
       "summary_id": "uuid",
       "summary": "Complete summary...",
       "metadata": {...}
   },
   "quality_metrics": {
       "coherence": 0.85,
       "completeness": 0.92,
       "relevance": 0.88
   }
   }
   ```

6. **Error Event:**

   ```json
   event: error
   data: {"message": "Error description"}
   ```

### 4. Batch Summarization

Process multiple summarization requests in parallel.

#### `POST /api/summarize/batch`

**Request Body:**

```json
{
  "requests": [
    {
      "text": "First text to summarize",
      "content_type": "article",
      "summary_level": "brief"
    },
    {
      "url": "https://example.com/article1",
      "include_outline": true
    },
    {
      "text": "Second text to summarize",
      "content_type": "code",
      "summary_level": "detailed"
    }
  ],
  "enable_caching": true,
  "enable_streaming": false
}
```

**Parameters:**

- `requests` (array, required): Array of summarization requests
- `enable_caching` (boolean, optional): Enable result caching (default: true)
- `enable_streaming` (boolean, optional): Enable streaming for batch (default: false)

**Response:**

```json
{
  "batch_id": "uuid-string",
  "results": [
    {
      "request_index": 0,
      "summary_id": "uuid-1",
      "summary": "Summary 1...",
      "metadata": {...}
    },
    {
      "request_index": 1,
      "summary_id": "uuid-2",
      "summary": "Summary 2...",
      "metadata": {...}
    }
  ],
  "processing_time": 5.2,
  "success_count": 2,
  "error_count": 0
}
```

### 5. Retrieve Summary

Retrieve a previously generated summary by ID.

#### `GET /api/summarize/{summary_id}`

**Response:**

```json
{
  "summary_id": "uuid-string",
  "url": "https://example.com/article",
  "title": "Article Title",
  "summary": "Generated summary text...",
  "outline": ["Key point 1", "Key point 2"],
  "highlights": ["Important highlight 1", "Important highlight 2"],
  "metadata": {
    "content_type": "article",
    "word_count": 1500,
    "processing_time": 2.5,
    "model_used": "qwen3:8b",
    "quality_score": 0.85,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 6. Available Models

Get information about available summarization models and capabilities.

#### `GET /api/summarize/models/available`

**Response:**

```json
{
  "available_summarizers": {
    "ollama": {
      "name": "Ollama Summarizer",
      "supported_content_types": [
        "article",
        "code",
        "document",
        "technical",
        "general"
      ],
      "supported_languages": ["en", "es", "fr", "de", "zh", "ja"],
      "default_model": "qwen3:8b"
    },
    "article": {
      "name": "Article Summarizer",
      "supported_content_types": ["article"],
      "supported_languages": ["en", "es", "fr", "de"],
      "default_model": "qwen3:8b"
    },
    "code": {
      "name": "Code Summarizer",
      "supported_content_types": ["code"],
      "supported_languages": ["en"],
      "default_model": "qwen3:8b"
    }
  },
  "supported_content_types": [
    "article",
    "code",
    "document",
    "technical",
    "general"
  ],
  "supported_languages": ["en", "es", "fr", "de", "zh", "ja"]
}
```

### 7. Enhanced Summarization

Advanced summarization with additional features and controls.

#### `POST /api/summarize/enhanced`

**Request Body:**

```json
{
  "text": "Text content to summarize...",
  "content_type": "article",
  "summary_level": "detailed",
  "include_outline": true,
  "include_highlights": true,
  "model": "qwen3:8b",
  "temperature": 0.7,
  "top_p": 0.9,
  "max_tokens": 1000,
  "user_id": "user123"
}
```

**Response:**

```json
{
  "summary_id": "uuid-string",
  "summary": "Enhanced summary with personalization...",
  "outline": ["Key point 1", "Key point 2"],
  "highlights": ["Important highlight 1", "Important highlight 2"],
  "personalization": {
    "user_preferences_applied": true,
    "context_used": true
  },
  "metadata": {
    "content_type": "article",
    "summary_level": "detailed",
    "word_count": 800,
    "processing_time": 2.1,
    "model_used": "qwen3:8b",
    "quality_score": 0.92
  }
}
```

## Content Types

### Article

Optimized for web articles, blog posts, news content, and general web text.

### Code

Specialized for source code files, programming documentation, and technical specifications.

### Document

General-purpose summarizer for reports, papers, academic content, and formal documents.

### Technical

Optimized for technical documentation, manuals, and specialized content.

### General

Default summarizer for any type of text content.

## Summary Levels

### Brief

Concise summaries focusing on key points and main ideas (100-200 words).

### Detailed

Comprehensive summaries with supporting details and context (200-500 words).

### Comprehensive

In-depth summaries with full analysis and complete coverage (500+ words).

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing or invalid token)
- `404`: Not Found (summary ID not found)
- `500`: Internal Server Error
- `503`: Service Unavailable (summarization service down)

**Error Response Format:**

```json
{
  "detail": "Error description",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Default**: 100 requests per minute per user
- **Streaming**: 10 concurrent streams per user
- **Batch**: 5 batch requests per minute per user

Rate limit headers are included in responses:

```json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

## Caching

Summarization results are cached to improve performance:

- **URL summaries**: Cached for 5 days by default
- **Text summaries**: Cached for 24 hours
- **Cache keys**: Generated from content hash and parameters
- **Cache invalidation**: Automatic based on TTL

## Quality Metrics

Summarization quality is automatically assessed using multiple metrics:

- **Coherence**: Logical flow and structure (0.0-1.0)
- **Completeness**: Coverage of source content (0.0-1.0)
- **Relevance**: Focus on important information (0.0-1.0)
- **Overall Score**: Weighted average of all metrics (0.0-1.0)

## Usage Examples

### JavaScript/TypeScript

```javascript
// Basic text summarization
const response = await fetch("/api/summarize/text", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    text: "Long text content to summarize...",
    content_type: "article",
    summary_level: "detailed",
  }),
});

const result = await response.json();
console.log(result.summary);

// Streaming summarization
const eventSource = new EventSource(
  "/api/summarize/stream?text=Content&content_type=article",
);
eventSource.addEventListener("tokens", (event) => {
  const data = JSON.parse(event.data);
  console.log("Partial summary:", data.partial_summary);
});
eventSource.addEventListener("done", (event) => {
  const data = JSON.parse(event.data);
  console.log("Final summary:", data.result.summary);
  eventSource.close();
});
```

### Python

```python
import requests

# Text summarization
response = requests.post(
    'http://localhost:7000/api/summarize/text',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'text': 'Long text content to summarize...',
        'content_type': 'article',
        'summary_level': 'detailed'
    }
)

result = response.json()
print(result['summary'])

# URL summarization
response = requests.post(
    'http://localhost:7000/api/summarize/url',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'url': 'https://example.com/article',
        'include_outline': True,
        'include_highlights': True
    }
)

result = response.json()
print(f"Summary: {result['summary']}")
print(f"Outline: {result['outline']}")
```

### cURL

```bash
# Text summarization
curl -X POST http://localhost:7000/api/summarize/text \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Long text content to summarize...",
    "content_type": "article",
    "summary_level": "detailed"
  }'

# URL summarization
curl -X POST http://localhost:7000/api/summarize/url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "include_outline": true,
    "include_highlights": true
  }'

# Streaming summarization
curl -N http://localhost:7000/api/summarize/stream?text=Content&content_type=article \
  -H "Authorization: Bearer $TOKEN"
```

## Best Practices

1. **Content Type Selection**: Choose the appropriate content type for better summarization quality
2. **Summary Level**: Use "brief" for quick overviews, "detailed" for comprehensive summaries
3. **Caching**: Leverage caching by reusing summary IDs when possible
4. **Streaming**: Use streaming endpoints for long content to provide real-time feedback
5. **Error Handling**: Always handle potential errors and implement retry logic
6. **Rate Limiting**: Respect rate limits and implement exponential backoff
7. **Quality Metrics**: Monitor quality scores to ensure satisfactory results
8. **Batch Processing**: Use batch endpoints for multiple summarization requests

## Integration Notes

- The summarization system integrates with the existing Ollama service infrastructure
- Results are compatible with the TTS system for "summarize and speak" functionality
- The system supports the existing notification system for progress updates
- All summarization results are stored in the cache directory for later retrieval
- The API follows the same authentication and authorization patterns as other services
