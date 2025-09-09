# TTS and Crawl Integration Documentation

## Overview

The TTS and Crawl Integration system brings web crawling and high-quality text-to-speech capabilities to YipYap. This system allows users to crawl web URLs via Firecrawl, summarize content using the existing LLM pipeline, synthesize speech using multiple TTS backends (Coqui, Kokoro, XTTS), and ingest the results into the Audio modality for playback and management.

## Architecture

### System Components

The integration consists of several key components working together:

1. **Crawl Service** (`app/services/integration/crawl_service.py`)
   - Firecrawl proxy with local caching
   - Job management and status tracking
   - Cache TTL and cleanup mechanisms

2. **Summarization Service** (`app/services/integration/summarize_service.py`)
   - Markdown cleaning and normalization
   - LLM-based summarization via Ollama
   - Outline and highlights generation

3. **TTS Service** (`app/services/integration/tts_service.py`)
   - Multi-backend orchestration (Coqui, Kokoro, XTTS)
   - Performance mode management
   - Voice selection and language support

4. **Audio Ingestion** (`app/api/audio.py`)
   - Deduplication by content hash
   - Metadata storage and provenance tracking
   - Gallery integration

### Data Flow

```
URL Input → Crawl Service → Markdown → Summarization → TTS → Audio Ingestion → Gallery
    ↓           ↓           ↓            ↓           ↓         ↓
  Validation  Firecrawl   Cleaning    LLM Chat   Synthesis  Deduplication
    ↓           ↓           ↓            ↓           ↓         ↓
  Allowlist   Caching   Normalization  Streaming   Chunking   Metadata
```

### Configuration

The system is controlled by environment variables and feature flags:

```python
# Core feature flags
CRAWL_ENABLED=true
TTS_ENABLED=true

# Firecrawl configuration
FIRECRAWL_BASE_URL=https://api.firecrawl.dev
CRAWL_CACHE_DIR=/path/to/cache
CRAWL_CACHE_TTL_DAYS=7

# TTS configuration
TTS_DEFAULT_BACKEND=kokoro
TTS_AUDIO_DIR=/path/to/audio
TTS_KOKORO_MODE=powersave  # performance, normal, powersave
```

## API Contracts

### Crawl API

#### POST /api/crawl/fetch

Submit a URL for crawling.

**Request:**

```json
{
  "url": "https://example.com/article",
  "max_age_days": 7
}
```

**Response:**

```json
{
  "job_id": "crawl_1234567890",
  "status": "queued"
}
```

#### GET /api/crawl/status/{job_id}

Get the status of a crawl job.

**Response:**

```json
{
  "job_id": "crawl_1234567890",
  "status": "completed",
  "markdown": "# Article Title\n\nContent...",
  "metadata": {
    "title": "Article Title",
    "url": "https://example.com/article",
    "crawl_time": "2024-01-01T12:00:00Z",
    "content_length": 15000
  }
}
```

#### GET /api/crawl/direct

Direct crawl without job management.

**Request:**

```json
{
  "url": "https://example.com/article"
}
```

**Response:**

```json
{
  "markdown": "# Article Title\n\nContent...",
  "metadata": {
    "title": "Article Title",
    "url": "https://example.com/article",
    "crawl_time": "2024-01-01T12:00:00Z"
  }
}
```

#### GET /api/crawl/stream

Server-Sent Events stream for crawl progress.

**Event Types:**

- `crawl_started`: Job submitted to Firecrawl
- `crawl_progress`: Crawl progress update
- `crawl_completed`: Crawl finished successfully
- `crawl_failed`: Crawl failed with error

### Summarization API

#### POST /api/summarize/url

Crawl and summarize a URL in one operation.

**Request:**

```json
{
  "url": "https://example.com/article",
  "include_outline": true,
  "include_highlights": true
}
```

**Response:**

```json
{
  "summary_id": "summary_1234567890",
  "status": "processing"
}
```

#### GET /api/summarize/{summary_id}

Get the complete summary data.

**Response:**

```json
{
  "summary_id": "summary_1234567890",
  "url": "https://example.com/article",
  "markdown": "# Original Content...",
  "summary": {
    "title": "Summarized Title",
    "abstract": "Brief summary of the content...",
    "outline": ["Point 1", "Point 2", "Point 3"],
    "highlights": ["Key highlight 1", "Key highlight 2"]
  },
  "metadata": {
    "crawl_time": "2024-01-01T12:00:00Z",
    "summary_time": "2024-01-01T12:05:00Z",
    "word_count": 1500
  }
}
```

### TTS API

#### POST /api/tts/speak

Synthesize speech from text.

**Request:**

```json
{
  "text": "Text to synthesize",
  "backend": "kokoro",
  "voice": "en_female_1",
  "speed": 1.0,
  "language": "en",
  "to_ogg": true
}
```

