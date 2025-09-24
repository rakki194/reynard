"""Tests for caption generation API endpoints.

This module tests all caption generation endpoints including
single caption generation, batch processing, and model management.
"""

from unittest.mock import patch

from fastapi.testclient import TestClient


class TestCaptionGenerators:
    """Test caption generator information endpoints."""

    def test_get_available_generators_success(
        self, client: TestClient, mock_caption_service,
    ):
        """Test successful retrieval of available generators."""
        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            response = client.get("/api/caption/generators")

            assert response.status_code == 200
            data = response.json()
            assert "florence2" in data
            assert "description" in data["florence2"]
            assert "is_available" in data["florence2"]
            assert "caption_type" in data["florence2"]
            assert "config_schema" in data["florence2"]

    def test_get_available_generators_service_error(self, client: TestClient):
        """Test error handling when service fails."""
        with patch("app.api.caption.endpoints.get_caption_api_service") as mock_service:
            mock_service.return_value.get_available_generators.side_effect = Exception(
                "Service error",
            )
            response = client.get("/api/caption/generators")

            assert response.status_code == 500
            assert "Service error" in response.json()["detail"]

    def test_get_generator_info_success(self, client: TestClient, mock_caption_service):
        """Test successful retrieval of specific generator info."""
        mock_caption_service.get_generator_info.return_value = {
            "description": "Microsoft Florence2 - General purpose image captioning model",
            "is_available": True,
            "caption_type": "caption",
            "config_schema": {"type": "object", "properties": {}},
        }

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            response = client.get("/api/caption/generators/florence2")

            assert response.status_code == 200
            data = response.json()
            assert (
                data["description"]
                == "Microsoft Florence2 - General purpose image captioning model"
            )
            assert data["is_available"] is True
            assert data["caption_type"] == "caption"
            assert "config_schema" in data

    def test_get_generator_info_not_found(
        self, client: TestClient, mock_caption_service,
    ):
        """Test retrieval of nonexistent generator info."""
        mock_caption_service.get_generator_info.side_effect = ValueError(
            "Generator not found",
        )

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            response = client.get("/api/caption/generators/nonexistent")

            assert response.status_code == 404
            assert "Generator 'nonexistent' not found" in response.json()["detail"]


class TestSingleCaptionGeneration:
    """Test single caption generation endpoints."""

    def test_generate_single_caption_success(
        self, client: TestClient, mock_caption_service, test_image_data,
    ):
        """Test successful single caption generation."""
        mock_result = {
            "success": True,
            "image_path": "/tmp/test.jpg",
            "generator_name": "florence2",
            "caption": "A test image with various objects",
            "processing_time": 1.5,
            "caption_type": "descriptive",
        }
        mock_caption_service.upload_and_generate_caption.return_value = mock_result

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            files = {"file": ("test.jpg", test_image_data, "image/jpeg")}
            data = {
                "generator_name": "florence2",
                "config": '{"threshold": 0.2}',  # JSON string for multipart data
                "force": "false",
                "post_process": "true",
            }

            response = client.post("/api/caption/upload", files=files, data=data)

            assert response.status_code == 200
            result = response.json()
            assert result["success"] is True
            assert result["caption"] == "A test image with various objects"
            assert result["processing_time"] == 1.5
            assert result["caption_type"] == "descriptive"

    def test_generate_single_caption_no_image(self, client: TestClient):
        """Test single caption generation without image."""
        data = {
            "generator_name": "florence2",
            "config": '{"threshold": 0.2}',
            "force": "false",
            "post_process": "true",
        }

        response = client.post("/api/caption/upload", data=data)
        assert response.status_code == 422

    def test_generate_single_caption_invalid_generator(
        self, client: TestClient, test_image_data,
    ):
        """Test single caption generation with invalid generator."""
        files = {"file": ("test.jpg", test_image_data, "image/jpeg")}
        data = {
            "generator_name": "invalid_generator",
            "config": '{"threshold": 0.2}',  # JSON string for multipart data
            "force": "false",
            "post_process": "true",
        }

        response = client.post("/api/caption/upload", files=files, data=data)
        assert response.status_code == 400

    def test_generate_single_caption_service_error(
        self, client: TestClient, mock_caption_service, test_image_data,
    ):
        """Test error handling during caption generation."""
        mock_caption_service.upload_and_generate_caption.side_effect = Exception(
            "Generation failed",
        )

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            files = {"file": ("test.jpg", test_image_data, "image/jpeg")}
            data = {
                "generator_name": "florence2",
                "config": '{"threshold": 0.2}',  # JSON string for multipart data
                "force": "false",
                "post_process": "true",
            }

            response = client.post("/api/caption/upload", files=files, data=data)

            assert response.status_code == 500
            assert "Generation failed" in response.json()["detail"]

    def test_generate_single_caption_generation_failed(
        self, client: TestClient, mock_caption_service, test_image_data,
    ):
        """Test handling of failed caption generation."""
        mock_result = {
            "success": False,
            "image_path": "/tmp/test.jpg",
            "generator_name": "florence2",
            "error": "Model not available",
            "retryable": True,
        }
        mock_caption_service.upload_and_generate_caption.return_value = mock_result

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            files = {"file": ("test.jpg", test_image_data, "image/jpeg")}
            data = {
                "generator_name": "florence2",
                "config": '{"threshold": 0.2}',  # JSON string for multipart data
                "force": "false",
                "post_process": "true",
            }

            response = client.post("/api/caption/upload", files=files, data=data)

            assert response.status_code == 200
            result = response.json()
            assert result["success"] is False
            assert result["error"] == "Model not available"
            assert result["retryable"] is True


