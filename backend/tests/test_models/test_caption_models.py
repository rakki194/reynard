"""
Tests for caption generation models.

This module tests the Pydantic models used for caption generation
request/response schemas.
"""

import pytest
from pydantic import ValidationError

from app.models.caption import (
    BatchCaptionRequest,
    BatchCaptionResponse,
    CaptionRequest,
    CaptionResponse,
    GeneratorInfo,
    ModelManagementRequest,
    ModelManagementResponse,
    ModelStatus,
)


class TestCaptionRequest:
    """Test CaptionRequest model validation and behavior."""

    def test_caption_request_valid_data(self):
        """Test CaptionRequest with valid data."""
        data = {
            "image_path": "/path/to/image.jpg",
            "generator_name": "jtp2",
            "config": {"max_length": 100},
            "force": True,
            "post_process": False,
        }
        request = CaptionRequest(**data)

        assert request.image_path == "/path/to/image.jpg"
        assert request.generator_name == "jtp2"
        assert request.config == {"max_length": 100}
        assert request.force is True
        assert request.post_process is False

    def test_caption_request_minimal_data(self):
        """Test CaptionRequest with minimal required data."""
        data = {"image_path": "/path/to/image.jpg", "generator_name": "florence2"}
        request = CaptionRequest(**data)

        assert request.image_path == "/path/to/image.jpg"
        assert request.generator_name == "florence2"
        assert request.config == {}
        assert request.force is False
        assert request.post_process is True

    def test_caption_request_missing_required_fields(self):
        """Test CaptionRequest validation with missing required fields."""
        with pytest.raises(ValidationError) as exc_info:
            CaptionRequest()

        errors = exc_info.value.errors()
        assert len(errors) == 2
        assert any(error["loc"] == ("image_path",) for error in errors)
        assert any(error["loc"] == ("generator_name",) for error in errors)

    def test_caption_request_invalid_types(self):
        """Test CaptionRequest with invalid field types."""
        with pytest.raises(ValidationError) as exc_info:
            CaptionRequest(image_path=123, generator_name="jtp2")  # Should be string

        errors = exc_info.value.errors()
        assert any(error["loc"] == ("image_path",) for error in errors)

    def test_caption_request_empty_strings(self):
        """Test CaptionRequest with empty string values."""
        with pytest.raises(ValidationError) as exc_info:
            CaptionRequest(image_path="", generator_name="")  # Empty string should fail

        errors = exc_info.value.errors()
        assert len(errors) >= 2


class TestCaptionResponse:
    """Test CaptionResponse model validation and behavior."""

    def test_caption_response_success(self):
        """Test CaptionResponse for successful generation."""
        data = {
            "success": True,
            "caption": "A beautiful sunset over the mountains",
            "processing_time": 2.5,
            "caption_type": "descriptive",
        }
        response = CaptionResponse(**data)

        assert response.success is True
        assert response.caption == "A beautiful sunset over the mountains"
        assert response.error is None
        assert response.error_type is None
        assert response.retryable is False
        assert response.processing_time == 2.5
        assert response.caption_type == "descriptive"

    def test_caption_response_failure(self):
        """Test CaptionResponse for failed generation."""
        data = {
            "success": False,
            "error": "Model not available",
            "error_type": "ModelError",
            "retryable": True,
        }
        response = CaptionResponse(**data)

        assert response.success is False
        assert response.caption is None
        assert response.error == "Model not available"
        assert response.error_type == "ModelError"
        assert response.retryable is True
        assert response.processing_time is None
        assert response.caption_type is None

    def test_caption_response_missing_required_field(self):
        """Test CaptionResponse validation with missing required field."""
        with pytest.raises(ValidationError) as exc_info:
            CaptionResponse()

        errors = exc_info.value.errors()
        assert any(error["loc"] == ("success",) for error in errors)

    def test_caption_response_invalid_types(self):
        """Test CaptionResponse with invalid field types."""
        with pytest.raises(ValidationError) as exc_info:
            CaptionResponse(
                success="yes",  # Should be boolean
                caption=123,  # Should be string or None
            )

        errors = exc_info.value.errors()
        assert any(error["loc"] == ("success",) for error in errors)


