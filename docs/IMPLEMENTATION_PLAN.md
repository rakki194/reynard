# Reynard Framework Implementation Plan

This document provides a detailed implementation plan for the most critical missing features in the Reynard framework.

## 🎯 Phase 1: Core AI/ML Services (Weeks 1-4)

### 1.1 Caption Generation Package ⚠️

**Priority**: **CRITICAL** - Frontend framework exists but lacks actual implementations
**Status**: Frontend framework complete, but NO actual model implementations exist

#### Current Implementation Reality

The caption generation system in `packages/annotating` provides:

- ✅ **AnnotationManager** - Main orchestrator framework
- ✅ **AnnotationService** - Service layer framework
- ✅ **BaseCaptionGenerator** - Abstract base class only
- ❌ **NO actual generators** - JTP2, WDv3, Florence2, JoyCaption are NOT implemented
- ✅ **Batch Processing Framework** - Structure exists but no actual processing
- ✅ **Event System** - Framework for lifecycle management
- ✅ **TypeScript Support** - Full type safety and comprehensive types

#### Critical Gap Discovered

**The frontend package is a complete framework but has NO actual caption generation capabilities**. Meanwhile, Yipyap contains sophisticated, fully-functional implementations of all these models.

#### Immediate Action Required

**Option 1: Bridge to Yipyap (Recommended)**

```python
# backend/app/api/caption.py
from fastapi import APIRouter, Depends, HTTPException
from app.models.caption import CaptionRequest, CaptionResponse
# Import Yipyap's sophisticated caption service
from third_party.yipyap.app.caption_generation.caption_service import get_caption_service

router = APIRouter(prefix="/api/caption", tags=["caption"])

@router.post("/generate", response_model=CaptionResponse)
async def generate_captions(
    request: CaptionRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Generate captions using Yipyap's sophisticated caption service"""
    service = get_caption_service()
    result = await service.generate_single_caption(
        image_path=request.image_path,
        generator_name=request.generator_name,
        config=request.config
    )
    return CaptionResponse(captions=result)

@router.get("/generators")
async def list_generators(current_user: User = Depends(get_current_active_user)):
    """List available caption generators from Yipyap"""
    service = get_caption_service()
    return service.get_available_generators()
```

**Option 2: Implement Generators in Reynard (Not Recommended)**
This would require reimplementing all the sophisticated model logic that already exists in Yipyap.

### 1.2 RAG System Enhancement

**Priority**: Critical
**Estimated Time**: 1 week

#### Implementation Steps

1. **Extend RAG Package**:

```typescript
// packages/rag/src/services/EmbeddingService.ts
export class EmbeddingService {
  private models: Map<string, any> = new Map();
  
  async loadModel(modelId: string): Promise<void> {
    // Load embedding model
  }
  
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Generate embeddings for texts
  }
  
  async searchSimilar(query: string, topK: number = 10): Promise<SearchResult[]> {
    // Search for similar content
  }
}
```

2. **Add Vector Database Integration**:

```python
# backend/app/services/vector_db.py
import asyncpg
from pgvector.asyncpg import register_vector

class VectorDatabase:
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
    
    async def connect(self):
        self.conn = await asyncpg.connect(self.connection_string)
        await register_vector(self.conn)
    
    async def insert_embeddings(self, embeddings: List[Embedding]):
        # Insert embeddings into vector database
        pass
    
    async def search_similar(self, query_vector: List[float], top_k: int = 10):
        # Search for similar embeddings
        pass
```

3. **Add RAG Endpoints**:

```python
# backend/app/api/rag.py
@router.post("/ingest")
async def ingest_documents(
    request: IngestRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Ingest documents for RAG"""
    pass

@router.post("/query")
async def query_rag(
    request: QueryRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Query RAG system"""
    pass
```

### 1.3 Model Management Backend

**Priority**: High
**Estimated Time**: 1 week

#### Implementation Steps

1. **Extend Backend with Model Endpoints**:

```python
# backend/app/api/models.py
@router.get("/models")
async def list_models(current_user: User = Depends(get_current_active_user)):
    """List all available models"""
    pass

@router.post("/models/{model_id}/download")
async def download_model(
    model_id: str,
    current_user: User = Depends(is_admin)
):
    """Download a model"""
    pass

@router.post("/models/{model_id}/load")
async def load_model(
    model_id: str,
    config: ModelConfig,
    current_user: User = Depends(is_admin)
):
    """Load a model with configuration"""
    pass
```

2. **Add Database Integration**:

```python
# backend/app/database/models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Model(Base):
    __tablename__ = "models"
    
    id = Column(Integer, primary_key=True)
    model_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    config = Column(String)  # JSON config
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
```

## 🎯 Phase 2: Advanced Features (Weeks 5-8)

### 2.1 Diffusion LLM Package

**Priority**: High
**Estimated Time**: 1 week

#### Implementation Steps

1. **Create Package Structure**:

```bash
mkdir -p packages/diffusion-llm/src/{models,services,types}
```

2. **Implement Models**:

```typescript
// packages/diffusion-llm/src/models/DreamOnModel.ts
export class DreamOnModel {
  async generateText(prompt: string, options: GenerationOptions): Promise<GenerationResult> {
    // Generate text using DreamOn model
  }
  
  async infillText(text: string, mask: string): Promise<string> {
    // Infill masked text
  }
}

// packages/diffusion-llm/src/models/LLaDAModel.ts
export class LLaDAModel {
  async generateStreaming(prompt: string, options: GenerationOptions): Promise<AsyncIterable<string>> {
    // Generate streaming text
  }
}
```

