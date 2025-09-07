# Reynard Basic Backend 🦊

A modular FastAPI backend example demonstrating uvicorn reload best practices and development patterns for the Reynard ecosystem.

## Features

- 🔄 **Optimized Uvicorn Reload**: Smart reload detection and service management
- 🏗️ **Modular Architecture**: Clean separation of concerns with services and routes
- 🔧 **Configuration Management**: Environment-based configuration with sensible defaults
- 🗄️ **Service Layer**: Database, cache, and background service abstractions
- 📊 **Health Monitoring**: Comprehensive health checks and metrics
- 🔐 **Authentication**: JWT-based authentication with session management
- 👥 **User Management**: Full CRUD operations for user management
- 🧪 **Development Ready**: Optimized for development workflows

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
├── requirements.txt       # Python dependencies
├── README.md             # This file
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

| Variable | Default | Description |
|----------|---------|-------------|
| `UVICORN_HOST` | `0.0.0.0` | Host to bind to |
| `UVICORN_PORT` | `8000` | Port to bind to |
| `UVICORN_RELOAD` | `true` | Enable auto-reload |
| `UVICORN_LOG_LEVEL` | `info` | Logging level |
| `UVICORN_RELOAD_DIRS` | `.` | Comma-separated directories to watch |
| `UVICORN_RELOAD_DELAY` | `0.25` | Delay between file checks |

### Application Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `development` | Environment (development/production) |
| `DEBUG` | `true` | Enable debug mode |
| `SECRET_KEY` | `your-secret-key-change-in-production` | Secret key for JWT |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | CORS origins |

### Database Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./reynard.db` | Database connection URL |
| `DATABASE_ECHO` | `false` | Enable SQL logging |
| `DATABASE_POOL_SIZE` | `5` | Connection pool size |
| `DATABASE_MAX_OVERFLOW` | `10` | Max overflow connections |

### Cache Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CACHE_URL` | `redis://localhost:6379/0` | Cache connection URL |
| `CACHE_TTL` | `3600` | Default TTL in seconds |
| `CACHE_MAX_CONNECTIONS` | `10` | Max cache connections |

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
    print("🔄 Skipping heavy initialization during reload")
    yield
    return
```

### 3. Smart Background Task Management

Background services are disabled during reload to prevent hanging:

```python
if IS_RELOAD_MODE:
    print("🔄 Skipping background service during reload")
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

## Development Workflow

### 1. Start Development Server

```bash
python main.py
```

### 2. Make Changes

Edit any Python file in the project. Uvicorn will automatically detect changes and reload the server.

### 3. Monitor Reload

Watch the console output for reload messages:

```text
🔄 Running in uvicorn reload mode - skipping heavy initialization
🔄 Skipping database initialization during reload
🔄 Skipping cache initialization during reload
🔄 Skipping background service during reload
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
```

## Troubleshooting

### Common Issues

1. **Reload Not Working**: Ensure you have `uvicorn[standard]` installed
2. **Slow Reloads**: Check `UVICORN_RELOAD_DELAY` and `UVICORN_RELOAD_DIRS`
3. **Hanging Processes**: Use `pkill -f uvicorn` to kill hanging processes
4. **Import Errors**: Ensure all dependencies are installed in the virtual environment

### Debug Mode

Enable debug logging for more verbose output:

```bash
export UVICORN_LOG_LEVEL="debug"
export DEBUG="true"
```

## Contributing

This is an example backend for the Reynard ecosystem. Feel free to use it as a starting point for your own projects or contribute improvements.

## License

Part of the Reynard framework ecosystem.
