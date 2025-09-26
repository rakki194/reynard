"""Tests for diffusion API endpoints.

This module tests the diffusion API endpoints for text generation
and infilling functionality.
"""

from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.diffusion.endpoints import router
from app.api.diffusion.models import (
    DiffusionGenerationRequest,
    DiffusionGenerationResponse,
    DiffusionInfillingRequest,
    DiffusionInfillingResponse,
)

# Create test app
app = FastAPI()
app.include_router(router, prefix="/api/diffusion")


class TestDiffusionGenerationEndpoint:
    """Test the diffusion text generation endpoint."""

    def test_generate_text_success(self):
        """Test successful text generation."""
        with patch(
            "app.api.diffusion.endpoints.get_diffusion_service",
        ) as mock_get_service:
            # Mock the service
            mock_service = AsyncMock()
            mock_get_service.return_value = mock_service

            # Mock the generation stream
            mock_event = MagicMock()
            mock_event.type = "token"
            mock_event.data = "Hello"
            mock_service.generate_stream.return_value = [mock_event]

            # Create test client
            client = TestClient(app)

            # Test request
            request_data = {
                "text": "Hello world",
                "model_id": "dreamon",
                "max_length": 100,
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 50,
                "repetition_penalty": 1.1,
                "stream": False,
            }

            response = client.post("/api/diffusion/generate", json=request_data)

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["generated_text"] == "Hello"
            assert data["model_id"] == "dreamon"
            assert data["tokens_generated"] == 1
            assert "processing_time" in data

    def test_generate_text_streaming_success(self):
        """Test successful streaming text generation."""
        with patch(
            "app.api.diffusion.endpoints.get_diffusion_service",
        ) as mock_get_service:
            # Mock the service
            mock_service = AsyncMock()
            mock_get_service.return_value = mock_service

            # Mock the generation stream
            mock_events = [
                MagicMock(type="token", data="Hello"),
                MagicMock(type="token", data=" world"),
                MagicMock(type="end", data=""),
            ]
            mock_service.generate_stream.return_value = mock_events

            # Create test client
            client = TestClient(app)

            # Test request
            request_data = {
                "text": "Hello world",
                "model_id": "dreamon",
                "max_length": 100,
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 50,
                "repetition_penalty": 1.1,
                "stream": True,
            }

            response = client.post("/api/diffusion/generate/stream", json=request_data)

            assert response.status_code == 200
            assert response.headers["content-type"] == "text/event-stream"

    def test_generate_text_service_error(self):
        """Test text generation with service error."""
        with patch(
            "app.api.diffusion.endpoints.get_diffusion_service",
        ) as mock_get_service:
            # Mock the service to raise an exception
            mock_get_service.side_effect = Exception("Service unavailable")

            # Create test client
            client = TestClient(app)

            # Test request
            request_data = {
                "text": "Hello world",
                "model_id": "dreamon",
                "max_length": 100,
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 50,
                "repetition_penalty": 1.1,
                "stream": False,
            }

            response = client.post("/api/diffusion/generate", json=request_data)

            assert response.status_code == 500
            data = response.json()
            assert data["detail"] == "Service unavailable"

    def test_generate_text_invalid_request(self):
        """Test text generation with invalid request data."""
        client = TestClient(app)

        # Test with missing required field
        request_data = {
            "model_id": "dreamon",
            "max_length": 100,
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 50,
            "repetition_penalty": 1.1,
            "stream": False,
        }

        response = client.post("/api/diffusion/generate", json=request_data)
        assert response.status_code == 422

    def test_generate_text_validation_errors(self):
        """Test text generation with validation errors."""
        client = TestClient(app)

        # Test with invalid field values
        request_data = {
            "text": "",  # Empty text (min_length=1)
            "model_id": "dreamon",
            "max_length": 0,  # Invalid max_length (ge=1)
            "temperature": 0.0,  # Invalid temperature (ge=0.1)
            "top_p": 0.0,  # Invalid top_p (ge=0.1)
            "top_k": 0,  # Invalid top_k (ge=1)
            "repetition_penalty": 0.9,  # Invalid repetition_penalty (ge=1.0)
            "stream": False,
        }

        response = client.post("/api/diffusion/generate", json=request_data)
        assert response.status_code == 422

    def test_generate_text_max_length_validation(self):
        """Test text generation with max_length validation."""
        client = TestClient(app)

        # Test with text too long
        request_data = {
            "text": "x" * 10001,  # Too long (max_length=10000)
            "model_id": "dreamon",
            "max_length": 100,
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 50,
            "repetition_penalty": 1.1,
            "stream": False,
        }

        response = client.post("/api/diffusion/generate", json=request_data)
        assert response.status_code == 422

    def test_generate_text_max_length_upper_bound(self):
        """Test text generation with max_length upper bound validation."""
        client = TestClient(app)

        # Test with max_length too high
        request_data = {
            "text": "Hello world",
            "model_id": "dreamon",
            "max_length": 2049,  # Too high (le=2048)
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 50,
            "repetition_penalty": 1.1,
            "stream": False,
        }

        response = client.post("/api/diffusion/generate", json=request_data)
        assert response.status_code == 422

    def test_generate_text_temperature_validation(self):
        """Test text generation with temperature validation."""
        client = TestClient(app)

        # Test with temperature too high
        request_data = {
            "text": "Hello world",
            "model_id": "dreamon",
            "max_length": 100,
            "temperature": 2.1,  # Too high (le=2.0)
            "top_p": 0.9,
            "top_k": 50,
            "repetition_penalty": 1.1,
            "stream": False,
        }

        response = client.post("/api/diffusion/generate", json=request_data)
        assert response.status_code == 422

    def test_generate_text_top_p_validation(self):
        """Test text generation with top_p validation."""
        client = TestClient(app)

        # Test with top_p too high
        request_data = {
            "text": "Hello world",
            "model_id": "dreamon",
            "max_length": 100,
            "temperature": 0.7,
            "top_p": 1.1,  # Too high (le=1.0)
            "top_k": 50,
            "repetition_penalty": 1.1,
            "stream": False,
        }

        response = client.post("/api/diffusion/generate", json=request_data)
        assert response.status_code == 422

    def test_generate_text_top_k_validation(self):
        """Test text generation with top_k validation."""
        client = TestClient(app)

        # Test with top_k too high
        request_data = {
            "text": "Hello world",
            "model_id": "dreamon",
            "max_length": 100,
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 101,  # Too high (le=100)
            "repetition_penalty": 1.1,
            "stream": False,
        }

        response = client.post("/api/diffusion/generate", json=request_data)
        assert response.status_code == 422

    def test_generate_text_repetition_penalty_validation(self):
        """Test text generation with repetition_penalty validation."""
        client = TestClient(app)

        # Test with repetition_penalty too high
        request_data = {
            "text": "Hello world",
            "model_id": "dreamon",
            "max_length": 100,
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 50,
            "repetition_penalty": 2.1,  # Too high (le=2.0)
            "stream": False,
        }

        response = client.post("/api/diffusion/generate", json=request_data)
        assert response.status_code == 422


