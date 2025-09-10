# 🦊> Reynard Ollama Backend Implementation

A complete Ollama local LLM backend system for Reynard, ported from Yipyap's battle-tested implementation with ReynardAssistant, tool calling, streaming responses, and context awareness.

## ✨ Features

### 🚀 **Core Capabilities**

- **Local LLM Integration**: Full Ollama server integration with model management
- **ReynardAssistant**: Advanced AI assistant with tool calling and context awareness
- **Streaming Responses**: Real-time chat with Server-Sent Events (SSE)
- **Tool Calling**: Dynamic tool execution and integration
- **Model Management**: Pull, list, and manage Ollama models
- **Context Awareness**: Maintain conversation context and memory
- **Performance Monitoring**: Comprehensive statistics and health monitoring

### 🎯 **API Endpoints**

- `POST /api/ollama/chat` - Single chat with Ollama model
- `POST /api/ollama/chat/stream` - Streaming chat with Ollama model
- `POST /api/ollama/assistant` - Chat with ReynardAssistant
- `POST /api/ollama/assistant/stream` - Streaming chat with ReynardAssistant
- `GET /api/ollama/models` - Available models
- `GET /api/ollama/config` - Get configuration
- `POST /api/ollama/config` - Update configuration
- `GET /api/ollama/admin/stats` - Service statistics
- `GET /api/ollama/admin/health` - Health check
- `GET /api/ollama/admin/models` - Detailed model information
- `POST /api/ollama/admin/models/{model_name}/pull` - Pull model
- `POST /api/ollama/admin/cleanup` - Cleanup resources

## 📦 Architecture

### **Service Layer**

```
backend/app/services/ollama/
├── __init__.py
├── ollama_service.py      # Main Ollama orchestrator
└── models.py              # Data models and configurations
```

### **API Layer**

```
backend/app/api/ollama/
├── __init__.py
├── router.py              # Main router
├── endpoints.py           # Core chat endpoints
├── admin.py               # Administrative endpoints
├── models.py              # Pydantic models
└── service.py             # Service layer integration
```

## 🚀 Quick Start

### **Prerequisites**

1. **Ollama Server** (required):

   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Start Ollama server
   ollama serve
   
   # Pull a model (e.g., Llama 3.1)
   ollama pull llama3.1
   ```

2. **Python Dependencies**:

   ```bash
   pip install aiohttp httpx
   ```

### **Configuration**

1. **Copy configuration template**:

   ```bash
   cp ollama_config_example.env .env
   ```

2. **Update Ollama settings**:

   ```env
   OLLAMA_ENABLED=true
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_DEFAULT_MODEL=llama3.1
   OLLAMA_TIMEOUT_SECONDS=300
   OLLAMA_ASSISTANT_ENABLED=true
   OLLAMA_TOOLS_ENABLED=true
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

### **Running the Backend**

```bash
# Start the FastAPI server
python main.py

# The Ollama API will be available at:
# http://localhost:8000/api/ollama/
```

## 🔧 Configuration Options

### **Core Settings**

