# Embedding Log Truncation

This feature allows you to control how embedding vectors are logged in the
application to reduce log verbosity while maintaining useful debugging
information.

## Configuration Options

### `embedding_log_truncate_enabled`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to truncate embedding vectors in debug logs
- **Environment Variable**: `EMBEDDING_LOG_TRUNCATE_ENABLED`

### `embedding_log_truncate_vectors`

- **Type**: `integer`
- **Default**: `8`
- **Description**: Number of embedding vectors to show before truncating
- **Environment Variable**: `EMBEDDING_LOG_TRUNCATE_VECTORS`

## Usage

### Configuration File

Add these settings to your `config.json`:

```json
{
  "embedding_log_truncate_enabled": true,
  "embedding_log_truncate_vectors": 8
}
```

### Environment Variables

You can also configure via environment variables:

```bash
# Enable/disable truncation
export EMBEDDING_LOG_TRUNCATE_ENABLED=true

# Set number of vectors to show
export EMBEDDING_LOG_TRUNCATE_VECTORS=8
```

### API Configuration

Update via the API endpoint:

```bash
curl -X PUT "http://localhost:7000/api/config" \
  -H "Content-Type: application/json" \
  -d '{
    "embedding_log_truncate_enabled": true,
    "embedding_log_truncate_vectors": 8
  }'
```

## Behavior

When enabled, the application will:

1. Show only the first N vectors (where N is `embedding_log_truncate_vectors`)
2. Add a truncation message indicating how many vectors were hidden
3. Keep the original response data unchanged for actual processing

### Example Log Output

**Before truncation:**

```text
Received embedding response from Ollama: {'embedding': [0.1, 0.2, 0.3, ..., 0.999], 'model': 'test-model'}
```

**After truncation (showing 8 vectors):**

```text
Received embedding response from Ollama: {'embedding': [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, '... (truncated, showing 8/1000 vectors)'], 'model': 'test-model'}
```

## Benefits

- **Reduced log verbosity**: Prevents embedding vectors from overwhelming log
  files
- **Maintained debugging**: Still shows enough vectors to verify the response
  structure
- **Performance**: Faster log processing and reduced storage requirements
- **Configurable**: Can be adjusted based on your debugging needs

## Disabling

To disable truncation and see full embedding vectors:

```json
{
  "embedding_log_truncate_enabled": false
}
```

Or via environment variable:

```bash
export EMBEDDING_LOG_TRUNCATE_ENABLED=false
```
