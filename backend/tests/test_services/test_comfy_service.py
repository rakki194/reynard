"""Tests for ComfyUI service.

This module tests the ComfyUI service functionality for
workflow execution and management.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.comfy.comfy_service import ComfyService
from app.services.comfy.models import ComfyWorkflowRequest


class TestComfyService:
    """Test the ComfyUI service."""

    def setup_method(self):
        """Set up test fixtures."""
        self.service = ComfyService()

    def test_service_initialization(self):
        """Test service initialization."""
        assert self.service is not None
        assert hasattr(self.service, "execute_workflow")
        assert hasattr(self.service, "get_workflow_status")
        assert hasattr(self.service, "cancel_workflow")

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_execute_workflow_success(self, mock_client_class):
        """Test successful workflow execution."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "prompt_id": "test_prompt_id",
            "status": "queued",
        }
        mock_client.post.return_value = mock_response

        # Create test workflow request
        workflow_request = ComfyWorkflowRequest(
            workflow_id="test_workflow", inputs={"text": "test input"}, priority=1,
        )

        # Execute workflow
        result = await self.service.execute_workflow(workflow_request)

        assert result is not None
        assert result.prompt_id == "test_prompt_id"
        assert result.status == "queued"

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_execute_workflow_failure(self, mock_client_class):
        """Test workflow execution failure."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = "Bad Request"
        mock_client.post.return_value = mock_response

        # Create test workflow request
        workflow_request = ComfyWorkflowRequest(
            workflow_id="test_workflow", inputs={"text": "test input"}, priority=1,
        )

        # Execute workflow
        with pytest.raises(Exception):
            await self.service.execute_workflow(workflow_request)

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_status_success(self, mock_client_class):
        """Test successful workflow status retrieval."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "running",
            "progress": 50,
            "current_step": "processing",
        }
        mock_client.get.return_value = mock_response

        # Get workflow status
        result = await self.service.get_workflow_status("test_prompt_id")

        assert result is not None
        assert result.status == "running"
        assert result.progress == 50
        assert result.current_step == "processing"

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_status_not_found(self, mock_client_class):
        """Test workflow status retrieval for non-existent workflow."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.text = "Not Found"
        mock_client.get.return_value = mock_response

        # Get workflow status
        with pytest.raises(Exception):
            await self.service.get_workflow_status("non_existent_id")

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_cancel_workflow_success(self, mock_client_class):
        """Test successful workflow cancellation."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "cancelled",
            "message": "Workflow cancelled successfully",
        }
        mock_client.post.return_value = mock_response

        # Cancel workflow
        result = await self.service.cancel_workflow("test_prompt_id")

        assert result is not None
        assert result.status == "cancelled"
        assert result.message == "Workflow cancelled successfully"

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_cancel_workflow_failure(self, mock_client_class):
        """Test workflow cancellation failure."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = "Cannot cancel completed workflow"
        mock_client.post.return_value = mock_response

        # Cancel workflow
        with pytest.raises(Exception):
            await self.service.cancel_workflow("test_prompt_id")

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_history_success(self, mock_client_class):
        """Test successful workflow history retrieval."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "workflows": [
                {
                    "prompt_id": "test_prompt_1",
                    "status": "completed",
                    "created_at": "2023-01-01T00:00:00Z",
                },
                {
                    "prompt_id": "test_prompt_2",
                    "status": "failed",
                    "created_at": "2023-01-02T00:00:00Z",
                },
            ],
            "total": 2,
        }
        mock_client.get.return_value = mock_response

        # Get workflow history
        result = await self.service.get_workflow_history(limit=10, offset=0)

        assert result is not None
        assert len(result.workflows) == 2
        assert result.total == 2
        assert result.workflows[0].prompt_id == "test_prompt_1"
        assert result.workflows[0].status == "completed"

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_history_empty(self, mock_client_class):
        """Test workflow history retrieval with no workflows."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"workflows": [], "total": 0}
        mock_client.get.return_value = mock_response

        # Get workflow history
        result = await self.service.get_workflow_history(limit=10, offset=0)

        assert result is not None
        assert len(result.workflows) == 0
        assert result.total == 0

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_outputs_success(self, mock_client_class):
        """Test successful workflow outputs retrieval."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "outputs": {
                "output_node": {
                    "images": [
                        {
                            "filename": "output.png",
                            "type": "output",
                            "subfolder": "output",
                        },
                    ],
                },
            },
        }
        mock_client.get.return_value = mock_response

        # Get workflow outputs
        result = await self.service.get_workflow_outputs("test_prompt_id")

        assert result is not None
        assert "outputs" in result
        assert "output_node" in result["outputs"]
        assert len(result["outputs"]["output_node"]["images"]) == 1
        assert result["outputs"]["output_node"]["images"][0]["filename"] == "output.png"

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_outputs_not_found(self, mock_client_class):
        """Test workflow outputs retrieval for non-existent workflow."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.text = "Not Found"
        mock_client.get.return_value = mock_response

        # Get workflow outputs
        with pytest.raises(Exception):
            await self.service.get_workflow_outputs("non_existent_id")

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_upload_workflow_success(self, mock_client_class):
        """Test successful workflow upload."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "workflow_id": "uploaded_workflow_123",
            "status": "uploaded",
            "message": "Workflow uploaded successfully",
        }
        mock_client.post.return_value = mock_response

        # Upload workflow
        workflow_data = {
            "nodes": [
                {"id": "1", "type": "text_input", "inputs": {"text": "Hello World"}},
            ],
            "connections": [],
        }

        result = await self.service.upload_workflow(workflow_data)

        assert result is not None
        assert result.workflow_id == "uploaded_workflow_123"
        assert result.status == "uploaded"
        assert result.message == "Workflow uploaded successfully"

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_upload_workflow_invalid_data(self, mock_client_class):
        """Test workflow upload with invalid data."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = "Invalid workflow data"
        mock_client.post.return_value = mock_response

        # Upload workflow
        invalid_workflow_data = {"invalid": "data"}

        with pytest.raises(Exception):
            await self.service.upload_workflow(invalid_workflow_data)

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_delete_workflow_success(self, mock_client_class):
        """Test successful workflow deletion."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "deleted",
            "message": "Workflow deleted successfully",
        }
        mock_client.delete.return_value = mock_response

        # Delete workflow
        result = await self.service.delete_workflow("test_workflow_id")

        assert result is not None
        assert result.status == "deleted"
        assert result.message == "Workflow deleted successfully"

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_delete_workflow_not_found(self, mock_client_class):
        """Test workflow deletion for non-existent workflow."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.text = "Workflow not found"
        mock_client.delete.return_value = mock_response

        # Delete workflow
        with pytest.raises(Exception):
            await self.service.delete_workflow("non_existent_id")

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_success(self, mock_client_class):
        """Test successful workflow templates retrieval."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "templates": [
                {
                    "id": "template_1",
                    "name": "Text to Image",
                    "description": "Generate images from text prompts",
                    "category": "generation",
                },
                {
                    "id": "template_2",
                    "name": "Image Upscaling",
                    "description": "Upscale images using AI",
                    "category": "enhancement",
                },
            ],
            "total": 2,
        }
        mock_client.get.return_value = mock_response

        # Get workflow templates
        result = await self.service.get_workflow_templates()

        assert result is not None
        assert len(result.templates) == 2
        assert result.total == 2
        assert result.templates[0].id == "template_1"
        assert result.templates[0].name == "Text to Image"
        assert result.templates[0].category == "generation"

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_empty(self, mock_client_class):
        """Test workflow templates retrieval with no templates."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"templates": [], "total": 0}
        mock_client.get.return_value = mock_response

        # Get workflow templates
        result = await self.service.get_workflow_templates()

        assert result is not None
        assert len(result.templates) == 0
        assert result.total == 0

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_by_category(self, mock_client_class):
        """Test workflow templates retrieval by category."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "templates": [
                {
                    "id": "template_1",
                    "name": "Text to Image",
                    "description": "Generate images from text prompts",
                    "category": "generation",
                },
            ],
            "total": 1,
        }
        mock_client.get.return_value = mock_response

        # Get workflow templates by category
        result = await self.service.get_workflow_templates(category="generation")

        assert result is not None
        assert len(result.templates) == 1
        assert result.total == 1
        assert result.templates[0].category == "generation"

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_search(self, mock_client_class):
        """Test workflow templates retrieval with search query."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "templates": [
                {
                    "id": "template_1",
                    "name": "Text to Image",
                    "description": "Generate images from text prompts",
                    "category": "generation",
                },
            ],
            "total": 1,
        }
        mock_client.get.return_value = mock_response

        # Get workflow templates with search
        result = await self.service.get_workflow_templates(search="text")

        assert result is not None
        assert len(result.templates) == 1
        assert result.total == 1
        assert "text" in result.templates[0].name.lower()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_pagination(self, mock_client_class):
        """Test workflow templates retrieval with pagination."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "templates": [
                {
                    "id": "template_1",
                    "name": "Text to Image",
                    "description": "Generate images from text prompts",
                    "category": "generation",
                },
            ],
            "total": 1,
            "page": 1,
            "per_page": 10,
        }
        mock_client.get.return_value = mock_response

        # Get workflow templates with pagination
        result = await self.service.get_workflow_templates(page=1, per_page=10)

        assert result is not None
        assert len(result.templates) == 1
        assert result.total == 1
        assert result.page == 1
        assert result.per_page == 10

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_error(self, mock_client_class):
        """Test workflow templates retrieval with error."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_network_error(self, mock_client_class):
        """Test workflow templates retrieval with network error."""
        # Mock the HTTP client to raise an exception
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client
        mock_client.get.side_effect = Exception("Network error")

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_timeout(self, mock_client_class):
        """Test workflow templates retrieval with timeout."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 408
        mock_response.text = "Request Timeout"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_unauthorized(self, mock_client_class):
        """Test workflow templates retrieval with unauthorized access."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = "Unauthorized"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_forbidden(self, mock_client_class):
        """Test workflow templates retrieval with forbidden access."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_response.text = "Forbidden"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_not_found(self, mock_client_class):
        """Test workflow templates retrieval with not found."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.text = "Not Found"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_method_not_allowed(self, mock_client_class):
        """Test workflow templates retrieval with method not allowed."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 405
        mock_response.text = "Method Not Allowed"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_conflict(self, mock_client_class):
        """Test workflow templates retrieval with conflict."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 409
        mock_response.text = "Conflict"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_unprocessable_entity(self, mock_client_class):
        """Test workflow templates retrieval with unprocessable entity."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 422
        mock_response.text = "Unprocessable Entity"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_too_many_requests(self, mock_client_class):
        """Test workflow templates retrieval with too many requests."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.text = "Too Many Requests"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_service_unavailable(self, mock_client_class):
        """Test workflow templates retrieval with service unavailable."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 503
        mock_response.text = "Service Unavailable"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_gateway_timeout(self, mock_client_class):
        """Test workflow templates retrieval with gateway timeout."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 504
        mock_response.text = "Gateway Timeout"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_http_version_not_supported(
        self, mock_client_class,
    ):
        """Test workflow templates retrieval with HTTP version not supported."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 505
        mock_response.text = "HTTP Version Not Supported"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_variant_also_negotiates(
        self, mock_client_class,
    ):
        """Test workflow templates retrieval with variant also negotiates."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 506
        mock_response.text = "Variant Also Negotiates"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_insufficient_storage(self, mock_client_class):
        """Test workflow templates retrieval with insufficient storage."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 507
        mock_response.text = "Insufficient Storage"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_loop_detected(self, mock_client_class):
        """Test workflow templates retrieval with loop detected."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 508
        mock_response.text = "Loop Detected"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_not_extended(self, mock_client_class):
        """Test workflow templates retrieval with not extended."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 510
        mock_response.text = "Not Extended"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()

    @patch("app.services.comfy.comfy_service.httpx.AsyncClient")
    async def test_get_workflow_templates_network_authentication_required(
        self, mock_client_class,
    ):
        """Test workflow templates retrieval with network authentication required."""
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 511
        mock_response.text = "Network Authentication Required"
        mock_client.get.return_value = mock_response

        # Get workflow templates
        with pytest.raises(Exception):
            await self.service.get_workflow_templates()