**Response:**

```json
{
  "audio_path": "/path/to/audio.wav",
  "ogg_path": "/path/to/audio.ogg",
  "duration": 15.5,
  "metadata": {
    "backend": "kokoro",
    "voice": "en_female_1",
    "language": "en",
    "word_count": 25
  }
}
```

#### POST /api/tts/speak-summary

Synthesize speech from a stored summary.

**Request:**

```json
{
  "summary_id": "summary_1234567890",
  "backend": "kokoro",
  "voice": "en_female_1"
}
```

**Response:**

```json
{
  "audio_path": "/path/to/audio.wav",
  "summary_id": "summary_1234567890",
  "duration": 45.2
}
```

#### GET /api/tts/voices

Get available voices for each backend.

**Response:**

```json
{
  "kokoro": [
    {
      "id": "en_female_1",
      "name": "English Female 1",
      "language": "en",
      "gender": "female"
    }
  ],
  "coqui": [
    {
      "id": "en_vctk_p225",
      "name": "VCTK P225",
      "language": "en",
      "gender": "female"
    }
  ]
}
```

## Event Schemas

### Crawl Events

#### crawl_started

```json
{
  "event": "crawl_started",
  "job_id": "crawl_1234567890",
  "url": "https://example.com/article",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### crawl_progress

```json
{
  "event": "crawl_progress",
  "job_id": "crawl_1234567890",
  "progress": 75,
  "stage": "extracting_content",
  "timestamp": "2024-01-01T12:01:00Z"
}
```

#### crawl_completed

```json
{
  "event": "crawl_completed",
  "job_id": "crawl_1234567890",
  "markdown": "# Content...",
  "metadata": {
    "title": "Article Title",
    "content_length": 15000
  },
  "timestamp": "2024-01-01T12:02:00Z"
}
```

### Summarization Events

#### summarize_started

```json
{
  "event": "summarize_started",
  "summary_id": "summary_1234567890",
  "url": "https://example.com/article",
  "timestamp": "2024-01-01T12:03:00Z"
}
```

#### summarize_progress

```json
{
  "event": "summarize_progress",
  "summary_id": "summary_1234567890",
  "stage": "llm_processing",
  "progress": 60,
  "timestamp": "2024-01-01T12:04:00Z"
}
```

#### summarize_completed

```json
{
  "event": "summarize_completed",
  "summary_id": "summary_1234567890",
  "summary": {
    "title": "Summarized Title",
    "abstract": "Brief summary..."
  },
  "timestamp": "2024-01-01T12:05:00Z"
}
```

### TTS Events

#### tts_started

```json
{
  "event": "tts_started",
  "job_id": "tts_1234567890",
  "text_length": 150,
  "backend": "kokoro",
  "voice": "en_female_1",
  "timestamp": "2024-01-01T12:06:00Z"
}
```

#### tts_progress

```json
{
  "event": "tts_progress",
  "job_id": "tts_1234567890",
  "progress": 80,
  "chunk": 3,
  "total_chunks": 4,
  "timestamp": "2024-01-01T12:07:00Z"
}
```

#### tts_completed

```json
{
  "event": "tts_completed",
  "job_id": "tts_1234567890",
  "audio_path": "/path/to/audio.wav",
  "duration": 15.5,
  "timestamp": "2024-01-01T12:08:00Z"
}
```

### Audio Ingestion Events

#### audio_ingested

```json
{
  "event": "audio_ingested",
  "audio_id": "audio_1234567890",
  "file_path": "/path/to/audio.wav",
  "metadata": {
    "source_url": "https://example.com/article",
    "summary_id": "summary_1234567890",
    "backend": "kokoro",
    "voice": "en_female_1"
  },
  "timestamp": "2024-01-01T12:09:00Z"
}
```

## Frontend Integration

### Composables

#### useCrawl

```typescript
const { crawlUrl, getCrawlStatus, streamCrawl } = useCrawl();

// Submit a URL for crawling
const jobId = await crawlUrl("https://example.com/article");

// Get status
const status = await getCrawlStatus(jobId);

// Stream progress
const unsubscribe = streamCrawl(jobId, (event) => {
  console.log(event);
});
```

#### useTTS

```typescript
const { speak, speakSummary, getVoices } = useTTS();

// Synthesize text
const result = await speak("Hello world", {
  backend: "kokoro",
  voice: "en_female_1",
});

// Synthesize summary
const result = await speakSummary("summary_1234567890", {
  backend: "kokoro",
  voice: "en_female_1",
});

