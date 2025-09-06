# Ollama Service Reconnection

The Ollama service now includes automatic reconnection functionality with exponential backoff to handle connection failures gracefully.

## Overview

When the Ollama service connects to the server once and then gets disconnected, it will automatically attempt to reconnect every 5 seconds initially, with exponential timeout increases up to a maximum of 5 minutes between attempts.

## Features

### Automatic Reconnection

- **Initial Delay**: 5 seconds
- **Exponential Backoff**: Each retry doubles the delay (5s → 10s → 20s → 40s → 80s → 160s → 300s)
- **Maximum Delay**: 5 minutes (300 seconds)
- **Maximum Attempts**: 10 attempts before giving up

### Connection State Management

The service tracks connection states:

- `DISCONNECTED`: No active connection
- `CONNECTING`: Attempting to establish initial connection
- `CONNECTED`: Successfully connected
- `RECONNECTING`: Attempting to reconnect after disconnection

### Health Check Integration

Health checks detect connection failures and:

1. Trigger reconnection loop if connection is lost
2. Reset connection state when connection is restored
3. Reset attempt counter on successful reconnection

- Regular health checks (every 60 seconds) detect connection failures
- Automatic reconnection loop starts when connection is lost
- Connection state is restored when health checks succeed

## Configuration

The reconnection behavior can be configured by modifying these parameters in the `OllamaService` class:

```python
self._base_reconnection_delay = 5  # Start with 5 seconds
self._max_reconnection_delay = 300  # Max 5 minutes
self._reconnection_backoff_multiplier = 2.0  # Double the delay each time
self._max_reconnection_attempts = 10  # Stop after 10 attempts
```

## Usage

The reconnection functionality is automatic and requires no user intervention:

1. **Initial Connection**: Service attempts to connect during initialization
2. **Connection Loss**: If connection fails, reconnection loop starts automatically
3. **Reconnection**: Service attempts to reconnect with exponential backoff
4. **Connection Restored**: When connection is restored, normal operation resumes
5. **Max Attempts**: If 10 attempts fail, reconnection stops until next health check

## Monitoring

The service provides connection state information through the `get_info()` method:

```python
info = ollama_service.get_info()
print(f"Connection State: {info['connection_state']}")
print(f"Connection Attempts: {info['connection_attempts']}")
print(f"Was Ever Connected: {info['was_ever_connected']}")
```

## Testing

The reconnection functionality is thoroughly tested with:

- Unit tests for individual components
- Integration tests for complete reconnection cycles
- State transition tests
- Exponential backoff timing tests

Run the tests with:

```bash
python -m pytest app/tests/test_ollama_reconnection.py -v
python -m pytest app/tests/test_ollama_integration.py -v
```

## Implementation Details

### Reconnection Loop

The reconnection loop runs as a background task and:

1. Calculates delay using exponential backoff
2. Waits for the calculated delay
3. Attempts to reconnect using `reinitialize()`
4. Updates connection state based on success/failure
5. Continues until connection is restored or max attempts reached

### Cleanup

The service properly cleans up reconnection tasks during shutdown to prevent resource leaks.