class TestBatchCaptionRequest:
    """Test BatchCaptionRequest model validation and behavior."""

    def test_batch_caption_request_valid_data(self):
        """Test BatchCaptionRequest with valid data."""
        tasks = [
            CaptionRequest(image_path="/path1.jpg", generator_name="jtp2"),
            CaptionRequest(image_path="/path2.jpg", generator_name="florence2"),
        ]
        data = {
            "tasks": tasks,
            "max_concurrent": 2,
            "progress_callback": "ws://localhost:8000/progress",
        }
        request = BatchCaptionRequest(**data)

        assert len(request.tasks) == 2
        assert request.max_concurrent == 2
        assert request.progress_callback == "ws://localhost:8000/progress"

    def test_batch_caption_request_minimal_data(self):
        """Test BatchCaptionRequest with minimal required data."""
        tasks = [CaptionRequest(image_path="/path.jpg", generator_name="jtp2")]
        data = {"tasks": tasks}
        request = BatchCaptionRequest(**data)

        assert len(request.tasks) == 1
        assert request.max_concurrent == 4  # Default value
        assert request.progress_callback is None

    def test_batch_caption_request_empty_tasks(self):
        """Test BatchCaptionRequest with empty tasks list."""
        with pytest.raises(ValidationError) as exc_info:
            BatchCaptionRequest(tasks=[])

        errors = exc_info.value.errors()
        assert any(error["loc"] == ("tasks",) for error in errors)

    def test_batch_caption_request_invalid_max_concurrent(self):
        """Test BatchCaptionRequest with invalid max_concurrent value."""
        tasks = [CaptionRequest(image_path="/path.jpg", generator_name="jtp2")]
        with pytest.raises(ValidationError) as exc_info:
            BatchCaptionRequest(tasks=tasks, max_concurrent=-1)

        errors = exc_info.value.errors()
        assert any(error["loc"] == ("max_concurrent",) for error in errors)


class TestBatchCaptionResponse:
    """Test BatchCaptionResponse model validation and behavior."""

    def test_batch_caption_response_valid_data(self):
        """Test BatchCaptionResponse with valid data."""
        results = [
            CaptionResponse(success=True, caption="Caption 1"),
            CaptionResponse(success=False, error="Error 2"),
        ]
        data = {
            "success": True,
            "results": results,
            "total_processed": 2,
            "successful_count": 1,
            "failed_count": 1,
            "processing_time": 5.2,
        }
        response = BatchCaptionResponse(**data)

        assert response.success is True
        assert len(response.results) == 2
        assert response.total_processed == 2
        assert response.successful_count == 1
        assert response.failed_count == 1
        assert response.processing_time == 5.2

    def test_batch_caption_response_missing_required_fields(self):
        """Test BatchCaptionResponse validation with missing required fields."""
        with pytest.raises(ValidationError) as exc_info:
            BatchCaptionResponse()

        errors = exc_info.value.errors()
        required_fields = [
            "success",
            "results",
            "total_processed",
            "successful_count",
            "failed_count",
            "processing_time",
        ]
        for field in required_fields:
            assert any(error["loc"] == (field,) for error in errors)

    def test_batch_caption_response_invalid_counts(self):
        """Test BatchCaptionResponse with invalid count values."""
        results = [CaptionResponse(success=True, caption="Caption 1")]
        with pytest.raises(ValidationError) as exc_info:
            BatchCaptionResponse(
                success=True,
                results=results,
                total_processed=1,
                successful_count=2,  # More successful than total
                failed_count=0,
                processing_time=1.0,
            )

        # This should pass validation as Pydantic doesn't enforce business logic
        # The validation would need to be added as a model validator if needed


class TestGeneratorInfo:
    """Test GeneratorInfo model validation and behavior."""

    def test_generator_info_valid_data(self):
        """Test GeneratorInfo with valid data."""
        data = {
            "name": "jtp2",
            "description": "Japanese Text-to-Picture model",
            "version": "1.0.0",
            "caption_type": "descriptive",
            "is_available": True,
            "is_loaded": False,
            "features": ["batch_processing", "custom_config"],
            "config_schema": {"max_length": {"type": "int", "default": 100}},
        }
        info = GeneratorInfo(**data)

        assert info.name == "jtp2"
        assert info.description == "Japanese Text-to-Picture model"
        assert info.version == "1.0.0"
        assert info.caption_type == "descriptive"
        assert info.is_available is True
        assert info.is_loaded is False
        assert "batch_processing" in info.features
        assert info.config_schema["max_length"]["type"] == "int"

    def test_generator_info_minimal_data(self):
        """Test GeneratorInfo with minimal required data."""
        data = {
            "name": "florence2",
            "description": "Florence-2 model",
            "version": "2.0.0",
            "caption_type": "tags",
            "is_available": False,
            "is_loaded": False,
        }
        info = GeneratorInfo(**data)

        assert info.name == "florence2"
        assert info.features == []
        assert info.config_schema == {}

    def test_generator_info_missing_required_fields(self):
        """Test GeneratorInfo validation with missing required fields."""
        with pytest.raises(ValidationError) as exc_info:
            GeneratorInfo()

        errors = exc_info.value.errors()
        required_fields = [
            "name",
            "description",
            "version",
            "caption_type",
            "is_available",
            "is_loaded",
        ]
        for field in required_fields:
            assert any(error["loc"] == (field,) for error in errors)


