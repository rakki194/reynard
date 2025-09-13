# 🦊> Reynard TTS Backend Implementation

A complete Text-to-Speech (TTS) backend system for Reynard, built with multi-backend support and
comprehensive audio processing capabilities.

## ✨ Features

### 🚀 **Core Capabilities**

- **Multi-Backend Support**: Kokoro, Coqui TTS, and XTTS with automatic fallback
- **Voice Cloning**: XTTS integration for voice cloning capabilities
- **Audio Processing**: FFmpeg integration for format conversion and optimization
- **Batch Processing**: Concurrent synthesis with configurable limits
- **Performance Modes**: Power-saving, normal, and performance modes for Kokoro
- **Health Monitoring**: Backend health checks and automatic failover
- **Rate Limiting**: Configurable rate limits and request validation

### 🎯 **API Endpoints**

See [Shared API Patterns](./shared/api-patterns.md) for common request/response structures.

**Core Endpoints:**

- `POST /api/tts/synthesize` - Single text synthesis
- `POST /api/tts/synthesize/batch` - Batch text synthesis
- `POST /api/tts/voice-clone` - Voice cloning synthesis
- `GET /api/tts/audio/{filename}` - Audio file retrieval

**Admin Endpoints:**

- `GET /api/tts/config` - Get configuration
- `POST /api/tts/config` - Update configuration
- `GET /api/tts/admin/stats` - Service statistics
- `GET /api/tts/admin/backends` - Available backends
- `GET /api/tts/admin/health` - Health check
- `POST /api/tts/admin/backends/{name}/reload` - Reload backend
- `POST /api/tts/admin/cleanup` - Clean up audio files

## 📦 Architecture

### **Service Layer**

```
backend/app/services/tts/
├── __init__.py
├── tts_service.py          # Main TTS orchestrator
└── audio_processor.py      # Audio processing and conversion
```

### **Backend Integrations**

```
backend/app/integration/tts/
├── __init__.py
├── base.py                 # Abstract base class
├── kokoro_backend.py       # Kokoro TTS implementation
├── coqui_backend.py        # Coqui TTS implementation
└── xtts_backend.py         # XTTS implementation
```

### **API Layer**

```
backend/app/api/tts/
├── __init__.py
├── router.py               # Main router
├── endpoints.py            # Core synthesis endpoints
├── admin.py                # Administrative endpoints
├── models.py               # Pydantic models
└── service.py              # Service layer integration
```

## 🚀 Quick Start

See [Shared Installation Guides](./shared/installation-guides.md) for detailed setup instructions.

### **Prerequisites**

1. **TTS Libraries** (optional, for full functionality):

   ```bash
   pip install kokoro TTS  # XTTS included with Coqui TTS
   ```

2. **FFmpeg** (for audio processing) - See shared installation guide

### **Configuration**

See [Shared Configuration Examples](./shared/configuration-examples.md) for environment setup.

**Key environment variables:**

```env
TTS_ENABLED=true
TTS_DEFAULT_BACKEND=kokoro
TTS_AUDIO_DIR=generated/audio
TTS_MAX_TEXT_LENGTH=10000
```

### **Running the Backend**

```bash
# Start the FastAPI server
python main.py

# The TTS API will be available at:
# http://localhost:8000/api/tts/
```

## 🔧 Configuration Options

### **Core Settings**

- `TTS_ENABLED`: Enable/disable TTS system
- `TTS_DEFAULT_BACKEND`: Default backend (kokoro, coqui, xtts)
- `TTS_AUDIO_DIR`: Output directory for audio files
- `TTS_KOKORO_MODE`: Kokoro mode (powersave, normal, performance)

### **Performance Tuning**

- `TTS_MAX_TEXT_LENGTH`: Maximum text length (default: 10000)
- `TTS_MAX_CHUNK_LENGTH`: Text chunk size (default: 2000)
- `TTS_CHUNK_OVERLAP_CHARS`: Chunk overlap (default: 100)
- `TTS_RATE_LIMIT_PER_MINUTE`: Rate limit (default: 60)

### **Audio Processing**

- `TTS_AUDIO_PROCESSING_ENABLED`: Enable audio processing
- `TTS_AUDIO_QUALITY`: Audio quality (low, medium, high)

## 🎵 Backend Details

### **Kokoro TTS**

- **Features**: High-quality voice synthesis, GPU acceleration
- **Voices**: af_heart, af_soft, af_strong
- **Languages**: English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Hindi
- **Modes**:
  - `powersave`: Lazy loading, auto-unload after 5 minutes
  - `normal`: Balanced performance and memory usage
  - `performance`: Keep models loaded for maximum speed

### **Coqui TTS**

- **Features**: Open-source TTS with multiple models
- **Voices**: default, male, female
- **Languages**: 10+ languages supported
- **Formats**: WAV, MP3

### **XTTS**

- **Features**: Voice cloning, multilingual support
- **Voices**: default, clone
- **Languages**: 16+ languages including English, Spanish, French, German, Italian, Portuguese, Polish, Turkish, Russian, Dutch, Czech, Arabic, Chinese, Japanese, Hungarian, Korean
- **Special**: Voice cloning with reference audio

## 📊 Usage Examples

### **Basic Synthesis**

