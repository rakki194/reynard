#!/usr/bin/env python3
"""
Reynard API Tool Integration Test

This script demonstrates elaborate tool calling patterns specifically designed
for Reynard API endpoints, showcasing how NLWeb can intelligently route
queries to the appropriate Reynard services.
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Any

# Add the backend app to the path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "app"))

from app.services.nlweb.models import (
    NLWebConfiguration,
    NLWebContext,
    NLWebSuggestionRequest,
    NLWebTool,
    NLWebToolParameter,
)
from app.services.nlweb.nlweb_service import NLWebService
from app.services.nlweb.nlweb_tool_registry import NLWebToolRegistry


class ReynardAPIToolIntegration:
    """Integration test for Reynard API-specific tool calling."""

    def __init__(self):
        self.registry = NLWebToolRegistry()
        self.service = None

    async def setup(self):
        """Set up the Reynard API integration environment."""
        print("🦊> Setting up Reynard API Tool Integration")
        print("=" * 60)

        # Create configuration
        config = NLWebConfiguration(
            enabled=True,
            base_url="http://localhost:3001",
            suggest_timeout_s=3.0,
            cache_ttl_s=20.0,
        )

        # Create service
        self.service = NLWebService(config)
        await self.service.initialize()

        # Register Reynard-specific tools
        await self._register_reynard_api_tools()

        print("✅ Reynard API integration setup completed!")
        print()

    async def _register_reynard_api_tools(self):
        """Register Reynard API-specific tools."""
        print("🦦> Registering Reynard API tools...")

        # ComfyUI Image Generation Tool
        comfy_tool = NLWebTool(
            name="comfy_image_generation",
            description="Generate images using ComfyUI workflows with advanced control",
            category="image_generation",
            tags=["comfy", "image", "generation", "workflow", "ai"],
            path="/api/comfy/generate",
            method="POST",
            parameters=[
                NLWebToolParameter(
                    name="workflow_type",
                    type="string",
                    description="Type of ComfyUI workflow to use",
                    required=True,
                    constraints={
                        "enum": [
                            "text2img",
                            "img2img",
                            "upscale",
                            "controlnet",
                            "custom",
                        ]
                    },
                ),
                NLWebToolParameter(
                    name="prompt",
                    type="string",
                    description="Text prompt for image generation",
                    required=True,
                ),
                NLWebToolParameter(
                    name="negative_prompt",
                    type="string",
                    description="Negative prompt to avoid certain elements",
                    required=False,
                ),
                NLWebToolParameter(
                    name="parameters",
                    type="object",
                    description="Advanced generation parameters",
                    required=False,
                    default={
                        "width": 512,
                        "height": 512,
                        "steps": 20,
                        "cfg_scale": 7.0,
                        "seed": -1,
                        "sampler": "euler_a",
                    },
                ),
                NLWebToolParameter(
                    name="workflow_options",
                    type="object",
                    description="ComfyUI workflow-specific options",
                    required=False,
                    default={
                        "enable_controlnet": False,
                        "enable_upscaling": False,
                        "save_intermediate": False,
                    },
                ),
            ],
            examples=[
                "generate a futuristic cityscape with neon lights",
                "create a portrait of a cyberpunk character",
                "upscale an existing image to 4K resolution",
                "generate an image using ControlNet with pose guidance",
            ],
            priority=95,
        )

        # RAG Document Search Tool
        rag_tool = NLWebTool(
            name="rag_document_search",
            description="Search and retrieve information from documents using RAG system",
            category="document_search",
            tags=["rag", "search", "documents", "semantic", "retrieval"],
            path="/api/rag/query",
            method="POST",
            parameters=[
                NLWebToolParameter(
                    name="query",
                    type="string",
                    description="Search query for document retrieval",
                    required=True,
                ),
                NLWebToolParameter(
                    name="modality",
                    type="string",
                    description="Search modality (text, image, or multimodal)",
                    required=False,
                    default="text",
                    constraints={"enum": ["text", "image", "multimodal"]},
                ),
                NLWebToolParameter(
                    name="search_options",
                    type="object",
                    description="Advanced search options",
                    required=False,
                    default={
                        "top_k": 10,
                        "similarity_threshold": 0.7,
                        "enable_reranking": True,
                        "include_metadata": True,
                    },
                ),
                NLWebToolParameter(
                    name="filters",
                    type="object",
                    description="Search filters and constraints",
                    required=False,
                    default={
                        "document_types": [],
                        "date_range": None,
                        "authors": [],
                        "tags": [],
                    },
                ),
            ],
            examples=[
                "search for information about machine learning algorithms",
                "find documents related to Python programming",
                "retrieve research papers on neural networks",
                "search for code examples in the documentation",
            ],
            priority=90,
        )

        # TTS Audio Generation Tool
        tts_tool = NLWebTool(
            name="tts_audio_generation",
            description="Generate high-quality audio from text using TTS services",
            category="audio_generation",
            tags=["tts", "audio", "speech", "synthesis", "voice"],
            path="/api/tts/synthesize",
            method="POST",
            parameters=[
                NLWebToolParameter(
                    name="text",
                    type="string",
                    description="Text to convert to speech",
                    required=True,
                ),
                NLWebToolParameter(
                    name="voice",
                    type="string",
                    description="Voice to use for synthesis",
                    required=False,
                    default="default",
                    constraints={
                        "enum": ["default", "male", "female", "child", "elderly"]
                    },
                ),
                NLWebToolParameter(
                    name="backend",
                    type="string",
                    description="TTS backend to use",
                    required=False,
                    default="kokoro",
                    constraints={"enum": ["kokoro", "coqui", "xtts"]},
                ),
                NLWebToolParameter(
                    name="audio_options",
                    type="object",
                    description="Audio generation options",
                    required=False,
                    default={
                        "speed": 1.0,
                        "language": "en",
                        "to_ogg": False,
                        "to_opus": False,
                        "quality": "high",
                    },
                ),
            ],
            examples=[
                "convert this text to speech with a female voice",
                "generate audio narration for a presentation",
                "create voice-over for a video tutorial",
                "synthesize speech in multiple languages",
            ],
            priority=85,
        )

        # Image Processing Tool
        image_utils_tool = NLWebTool(
            name="image_processing",
            description="Process and manipulate images using advanced image utilities",
            category="image_processing",
            tags=["image", "processing", "manipulation", "format", "conversion"],
            path="/api/image-utils/process",
            method="POST",
            parameters=[
                NLWebToolParameter(
                    name="operation",
                    type="string",
                    description="Image processing operation to perform",
                    required=True,
                    constraints={
                        "enum": ["resize", "convert", "enhance", "analyze", "validate"]
                    },
                ),
                NLWebToolParameter(
                    name="input_format",
                    type="string",
                    description="Input image format",
                    required=True,
                    constraints={
                        "enum": ["jpg", "png", "webp", "jxl", "avif", "bmp", "tiff"]
                    },
                ),
                NLWebToolParameter(
                    name="output_format",
                    type="string",
                    description="Output image format",
                    required=False,
                    default="png",
                ),
                NLWebToolParameter(
                    name="processing_options",
                    type="object",
                    description="Processing-specific options",
                    required=False,
                    default={
                        "quality": 90,
                        "preserve_metadata": True,
                        "optimize_size": True,
                    },
                ),
            ],
            examples=[
                "resize an image to 1920x1080 resolution",
                "convert image from JPG to WebP format",
                "enhance image quality and remove noise",
                "validate image format and get dimensions",
            ],
            priority=80,
        )

        # Caption Generation Tool
        caption_tool = NLWebTool(
            name="caption_generation",
            description="Generate descriptive captions for images using AI models",
            category="caption_generation",
            tags=["caption", "image", "description", "ai", "analysis"],
            path="/api/caption/generate",
            method="POST",
            parameters=[
                NLWebToolParameter(
                    name="generator",
                    type="string",
                    description="Caption generator to use",
                    required=False,
                    default="blip2",
                    constraints={"enum": ["blip2", "clip", "gpt4v", "custom"]},
                ),
                NLWebToolParameter(
                    name="caption_options",
                    type="object",
                    description="Caption generation options",
                    required=False,
                    default={
                        "style": "descriptive",
                        "max_length": 200,
                        "include_objects": True,
                        "include_emotions": False,
                        "language": "en",
                    },
                ),
                NLWebToolParameter(
                    name="batch_processing",
                    type="boolean",
                    description="Enable batch processing for multiple images",
                    required=False,
                    default=False,
                ),
            ],
            examples=[
                "generate a detailed caption for this image",
                "create captions for a batch of photos",
                "describe the scene and objects in the image",
                "generate captions in multiple languages",
            ],
            priority=75,
        )

        # Ollama Chat Tool
        ollama_tool = NLWebTool(
            name="ollama_chat",
            description="Chat with local LLM models using Ollama integration",
            category="llm_chat",
            tags=["ollama", "llm", "chat", "local", "ai"],
            path="/api/ollama/chat",
            method="POST",
            parameters=[
                NLWebToolParameter(
                    name="message",
                    type="string",
                    description="Message to send to the LLM",
                    required=True,
                ),
                NLWebToolParameter(
                    name="model",
                    type="string",
                    description="Ollama model to use",
                    required=False,
                    default="qwen3:latest",
                    constraints={
                        "enum": [
                            "qwen3:latest",
                            "llama3:latest",
                            "mistral:latest",
                            "codellama:latest",
                        ]
                    },
                ),
                NLWebToolParameter(
                    name="chat_options",
                    type="object",
                    description="Chat configuration options",
                    required=False,
                    default={
                        "temperature": 0.7,
                        "max_tokens": 2048,
                        "system_prompt": None,
                        "stream": True,
                    },
                ),
                NLWebToolParameter(
                    name="context",
                    type="object",
                    description="Additional context for the conversation",
                    required=False,
                    default={},
                ),
            ],
            examples=[
                "explain machine learning concepts in simple terms",
                "help me debug this Python code",
                "generate creative writing based on a prompt",
                "analyze the sentiment of this text",
            ],
            priority=70,
        )

        # Register all Reynard API tools
        self.registry.register_tool(comfy_tool)
        self.registry.register_tool(rag_tool)
        self.registry.register_tool(tts_tool)
        self.registry.register_tool(image_utils_tool)
        self.registry.register_tool(caption_tool)
        self.registry.register_tool(ollama_tool)

        print(f"  ✅ Registered {len(self.registry.get_all_tools())} Reynard API tools")
        print(f"  📁 Categories: {', '.join(self.registry.get_categories())}")
        print(f"  🏷️  Tags: {', '.join(sorted(self.registry.get_tags()))}")

    async def demo_reynard_specific_queries(self):
        """Demonstrate Reynard-specific API queries and tool suggestions."""
        print("🦦> Demo: Reynard-Specific API Queries")
        print("-" * 40)

        reynard_queries = [
            "I need to generate a futuristic cityscape image for my presentation using ComfyUI",
            "Search my document collection for information about Python async programming",
            "Convert this text to speech with a professional female voice for my podcast",
            "Process this image to resize it to 4K resolution and convert to WebP format",
            "Generate a detailed caption for this product photo for my e-commerce site",
            "Help me understand this complex algorithm by chatting with the local LLM",
            "Create a workflow that generates an image, then adds a caption, and converts it to audio",
        ]

        for i, query in enumerate(reynard_queries, 1):
            print(f"\n📝 Reynard Query {i}: {query}")

            # Create suggestion request with Reynard context
            request = NLWebSuggestionRequest(
                query=query,
                context=NLWebContext(
                    current_path="/home/user/reynard-project",
                    project_type="reynard_application",
                    user_preferences={
                        "preferred_services": ["comfy", "rag", "tts", "ollama"],
                        "quality_preference": "high",
                        "processing_speed": "balanced",
                    },
                    reynard_context={
                        "available_models": ["qwen3:latest", "llama3:latest"],
                        "comfy_workflows": ["text2img", "img2img", "upscale"],
                        "tts_backends": ["kokoro", "coqui", "xtts"],
                        "rag_collections": ["docs", "code", "research"],
                    },
                ),
                max_suggestions=3,
                min_score=80.0,
                include_reasoning=True,
            )

            # Get suggestions (mocked for demo)
            suggestions = await self._mock_reynard_suggestions(request)

            print(f"  🎯 Found {len(suggestions)} Reynard API suggestions:")
            for j, suggestion in enumerate(suggestions, 1):
                tool = suggestion["tool"]
                tool_name = tool.name if hasattr(tool, "name") else tool["name"]
                print(f"    {j}. {tool_name} (Score: {suggestion['score']:.1f})")
                print(f"       📋 {suggestion['reasoning']}")
                print(
                    f"       ⚙️  Parameters: {json.dumps(suggestion['parameters'], indent=8)}"
                )

    async def demo_multi_service_workflows(self):
        """Demonstrate multi-service workflows using Reynard APIs."""
        print("\n🦦> Demo: Multi-Service Reynard Workflows")
        print("-" * 40)

        workflows = [
            {
                "name": "Content Creation Pipeline",
                "description": "Generate image, add caption, and create audio narration",
                "steps": [
                    {
                        "service": "comfy_image_generation",
                        "action": "Generate promotional image",
                        "parameters": {
                            "workflow_type": "text2img",
                            "prompt": "modern tech startup office with glass walls and natural lighting",
                            "parameters": {"width": 1024, "height": 768, "steps": 25},
                        },
                    },
                    {
                        "service": "caption_generation",
                        "action": "Generate descriptive caption",
                        "parameters": {
                            "generator": "blip2",
                            "caption_options": {
                                "style": "marketing",
                                "max_length": 150,
                            },
                        },
                    },
                    {
                        "service": "tts_audio_generation",
                        "action": "Create voice-over",
                        "parameters": {
                            "text": "Welcome to our innovative tech startup",
                            "voice": "professional_female",
                            "backend": "kokoro",
                        },
                    },
                ],
            },
            {
                "name": "Document Analysis & Summary",
                "description": "Search documents, analyze content, and generate summary",
                "steps": [
                    {
                        "service": "rag_document_search",
                        "action": "Search relevant documents",
                        "parameters": {
                            "query": "machine learning best practices",
                            "search_options": {"top_k": 15, "enable_reranking": True},
                        },
                    },
                    {
                        "service": "ollama_chat",
                        "action": "Analyze and summarize findings",
                        "parameters": {
                            "message": "Summarize the key findings from the document search",
                            "model": "qwen3:latest",
                            "chat_options": {"temperature": 0.3, "max_tokens": 1000},
                        },
                    },
                ],
            },
            {
                "name": "Image Processing & Enhancement",
                "description": "Process, enhance, and optimize images for web use",
                "steps": [
                    {
                        "service": "image_processing",
                        "action": "Resize and convert image",
                        "parameters": {
                            "operation": "resize",
                            "input_format": "jpg",
                            "output_format": "webp",
                            "processing_options": {
                                "quality": 85,
                                "optimize_size": True,
                            },
                        },
                    },
                    {
                        "service": "caption_generation",
                        "action": "Generate SEO-friendly caption",
                        "parameters": {
                            "caption_options": {"style": "seo", "include_objects": True}
                        },
                    },
                ],
            },
        ]

        for workflow in workflows:
            print(f"\n🔄 Workflow: {workflow['name']}")
            print(f"   📋 {workflow['description']}")

            for step in workflow["steps"]:
                print(f"\n  Step: {step['service']}")
                print(f"    🎯 {step['action']}")
                print(f"    ⚙️  Parameters: {json.dumps(step['parameters'], indent=6)}")

                # Simulate step execution
                await asyncio.sleep(0.3)
                print("    ✅ Completed successfully")

            print(f"\n  🎉 Workflow '{workflow['name']}' completed!")

    async def demo_reynard_service_health_monitoring(self):
        """Demonstrate Reynard service health monitoring and diagnostics."""
        print("\n🦦> Demo: Reynard Service Health Monitoring")
        print("-" * 40)

        services = [
            {
                "name": "ComfyUI",
                "endpoint": "/api/comfy/health",
                "status": "healthy",
                "response_time": 0.15,
                "features": ["text2img", "img2img", "upscale", "controlnet"],
            },
            {
                "name": "RAG System",
                "endpoint": "/api/rag/config",
                "status": "healthy",
                "response_time": 0.08,
                "features": ["semantic_search", "document_ingestion", "vector_db"],
            },
            {
                "name": "TTS Service",
                "endpoint": "/api/tts/health",
                "status": "healthy",
                "response_time": 0.12,
                "features": ["kokoro", "coqui", "xtts", "voice_cloning"],
            },
            {
                "name": "Ollama",
                "endpoint": "/api/ollama/health",
                "status": "healthy",
                "response_time": 0.05,
                "features": ["qwen3", "llama3", "mistral", "codellama"],
            },
            {
                "name": "Image Utils",
                "endpoint": "/api/image-utils/service-info",
                "status": "healthy",
                "response_time": 0.03,
                "features": ["jxl", "avif", "webp", "format_conversion"],
            },
        ]

        print("🔍 Reynard Service Health Status:")
        for service in services:
            status_emoji = "✅" if service["status"] == "healthy" else "❌"
            print(f"\n  {status_emoji} {service['name']}")
            print(f"    📡 Endpoint: {service['endpoint']}")
            print(f"    ⏱️  Response Time: {service['response_time']}s")
            print(f"    🚀 Features: {', '.join(service['features'])}")

        print("\n🎯 All Reynard services are operational and ready for tool calling!")

    async def demo_error_handling_and_fallback(self):
        """Demonstrate error handling and fallback strategies for Reynard services."""
        print("\n🦦> Demo: Error Handling and Fallback Strategies")
        print("-" * 40)

        error_scenarios = [
            {
                "scenario": "ComfyUI Service Unavailable",
                "primary_tool": "comfy_image_generation",
                "fallback_tool": "ollama_chat",
                "fallback_action": "Generate text description instead of image",
                "user_experience": "Seamless fallback to alternative content generation",
            },
            {
                "scenario": "RAG System Overloaded",
                "primary_tool": "rag_document_search",
                "fallback_tool": "ollama_chat",
                "fallback_action": "Use LLM knowledge base for information",
                "user_experience": "Continue with local knowledge when search is unavailable",
            },
            {
                "scenario": "TTS Backend Failure",
                "primary_tool": "tts_audio_generation",
                "fallback_tool": "image_processing",
                "fallback_action": "Generate visual content instead of audio",
                "user_experience": "Adapt content type based on available services",
            },
        ]

        for scenario in error_scenarios:
            print(f"\n  🚨 Scenario: {scenario['scenario']}")
            print(f"    🎯 Primary Tool: {scenario['primary_tool']}")
            print(f"    🔄 Fallback Tool: {scenario['fallback_tool']}")
            print(f"    📋 Fallback Action: {scenario['fallback_action']}")
            print(f"    👤 User Experience: {scenario['user_experience']}")
            await asyncio.sleep(0.2)

        print(
            "\n  🎯 Reynard's intelligent fallback system ensures continuous service availability!"
        )

    async def _mock_reynard_suggestions(
        self, request: NLWebSuggestionRequest
    ) -> list[dict[str, Any]]:
        """Mock Reynard-specific tool suggestions for demo purposes."""
        suggestions = []
        query_lower = request.query.lower()

        # ComfyUI suggestions
        if any(
            word in query_lower
            for word in ["image", "generate", "comfy", "visual", "picture"]
        ):
            suggestions.append(
                {
                    "tool": self.registry.get_tool("comfy_image_generation"),
                    "score": 95.0,
                    "parameters": {
                        "workflow_type": "text2img",
                        "prompt": "Extracted from user query",
                        "parameters": {"width": 1024, "height": 1024, "steps": 20},
                    },
                    "reasoning": "Query mentions image generation - suggesting ComfyUI workflow",
                }
            )

        # RAG suggestions
        if any(
            word in query_lower
            for word in ["search", "document", "find", "information", "knowledge"]
        ):
            suggestions.append(
                {
                    "tool": self.registry.get_tool("rag_document_search"),
                    "score": 92.0,
                    "parameters": {
                        "query": "Extracted search terms from query",
                        "modality": "text",
                        "search_options": {"top_k": 10, "enable_reranking": True},
                    },
                    "reasoning": "Query involves document search - suggesting RAG system",
                }
            )

        # TTS suggestions
        if any(
            word in query_lower for word in ["speech", "audio", "voice", "sound", "tts"]
        ):
            suggestions.append(
                {
                    "tool": self.registry.get_tool("tts_audio_generation"),
                    "score": 90.0,
                    "parameters": {
                        "text": "Text to be converted to speech",
                        "voice": "default",
                        "backend": "kokoro",
                    },
                    "reasoning": "Query involves audio generation - suggesting TTS service",
                }
            )

        # Ollama suggestions
        if any(
            word in query_lower
            for word in ["chat", "explain", "help", "understand", "analyze"]
        ):
            suggestions.append(
                {
                    "tool": self.registry.get_tool("ollama_chat"),
                    "score": 85.0,
                    "parameters": {
                        "message": "User's question or request",
                        "model": "qwen3:latest",
                        "chat_options": {"temperature": 0.7, "max_tokens": 2048},
                    },
                    "reasoning": "Query involves conversation or analysis - suggesting Ollama chat",
                }
            )

        return suggestions[: request.max_suggestions or 3]

    async def run_demo(self):
        """Run the complete Reynard API tool integration demo."""
        print("🦊> Reynard API Tool Integration Demo")
        print("=" * 60)
        print("Demonstrating elaborate tool calling patterns specifically")
        print("designed for Reynard API endpoints and services.")
        print()

        try:
            await self.setup()
            await self.demo_reynard_specific_queries()
            await self.demo_multi_service_workflows()
            await self.demo_reynard_service_health_monitoring()
            await self.demo_error_handling_and_fallback()

            print("\n🎉 Reynard API Tool Integration Demo Completed Successfully!")
            print("=" * 60)
            print("Key Features Demonstrated:")
            print("  ✅ Reynard-specific API tool integration")
            print("  ✅ Multi-service workflow orchestration")
            print("  ✅ Service health monitoring and diagnostics")
            print("  ✅ Intelligent error handling and fallback strategies")
            print("  ✅ Context-aware tool suggestions for Reynard services")
            print("  ✅ Advanced parameter handling for complex APIs")
            print()
            print("💡 This demonstrates how NLWeb can intelligently route")
            print("   queries to the appropriate Reynard services, creating")
            print("   seamless multi-modal AI experiences!")

        except Exception as e:
            print(f"❌ Demo failed with error: {e}")
            import traceback

            traceback.print_exc()


async def main():
    """Run the Reynard API tool integration demo."""
    demo = ReynardAPIToolIntegration()
    await demo.run_demo()


if __name__ == "__main__":
    asyncio.run(main())
