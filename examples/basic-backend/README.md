# Reynard Basic Backend

A modular FastAPI backend example demonstrating uvicorn reload best practices and
development patterns for the Reynard ecosystem.

## Features

- **Optimized Uvicorn Reload**: Smart reload detection and service management
- 🏗️ **Modular Architecture**: Clean separation of concerns with services and routes
- **Configuration Management**: Environment-based configuration with sensible defaults
- 🗄️ **Service Layer**: Database, cache, and background service abstractions
- 📊 **Health Monitoring**: Comprehensive health checks and metrics
- 🔐 **Authentication**: JWT-based authentication with session management
- 👥 **User Management**: Full CRUD operations for user management
- 🧪 **Development Ready**: Optimized for development workflows
- 📝 **Professional Logging**: Comprehensive logging with YAML configuration and environment variable support

## Quick Start

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. **Navigate to the backend directory**:

   ```bash
   cd examples/basic-backend
   ```

2. **Create a virtual environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the development server**:

   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>
- **OpenAPI JSON**: <http://localhost:8000/openapi.json>

## Project Structure

```text
basic-backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration management
├── logging_config.py      # Professional logging configuration
├── log_conf.yaml          # YAML logging configuration
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── logs/                 # Log files directory (auto-created)
│   ├── reynard-backend.log
│   └── reynard-errors.log
├── services/             # Service layer
│   ├── __init__.py
│   ├── database.py       # Database service
│   ├── cache.py          # Cache service
│   └── background.py     # Background service
└── routes/               # API routes
    ├── __init__.py
    ├── health.py         # Health check endpoints
    ├── auth.py           # Authentication endpoints
    └── users.py          # User management endpoints
```

## Configuration

The backend uses environment-based configuration. You can customize behavior using environment variables:

### Uvicorn Configuration

| Variable               | Default   | Description                          |
| ---------------------- | --------- | ------------------------------------ |
| `UVICORN_HOST`         | `0.0.0.0` | Host to bind to                      |
| `UVICORN_PORT`         | `8000`    | Port to bind to                      |
| `UVICORN_RELOAD`       | `true`    | Enable auto-reload                   |
| `UVICORN_LOG_LEVEL`    | `info`    | Logging level                        |
| `UVICORN_RELOAD_DIRS`  | `.`       | Comma-separated directories to watch |
| `UVICORN_RELOAD_DELAY` | `0.25`    | Delay between file checks            |

### Application Configuration

| Variable       | Default                                       | Description                          |
| -------------- | --------------------------------------------- | ------------------------------------ |
| `ENVIRONMENT`  | `development`                                 | Environment (development/production) |
| `DEBUG`        | `true`                                        | Enable debug mode                    |
| `SECRET_KEY`   | `your-secret-key-change-in-production`        | Secret key for JWT                   |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | CORS origins                         |

### Database Configuration

| Variable                | Default                  | Description              |
| ----------------------- | ------------------------ | ------------------------ |
| `DATABASE_URL`          | `sqlite:///./reynard.db` | Database connection URL  |
| `DATABASE_ECHO`         | `false`                  | Enable SQL logging       |
| `DATABASE_POOL_SIZE`    | `5`                      | Connection pool size     |
| `DATABASE_MAX_OVERFLOW` | `10`                     | Max overflow connections |

### Cache Configuration

| Variable                | Default                    | Description            |
| ----------------------- | -------------------------- | ---------------------- |
| `CACHE_URL`             | `redis://localhost:6379/0` | Cache connection URL   |
| `CACHE_TTL`             | `3600`                     | Default TTL in seconds |
| `CACHE_MAX_CONNECTIONS` | `10`                       | Max cache connections  |

### Logging Configuration