class TestDiffusionInfillingEndpoint:
    """Test the diffusion text infilling endpoint."""

    def test_infill_text_success(self):
        """Test successful text infilling."""
        with patch(
            "app.api.diffusion.endpoints.get_diffusion_service",
        ) as mock_get_service:
            # Mock the service
            mock_service = AsyncMock()
            mock_get_service.return_value = mock_service

            # Mock the infilling stream
            mock_event = MagicMock()
            mock_event.type = "token"
            mock_event.data = "filled"
            mock_service.infill_stream.return_value = [mock_event]

            # Create test client
            client = TestClient(app)

            # Test request
            request_data = {
                "prefix": "Hello ",
                "suffix": " world",
                "model_id": "dreamon",
                "max_length": 100,
                "temperature": 0.7,
                "top_p": 0.9,
                "stream": False,
            }

            response = client.post("/api/diffusion/infill", json=request_data)

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["infilled_text"] == "filled"
            assert data["model_id"] == "dreamon"
            assert data["tokens_generated"] == 1
            assert "processing_time" in data

    def test_infill_text_streaming_success(self):
        """Test successful streaming text infilling."""
        with patch(
            "app.api.diffusion.endpoints.get_diffusion_service",
        ) as mock_get_service:
            # Mock the service
            mock_service = AsyncMock()
            mock_get_service.return_value = mock_service

            # Mock the infilling stream
            mock_events = [
                MagicMock(type="token", data="filled"),
                MagicMock(type="end", data=""),
            ]
            mock_service.infill_stream.return_value = mock_events

            # Create test client
            client = TestClient(app)

            # Test request
            request_data = {
                "prefix": "Hello ",
                "suffix": " world",
                "model_id": "dreamon",
                "max_length": 100,
                "temperature": 0.7,
                "top_p": 0.9,
                "stream": True,
            }

            response = client.post("/api/diffusion/infill/stream", json=request_data)

            assert response.status_code == 200
            assert response.headers["content-type"] == "text/event-stream"

    def test_infill_text_service_error(self):
        """Test text infilling with service error."""
        with patch(
            "app.api.diffusion.endpoints.get_diffusion_service",
        ) as mock_get_service:
            # Mock the service to raise an exception
            mock_get_service.side_effect = Exception("Service unavailable")

            # Create test client
            client = TestClient(app)

            # Test request
            request_data = {
                "prefix": "Hello ",
                "suffix": " world",
                "model_id": "dreamon",
                "max_length": 100,
                "temperature": 0.7,
                "top_p": 0.9,
                "stream": False,
            }

            response = client.post("/api/diffusion/infill", json=request_data)

            assert response.status_code == 500
            data = response.json()
            assert data["detail"] == "Service unavailable"

    def test_infill_text_invalid_request(self):
        """Test text infilling with invalid request data."""
        client = TestClient(app)

        # Test with missing required field
        request_data = {
            "prefix": "Hello ",
            "model_id": "dreamon",
            "max_length": 100,
            "temperature": 0.7,
            "top_p": 0.9,
            "stream": False,
        }

        response = client.post("/api/diffusion/infill", json=request_data)
        assert response.status_code == 422

    def test_infill_text_validation_errors(self):
        """Test text infilling with validation errors."""
        client = TestClient(app)

        # Test with invalid field values
        request_data = {
            "prefix": "",  # Empty prefix (min_length=1)
            "suffix": "",  # Empty suffix (min_length=1)
            "model_id": "dreamon",
            "max_length": 0,  # Invalid max_length (ge=1)
            "temperature": 0.0,  # Invalid temperature (ge=0.1)
            "top_p": 0.0,  # Invalid top_p (ge=0.1)
            "stream": False,
        }

        response = client.post("/api/diffusion/infill", json=request_data)
        assert response.status_code == 422

    def test_infill_text_max_length_validation(self):
        """Test text infilling with max_length validation."""
        client = TestClient(app)

        # Test with prefix too long
        request_data = {
            "prefix": "x" * 5001,  # Too long (max_length=5000)
            "suffix": " world",
            "model_id": "dreamon",
            "max_length": 100,
            "temperature": 0.7,
            "top_p": 0.9,
            "stream": False,
        }

        response = client.post("/api/diffusion/infill", json=request_data)
        assert response.status_code == 422

    def test_infill_text_max_length_upper_bound(self):
        """Test text infilling with max_length upper bound validation."""
        client = TestClient(app)

        # Test with max_length too high
        request_data = {
            "prefix": "Hello ",
            "suffix": " world",
            "model_id": "dreamon",
            "max_length": 1025,  # Too high (le=1024)
            "temperature": 0.7,
            "top_p": 0.9,
            "stream": False,
        }

        response = client.post("/api/diffusion/infill", json=request_data)
        assert response.status_code == 422

    def test_infill_text_temperature_validation(self):
        """Test text infilling with temperature validation."""
        client = TestClient(app)

        # Test with temperature too high
        request_data = {
            "prefix": "Hello ",
            "suffix": " world",
            "model_id": "dreamon",
            "max_length": 100,
            "temperature": 2.1,  # Too high (le=2.0)
            "top_p": 0.9,
            "stream": False,
        }

        response = client.post("/api/diffusion/infill", json=request_data)
        assert response.status_code == 422

    def test_infill_text_top_p_validation(self):
        """Test text infilling with top_p validation."""
        client = TestClient(app)

        # Test with top_p too high
        request_data = {
            "prefix": "Hello ",
            "suffix": " world",
            "model_id": "dreamon",
            "max_length": 100,
            "temperature": 0.7,
            "top_p": 1.1,  # Too high (le=1.0)
            "stream": False,
        }

        response = client.post("/api/diffusion/infill", json=request_data)
        assert response.status_code == 422