```python
import requests

# Single text synthesis
response = requests.post("http://localhost:8000/api/tts/synthesize", json={
    "text": "Hello, this is a test of the TTS system.",
    "backend": "kokoro",
    "voice": "af_heart",
    "speed": 1.0,
    "lang": "en"
})

result = response.json()
if result["success"]:
    print(f"Audio generated: {result['audio_url']}")
```

### **Batch Synthesis**

```python
# Batch synthesis
response = requests.post("http://localhost:8000/api/tts/synthesize/batch", json={
    "texts": [
        "First sentence to synthesize.",
        "Second sentence to synthesize.",
        "Third sentence to synthesize."
    ],
    "backend": "coqui",
    "voice": "default",
    "speed": 1.2
})

result = response.json()
for i, synthesis_result in enumerate(result["results"]):
    if synthesis_result["success"]:
        print(f"Audio {i+1}: {synthesis_result['audio_url']}")
```

### **Voice Cloning**

```python
# Voice cloning with XTTS
files = {
    "reference_audio": open("reference.wav", "rb")
}
data = {
    "text": "This will be spoken in the cloned voice.",
    "speed": 1.0,
    "lang": "en"
}

response = requests.post(
    "http://localhost:8000/api/tts/voice-clone",
    files=files,
    data=data
)

result = response.json()
if result["success"]:
    print(f"Cloned voice audio: {result['audio_url']}")
```

## 🔍 Monitoring and Administration

### **Service Statistics**

```bash
curl http://localhost:8000/api/tts/admin/stats
```

Returns:

```json
{
  "total_synthesis_requests": 150,
  "successful_synthesis": 145,
  "failed_synthesis": 5,
  "average_processing_time": 2.3,
  "total_audio_generated": 1200.5,
  "backend_usage": {
    "kokoro": 100,
    "coqui": 30,
    "xtts": 20
  },
  "voice_usage": {
    "af_heart": 80,
    "default": 50,
    "clone": 20
  },
  "error_rate": 3.33
}
```

### **Health Check**

```bash
curl http://localhost:8000/api/tts/admin/health
```

### **Available Backends**

```bash
curl http://localhost:8000/api/tts/admin/backends
```

## 🛠️ Development

### **Adding New Backends**

1. **Create backend class**:

   ```python
   from .base import TTSBackend

   class MyBackend(TTSBackend):
       def __init__(self):
           super().__init__("my_backend")

       async def initialize(self) -> bool:
           # Initialize your backend
           return True

       async def synthesize(self, text: str, out_path: Path, **kwargs) -> Path:
           # Implement synthesis logic
           return out_path
   ```

2. **Register in service**:

   ```python
   # In tts_service.py
   from ...integration.tts.my_backend import MyBackend

   async def _initialize_backends(self):
       self._backend_services["my_backend"] = MyBackend()
       await self._backend_services["my_backend"].initialize()
   ```

### **Testing**

```bash
# Run TTS service tests
python test_tts_api.py

# Test specific backend
python -c "
import asyncio
from app.services.tts import TTSService

async def test():
    service = TTSService()
    await service.initialize({'tts_enabled': True})
    result = await service.synthesize_text('Test', 'test.wav')
    print(result)

asyncio.run(test())
"
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Backend not available**:
   - Install required TTS libraries
   - Check backend health: `GET /api/tts/admin/health`

2. **Audio processing fails**:
   - Install FFmpeg
   - Check FFmpeg availability in logs

3. **High memory usage**:
   - Use `powersave` mode for Kokoro
   - Reduce `TTS_MAX_CHUNK_LENGTH`

4. **Slow synthesis**:
   - Use `performance` mode for Kokoro
   - Enable GPU acceleration
   - Reduce batch size

### **Performance Optimization**

- **GPU Acceleration**: Ensure CUDA is available for Kokoro
- **Memory Management**: Use appropriate Kokoro modes
- **Batch Processing**: Limit concurrent synthesis
- **Audio Caching**: Implement audio file caching for repeated requests

## 📈 Performance Metrics

### **Benchmarks**

- **Kokoro**: ~2-3 seconds for 100 words (GPU), ~5-8 seconds (CPU)
- **Coqui**: ~1-2 seconds for 100 words
- **XTTS**: ~3-5 seconds for 100 words, ~10-15 seconds for voice cloning

### **Resource Usage**

- **Memory**: 2-8GB depending on backend and mode
- **CPU**: Moderate usage for audio processing
- **Storage**: ~1MB per minute of audio generated

## 🔒 Security Considerations

- **Input Validation**: Text length limits and content filtering
- **Rate Limiting**: Prevent abuse with configurable limits
- **File Cleanup**: Automatic cleanup of temporary audio files
- **Access Control**: Authentication required for admin endpoints

## 🎉 Conclusion

The Reynard TTS backend provides a robust,
scalable solution for text-to-speech synthesis with multiple backend support, voice cloning capabilities, and
comprehensive monitoring. The system gracefully handles missing dependencies and
provides fallback functionality for development and testing.

Key benefits:

- **Multi-Backend Support**: Choose the best TTS engine for your needs
- **Voice Cloning**: XTTS integration for personalized voices
- **Production Ready**: Health monitoring, rate limiting, and error handling
- **Developer Friendly**: Comprehensive API and easy backend extension
- **Performance Optimized**: Multiple performance modes and GPU acceleration

_Build voice-enabled applications with the cunning precision of a fox!_ 🦊
