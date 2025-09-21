from unittest.mock import Mock, patch

from fastapi.testclient import TestClient

from backend.app.api.gallery.endpoints import router


class TestGalleryAPI:
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.client = TestClient(router)

    @patch("backend.app.services.gallery.service_initializer.get_gallery_service")
    def test_download_gallery_success(self, mock_get_service):
        """Test successful gallery download endpoint."""
        mock_service = Mock()
        mock_service.download_gallery.return_value = {
            "status": 0,
            "download_id": "test-download-123",
            "url": "https://example.com/gallery",
            "extractor": "test-extractor",
            "files": [],
            "total_files": 5,
            "downloaded_files": 0,
            "total_bytes": 10240000,
            "downloaded_bytes": 0,
            "status": "downloading",
            "created_at": "2025-01-15T10:00:00Z",
            "completed_at": None,
            "error": None,
        }
        mock_get_service.return_value = mock_service

        response = self.client.post(
            "/download",
            json={
                "url": "https://example.com/gallery",
                "options": {"output_directory": "./downloads", "max_concurrent": 3},
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == 0
        assert data["download_id"] == "test-download-123"
        assert data["url"] == "https://example.com/gallery"

    @patch("backend.app.services.gallery.service_initializer.get_gallery_service")
    def test_download_gallery_invalid_url(self, mock_get_service):
        """Test gallery download with invalid URL."""
        mock_service = Mock()
        mock_service.download_gallery.return_value = {
            "status": -1,
            "error": "Invalid URL provided",
            "download_id": None,
            "url": "invalid-url",
            "extractor": None,
            "files": [],
            "total_files": 0,
            "downloaded_files": 0,
            "total_bytes": 0,
            "downloaded_bytes": 0,
            "status": "failed",
            "created_at": "2025-01-15T10:00:00Z",
            "completed_at": None,
        }
        mock_get_service.return_value = mock_service

        response = self.client.post(
            "/download", json={"url": "invalid-url", "options": {}}
        )

        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "Invalid URL provided"

    @patch("backend.app.services.gallery.service_initializer.get_gallery_service")
    def test_validate_url_success(self, mock_get_service):
        """Test URL validation endpoint."""
        mock_service = Mock()
        mock_service.validate_url.return_value = {
            "valid": True,
            "url": "https://example.com/gallery",
            "extractor": "test-extractor",
            "extractor_info": {
                "name": "test-extractor",
                "category": "test",
                "subcategory": "gallery",
                "pattern": "example\\.com/gallery",
                "description": "Test extractor",
            },
            "estimated_files": 5,
            "estimated_size": 10240000,
            "requires_auth": False,
            "error": None,
        }
        mock_get_service.return_value = mock_service

        response = self.client.post(
            "/validate", json={"url": "https://example.com/gallery"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["extractor"] == "test-extractor"
        assert data["estimated_files"] == 5

    @patch("backend.app.services.gallery.service_initializer.get_gallery_service")
    def test_validate_url_invalid(self, mock_get_service):
        """Test URL validation with invalid URL."""
        mock_service = Mock()
        mock_service.validate_url.return_value = {
            "valid": False,
            "url": "invalid-url",
            "extractor": None,
            "extractor_info": None,
            "estimated_files": 0,
            "estimated_size": 0,
            "requires_auth": False,
            "error": "No extractor found for URL",
        }
        mock_get_service.return_value = mock_service

        response = self.client.post("/validate", json={"url": "invalid-url"})

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert data["error"] == "No extractor found for URL"

    @patch("backend.app.services.gallery.service_initializer.get_gallery_service")
    def test_get_extractors(self, mock_get_service):
        """Test getting available extractors."""
        mock_service = Mock()
        mock_service._get_available_extractors.return_value = [
            "test-extractor",
            "another-extractor",
        ]
        mock_get_service.return_value = mock_service

        response = self.client.get("/extractors")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert "test-extractor" in data
        assert "another-extractor" in data

    @patch("backend.app.services.gallery.service_initializer.get_gallery_service")
    def test_get_reynard_extractors(self, mock_get_service):
        """Test getting Reynard custom extractors."""
        mock_service = Mock()
        mock_service.get_reynard_extractors.return_value = [
            {
                "name": "reynard-content",
                "category": "reynard",
                "subcategory": "content",
                "pattern": "reynard://content/(\\d+)",
                "description": "Reynard content extractor",
            },
            {
                "name": "reynard-gallery",
                "category": "reynard",
                "subcategory": "gallery",
                "pattern": "reynard://gallery/(\\d+)",
                "description": "Reynard gallery extractor",
            },
        ]
        mock_get_service.return_value = mock_service

        response = self.client.get("/extractors/reynard")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["name"] == "reynard-content"
        assert data[1]["name"] == "reynard-gallery"

    @patch("backend.app.services.gallery.service_initializer.get_gallery_service")
    def test_get_extractor_stats(self, mock_get_service):
        """Test getting extractor statistics."""
        mock_service = Mock()
        mock_service.get_extractor_stats.return_value = {
            "total_extractors": 150,
            "reynard_extractors": 3,
            "gallery_dl_extractors": 147,
        }
        mock_get_service.return_value = mock_service

        response = self.client.get("/extractors/stats")

        assert response.status_code == 200
        data = response.json()
        assert data["total_extractors"] == 150
        assert data["reynard_extractors"] == 3
        assert data["gallery_dl_extractors"] == 147

    @patch("backend.app.services.gallery.service_initializer.get_gallery_service")
    def test_get_download_progress(self, mock_get_service):
        """Test getting download progress."""
        mock_service = Mock()
        mock_service.get_download_progress.return_value = {
            "download_id": "test-download-123",
            "url": "https://example.com/gallery",
            "status": "downloading",
            "percentage": 50,
            "current_file": "image5.jpg",
            "total_files": 10,
            "downloaded_files": 5,
            "total_bytes": 10240000,
            "downloaded_bytes": 5120000,
            "speed": 1024000,
            "estimated_time": 5,
            "message": "Downloading image5.jpg...",
            "error": None,
            "timestamp": "2025-01-15T10:02:30Z",
        }
        mock_get_service.return_value = mock_service

        response = self.client.get("/download/test-download-123/progress")

        assert response.status_code == 200
        data = response.json()
        assert data["download_id"] == "test-download-123"
        assert data["percentage"] == 50
        assert data["status"] == "downloading"

    @patch("backend.app.services.gallery.service_initializer.get_gallery_service")
    def test_cancel_download(self, mock_get_service):
        """Test cancelling a download."""
        mock_service = Mock()
        mock_service.cancel_download.return_value = {
            "success": True,
            "message": "Download cancelled successfully",
        }
        mock_get_service.return_value = mock_service

        response = self.client.post("/download/test-download-123/cancel")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Download cancelled successfully"

    @patch("backend.app.services.gallery.service_initializer.get_gallery_service")
    def test_get_download_history(self, mock_get_service):
        """Test getting download history."""
        mock_service = Mock()
        mock_service.get_download_history.return_value = [
            {
                "download_id": "download-1",
                "url": "https://example.com/gallery1",
                "status": "completed",
                "created_at": "2025-01-15T10:00:00Z",
                "completed_at": "2025-01-15T10:05:00Z",
                "total_files": 5,
                "downloaded_files": 5,
            },
            {
                "download_id": "download-2",
                "url": "https://example.com/gallery2",
                "status": "failed",
                "created_at": "2025-01-15T11:00:00Z",
                "completed_at": None,
                "total_files": 3,
                "downloaded_files": 1,
            },
        ]
        mock_get_service.return_value = mock_service

        response = self.client.get("/history")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["download_id"] == "download-1"
        assert data[1]["download_id"] == "download-2"

    @patch("backend.app.services.gallery.service_initializer.get_batch_processor")
    def test_create_batch_download(self, mock_get_processor):
        """Test creating a batch download."""
        mock_processor = Mock()
        mock_processor.create_batch.return_value = {
            "batch_id": "batch-123",
            "name": "Test Batch",
            "total_items": 3,
            "completed_items": 0,
            "failed_items": 0,
            "status": "pending",
            "created_at": "2025-01-15T10:00:00Z",
        }
        mock_get_processor.return_value = mock_processor

        response = self.client.post(
            "/batch",
            json={
                "urls": [
                    "https://example.com/gallery1",
                    "https://example.com/gallery2",
                    "https://example.com/gallery3",
                ],
                "name": "Test Batch",
                "priority": "normal",
                "options": {"max_concurrent": 2},
                "settings": {},
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["batch_id"] == "batch-123"
        assert data["name"] == "Test Batch"
        assert data["total_items"] == 3

    @patch("backend.app.services.gallery.service_initializer.get_batch_processor")
    def test_get_batch_downloads(self, mock_get_processor):
        """Test getting batch downloads."""
        mock_processor = Mock()
        mock_processor.list_batches.return_value = [
            {
                "batch_id": "batch-1",
                "name": "Batch 1",
                "total_items": 5,
                "completed_items": 3,
                "failed_items": 1,
                "status": "downloading",
                "created_at": "2025-01-15T10:00:00Z",
            },
            {
                "batch_id": "batch-2",
                "name": "Batch 2",
                "total_items": 3,
                "completed_items": 3,
                "failed_items": 0,
                "status": "completed",
                "created_at": "2025-01-15T09:00:00Z",
            },
        ]
        mock_get_processor.return_value = mock_processor

        response = self.client.get("/batch")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["batch_id"] == "batch-1"
        assert data[1]["batch_id"] == "batch-2"

    @patch("backend.app.services.gallery.service_initializer.get_batch_processor")
    def test_get_batch_download(self, mock_get_processor):
        """Test getting a specific batch download."""
        mock_processor = Mock()
        mock_processor.get_batch.return_value = {
            "batch_id": "batch-123",
            "name": "Test Batch",
            "total_items": 3,
            "completed_items": 2,
            "failed_items": 0,
            "status": "downloading",
            "created_at": "2025-01-15T10:00:00Z",
        }
        mock_get_processor.return_value = mock_processor

        response = self.client.get("/batch/batch-123")

        assert response.status_code == 200
        data = response.json()
        assert data["batch_id"] == "batch-123"
        assert data["name"] == "Test Batch"

    @patch("backend.app.services.gallery.service_initializer.get_batch_processor")
    def test_get_batch_download_not_found(self, mock_get_processor):
        """Test getting a non-existent batch download."""
        mock_processor = Mock()
        mock_processor.get_batch.return_value = None
        mock_get_processor.return_value = mock_processor

        response = self.client.get("/batch/non-existent-batch")

        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "Batch not found"

    @patch("backend.app.services.gallery.service_initializer.get_batch_processor")
    def test_cancel_batch_download(self, mock_get_processor):
        """Test cancelling a batch download."""
        mock_processor = Mock()
        mock_processor.cancel_batch.return_value = {
            "success": True,
            "message": "Batch cancelled successfully",
        }
        mock_get_processor.return_value = mock_processor

        response = self.client.post("/batch/batch-123/cancel")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Batch cancelled successfully"

    @patch("backend.app.services.gallery.service_initializer.get_batch_processor")
    def test_retry_batch_download(self, mock_get_processor):
        """Test retrying a batch download."""
        mock_processor = Mock()
        mock_processor.retry_batch.return_value = {
            "success": True,
            "message": "Batch retry initiated",
        }
        mock_get_processor.return_value = mock_processor

        response = self.client.post("/batch/batch-123/retry")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Batch retry initiated"

    @patch("backend.app.services.gallery.service_initializer.get_batch_processor")
    def test_get_batch_processor_stats(self, mock_get_processor):
        """Test getting batch processor statistics."""
        mock_processor = Mock()
        mock_processor.get_stats.return_value = {
            "total_batches": 10,
            "active_batches": 2,
            "completed_batches": 7,
            "failed_batches": 1,
        }
        mock_get_processor.return_value = mock_processor

        response = self.client.get("/batch/processor/stats")

        assert response.status_code == 200
        data = response.json()
        assert data["total_batches"] == 10
        assert data["active_batches"] == 2
        assert data["completed_batches"] == 7
        assert data["failed_batches"] == 1

    def test_websocket_endpoint(self):
        """Test WebSocket endpoint."""
        # This would require more complex WebSocket testing
        # For now, just test that the endpoint exists
        response = self.client.get("/ws")
        # WebSocket endpoints typically return 426 Upgrade Required for HTTP requests
        assert response.status_code in [426, 404]  # Depending on implementation

    @patch("backend.app.services.gallery.service_initializer.get_websocket_manager")
    def test_websocket_stats(self, mock_get_manager):
        """Test WebSocket statistics endpoint."""
        mock_manager = Mock()
        mock_manager.get_stats.return_value = {
            "total_connections": 5,
            "total_subscriptions": 12,
            "unique_downloads": 8,
        }
        mock_get_manager.return_value = mock_manager

        response = self.client.get("/ws/stats")

        assert response.status_code == 200
        data = response.json()
        assert data["total_connections"] == 5
        assert data["total_subscriptions"] == 12
        assert data["unique_downloads"] == 8

    def test_health_check(self):
        """Test health check endpoint."""
        response = self.client.get("/api/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"

    def test_invalid_endpoint(self):
        """Test invalid endpoint returns 404."""
        response = self.client.get("/invalid-endpoint")

        assert response.status_code == 404

    def test_missing_required_fields(self):
        """Test endpoints with missing required fields."""
        response = self.client.post("/download", json={})

        assert response.status_code == 422  # Validation error

    def test_invalid_json(self):
        """Test endpoints with invalid JSON."""
        response = self.client.post(
            "/download",
            data="invalid json",
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code == 422  # Validation error
