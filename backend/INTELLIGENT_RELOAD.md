# 🦊 Intelligent Service Reload System

The Reynard backend now includes an intelligent service reload system that allows individual services to be reloaded when their files change, rather than restarting the entire application.

## 🎯 Key Features

- **Service-Specific Reloading**: Only the affected service is reloaded when its files change
- **Faster Development Cycles**: No need to wait for the entire backend to restart
- **Dependency-Aware**: Services are reloaded in the correct dependency order
- **Configurable**: Can be enabled/disabled via environment variable
- **Comprehensive Coverage**: All major services are supported

## 🚀 Usage

### Enable Intelligent Reload

```bash
export INTELLIGENT_RELOAD=true
python main.py
```

### Disable Intelligent Reload (Standard Behavior)

```bash
export INTELLIGENT_RELOAD=false
python main.py
```

### Using the Development Server

```bash
# The dev-server.py automatically uses intelligent reload when enabled
python scripts/dev-server.py
```

## 🔧 Supported Services

The intelligent reload system monitors the following services:

| Service               | File Patterns                                                    | Description                     |
| --------------------- | ---------------------------------------------------------------- | ------------------------------- |
| **ECS World**         | `app/ecs/**/*.py`                                                | ECS world simulation service    |
| **Gatekeeper**        | `gatekeeper/**/*.py`, `app/auth/**/*.py`, `app/security/**/*.py` | Authentication and security     |
| **ComfyUI**           | `app/api/comfy/**/*.py`, `app/services/comfy/**/*.py`            | Image generation                |
| **NLWeb**             | `app/api/nlweb/**/*.py`, `app/services/nlweb/**/*.py`            | Natural language web processing |
| **RAG**               | `app/api/rag/**/*.py`, `app/services/rag/**/*.py`                | Retrieval-Augmented Generation  |
| **Search**            | `app/api/search/**/*.py`, `app/services/search/**/*.py`          | Search functionality            |
| **Ollama**            | `app/api/ollama/**/*.py`, `app/services/ollama/**/*.py`          | Local LLM inference             |
| **TTS**               | `app/api/tts/**/*.py`, `app/services/tts/**/*.py`                | Text-to-Speech                  |
| **Image Processing**  | `app/api/image_utils/**/*.py`                                    | Image processing utilities      |
| **AI Email Response** | `app/services/ai_email_response_service.py`                      | AI email handling               |

## 🧪 Testing

Test the intelligent reload system:

```bash
python scripts/test-intelligent-reload.py
```

This will show you which services would be affected by different file changes.

## 📁 File Change Examples

### ECS Service Changes

When you modify files in `app/ecs/`, only the ECS world service will reload:

```bash
# These changes will trigger ECS service reload:
touch app/ecs/world.py
touch app/ecs/service.py
touch app/ecs/endpoints/agents.py
touch app/ecs/database.py
```

### Core Changes

When you modify core files, the entire application will reload (standard behavior):

```bash
# These changes will trigger full reload:
touch main.py
touch app/core/config.py
touch app/core/app_factory.py
```

## 🔄 How It Works

1. **File Monitoring**: The system monitors all Python files in the backend
2. **Pattern Matching**: When a file changes, it checks against service file patterns
3. **Service Identification**: Determines which services are affected by the change
4. **Selective Reload**: Reloads only the affected services using the service registry
5. **Dependency Order**: Services are reloaded in dependency order (highest priority first)

## 🎛️ Configuration

### Environment Variables

- `INTELLIGENT_RELOAD`: Enable/disable intelligent reload (default: `true`)
- `ENVIRONMENT`: Set to `development` to enable reload (default: `development`)
- `DEBUG`: Enable debug mode (default: `false`)

### Service Priorities

Services are reloaded in this priority order:

1. **Gatekeeper** (100) - Authentication and security
2. **ECS World** (90) - Agent simulation
3. **Image Processing** (75) - Image support
4. **ComfyUI** (50) - Image generation
5. **NLWeb** (50) - Natural language processing
6. **RAG** (25) - Document processing
7. **Ollama** (25) - Local LLM
8. **Search** (20) - Search functionality
9. **AI Email Response** (15) - Email handling
10. **TTS** (10) - Text-to-Speech

## 🐛 Troubleshooting

### Service Not Reloading

1. Check that the file pattern matches the service configuration
2. Verify that `INTELLIGENT_RELOAD=true` is set
3. Check the logs for reload messages
4. Ensure the service is properly registered in the service registry

### Full Application Reloading

If the entire application is still reloading:

1. Check that the file change is not in a core directory
2. Verify that `INTELLIGENT_RELOAD=true` is set
3. Check the reload excludes configuration

### Performance Issues

If reloading is slow:

1. Check that services are shutting down properly
2. Verify that dependencies are not causing circular reloads
3. Monitor the service registry for stuck services

## 🔮 Future Enhancements

- **Hot Module Replacement**: Replace individual modules without service restart
- **Dependency Graph**: Visual representation of service dependencies
- **Reload Metrics**: Track reload performance and frequency
- **Custom Patterns**: Allow custom file patterns per service
- **Reload Hooks**: Custom pre/post reload hooks for services

## 📚 Related Files

- `app/core/intelligent_reload.py` - Main intelligent reload system
- `app/core/custom_reload_handler.py` - Custom uvicorn reload handler
- `scripts/test-intelligent-reload.py` - Test script for the system
- `app/core/lifespan_manager.py` - Service lifecycle management
- `app/core/service_registry.py` - Service registry for lifecycle management

---

_The intelligent reload system is designed to make development faster and more efficient by reducing the time spent waiting for application restarts._