- `OLLAMA_ENABLED`: Enable/disable Ollama service
- `OLLAMA_BASE_URL`: Ollama server URL (default: <http://localhost:11434>)
- `OLLAMA_DEFAULT_MODEL`: Default model for generation
- `OLLAMA_TIMEOUT_SECONDS`: Request timeout (300 seconds)

### **Performance Tuning**

- `OLLAMA_MAX_CONCURRENT_REQUESTS`: Maximum concurrent requests (5)
- `OLLAMA_ASSISTANT_ENABLED`: Enable ReynardAssistant
- `OLLAMA_TOOLS_ENABLED`: Enable tool calling
- `OLLAMA_CONTEXT_AWARENESS`: Enable context awareness

### **Model Configuration**

- `OLLAMA_TEMPERATURE`: Sampling temperature (0.7)
- `OLLAMA_MAX_TOKENS`: Maximum tokens to generate (2048)
- `OLLAMA_SYSTEM_PROMPT`: Default system prompt

## 🤖 Assistant Details

### **ReynardAssistant**

- **Features**: Advanced AI assistant with tool calling and context awareness
- **Capabilities**:
  - Natural language understanding
  - Tool execution and integration
  - Context-aware conversations
  - Multi-turn dialogue
- **Tools**: Search, file operations, code execution, data analysis
- **Use Cases**: General assistance, code help, research, analysis

### **CodeWolf Assistant**

- **Features**: Specialized coding assistant
- **Capabilities**:
  - Code generation and analysis
  - Debugging assistance
  - Code review and optimization
  - Documentation generation
- **Tools**: Code analysis, testing, documentation, version control
- **Use Cases**: Software development, code review, technical assistance

## 📊 Usage Examples

### **Basic Chat**

```python
import requests

# Single chat with Ollama
response = requests.post("http://localhost:8000/api/ollama/chat", json={
    "message": "Hello, how are you?",
    "model": "llama3.1",
    "temperature": 0.7,
    "max_tokens": 100
})

result = response.json()
if result["success"]:
    print(f"Response: {result['response']}")
    print(f"Processing time: {result['processing_time']:.2f}s")
```

### **Streaming Chat**

```python
import requests
import json

# Streaming chat with Ollama
response = requests.post(
    "http://localhost:8000/api/ollama/chat/stream",
    json={
        "message": "Tell me a story about a fox",
        "model": "llama3.1",
        "stream": True
    },
    stream=True
)

response_text = ""
for line in response.iter_lines():
    if line:
        event = json.loads(line.decode('utf-8'))
        if event["type"] == "token":
            response_text += event["data"]
            print(event["data"], end="", flush=True)
        elif event["type"] == "complete":
            print(f"\n\nChat completed: {len(response_text)} characters")
```

### **ReynardAssistant Chat**

```python
# Chat with ReynardAssistant
response = requests.post("http://localhost:8000/api/ollama/assistant", json={
    "message": "Can you help me search for information about AI?",
    "assistant_type": "reynard",
    "model": "llama3.1",
    "tools_enabled": True,
    "temperature": 0.7
})

result = response.json()
if result["success"]:
    print(f"Assistant response: {result['response']}")
    print(f"Tools used: {result['tools_used']}")
```

### **Streaming Assistant Chat**

```python
# Streaming chat with ReynardAssistant
response = requests.post(
    "http://localhost:8000/api/ollama/assistant/stream",
    json={
        "message": "Help me analyze this data",
        "assistant_type": "reynard",
        "tools_enabled": True,
        "stream": True
    },
    stream=True
)

response_text = ""
tools_used = []
for line in response.iter_lines():
    if line:
        event = json.loads(line.decode('utf-8'))
        if event["type"] == "token":
            response_text += event["data"]
            print(event["data"], end="", flush=True)
        elif event["type"] == "tool_call":
            tool_name = event["metadata"].get("tool_name", "unknown")
            tools_used.append(tool_name)
            print(f"\n[Using tool: {tool_name}]")
        elif event["type"] == "complete":
            print(f"\n\nAssistant completed: {len(response_text)} characters")
            print(f"Tools used: {tools_used}")
```

## 🔍 Monitoring and Administration

### **Service Statistics**

```bash
curl http://localhost:8000/api/ollama/admin/stats
```

Returns:

```json
{
  "total_requests": 150,
  "successful_requests": 145,
  "failed_requests": 5,
  "average_processing_time": 2.3,
  "total_tokens_generated": 45000,
  "model_usage": {
    "llama3.1": 100,
    "codellama": 30,
    "mistral": 20
  },
  "assistant_usage": {
    "reynard": 80,
    "codewolf": 50
  },
  "tools_usage": {
    "search": 40,
    "file_ops": 20,
    "code_analysis": 15
  },
  "error_rate": 3.33
}
```

### **Health Check**

```bash
curl http://localhost:8000/api/ollama/admin/health
```

### **Available Models**

```bash
curl http://localhost:8000/api/ollama/admin/models
```

### **Pull New Model**

```bash
curl -X POST http://localhost:8000/api/ollama/admin/models/mistral/pull
```

## 🛠️ Development

### **Adding New Tools**

1. **Create tool class**:

   ```python
   from .base import Tool
   
   class MyTool(Tool):
       def __init__(self):
           super().__init__("my_tool")
       
       async def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
           # Implement tool logic
           return {"result": "success"}
   ```

2. **Register in assistant**:

   ```python
   # In reynard_assistant.py
   from .my_tool import MyTool
   
   async def _initialize_tools(self):
       self._tools["my_tool"] = MyTool()
   ```

### **Adding New Assistants**

1. **Create assistant class**:

   ```python
   from .base import Assistant
   
   class MyAssistant(Assistant):
       def __init__(self, client: OllamaClient, config: OllamaConfig):
           super().__init__("my_assistant", client, config)
       
       async def chat_stream(self, params: OllamaAssistantParams):
           # Implement assistant logic
           pass
   ```

2. **Register in service**:

   ```python
   # In ollama_service.py
   from .my_assistant import MyAssistant
   
   async def _initialize_assistants(self):
       self._assistants["my_assistant"] = MyAssistant(self._client, self._config)
   ```

### **Testing**

```bash
# Run Ollama service tests
python test_ollama_api.py

# Test specific model
python -c "
import asyncio
from app.services.ollama import OllamaService

async def test():
    service = OllamaService()
    await service.initialize({'ollama': {'enabled': True}})
    result = await service.chat_stream('Test message')
    print(result)

asyncio.run(test())
"
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Ollama server not running**:
   - Start Ollama server: `ollama serve`
   - Check server health: `curl http://localhost:11434/api/tags`

2. **Model not available**:
   - Pull the model: `ollama pull llama3.1`
   - Check available models: `ollama list`

3. **Connection timeout**:
   - Increase `OLLAMA_TIMEOUT_SECONDS`
   - Check network connectivity
   - Verify Ollama server is accessible

4. **Memory issues**:
   - Reduce `max_tokens` parameter
   - Use smaller models
   - Increase system memory

### **Performance Optimization**

- **Model Selection**: Choose appropriate model size for your use case
- **Concurrent Requests**: Balance throughput with resource usage
- **Streaming**: Use streaming for better responsiveness
- **Context Management**: Optimize context length for memory usage

## 📈 Performance Metrics

### **Benchmarks**

- **Llama 3.1 8B**: ~2-5 seconds for 100 tokens (GPU), ~5-10 seconds (CPU)
- **CodeLlama 7B**: ~1-3 seconds for 100 tokens (GPU), ~3-8 seconds (CPU)
- **Mistral 7B**: ~1-2 seconds for 100 tokens (GPU), ~2-5 seconds (CPU)

### **Resource Usage**

- **Memory**: 4-16GB depending on model size
- **CPU**: Moderate usage for text processing
- **GPU**: High usage during generation, idle otherwise

## 🔒 Security Considerations

- **Input Validation**: Message length limits and content filtering
- **Rate Limiting**: Prevent abuse with configurable limits
- **Tool Execution**: Sandboxed tool execution environment
- **Access Control**: Authentication required for admin endpoints

## 🎉 Conclusion

The Reynard Ollama backend provides a robust, scalable solution for local LLM integration with advanced assistant capabilities, tool calling, and comprehensive monitoring. The system gracefully handles missing Ollama server and provides fallback functionality for development and testing.

Key benefits:

- **Local LLM Integration**: Full Ollama server integration with model management
- **Advanced Assistants**: ReynardAssistant and CodeWolf with tool calling
- **Streaming Responses**: Real-time chat with minimal latency
- **Tool Calling**: Dynamic tool execution and integration
- **Production Ready**: Health monitoring, statistics, and error handling
- **Developer Friendly**: Comprehensive API and easy extension
- **Performance Optimized**: Efficient model management and resource usage

*Build intelligent local AI applications with the cunning precision of a fox!* 🦊