class TestModelStatus:
    """Test ModelStatus model validation and behavior."""

    def test_model_status_valid_data(self):
        """Test ModelStatus with valid data."""
        data = {
            "model_id": "model_123",
            "name": "jtp2-base",
            "type": "caption_generator",
            "status": "loaded",
            "is_available": True,
            "is_loaded": True,
            "config": {"device": "cuda", "batch_size": 4},
            "error_message": None,
        }
        status = ModelStatus(**data)

        assert status.model_id == "model_123"
        assert status.name == "jtp2-base"
        assert status.type == "caption_generator"
        assert status.status == "loaded"
        assert status.is_available is True
        assert status.is_loaded is True
        assert status.config["device"] == "cuda"
        assert status.error_message is None

    def test_model_status_error_state(self):
        """Test ModelStatus in error state."""
        data = {
            "model_id": "model_456",
            "name": "florence2-large",
            "type": "caption_generator",
            "status": "error",
            "is_available": False,
            "is_loaded": False,
            "error_message": "CUDA out of memory",
        }
        status = ModelStatus(**data)

        assert status.status == "error"
        assert status.is_available is False
        assert status.is_loaded is False
        assert status.error_message == "CUDA out of memory"

    def test_model_status_missing_required_fields(self):
        """Test ModelStatus validation with missing required fields."""
        with pytest.raises(ValidationError) as exc_info:
            ModelStatus()

        errors = exc_info.value.errors()
        required_fields = [
            "model_id",
            "name",
            "type",
            "status",
            "is_available",
            "is_loaded",
        ]
        for field in required_fields:
            assert any(error["loc"] == (field,) for error in errors)


class TestModelManagementRequest:
    """Test ModelManagementRequest model validation and behavior."""

    def test_model_management_request_valid_data(self):
        """Test ModelManagementRequest with valid data."""
        data = {
            "model_id": "model_123",
            "action": "load",
            "config": {"device": "cuda", "batch_size": 8},
        }
        request = ModelManagementRequest(**data)

        assert request.model_id == "model_123"
        assert request.action == "load"
        assert request.config["device"] == "cuda"

    def test_model_management_request_minimal_data(self):
        """Test ModelManagementRequest with minimal required data."""
        data = {"model_id": "model_456", "action": "unload"}
        request = ModelManagementRequest(**data)

        assert request.model_id == "model_456"
        assert request.action == "unload"
        assert request.config is None

    def test_model_management_request_missing_required_fields(self):
        """Test ModelManagementRequest validation with missing required fields."""
        with pytest.raises(ValidationError) as exc_info:
            ModelManagementRequest()

        errors = exc_info.value.errors()
        assert any(error["loc"] == ("model_id",) for error in errors)
        assert any(error["loc"] == ("action",) for error in errors)

    def test_model_management_request_invalid_action(self):
        """Test ModelManagementRequest with invalid action value."""
        with pytest.raises(ValidationError) as exc_info:
            ModelManagementRequest(
                model_id="model_123",
                action="invalid_action",  # Should be load, unload, or download
            )

        # This should pass validation as Pydantic doesn't enforce enum values
        # unless explicitly defined with Enum type


class TestModelManagementResponse:
    """Test ModelManagementResponse model validation and behavior."""

    def test_model_management_response_success(self):
        """Test ModelManagementResponse for successful operation."""
        model_status = ModelStatus(
            model_id="model_123",
            name="jtp2-base",
            type="caption_generator",
            status="loaded",
            is_available=True,
            is_loaded=True,
        )
        data = {
            "success": True,
            "message": "Model loaded successfully",
            "model_status": model_status,
        }
        response = ModelManagementResponse(**data)

        assert response.success is True
        assert response.message == "Model loaded successfully"
        assert response.model_status.model_id == "model_123"
        assert response.model_status.status == "loaded"

    def test_model_management_response_failure(self):
        """Test ModelManagementResponse for failed operation."""
        data = {"success": False, "message": "Model not found", "model_status": None}
        response = ModelManagementResponse(**data)

        assert response.success is False
        assert response.message == "Model not found"
        assert response.model_status is None

    def test_model_management_response_missing_required_fields(self):
        """Test ModelManagementResponse validation with missing required fields."""
        with pytest.raises(ValidationError) as exc_info:
            ModelManagementResponse()

        errors = exc_info.value.errors()
        assert any(error["loc"] == ("success",) for error in errors)
        assert any(error["loc"] == ("message",) for error in errors)

    def test_model_management_response_invalid_types(self):
        """Test ModelManagementResponse with invalid field types."""
        with pytest.raises(ValidationError) as exc_info:
            ModelManagementResponse(
                success="yes", message=123  # Should be boolean  # Should be string
            )

        errors = exc_info.value.errors()
        assert any(error["loc"] == ("success",) for error in errors)
        assert any(error["loc"] == ("message",) for error in errors)