class TestBatchCaptionGeneration:
    """Test batch caption generation endpoints."""

    def test_generate_batch_captions_success(
        self, client: TestClient, mock_caption_service, test_image_data,
    ):
        """Test successful batch caption generation."""
        mock_results = [
            {
                "success": True,
                "caption": "First image caption",
                "processing_time": 1.0,
                "caption_type": "descriptive",
            },
            {
                "success": True,
                "caption": "Second image caption",
                "processing_time": 1.2,
                "caption_type": "descriptive",
            },
        ]
        mock_caption_service.generate_batch_captions.return_value = mock_results

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            files = [
                ("images", ("test1.jpg", test_image_data, "image/jpeg")),
                ("images", ("test2.jpg", test_image_data, "image/jpeg")),
            ]
            data = {
                "generator_name": "florence2",
                "config": '{"threshold": 0.2}',  # JSON string for multipart data
                "max_concurrent": "2",
            }

            response = client.post("/api/caption/batch", files=files, data=data)

            assert response.status_code == 200
            results = response.json()
            assert len(results) == 2
            assert results[0]["success"] is True
            assert results[0]["caption"] == "First image caption"
            assert results[1]["success"] is True
            assert results[1]["caption"] == "Second image caption"

    def test_generate_batch_captions_no_images(self, client: TestClient):
        """Test batch caption generation without images."""
        data = {
            "generator_name": "florence2",
            "config": '{"threshold": 0.2}',  # JSON string for multipart data
            "max_concurrent": "2",
        }

        response = client.post("/api/caption/batch", data=data)
        assert response.status_code == 422

    def test_generate_batch_captions_mixed_results(
        self, client: TestClient, mock_caption_service, test_image_data,
    ):
        """Test batch caption generation with mixed success/failure results."""
        mock_results = [
            {
                "success": True,
                "caption": "Successful caption",
                "processing_time": 1.0,
                "caption_type": "descriptive",
            },
            {"success": False, "error": "Processing failed", "retryable": True},
        ]
        mock_caption_service.generate_batch_captions.return_value = mock_results

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            files = [
                ("images", ("test1.jpg", test_image_data, "image/jpeg")),
                ("images", ("test2.jpg", test_image_data, "image/jpeg")),
            ]
            data = {
                "generator_name": "florence2",
                "config": '{"threshold": 0.2}',  # JSON string for multipart data
                "max_concurrent": "2",
            }

            response = client.post("/api/caption/batch", files=files, data=data)

            assert response.status_code == 200
            results = response.json()
            assert len(results) == 2
            assert results[0]["success"] is True
            assert results[1]["success"] is False
            assert results[1]["error"] == "Processing failed"


