"""ComfyUI API Endpoints

REST API endpoints for ComfyUI workflow automation and management.
Refactored to use BaseServiceRouter infrastructure for consistency and maintainability.
"""

import hashlib
import json
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, Field

from gatekeeper.api.dependencies import require_active_user
from gatekeeper.models.user import User

from ...core.base_router import BaseServiceRouter, ServiceStatus
from ...core.logging_config import get_service_logger
from ...core.router_mixins import (
    ConfigEndpointMixin,
    FileUploadMixin,
    MetricsMixin,
    RateLimitingMixin,
    StreamingResponseMixin,
    ValidationMixin,
)
from ...services.comfy.service_initializer import get_comfy_service
from .models import (
    ComfyQueueRequest,
    ComfyText2ImgRequest,
)

logger = get_service_logger("comfy")


class ComfyConfigModel(BaseModel):
    """Configuration model for ComfyUI service."""

    # Connection settings
    api_url: str = Field("http://127.0.0.1:8188", description="ComfyUI API URL")
    timeout: int = Field(60, ge=10, le=300, description="Request timeout in seconds")
    enabled: bool = Field(True, description="Enable ComfyUI integration")

    # Reconnection settings
    reconnect_max_attempts: int = Field(
        5,
        ge=1,
        le=20,
        description="Maximum reconnection attempts",
    )
    reconnect_base_delay_s: float = Field(
        0.5,
        ge=0.1,
        le=10.0,
        description="Base reconnection delay",
    )
    reconnect_max_delay_s: float = Field(
        30.0,
        ge=5.0,
        le=120.0,
        description="Maximum reconnection delay",
    )

    # Image settings
    image_dir: str = Field(
        "generated/comfy",
        description="Directory for generated images",
    )
    max_file_size: int = Field(
        50 * 1024 * 1024,
        ge=1024 * 1024,
        le=500 * 1024 * 1024,
        description="Maximum file size in bytes",
    )
    allowed_image_types: list[str] = Field(
        default=["image/png", "image/jpeg", "image/jpg", "image/webp"],
        description="Allowed image MIME types",
    )

    # Workflow settings
    default_checkpoint: str = Field(
        "v1-5-pruned-emaonly.ckpt",
        description="Default checkpoint model",
    )
    default_sampler: str = Field("euler", description="Default sampler")
    default_scheduler: str = Field("normal", description="Default scheduler")
    default_steps: int = Field(24, ge=1, le=150, description="Default sampling steps")
    default_cfg: float = Field(5.5, ge=0.1, le=20.0, description="Default CFG scale")

    # Caching settings
    object_info_ttl_seconds: int = Field(
        86400,
        ge=3600,
        le=604800,
        description="Object info cache TTL",
    )
    enable_workflow_validation: bool = Field(
        True,
        description="Enable workflow validation",
    )
    enable_deduplication: bool = Field(True, description="Enable image deduplication")

    # Rate limiting
    queue_rate_limit: int = Field(
        30,
        ge=1,
        le=100,
        description="Queue requests per minute",
    )
    stream_rate_limit: int = Field(
        20,
        ge=1,
        le=50,
        description="Stream requests per minute",
    )
    upload_rate_limit: int = Field(
        10,
        ge=1,
        le=30,
        description="Upload requests per minute",
    )