### 2.2 TTS Integration

**Priority**: Medium
**Estimated Time**: 1 week

#### Implementation Steps

1. **Create TTS Package**:

```typescript
// packages/tts/src/services/TTSService.ts
export class TTSService {
  async generateSpeech(text: string, options: TTSOptions): Promise<AudioBuffer> {
    // Generate speech from text
  }
  
  async batchGenerate(texts: string[], options: TTSOptions): Promise<AudioBuffer[]> {
    // Generate multiple audio files
  }
}
```

### 2.3 ComfyUI Integration

**Priority**: Medium
**Estimated Time**: 1 week

#### Implementation Steps

1. **Create ComfyUI Package**:

```typescript
// packages/comfy/src/services/ComfyService.ts
export class ComfyService {
  async queueWorkflow(workflow: Workflow): Promise<JobId> {
    // Queue a ComfyUI workflow
  }
  
  async getJobStatus(jobId: JobId): Promise<JobStatus> {
    // Get job status
  }
  
  async getResult(jobId: JobId): Promise<JobResult> {
    // Get job result
  }
}
```

## 🎯 Phase 3: External Integrations (Weeks 9-12)

### 3.1 Ollama Integration

**Priority**: Medium
**Estimated Time**: 1 week

#### Implementation Steps

1. **Create Ollama Package**:

```typescript
// packages/ollama/src/services/OllamaService.ts
export class OllamaService {
  async listModels(): Promise<Model[]> {
    // List available Ollama models
  }
  
  async chatWithModel(model: string, messages: Message[]): Promise<ChatResponse> {
    // Chat with Ollama model
  }
  
  async streamChat(model: string, messages: Message[]): Promise<AsyncIterable<string>> {
    // Stream chat responses
  }
}
```

### 3.2 Web Crawling Service

**Priority**: Low
**Estimated Time**: 1 week

#### Implementation Steps

1. **Create Crawling Package**:

```typescript
// packages/crawling/src/services/CrawlingService.ts
export class CrawlingService {
  async crawlUrl(url: string): Promise<CrawlResult> {
    // Crawl a URL and extract content
  }
  
  async summarizeContent(content: string): Promise<Summary> {
    // Summarize crawled content
  }
}
```

## 📋 Implementation Checklist

### Week 1-2: Core AI/ML Services

- [x] ~~Create caption generation package~~ **COMPLETED** - Exists in `packages/annotating`
- [x] ~~Implement JTP2, WDv3, Florence2 models~~ **COMPLETED** - Already implemented
- [ ] Add caption generation backend endpoints (integrate with existing frontend)
- [ ] Test caption generation pipeline

### Week 3-4: RAG System

- [ ] Enhance RAG package with embedding services
- [ ] Add vector database integration
- [ ] Implement RAG endpoints
- [ ] Test RAG functionality

### Week 5-6: Model Management

- [ ] Extend backend with model management
- [ ] Add database integration
- [ ] Implement model lifecycle management
- [ ] Test model management system

### Week 7-8: Advanced Features

- [ ] Create diffusion LLM package
- [ ] Implement TTS integration
- [ ] Add ComfyUI integration
- [ ] Test advanced features

### Week 9-10: External Integrations

- [ ] Implement Ollama integration
- [ ] Add web crawling service
- [ ] Test external integrations
- [ ] Document new features

### Week 11-12: Testing & Documentation

- [ ] Add comprehensive tests
- [ ] Update documentation
- [ ] Create example applications
- [ ] Performance optimization

## 🚀 Getting Started

### Current Status: Critical Gap Identified ⚠️

**The caption generation system in `packages/annotating` is NOT functional** - it's a complete frontend framework with no actual model implementations.

### Immediate Priority: Bridge to Yipyap

1. **Create API endpoints to expose Yipyap's caption service**:

```bash
cd backend
mkdir -p app/api app/services app/models
```

2. **Implement caption endpoints that bridge to Yipyap**:

```python
# backend/app/api/caption.py
from fastapi import APIRouter, Depends
from third_party.yipyap.app.caption_generation.caption_service import get_caption_service

router = APIRouter(prefix="/api/caption", tags=["caption"])

@router.post("/generate")
async def generate_captions(request: CaptionRequest):
    service = get_caption_service()
    return await service.generate_single_caption(
        image_path=request.image_path,
        generator_name=request.generator_name,
        config=request.config
    )
```

3. **Update Reynard frontend to use backend APIs**:
   - Modify `packages/annotating` to make HTTP requests to backend
   - Remove the non-functional local model implementations
   - Connect to the actual Yipyap caption service via API

4. **Test end-to-end integration**:
   - Verify frontend can generate captions via backend
   - Test all caption types (JTP2, Florence2, etc.)
   - Ensure batch processing works correctly

### Why This Approach is Critical

- **Yipyap already has everything**: Sophisticated model implementations, GPU acceleration, batch processing, error handling
- **Reynard has the UI**: Excellent frontend components that just need to connect to real services
- **No duplication**: Avoids reimplementing thousands of lines of complex model code
- **Immediate functionality**: Can have working caption generation in days, not months

This represents the fastest path to a fully functional caption generation system in Reynard.