| Variable               | Default                    | Description                                           |
| ---------------------- | -------------------------- | ----------------------------------------------------- |
| `LOG_LEVEL`            | `INFO`                     | Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL) |
| `LOG_FORMAT`           | `detailed`                 | Log format (default, access, detailed, json)          |
| `LOG_TO_FILE`          | `true`                     | Enable file logging                                   |
| `LOG_FILE_PATH`        | `logs/reynard-backend.log` | Main log file path                                    |
| `LOG_ERROR_FILE_PATH`  | `logs/reynard-errors.log`  | Error log file path                                   |
| `LOG_MAX_BYTES`        | `10485760`                 | Max log file size (10MB)                              |
| `LOG_BACKUP_COUNT`     | `5`                        | Number of backup log files                            |
| `USE_YAML_LOG_CONFIG`  | `true`                     | Use YAML configuration file                           |
| `YAML_LOG_CONFIG_PATH` | `log_conf.yaml`            | Path to YAML config file                              |

## API Endpoints

### Health & System

- `GET /` - Root endpoint with system information
- `GET /api/system` - Detailed system status
- `GET /api/health` - Comprehensive health check
- `GET /api/health/simple` - Simple health check
- `GET /api/health/ready` - Readiness check (Kubernetes)
- `GET /api/health/live` - Liveness check (Kubernetes)
- `GET /api/health/services` - Detailed service status
- `GET /api/health/metrics` - System metrics

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/users` - List all users

### User Management

- `GET /api/users/` - List users with pagination
- `GET /api/users/{user_id}` - Get user by ID
- `POST /api/users/` - Create new user
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user
- `GET /api/users/stats/overview` - User statistics
- `GET /api/users/search/{query}` - Search users

## Professional Logging

This backend includes a comprehensive logging system that unifies FastAPI and
Uvicorn logging with professional formatting and configuration options.

### Logging Features

- **Unified Logging**: FastAPI and Uvicorn logs use the same professional formatting
- **Multiple Formats**: Support for default, access, detailed, and JSON log formats
- **File Logging**: Automatic log rotation with configurable size and backup count
- **Environment Configuration**: All logging settings configurable via environment variables
- **YAML Configuration**: Professional YAML-based logging configuration
- **Structured Logging**: JSON format support for log aggregation systems
- **Error Separation**: Separate error logs for easier debugging

### Log Output Examples

> _Before (default Uvicorn logging):_

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [34318] using StatReload
INFO:     127.0.0.1:50062 - "GET / HTTP/1.1" 200 OK
```

> _After (professional logging):_

```
2023-03-08 15:40:41,170 - uvicorn.error - INFO - Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
2023-03-08 15:40:41,170 - uvicorn.error - INFO - Started reloader process [34322] using StatReload
2023-03-08 15:40:41,432 - uvicorn.error - INFO - Application startup complete.
2023-03-08 15:48:21,450 - main - INFO - Root endpoint accessed
2023-03-08 15:48:21,450 - uvicorn.access - INFO - 127.0.0.1:59782 - "GET / HTTP/1.1" 200
```

### Using Loggers in Your Code

```python
from logging_config import get_app_logger, get_service_logger, get_route_logger

# Get application logger
logger = get_app_logger()
logger.info("Application started")

# Get service-specific logger
service_logger = get_service_logger("database")
service_logger.info("Database connection established")

# Get route-specific logger
route_logger = get_route_logger("users")
route_logger.info("User endpoint accessed")
```

### Logging Configuration Options

#### Using YAML Configuration (Recommended)

The backend automatically uses `log_conf.yaml` if
available. This provides the most comprehensive logging setup with file rotation and multiple formatters.

#### Using Environment Variables

Override any logging setting using environment variables:

```bash
# Set log level
export LOG_LEVEL="DEBUG"

# Disable file logging
export LOG_TO_FILE="false"

# Use JSON format for log aggregation
export LOG_FORMAT="json"

# Custom log file paths
export LOG_FILE_PATH="/var/log/reynard/app.log"
export LOG_ERROR_FILE_PATH="/var/log/reynard/errors.log"
```

#### Production Logging Setup

For production environments:

```bash
# Production logging configuration
export LOG_LEVEL="WARNING"
export LOG_FORMAT="json"
export LOG_TO_FILE="true"
export LOG_FILE_PATH="/var/log/reynard/production.log"
export LOG_MAX_BYTES="52428800"  # 50MB
export LOG_BACKUP_COUNT="10"
```