class ComfyUIServiceRouter(
    BaseServiceRouter,
    ConfigEndpointMixin,
    FileUploadMixin,
    MetricsMixin,
    RateLimitingMixin,
    StreamingResponseMixin,
    ValidationMixin,
):
    """ComfyUI Service Router with comprehensive workflow automation and management.

    Provides standardized patterns for:
    - Workflow queueing and execution
    - Image generation and ingestion
    - Real-time status streaming
    - Workflow validation and optimization
    - File upload handling with deduplication
    - Comprehensive error handling and recovery
    """

    def __init__(self):
        super().__init__(
            service_name="comfy",
            prefix="/api/comfy",
            tags=["comfy", "workflow", "image-generation"],
        )

        # Initialize mixins
        MetricsMixin.__init__(self)
        RateLimitingMixin.__init__(self)

        # Setup configuration endpoints
        self.setup_config_endpoints(ComfyConfigModel)

        # Setup rate limiting
        self.setup_rate_limiting_endpoints()
        self.set_rate_limit("queue", 30)  # 30 requests per minute
        self.set_rate_limit("stream", 20)  # 20 requests per minute
        self.set_rate_limit("upload", 10)  # 10 requests per minute

        # Setup metrics endpoints
        self.setup_metrics_endpoints()

        # Setup ComfyUI-specific endpoints
        self._setup_comfy_endpoints()

    def get_service(self):
        """Get the ComfyUI service instance."""
        return get_comfy_service()

    def check_service_health(self) -> ServiceStatus:
        """Check ComfyUI service health."""
        try:
            service = self.get_service()
            health_info = service.health_check()

            is_healthy = health_info.get("status") == "healthy"
            status = health_info.get("status", "unknown")

            return ServiceStatus(
                service_name=self.service_name,
                is_healthy=is_healthy,
                status=status,
                details=health_info,
                timestamp=datetime.now().timestamp(),
            )
        except Exception as e:
            logger.exception("Health check failed for %s", self.service_name)
            return ServiceStatus(
                service_name=self.service_name,
                is_healthy=False,
                status="error",
                details={"error": str(e)},
                timestamp=datetime.now().timestamp(),
            )

    def _setup_comfy_endpoints(self):
        """Setup ComfyUI-specific endpoints."""
        self._setup_core_endpoints()
        self._setup_validation_endpoints()

    def _setup_core_endpoints(self):
        """Setup core ComfyUI endpoints."""

        @self.router.get("/health/force-check")
        async def force_health_check(current_user: User = Depends(require_active_user)):
            """Force a health check with detailed information."""
            return await self._standard_async_operation(
                "force_health_check",
                self._force_health_check_impl,
                current_user,
            )

        @self.router.post("/queue")
        async def queue_prompt(
            request: ComfyQueueRequest,
            current_user: User = Depends(require_active_user),
        ):
            """Queue a ComfyUI workflow for execution."""
            return await self._standard_async_operation(
                "queue_prompt",
                self._queue_prompt_impl,
                request,
                current_user,
            )

        @self.router.get("/status/{prompt_id}")
        async def get_status(
            prompt_id: str,
            current_user: User = Depends(require_active_user),
        ):
            """Get the status of a queued prompt."""
            return await self._standard_async_operation(
                "get_status",
                self._get_status_impl,
                prompt_id,
                current_user,
            )

        @self.router.get("/history/{prompt_id}")
        async def get_history(
            prompt_id: str,
            current_user: User = Depends(require_active_user),
        ):
            """Get the history for a prompt."""
            return await self._standard_async_operation(
                "get_history",
                self._get_history_impl,
                prompt_id,
                current_user,
            )

        @self.router.get("/object-info")
        async def get_object_info(
            refresh: bool = False,
            current_user: User = Depends(require_active_user),
            request: Request = None,
        ):
            """Get ComfyUI object information with caching."""
            return await self._standard_async_operation(
                "get_object_info",
                self._get_object_info_impl,
                refresh,
                current_user,
                request,
            )

        @self.router.get("/view")
        async def view_image(
            filename: str,
            subfolder: str = "",
            image_type: str = "output",
            current_user: User = Depends(require_active_user),
        ):
            """View a generated image."""
            return await self._standard_async_operation(
                "view_image",
                self._view_image_impl,
                filename,
                subfolder,
                image_type,
                current_user,
            )

        @self.router.post("/text2img")
        async def text2img(
            request: ComfyText2ImgRequest,
            current_user: User = Depends(require_active_user),
        ):
            """Generate an image from text using a simple workflow."""
            return await self._standard_async_operation(
                "text2img",
                self._text2img_impl,
                request,
                current_user,
            )

        @self.router.post("/ingest")
        async def ingest_generated_image(
            file: UploadFile = File(...),
            prompt_id: str = Form(...),
            workflow: str = Form(...),
            metadata: str = Form("{}"),
            current_user: User = Depends(require_active_user),
        ):
            """Ingest a generated image into the gallery with deduplication."""
            return await self._standard_async_operation(
                "ingest_image",
                self._ingest_image_impl,
                file,
                prompt_id,
                workflow,
                metadata,
                current_user,
            )

        @self.router.get("/stream/{prompt_id}")
        async def stream_status(
            prompt_id: str,
            current_user: User = Depends(require_active_user),
        ):
            """Stream status updates for a prompt."""
            return await self._standard_async_operation(
                "stream_status",
                self._stream_status_impl,
                prompt_id,
                current_user,
            )

    def _setup_validation_endpoints(self):
        """Setup validation endpoints."""

        @self.router.get("/validate/checkpoint/{checkpoint}")
        async def validate_checkpoint(
            checkpoint: str,
            current_user: User = Depends(require_active_user),
        ):
            """Validate checkpoint and suggest alternatives."""
            return await self._standard_async_operation(
                "validate_checkpoint",
                self._validate_checkpoint_impl,
                checkpoint,
                current_user,
            )

        @self.router.get("/validate/lora/{lora}")
        async def validate_lora(
            lora: str,
            current_user: User = Depends(require_active_user),
        ):
            """Validate LoRA and suggest alternatives."""
            return await self._standard_async_operation(
                "validate_lora",
                self._validate_lora_impl,
                lora,
                current_user,
            )

        @self.router.get("/validate/sampler/{sampler}")
        async def validate_sampler(
            sampler: str,
            current_user: User = Depends(require_active_user),
        ):
            """Validate sampler and suggest alternatives."""
            return await self._standard_async_operation(
                "validate_sampler",
                self._validate_sampler_impl,
                sampler,
                current_user,
            )

        @self.router.get("/validate/scheduler/{scheduler}")
        async def validate_scheduler(
            scheduler: str,
            current_user: User = Depends(require_active_user),
        ):
            """Validate scheduler and suggest alternatives."""
            return await self._standard_async_operation(
                "validate_scheduler",
                self._validate_scheduler_impl,
                scheduler,
                current_user,
            )

    # Implementation methods
    async def _force_health_check_impl(self, _current_user: User):
        """Implementation for force health check."""
        service = self.get_service()
        health_info = await service.health_check()
        service_info = service.get_info()

        return {
            "result": health_info.get("status", "unknown"),
            "connection_state": service_info.get("connection_state"),
            "connection_attempts": service_info.get("connection_attempts"),
            "base_url": service_info.get("api_url"),
            "health_details": health_info,
            "service_info": service_info,
        }

    async def _queue_prompt_impl(self, request: ComfyQueueRequest, current_user: User):
        """Implementation for queueing a prompt."""
        # Validate workflow
        if self._should_validate_workflow():
            self._validate_workflow(request.workflow)

        service = self.get_service()
        result = await service.queue_prompt(request.workflow, request.client_id)

        return {
            "prompt_id": result.prompt_id,
            "client_id": result.client_id,
            "queued_by": current_user.username,
            "queued_at": datetime.now().isoformat(),
        }

    async def _get_status_impl(self, prompt_id: str, current_user: User):
        """Implementation for getting prompt status."""
        service = self.get_service()
        result = await service.check_status(prompt_id)

        return {
            **result,
            "prompt_id": prompt_id,
            "checked_by": current_user.username,
            "checked_at": datetime.now().isoformat(),
        }

    async def _get_history_impl(self, prompt_id: str, current_user: User):
        """Implementation for getting prompt history."""
        service = self.get_service()
        result = await service.get_history(prompt_id)

        return {
            "prompt_id": prompt_id,
            "status": result.get("status"),
            "progress": result.get("progress"),
            "images": result.get("images", []),
            "items": result.get("items", []),
            "retrieved_by": current_user.username,
            "retrieved_at": datetime.now().isoformat(),
        }

    async def _get_object_info_impl(
        self,
        refresh: bool,
        _current_user: User,
        request: Request,
    ):
        """Implementation for getting object info with caching."""
        service = self.get_service()

        # Check ETag for cache validation
        if not refresh and request:
            etag = service.get_object_info_etag()
            if etag:
                if_none_match = request.headers.get("if-none-match")
                if if_none_match and if_none_match.strip('"') == etag:
                    return Response(status_code=304)

        result = await service.get_object_info(force_refresh=refresh)

        # Return with ETag header
        etag = service.get_object_info_etag()
        response = Response(content=json.dumps(result), media_type="application/json")
        if etag:
            response.headers["ETag"] = f'"{etag}"'

        return response

    async def _view_image_impl(
        self,
        filename: str,
        subfolder: str,
        image_type: str,
        _current_user: User,
    ):
        """Implementation for viewing an image."""
        service = self.get_service()
        blob = await service.get_image(filename, subfolder, image_type)

        return Response(content=blob, media_type="image/png")

    async def _text2img_impl(self, request: ComfyText2ImgRequest, current_user: User):
        """Implementation for text-to-image generation."""
        # Create a simple text-to-image workflow
        workflow = self._create_simple_text2img_workflow(
            caption=request.caption,
            negative=request.negative,
            width=request.width or 1024,
            height=request.height or 1024,
            steps=request.steps or 24,
            cfg=request.cfg or 5.5,
            seed=request.seed,
            checkpoint=request.checkpoint,
            sampler=request.sampler,
            scheduler=request.scheduler,
        )

        service = self.get_service()
        result = await service.queue_prompt(workflow)

        return {
            "prompt_id": result.prompt_id,
            "workflow_type": "text2img",
            "generated_by": current_user.username,
            "generated_at": datetime.now().isoformat(),
        }

    async def _ingest_image_impl(
        self,
        file: UploadFile,
        prompt_id: str,
        workflow: str,
        metadata: str,
        current_user: User,
    ):
        """Implementation for ingesting generated images with enhanced deduplication."""
        # Validate file type and size
        self._validate_uploaded_file(file)

        service = self.get_service()
        service_info = service.get_info()
        image_dir = Path(service_info.get("image_dir", "generated/comfy"))

        # Create date-based subfolder
        today = datetime.now().strftime("%Y-%m-%d")
        date_dir = image_dir / today
        date_dir.mkdir(parents=True, exist_ok=True)

        # Read uploaded file content
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # Compute content hash for deduplication
        file_hash = hashlib.sha256(content).hexdigest()

        # Determine file extension
        ext = Path(file.filename).suffix.lower() if file.filename else ".png"
        if not ext or ext not in [".png", ".jpg", ".jpeg", ".webp"]:
            ext = ".png"

        # Create filename with hash
        filename = f"comfy_{file_hash[:16]}{ext}"
        dest_path = date_dir / filename
        sidecar_path = dest_path.with_suffix(".json")

        # Check for existing file (deduplication)
        if dest_path.exists():
            return {
                "success": True,
                "image_path": str(dest_path),
                "metadata_path": str(sidecar_path),
                "deduplicated": True,
                "message": "Image already exists",
                "file_hash": file_hash,
            }

        # Write the image file
        with dest_path.open("wb") as f:
            f.write(content)

        # Parse workflow and metadata
        try:
            workflow_data = json.loads(workflow) if workflow else {}
        except json.JSONDecodeError:
            workflow_data = {"raw_workflow": workflow}

        try:
            metadata_data = json.loads(metadata) if metadata else {}
        except json.JSONDecodeError:
            metadata_data = {"raw_metadata": metadata}

        # Create sidecar metadata
        sidecar_data = {
            "hash": file_hash,
            "prompt_id": prompt_id,
            "workflow": workflow_data,
            "ingested_by": current_user.username,
            "ingested_at": datetime.now().isoformat(),
            "original_filename": file.filename,
            "file_size": len(content),
            "content_type": file.content_type,
        }
        sidecar_data.update(metadata_data)

        # Write sidecar JSON
        with sidecar_path.open("w", encoding="utf-8") as f:
            json.dump(sidecar_data, f, ensure_ascii=False, indent=2)

        return {
            "success": True,
            "image_path": str(dest_path),
            "metadata_path": str(sidecar_path),
            "deduplicated": False,
            "message": "Image ingested successfully",
            "file_hash": file_hash,
        }

    async def _stream_status_impl(self, prompt_id: str, _current_user: User):
        """Implementation for streaming status updates."""
        service = self.get_service()

        async def event_stream():
            try:
                async for event in service.stream_status(prompt_id):
                    yield f"data: {json.dumps(event)}\n\n"
            except Exception as e:
                logger.exception("ComfyUI stream error")
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            },
        )

    async def _validate_checkpoint_impl(self, checkpoint: str, current_user: User):
        """Implementation for checkpoint validation."""
        service = self.get_service()
        result = await service.validate_checkpoint(checkpoint)

        return {
            "is_valid": result.is_valid,
            "suggestions": result.suggestions,
            "errors": result.errors,
            "validated_by": current_user.username,
            "validated_at": datetime.now().isoformat(),
        }

    async def _validate_lora_impl(self, lora: str, current_user: User):
        """Implementation for LoRA validation."""
        service = self.get_service()
        result = await service.validate_lora(lora)

        return {
            "is_valid": result.is_valid,
            "suggestions": result.suggestions,
            "errors": result.errors,
            "validated_by": current_user.username,
            "validated_at": datetime.now().isoformat(),
        }

    async def _validate_sampler_impl(self, sampler: str, current_user: User):
        """Implementation for sampler validation."""
        service = self.get_service()
        result = await service.validate_sampler(sampler)

        return {
            "is_valid": result.is_valid,
            "suggestions": result.suggestions,
            "errors": result.errors,
            "validated_by": current_user.username,
            "validated_at": datetime.now().isoformat(),
        }

    async def _validate_scheduler_impl(self, scheduler: str, current_user: User):
        """Implementation for scheduler validation."""
        service = self.get_service()
        result = await service.validate_scheduler(scheduler)

        return {
            "is_valid": result.is_valid,
            "suggestions": result.suggestions,
            "errors": result.errors,
            "validated_by": current_user.username,
            "validated_at": datetime.now().isoformat(),
        }

    # Helper methods
    def _should_validate_workflow(self) -> bool:
        """Check if workflow validation should be performed."""
        # This could be based on configuration
        return True

    def _validate_workflow(self, workflow: dict[str, Any]) -> None:
        """Validate workflow structure and parameters."""
        if not isinstance(workflow, dict):
            raise HTTPException(status_code=400, detail="Workflow must be a dictionary")

        if not workflow:
            raise HTTPException(status_code=400, detail="Workflow cannot be empty")

        # Basic workflow validation
        for node_id, node_data in workflow.items():
            if not isinstance(node_data, dict):
                raise HTTPException(
                    status_code=400,
                    detail=f"Node {node_id} must be a dictionary",
                )

            if "class_type" not in node_data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Node {node_id} missing 'class_type'",
                )

    def _validate_uploaded_file(self, file: UploadFile) -> None:
        """Validate uploaded file type and size."""
        # Get configuration for validation limits
        # For now, use reasonable defaults
        max_size = 50 * 1024 * 1024  # 50MB
        allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type '{file.content_type}' not allowed. Allowed types: {allowed_types}",
            )

        if file.size and file.size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size {file.size} bytes exceeds maximum {max_size} bytes",
            )

    def _create_simple_text2img_workflow(
        self,
        caption: str,
        negative: str | None = None,
        width: int = 1024,
        height: int = 1024,
        steps: int = 24,
        cfg: float = 5.5,
        seed: int | None = None,
        checkpoint: str | None = None,
        sampler: str | None = None,
        scheduler: str | None = None,
    ) -> dict[str, Any]:
        """Create a simple text-to-image workflow."""
        import uuid

        # Generate unique node IDs
        checkpoint_loader = str(uuid.uuid4())
        clip_text_encode = str(uuid.uuid4())
        clip_text_encode_2 = str(uuid.uuid4())
        ksampler = str(uuid.uuid4())
        vae_decode = str(uuid.uuid4())
        save_image = str(uuid.uuid4())

        return {
            checkpoint_loader: {
                "class_type": "CheckpointLoaderSimple",
                "inputs": {"ckpt_name": checkpoint or "v1-5-pruned-emaonly.ckpt"},
            },
            clip_text_encode: {
                "class_type": "CLIPTextEncode",
                "inputs": {"text": caption, "clip": [checkpoint_loader, 1]},
            },
            clip_text_encode_2: {
                "class_type": "CLIPTextEncode",
                "inputs": {"text": negative or "", "clip": [checkpoint_loader, 1]},
            },
            ksampler: {
                "class_type": "KSampler",
                "inputs": {
                    "seed": seed or 42,
                    "steps": steps,
                    "cfg": cfg,
                    "sampler_name": sampler or "euler",
                    "scheduler": scheduler or "normal",
                    "denoise": 1.0,
                    "model": [checkpoint_loader, 0],
                    "positive": [clip_text_encode, 0],
                    "negative": [clip_text_encode_2, 0],
                    "latent_image": ["4", 0],  # Empty latent
                },
            },
            vae_decode: {
                "class_type": "VAEDecode",
                "inputs": {"samples": [ksampler, 0], "vae": [checkpoint_loader, 2]},
            },
            save_image: {
                "class_type": "SaveImage",
                "inputs": {"filename_prefix": "ComfyUI", "images": [vae_decode, 0]},
            },
            "4": {
                "class_type": "EmptyLatentImage",
                "inputs": {"width": width, "height": height, "batch_size": 1},
            },
        }


# Create the router instance
comfy_router = ComfyUIServiceRouter()
router = comfy_router.get_router()


# All endpoints are now handled by the ComfyUIServiceRouter class above