class TestModelManagement:
    """Test model management endpoints."""

    def test_load_model_success(self, client: TestClient, mock_caption_service):
        """Test successful model loading."""
        mock_caption_service.load_model.return_value = True

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            data = {"model_name": "test_model"}
            response = client.post("/api/caption/models/test_model/load", json=data)

            assert response.status_code == 200
            result = response.json()
            assert result["success"] is True
            assert result["message"] == "Model loaded successfully"

    def test_load_model_failure(self, client: TestClient, mock_caption_service):
        """Test model loading failure."""
        mock_caption_service.load_model.return_value = False

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            data = {"model_name": "test_model"}
            response = client.post("/api/caption/models/test_model/load", json=data)

            assert response.status_code == 400
            result = response.json()
            assert result["success"] is False
            assert "Failed to load model" in result["message"]

    def test_unload_model_success(self, client: TestClient, mock_caption_service):
        """Test successful model unloading."""
        mock_caption_service.unload_model.return_value = True

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            data = {"model_name": "test_model"}
            response = client.post("/api/caption/models/test_model/unload", json=data)

            assert response.status_code == 200
            result = response.json()
            assert result["success"] is True
            assert result["message"] == "Model unloaded successfully"

    def test_unload_model_failure(self, client: TestClient, mock_caption_service):
        """Test model unloading failure."""
        mock_caption_service.unload_model.return_value = False

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            data = {"model_name": "test_model"}
            response = client.post("/api/caption/models/test_model/unload", json=data)

            assert response.status_code == 400
            result = response.json()
            assert result["success"] is False
            assert "Failed to unload model" in result["message"]

    def test_get_loaded_models(self, client: TestClient, mock_caption_service):
        """Test retrieval of loaded models."""
        mock_caption_service.get_loaded_models.return_value = ["model1", "model2"]

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            response = client.get("/api/caption/models/loaded")

            assert response.status_code == 200
            result = response.json()
            assert result["loaded_models"] == ["model1", "model2"]

    def test_load_model_missing_name(self, client: TestClient):
        """Test model loading without model name."""
        response = client.post("/api/caption/models/test_model/load", json={})
        assert response.status_code == 422

    def test_unload_model_missing_name(self, client: TestClient):
        """Test model unloading without model name."""
        response = client.post("/api/caption/models/test_model/unload", json={})
        assert response.status_code == 422


class TestCaptionMonitoring:
    """Test caption generation monitoring endpoints."""

    def test_get_generation_stats(self, client: TestClient, mock_caption_service):
        """Test retrieval of generation statistics."""
        mock_stats = {
            "total_generations": 100,
            "successful_generations": 95,
            "failed_generations": 5,
            "average_processing_time": 1.5,
            "generators_used": ["generator1", "generator2"],
        }
        mock_caption_service.get_generation_stats.return_value = mock_stats

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            response = client.get("/api/caption/stats")

            assert response.status_code == 200
            result = response.json()
            assert result["total_generations"] == 100
            assert result["successful_generations"] == 95
            assert result["failed_generations"] == 5
            assert result["average_processing_time"] == 1.5
            assert result["generators_used"] == ["generator1", "generator2"]

    def test_get_generation_history(self, client: TestClient, mock_caption_service):
        """Test retrieval of generation history."""
        mock_history = [
            {
                "id": "1",
                "timestamp": "2023-01-01T00:00:00Z",
                "generator": "test_generator",
                "success": True,
                "processing_time": 1.5,
            },
            {
                "id": "2",
                "timestamp": "2023-01-01T01:00:00Z",
                "generator": "test_generator",
                "success": False,
                "error": "Model not available",
            },
        ]
        mock_caption_service.get_generation_history.return_value = mock_history

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            response = client.get("/api/caption/queue")

            assert response.status_code == 200
            result = response.json()
            assert len(result) == 2
            assert result[0]["id"] == "1"
            assert result[0]["success"] is True
            assert result[1]["id"] == "2"
            assert result[1]["success"] is False

    def test_clear_generation_history(self, client: TestClient, mock_caption_service):
        """Test clearing generation history."""
        mock_caption_service.clear_generation_history.return_value = True

        with patch(
            "app.api.caption.upload.get_caption_api_service",
            return_value=mock_caption_service,
        ):
            response = client.get("/api/caption/health")

            assert response.status_code == 200
            result = response.json()
            assert result["success"] is True
            assert result["message"] == "Generation history cleared successfully"
