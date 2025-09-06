# Ollama Integration & YipYap Assistant 🦊

This document covers the Ollama integration in YipYap, including the custom yipyap assistant that helps with dataset management tasks.

## Overview

YipYap now includes a built-in AI assistant (🦊) powered by Ollama that can help you with:

- Image dataset organization and management
- Tagging and captioning workflows
- Dataset cleaning and preparation
- Understanding YipYap features and functionality  
- Git-based dataset version control
- General dataset best practices

## Prerequisites

### Installing Ollama

1. **Download and Install Ollama**
   - Visit [ollama.ai](https://ollama.ai) and download for your platform
   - Follow the installation instructions for your operating system

2. **Start Ollama Service**

   ```bash
   # The service usually starts automatically, but you can also run:
   ollama serve
   ```

3. **Pull a Model** (recommended)

   ```bash
   ollama pull qwen3:8b
   ```

### Environment Configuration

Configure your Ollama settings by setting these environment variables:

```bash
# Ollama server URL (default: http://localhost:11434)
OLLAMA_BASE_URL=http://localhost:11434

# Default model for the yipyap assistant (default: qwen3:8b)
YIPYAP_ASSISTANT_MODEL=qwen3:8b
```

You can also set these in your `.env` file in the project root.

## Using the YipYap Assistant

### Accessing the Assistant

The yipyap assistant (🦊) appears as a floating chat interface in the bottom-right corner of the application when Ollama is connected and running.

### Features

1. **Context-Aware Assistance**
   - The assistant automatically receives context about your current directory
   - It knows about selected images and current dataset state
   - Git repository status is included when available

2. **Streaming Responses**
   - Real-time response streaming for immediate feedback
   - Ability to stop generation if needed

3. **Conversation History**
   - Maintains conversation context within the session
   - Clear history option for starting fresh

4. **Model Selection**
   - Switch between different Ollama models
   - Automatic model availability detection

### Example Use Cases

**Dataset Organization:**
> "How should I organize my training images for a Stable Diffusion model?"

**Tagging Help:**
> "What tags would be appropriate for this fantasy art collection?"

**Git Workflow:**
> "I have 500 new images in my dataset. What's the best way to commit them?"

**Caption Generation:**
> "Should I use JTP2 or WDv3 for tagging anime-style artwork?"

**Technical Issues:**
> "My thumbnails are generating slowly. How can I speed this up?"

## API Endpoints

The Ollama integration provides several API endpoints:

### Status and Health

- `GET /api/ollama/status` - Get connection status and availability
- `GET /api/ollama/health` - Health check endpoint

### Model Management

- `GET /api/ollama/models` - List available models
- `POST /api/ollama/models/pull` - Pull a new model
- `GET /api/ollama/assistant/models` - Get models available for assistant
- `POST /api/ollama/assistant/ensure-model` - Ensure model is available

### Chat Interface

- `POST /api/ollama/chat` - Chat with the assistant (streaming)
- `GET /api/ollama/assistant/context/{path}` - Get context for path

## Frontend Integration

### Using the Composable

```typescript
import { useOllama } from "../composables/useOllama";

function MyComponent() {
  const {
    isConnected,
    isStreaming,
    chatWithAssistant,
    conversationHistory,
    // ... other methods
  } = useOllama();

  // Send a message to the assistant
  const handleChat = async () => {
    await chatWithAssistant("How do I organize my dataset?", {
      current_path: "/my/dataset/path",
      selected_images: ["image1.jpg", "image2.png"]
    });
  };

  return (
    <div>
      {/* Your component UI */}
    </div>
  );
}
```

### Adding the Assistant Component

```typescript
import { YipYapAssistant } from "../components/YipYapAssistant";

function MyPage() {
  return (
    <div>
      {/* Your page content */}
      
      <YipYapAssistant 
        currentPath="/current/dataset/path"
        selectedImages={["selected1.jpg", "selected2.png"]}
      />
    </div>
  );
}
```

## Configuration

### Assistant Personality

The yipyap assistant is configured with a custom system prompt that:

- Identifies as 🦊 (fox emoji)
- Specializes in dataset management tasks
- Provides helpful, technical guidance
- Maintains a friendly but professional tone
- Focuses on yipyap-specific workflows

### Model Recommendations

**For Development/Testing:**

- `qwen3:8b` (8B) - Fast, good for all queries

## Troubleshooting

### Common Issues

**Assistant Shows as Offline:**

1. Verify Ollama is running: `ollama list`
2. Check the service: `ollama serve`
3. Verify the URL in environment variables
4. Check firewall settings for port 11434

**Slow Responses:**

1. Use a smaller model (llama3.2 vs llama3.1:8b)
2. Ensure adequate system resources
3. Check if other applications are using GPU/CPU

**Model Not Found:**

1. Pull the model: `ollama pull model-name`
2. Verify model name in settings
3. Refresh the models list in the UI

**Connection Errors:**

1. Verify Ollama server is accessible
2. Check network settings and firewall
3. Ensure correct OLLAMA_BASE_URL

### Performance Tips

1. **Memory Management:**
   - Ollama loads models into memory
   - Larger models require more RAM
   - Only keep needed models pulled

2. **GPU Acceleration:**
   - Ollama automatically uses GPU if available
   - Ensure proper GPU drivers are installed
   - Monitor GPU memory usage

3. **Response Speed:**
   - Smaller models respond faster
   - Local models are always faster than API calls
   - Consider model size vs. quality tradeoffs

## Development

### Adding New Features

The Ollama integration is modular and extensible:

1. **Backend:** Add new endpoints in `app/api/ollama.py`
2. **Frontend:** Extend the composable in `src/composables/useOllama.ts`
3. **Assistant:** Modify system prompt in `app/ollama_integration.py`

### Custom Prompts

You can create custom prompts for specific use cases:

```python
# In YipYapAssistant class
def create_specialized_prompt(self, task_type: str) -> str:
    base_prompt = self.system_prompt
    
    if task_type == "tagging":
        return base_prompt + "\n\nFocus specifically on image tagging best practices..."
    elif task_type == "organization":
        return base_prompt + "\n\nProvide detailed dataset organization strategies..."
    
    return base_prompt
```

## Security Considerations

1. **Local Processing:** All data stays on your local machine
2. **No API Keys:** No external service dependencies
3. **Privacy:** Conversations are not logged or transmitted
4. **Access Control:** Uses existing yipyap authentication

## Future Enhancements

Planned improvements include:

- Multi-modal support (image + text input)
- Integration with caption generation models
- Custom tool/function calling
- Dataset analysis and insights
- Automated workflow suggestions
- Integration with tagging systems

## Contributing

To contribute to the Ollama integration:

1. Follow the existing code patterns
2. Add appropriate error handling
3. Include type definitions
4. Update documentation
5. Test with multiple models
6. Consider performance implications

## License

The Ollama integration follows the same MIT license as the rest of YipYap.