// Get available voices
const voices = await getVoices();
```

### Settings Integration

The TTS and Crawl settings are integrated into the existing settings system:

```typescript
// Settings structure
interface TTSAndCrawlSettings {
  crawl: {
    enabled: boolean;
    baseUrl: string;
    cacheTtlDays: number;
  };
  tts: {
    enabled: boolean;
    defaultBackend: string;
    kokoroMode: "performance" | "normal" | "powersave";
    defaultVoice: string;
  };
}
```

## Error Handling

### Error Categories

1. **Network Errors**
   - Firecrawl API unavailable
   - TTS backend connection issues
   - Timeout errors

2. **Validation Errors**
   - Invalid URLs
   - Content size limits exceeded
   - Unsupported languages or voices

3. **Processing Errors**
   - Crawl failures
   - Summarization failures
   - TTS synthesis errors

4. **Resource Errors**
   - Disk space issues
   - Memory pressure
   - VRAM limitations

### Error Response Format

```json
{
  "error": {
    "code": "CRAWL_FAILED",
    "message": "Failed to crawl URL",
    "details": {
      "url": "https://example.com/article",
      "reason": "timeout"
    },
    "correlation_id": "corr_1234567890",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Troubleshooting

### Common Issues

#### Crawl Failures

**Problem**: URLs fail to crawl
**Solutions**:

1. Check Firecrawl API status and credentials
2. Verify URL is accessible and not blocked
3. Check cache TTL settings
4. Review allowlist/denylist patterns

**Debugging**:

```bash
# Check crawl service logs
tail -f logs/crawl_service.log

# Test Firecrawl connectivity
curl -X POST "http://localhost:7000/api/crawl/direct" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

#### TTS Synthesis Issues

**Problem**: Audio synthesis fails
**Solutions**:

1. Check TTS backend availability
2. Verify voice and language compatibility
3. Check VRAM usage (Kokoro)
4. Review text length limits

**Debugging**:

```bash
# Check TTS service logs
tail -f logs/tts_service.log

# Test TTS endpoint
curl -X POST "http://localhost:7000/api/tts/speak" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test", "backend": "kokoro"}'
```

#### Performance Issues

**Problem**: Slow processing or timeouts
**Solutions**:

1. Adjust Kokoro mode (performance/normal/powersave)
2. Check cache hit rates
3. Monitor system resources
4. Review concurrent job limits

**Monitoring**:

```bash
# Check metrics
curl "http://localhost:7000/api/metrics/crawl"
curl "http://localhost:7000/api/metrics/tts"

# Monitor cache usage
curl "http://localhost:7000/api/crawl/cache-info"
```

### Log Analysis

The system uses structured logging with correlation IDs for end-to-end tracing:

```bash
# Find all events for a specific job
grep "corr_1234567890" logs/*.log

# Analyze crawl performance
grep "crawl_completed" logs/crawl_service.log | jq '.duration'

# Check error patterns
grep "ERROR" logs/*.log | jq '.error.code' | sort | uniq -c
```

### Cache Management

```bash
# Purge specific URL cache
curl -X POST "http://localhost:7000/api/crawl/purge-cache" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'

# Purge all cache
curl -X POST "http://localhost:7000/api/crawl/purge-cache" \
  -H "Content-Type: application/json" \
  -d '{"all": true}'

# Get cache statistics
curl "http://localhost:7000/api/crawl/cache-info"
```

## Performance Tuning

### Kokoro Mode Optimization

- **Performance**: Preload models, keep in VRAM
- **Normal**: Load on demand, prewarm threshold
- **Powersave**: Auto-unload after inactivity

### Cache Optimization

- Adjust TTL based on content freshness requirements
- Monitor cache hit rates and adjust accordingly
- Implement cache size limits to prevent disk space issues

### Concurrent Processing

- Limit concurrent crawl jobs to prevent API rate limiting
- Queue TTS jobs to manage VRAM usage
- Use background processing for long-running operations

## Security Considerations

### URL Validation

- Implement allowlist/denylist patterns
- Validate URL format and length
- Check for malicious content patterns

### Content Limits

- Enforce maximum content size limits
- Implement text length restrictions for TTS
- Monitor resource usage and implement rate limiting

### Access Control

- Integrate with existing authentication system
- Implement API rate limiting
- Log all operations for audit trails

## Future Enhancements

### Planned Features

1. **RVC Voice Conversion**: Add voice cloning capabilities
2. **Batch Processing**: Process multiple URLs simultaneously
3. **Advanced Caching**: Implement distributed caching
4. **Quality Metrics**: Add audio quality assessment
5. **Custom Voices**: Support for user-uploaded voice models

### Integration Opportunities

1. **Workflow Builder**: Integrate with existing workflow system
2. **Memory System**: Store and retrieve crawl/summary history
3. **Export Features**: Export audio with metadata
4. **Collaboration**: Share summaries and audio with team members
