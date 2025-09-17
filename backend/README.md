# Reynard FastAPI Backend

A secure, JWT-based authentication backend for the Reynard project, built with FastAPI and Python.

## Features

- 🔐 **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- 🛡️ **Password Security**: PBKDF2 with HMAC-SHA256 password hashing (no bcrypt/passlib)
- 🔒 **Security Headers**: Comprehensive security middleware and headers
- 📚 **Auto Documentation**: Interactive API documentation with Swagger UI
- 🚀 **High Performance**: Built on FastAPI for maximum performance
- 🧪 **Tested**: Comprehensive test suite for all endpoints
- 🌍 **ECS World Service**: Single authoritative ECS World simulation with agent management
- 🔗 **MCP Integration**: REST API endpoints for MCP server integration

## Quick Start

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd reynard/backend
   ```

2. **Create a virtual environment**:

   ```bash
   python -m venv venv
   bash -c "source venv/bin/activate && ..."  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the development server**:

   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: <http://localhost:8000/api/docs>
- **ReDoc**: <http://localhost:8000/api/redoc>
- **OpenAPI JSON**: <http://localhost:8000/openapi.json>

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens
- `GET /api/auth/me` - Get current user information

### Protected Routes

- `GET /api/protected` - Example protected route
- `GET /api/health` - Health check endpoint

## Security Features

### Password Hashing

The backend uses PBKDF2 with HMAC-SHA256 for password hashing, providing:

- **Salt**: Each password gets a unique 32-byte salt
- **Iterations**: 100,000 iterations for key derivation
- **Constant-time comparison**: Prevents timing attacks
- **No external dependencies**: Uses only Python standard library

### JWT Tokens

- **Access Tokens**: Short-lived (30 minutes) for API access
- **Refresh Tokens**: Long-lived (7 days) for token renewal
- **Secure Signing**: HMAC-SHA256 with configurable secret key
- **Token Validation**: Comprehensive token verification

### Security Headers

- **CORS**: Configurable cross-origin resource sharing
- **Trusted Hosts**: Protection against host header attacks
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# JWT Secret Key (generate a secure random key)
SECRET_KEY=your-secret-key-here

# Token expiration times
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Development settings
DEBUG=True
LOG_LEVEL=info
```

### Generating a Secure Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Testing

### Manual Testing

Use the provided test script:

```bash
# Start the backend server first
python main.py

# In another terminal, run the tests
python scripts/test-backend.py
```

### API Testing with curl

```bash
# Register a user
curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "email": "test@example.com", "password": "testpassword123"}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "testpassword123"}'

# Access protected route (replace TOKEN with actual token)
curl -X GET "http://localhost:8000/api/protected" \
     -H "Authorization: Bearer TOKEN"
```

## Production Deployment

### Docker

```bash
# Build the Docker image
docker build -t reynard-backend .

# Run the container
docker run -p 8000:8000 --env-file .env reynard-backend
```

### Nginx Integration

The backend is designed to work with Nginx as a reverse proxy. See the `nginx/` directory for configuration examples.

### Security Considerations

For production deployment:

1. **Use HTTPS**: Always use SSL/TLS in production
2. **Secure Secret Key**: Use a strong, randomly generated secret key
3. **Database**: Replace in-memory storage with a proper database
4. **Rate Limiting**: Implement rate limiting for authentication endpoints
5. **Logging**: Set up proper logging and monitoring
6. **Environment**: Use environment-specific configurations

## Development

### Project Structure

```text
backend/
├── main.py               # FastAPI application
├── requirements.txt       # Python dependencies
├── .env                  # Environment variables
├── .env.example          # Environment variables template
├── README.md             # This file
└── scripts/
    └── test-backend.py   # Test script
```

### Adding New Endpoints

1. Define Pydantic models for request/response
2. Create the endpoint function
3. Add appropriate dependencies for authentication
4. Update this README with the new endpoint

### Database Integration

To add database support:

1. Install a database driver (e.g., `sqlalchemy`, `asyncpg`)
2. Create database models
3. Replace in-memory storage with database operations
4. Add database migrations

## ECS World Service

The Reynard backend includes a comprehensive ECS (Entity Component System) World service that provides single authoritative agent simulation and management.

### ECS Service Features

- **🌍 Single Authoritative Source**: Centralized ECS World instance for all agent operations
- **🧬 Agent Management**: Create, manage, and track agents with trait inheritance
- **🔗 MCP Integration**: REST API endpoints for MCP server communication
- **⏰ Time Simulation**: Time-accelerated world progression with configurable speed
- **🧬 Breeding System**: Automatic and manual agent reproduction with genetic compatibility
- **📊 Lineage Tracking**: Complete family tree and ancestry management
- **🔐 Authentication**: Secure access to all ECS operations

### ECS API Endpoints

The backend provides comprehensive REST endpoints for ECS operations:

#### World Management

- `GET /api/ecs/status` - Get world status and statistics
- `GET /api/ecs/agents` - List all agents in the world
- `POST /api/ecs/agents` - Create a new agent

#### Agent Operations

- `POST /api/ecs/agents/offspring` - Create offspring from two parent agents
- `GET /api/ecs/agents/{id}/mates` - Find compatible mates for an agent
- `GET /api/ecs/agents/{id}/compatibility/{id2}` - Analyze genetic compatibility
- `GET /api/ecs/agents/{id}/lineage` - Get agent family tree and lineage

#### Breeding System

- `POST /api/ecs/breeding/enable` - Enable or disable automatic breeding
- `GET /api/ecs/breeding/stats` - Get breeding statistics

### ECS Service Integration

The ECS service is integrated into the backend's lifespan manager with:

- **Priority-based Initialization**: ECS service starts with high priority (90)
- **Health Monitoring**: Built-in health checks for service status
- **Graceful Shutdown**: Proper cleanup on application shutdown
- **Error Handling**: Comprehensive error handling and logging

### Usage Example

```python
# Create an agent via API
POST /api/ecs/agents
{
  "agent_id": "agent-001",
  "spirit": "fox",
  "style": "foundation",
  "name": "Custom-Name-123"
}

# Get world status
GET /api/ecs/status
{
  "status": "active",
  "entity_count": 5,
  "agent_count": 3,
  "mature_agents": 1
}
```

### MCP Server Integration

MCP servers connect to the ECS service via HTTP client:

```python
from services.ecs_client import ECSClient

# Create ECS client
ecs_client = ECSClient(base_url="http://localhost:8000")
await ecs_client.start()

# Use ECS operations
agents = await ecs_client.get_agents()
new_agent = await ecs_client.create_agent("agent-002", "wolf", "foundation")
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `main.py` or stop the conflicting service
2. **Import errors**: Ensure all dependencies are installed in the virtual environment
3. **JWT errors**: Check that the SECRET_KEY is set and consistent
4. **CORS errors**: Verify ALLOWED_ORIGINS includes your frontend URL

### Logs

The application logs to stdout. For production, consider using a proper logging configuration.

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## License

This project is part of the Reynard framework. See the main project for license information.