### Log File Management

- **Automatic Rotation**: Log files are automatically rotated when they reach the configured size
- **Backup Files**: Old log files are kept as `.1`, `.2`, etc.
- **Error Separation**: Critical errors are logged to a separate file for easier monitoring
- **Directory Creation**: Log directories are created automatically if they don't exist

## Uvicorn Reload Features

This backend demonstrates several uvicorn reload optimization patterns:

### 1. Reload Mode Detection

```python
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"
```

### 2. Optimized Service Initialization

Services skip heavy initialization during reload to speed up the process:

```python
if IS_RELOAD_MODE:
    print("[INFO] Skipping heavy initialization during reload")
    yield
    return
```

### 3. Smart Background Task Management

Background services are disabled during reload to prevent hanging:

```python
if IS_RELOAD_MODE:
    print("[INFO] Skipping background service during reload")
    return
```

### 4. Configuration-Based Reload

The reload behavior is configurable via environment variables:

```bash
# Custom reload configuration
export UVICORN_RELOAD_DIRS="services,routes"
export UVICORN_RELOAD_DELAY="0.5"
export UVICORN_LOG_LEVEL="debug"
```

### 5. Professional Logging Integration

The reload system works seamlessly with the professional logging configuration:

```bash
# Start with custom logging configuration
python main.py

# Or use uvicorn directly with YAML config
uvicorn main:app --reload --log-config=log_conf.yaml

# Or with environment variable overrides
export LOG_LEVEL="DEBUG"
export LOG_FORMAT="detailed"
python main.py
```

## Development Workflow

### 1. Start Development Server

```bash
python main.py
```

### 2. Make Changes

Edit any Python file in the project. Uvicorn will automatically detect changes and reload the server.

### 3. Monitor Reload

Watch the console output for reload messages with professional logging:

```text
2023-03-08 15:40:41,170 - main - INFO - Running in uvicorn reload mode - skipping heavy initialization
2023-03-08 15:40:41,170 - main - INFO - Skipping database initialization during reload
2023-03-08 15:40:41,170 - main - INFO - Skipping cache initialization during reload
2023-03-08 15:40:41,170 - main - INFO - Skipping background service during reload
```

### 4. Test Endpoints

Use the interactive API documentation at <http://localhost:8000/docs> to test endpoints.

## Production Deployment

For production deployment, disable reload and configure properly:

```bash
export UVICORN_RELOAD="false"
export ENVIRONMENT="production"
export DEBUG="false"
export SECRET_KEY="your-secure-secret-key"

# Production logging configuration
export LOG_LEVEL="WARNING"
export LOG_FORMAT="json"
export LOG_TO_FILE="true"
export LOG_FILE_PATH="/var/log/reynard/production.log"
export LOG_MAX_BYTES="52428800"  # 50MB
export LOG_BACKUP_COUNT="10"
```

## Troubleshooting

### Common Issues

1. **Reload Not Working**: Ensure you have `uvicorn[standard]` installed
2. **Slow Reloads**: Check `UVICORN_RELOAD_DELAY` and `UVICORN_RELOAD_DIRS`
3. **Hanging Processes**: Use `pkill -f uvicorn` to kill hanging processes
4. **Import Errors**: Ensure all dependencies are installed in the virtual environment
5. **Logging Issues**: Check that `PyYAML` is installed and `log_conf.yaml` exists
6. **Log File Permissions**: Ensure the application has write permissions to the log directory

### Debug Mode

Enable debug logging for more verbose output:

```bash
export UVICORN_LOG_LEVEL="debug"
export DEBUG="true"
export LOG_LEVEL="DEBUG"
export LOG_FORMAT="detailed"
```

## Contributing

This is an example backend for the Reynard ecosystem. Feel free to use it as a starting point for your own projects or
contribute improvements.

## License

Part of the Reynard framework ecosystem.