class TestDiffusionModels:
    """Test the diffusion API models."""

    def test_diffusion_generation_request_valid(self):
        """Test DiffusionGenerationRequest with valid data."""
        request = DiffusionGenerationRequest(
            text="Hello world",
            model_id="dreamon",
            max_length=100,
            temperature=0.7,
            top_p=0.9,
            top_k=50,
            repetition_penalty=1.1,
            stream=True,
        )

        assert request.text == "Hello world"
        assert request.model_id == "dreamon"
        assert request.max_length == 100
        assert request.temperature == 0.7
        assert request.top_p == 0.9
        assert request.top_k == 50
        assert request.repetition_penalty == 1.1
        assert request.stream is True

    def test_diffusion_generation_request_defaults(self):
        """Test DiffusionGenerationRequest with default values."""
        request = DiffusionGenerationRequest(text="Hello world")

        assert request.text == "Hello world"
        assert request.model_id == "dreamon"
        assert request.max_length == 512
        assert request.temperature == 0.7
        assert request.top_p == 0.9
        assert request.top_k == 50
        assert request.repetition_penalty == 1.1
        assert request.stream is True

    def test_diffusion_infilling_request_valid(self):
        """Test DiffusionInfillingRequest with valid data."""
        request = DiffusionInfillingRequest(
            prefix="Hello ",
            suffix=" world",
            model_id="dreamon",
            max_length=100,
            temperature=0.7,
            top_p=0.9,
            stream=True,
        )

        assert request.prefix == "Hello "
        assert request.suffix == " world"
        assert request.model_id == "dreamon"
        assert request.max_length == 100
        assert request.temperature == 0.7
        assert request.top_p == 0.9
        assert request.stream is True

    def test_diffusion_infilling_request_defaults(self):
        """Test DiffusionInfillingRequest with default values."""
        request = DiffusionInfillingRequest(prefix="Hello ", suffix=" world")

        assert request.prefix == "Hello "
        assert request.suffix == " world"
        assert request.model_id == "dreamon"
        assert request.max_length == 256
        assert request.temperature == 0.7
        assert request.top_p == 0.9
        assert request.stream is True

    def test_diffusion_generation_response_valid(self):
        """Test DiffusionGenerationResponse with valid data."""
        response = DiffusionGenerationResponse(
            success=True,
            generated_text="Hello world",
            model_id="dreamon",
            processing_time=1.5,
            tokens_generated=10,
            metadata={"key": "value"},
        )

        assert response.success is True
        assert response.generated_text == "Hello world"
        assert response.model_id == "dreamon"
        assert response.processing_time == 1.5
        assert response.tokens_generated == 10
        assert response.metadata == {"key": "value"}

    def test_diffusion_generation_response_defaults(self):
        """Test DiffusionGenerationResponse with default values."""
        response = DiffusionGenerationResponse(
            success=True,
            model_id="dreamon",
            processing_time=1.5,
        )

        assert response.success is True
        assert response.generated_text == ""
        assert response.model_id == "dreamon"
        assert response.processing_time == 1.5
        assert response.tokens_generated == 0
        assert response.metadata == {}

    def test_diffusion_infilling_response_valid(self):
        """Test DiffusionInfillingResponse with valid data."""
        response = DiffusionInfillingResponse(
            success=True,
            infilled_text="filled",
            model_id="dreamon",
            processing_time=1.0,
            tokens_generated=5,
            metadata={"key": "value"},
        )

        assert response.success is True
        assert response.infilled_text == "filled"
        assert response.model_id == "dreamon"
        assert response.processing_time == 1.0
        assert response.tokens_generated == 5
        assert response.metadata == {"key": "value"}

    def test_diffusion_infilling_response_defaults(self):
        """Test DiffusionInfillingResponse with default values."""
        response = DiffusionInfillingResponse(
            success=True,
            model_id="dreamon",
            processing_time=1.0,
        )

        assert response.success is True
        assert response.infilled_text == ""
        assert response.model_id == "dreamon"
        assert response.processing_time == 1.0
        assert response.tokens_generated == 0
        assert response.metadata == {}
