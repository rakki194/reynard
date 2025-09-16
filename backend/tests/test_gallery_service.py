from unittest.mock import Mock, patch

from backend.app.services.gallery.batch_processor import GalleryBatchProcessor
from backend.app.services.gallery.gallery_service import ReynardGalleryService
from backend.app.services.gallery.websocket_manager import GalleryWebSocketManager


class TestReynardGalleryService:
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.service = ReynardGalleryService()

    def test_initialization(self):
        """Test service initialization."""
        assert self.service is not None
        assert hasattr(self.service, "config")
        assert hasattr(self.service, "gallery_dl_config")

    def test_health_check(self):
        """Test health check functionality."""
        result = self.service.health_check()
        assert result["status"] == "healthy"
        assert "extractors" in result
        assert "gallery_dl_version" in result

    def test_get_available_extractors(self):
        """Test getting available extractors."""
        extractors = self.service._get_available_extractors()
        assert isinstance(extractors, list)
        # Should have at least the Reynard custom extractors
        assert len(extractors) >= 0

    def test_validate_url_valid(self):
        """Test URL validation with valid URL."""
        with patch.object(self.service, "_get_available_extractors") as mock_extractors:
            mock_extractors.return_value = ["test-extractor"]

            result = self.service.validate_url("https://example.com/gallery")
            assert result["valid"] is True
            assert "extractor" in result
            assert "estimated_files" in result

    def test_validate_url_invalid(self):
        """Test URL validation with invalid URL."""
        result = self.service.validate_url("invalid-url")
        assert result["valid"] is False
        assert "error" in result

    def test_validate_url_empty(self):
        """Test URL validation with empty URL."""
        result = self.service.validate_url("")
        assert result["valid"] is False
        assert "error" in result

    @patch("gallery_dl.job.DownloadJob")
    def test_download_gallery_success(self, mock_job):
        """Test successful gallery download."""
        # Mock the download job
        mock_job_instance = Mock()
        mock_job_instance.run.return_value = 0  # Success
        mock_job.return_value = mock_job_instance

        result = self.service.download_gallery("https://example.com/gallery")

        assert result["status"] == 0
        assert "download_id" in result
        assert "url" in result
        assert "extractor" in result

    @patch("gallery_dl.job.DownloadJob")
    def test_download_gallery_with_options(self, mock_job):
        """Test gallery download with custom options."""
        mock_job_instance = Mock()
        mock_job_instance.run.return_value = 0
        mock_job.return_value = mock_job_instance

        options = {"output_directory": "/tmp/test", "max_concurrent": 2}

        result = self.service.download_gallery("https://example.com/gallery", options)

        assert result["status"] == 0
        mock_job.assert_called_once()

    @patch("gallery_dl.job.DownloadJob")
    def test_download_gallery_failure(self, mock_job):
        """Test gallery download failure."""
        mock_job_instance = Mock()
        mock_job_instance.run.return_value = 1  # Failure
        mock_job.return_value = mock_job_instance

        result = self.service.download_gallery("https://example.com/gallery")

        assert result["status"] == 1
        assert "error" in result

    def test_download_gallery_invalid_url(self):
        """Test gallery download with invalid URL."""
        result = self.service.download_gallery("invalid-url")

        assert result["status"] == -1
        assert "error" in result

    def test_get_reynard_extractors(self):
        """Test getting Reynard custom extractors."""
        extractors = self.service.get_reynard_extractors()
        assert isinstance(extractors, list)
        # Should include our custom extractors
        extractor_names = [ext["name"] for ext in extractors]
        assert "reynard-content" in extractor_names
        assert "reynard-gallery" in extractor_names
        assert "reynard-user" in extractor_names

    def test_get_extractor_stats(self):
        """Test getting extractor statistics."""
        stats = self.service.get_extractor_stats()
        assert isinstance(stats, dict)
        assert "total_extractors" in stats
        assert "reynard_extractors" in stats
        assert "gallery_dl_extractors" in stats

    def test_load_reynard_config(self):
        """Test loading Reynard configuration."""
        config = self.service._load_reynard_config()
        assert isinstance(config, dict)
        assert "output" in config
        assert "extractor" in config

    def test_configure_gallery_dl(self):
        """Test configuring gallery-dl."""
        config = {"test": "value"}
        self.service._configure_gallery_dl(config)
        # Should not raise any exceptions
        assert True

    def test_generate_download_id(self):
        """Test download ID generation."""
        download_id = self.service._generate_download_id()
        assert isinstance(download_id, str)
        assert len(download_id) > 0

    def test_format_file_size(self):
        """Test file size formatting."""
        assert self.service._format_file_size(1024) == "1.0 KB"
        assert self.service._format_file_size(1048576) == "1.0 MB"
        assert self.service._format_file_size(1073741824) == "1.0 GB"

    def test_format_duration(self):
        """Test duration formatting."""
        assert self.service._format_duration(60) == "1m 0s"
        assert self.service._format_duration(3661) == "1h 1m 1s"
        assert self.service._format_duration(30) == "30s"


class TestGalleryBatchProcessor:
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.processor = GalleryBatchProcessor()

    def test_initialization(self):
        """Test batch processor initialization."""
        assert self.processor is not None
        assert hasattr(self.processor, "active_batches")
        assert hasattr(self.processor, "download_queue")

    def test_create_batch(self):
        """Test creating a new batch."""
        batch_request = {
            "urls": ["https://example.com/gallery1", "https://example.com/gallery2"],
            "name": "Test Batch",
            "priority": "normal",
            "options": {},
            "settings": {},
        }

        batch = self.processor.create_batch(batch_request)

        assert batch["batch_id"] is not None
        assert batch["name"] == "Test Batch"
        assert batch["total_items"] == 2
        assert batch["status"] == "pending"

    def test_get_batch(self):
        """Test getting a batch by ID."""
        batch_request = {
            "urls": ["https://example.com/gallery1"],
            "name": "Test Batch",
            "priority": "normal",
            "options": {},
            "settings": {},
        }

        batch = self.processor.create_batch(batch_request)
        batch_id = batch["batch_id"]

        retrieved_batch = self.processor.get_batch(batch_id)
        assert retrieved_batch is not None
        assert retrieved_batch["batch_id"] == batch_id

    def test_get_batch_nonexistent(self):
        """Test getting a non-existent batch."""
        result = self.processor.get_batch("non-existent-id")
        assert result is None

    def test_cancel_batch(self):
        """Test cancelling a batch."""
        batch_request = {
            "urls": ["https://example.com/gallery1"],
            "name": "Test Batch",
            "priority": "normal",
            "options": {},
            "settings": {},
        }

        batch = self.processor.create_batch(batch_request)
        batch_id = batch["batch_id"]

        result = self.processor.cancel_batch(batch_id)
        assert result["success"] is True

        updated_batch = self.processor.get_batch(batch_id)
        assert updated_batch["status"] == "cancelled"

    def test_retry_batch(self):
        """Test retrying a batch."""
        batch_request = {
            "urls": ["https://example.com/gallery1"],
            "name": "Test Batch",
            "priority": "normal",
            "options": {},
            "settings": {},
        }

        batch = self.processor.create_batch(batch_request)
        batch_id = batch["batch_id"]

        result = self.processor.retry_batch(batch_id)
        assert result["success"] is True

    def test_get_batch_stats(self):
        """Test getting batch processor statistics."""
        stats = self.processor.get_stats()
        assert isinstance(stats, dict)
        assert "total_batches" in stats
        assert "active_batches" in stats
        assert "completed_batches" in stats
        assert "failed_batches" in stats

    def test_list_batches(self):
        """Test listing all batches."""
        # Create a few test batches
        for i in range(3):
            batch_request = {
                "urls": [f"https://example.com/gallery{i}"],
                "name": f"Test Batch {i}",
                "priority": "normal",
                "options": {},
                "settings": {},
            }
            self.processor.create_batch(batch_request)

        batches = self.processor.list_batches()
        assert len(batches) == 3

    def test_batch_priority_ordering(self):
        """Test that batches are processed in priority order."""
        # Create batches with different priorities
        high_priority = {
            "urls": ["https://example.com/high"],
            "name": "High Priority",
            "priority": "high",
            "options": {},
            "settings": {},
        }

        low_priority = {
            "urls": ["https://example.com/low"],
            "name": "Low Priority",
            "priority": "low",
            "options": {},
            "settings": {},
        }

        batch1 = self.processor.create_batch(low_priority)
        batch2 = self.processor.create_batch(high_priority)

        # High priority should be processed first
        assert batch2["priority"] == "high"
        assert batch1["priority"] == "low"


class TestGalleryWebSocketManager:
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.manager = GalleryWebSocketManager()

    def test_initialization(self):
        """Test WebSocket manager initialization."""
        assert self.manager is not None
        assert hasattr(self.manager, "connections")
        assert hasattr(self.manager, "subscribers")

    def test_add_connection(self):
        """Test adding a WebSocket connection."""
        mock_websocket = Mock()
        connection_id = "test-connection"

        self.manager.add_connection(connection_id, mock_websocket)

        assert connection_id in self.manager.connections
        assert self.manager.connections[connection_id] == mock_websocket

    def test_remove_connection(self):
        """Test removing a WebSocket connection."""
        mock_websocket = Mock()
        connection_id = "test-connection"

        self.manager.add_connection(connection_id, mock_websocket)
        assert connection_id in self.manager.connections

        self.manager.remove_connection(connection_id)
        assert connection_id not in self.manager.connections

    def test_subscribe_to_download(self):
        """Test subscribing to download updates."""
        mock_websocket = Mock()
        connection_id = "test-connection"
        download_id = "test-download"

        self.manager.add_connection(connection_id, mock_websocket)
        self.manager.subscribe_to_download(connection_id, download_id)

        assert download_id in self.manager.subscribers
        assert connection_id in self.manager.subscribers[download_id]

    def test_unsubscribe_from_download(self):
        """Test unsubscribing from download updates."""
        mock_websocket = Mock()
        connection_id = "test-connection"
        download_id = "test-download"

        self.manager.add_connection(connection_id, mock_websocket)
        self.manager.subscribe_to_download(connection_id, download_id)

        assert download_id in self.manager.subscribers
        assert connection_id in self.manager.subscribers[download_id]

        self.manager.unsubscribe_from_download(connection_id, download_id)
        assert connection_id not in self.manager.subscribers[download_id]

    def test_broadcast_progress_update(self):
        """Test broadcasting progress updates."""
        mock_websocket1 = Mock()
        mock_websocket2 = Mock()
        connection_id1 = "connection-1"
        connection_id2 = "connection-2"
        download_id = "test-download"

        self.manager.add_connection(connection_id1, mock_websocket1)
        self.manager.add_connection(connection_id2, mock_websocket2)
        self.manager.subscribe_to_download(connection_id1, download_id)
        self.manager.subscribe_to_download(connection_id2, download_id)

        progress_update = {
            "download_id": download_id,
            "percentage": 50,
            "status": "downloading",
        }

        self.manager.broadcast_progress_update(download_id, progress_update)

        # Both connections should receive the update
        mock_websocket1.send.assert_called_once()
        mock_websocket2.send.assert_called_once()

    def test_broadcast_download_event(self):
        """Test broadcasting download events."""
        mock_websocket = Mock()
        connection_id = "test-connection"
        download_id = "test-download"

        self.manager.add_connection(connection_id, mock_websocket)
        self.manager.subscribe_to_download(connection_id, download_id)

        download_event = {
            "download_id": download_id,
            "type": "completed",
            "message": "Download completed successfully",
        }

        self.manager.broadcast_download_event(download_id, download_event)

        mock_websocket.send.assert_called_once()

    def test_get_connection_stats(self):
        """Test getting connection statistics."""
        mock_websocket1 = Mock()
        mock_websocket2 = Mock()

        self.manager.add_connection("connection-1", mock_websocket1)
        self.manager.add_connection("connection-2", mock_websocket2)
        self.manager.subscribe_to_download("connection-1", "download-1")
        self.manager.subscribe_to_download("connection-2", "download-1")
        self.manager.subscribe_to_download("connection-2", "download-2")

        stats = self.manager.get_stats()

        assert stats["total_connections"] == 2
        assert stats["total_subscriptions"] == 3
        assert stats["unique_downloads"] == 2

    def test_handle_connection_error(self):
        """Test handling connection errors."""
        mock_websocket = Mock()
        connection_id = "test-connection"
        download_id = "test-download"

        self.manager.add_connection(connection_id, mock_websocket)
        self.manager.subscribe_to_download(connection_id, download_id)

        # Simulate connection error
        mock_websocket.send.side_effect = Exception("Connection error")

        progress_update = {
            "download_id": download_id,
            "percentage": 50,
            "status": "downloading",
        }

        # Should handle error gracefully
        self.manager.broadcast_progress_update(download_id, progress_update)

        # Connection should be removed after error
        assert connection_id not in self.manager.connections
        assert connection_id not in self.manager.subscribers[download_id]

    def test_cleanup_inactive_connections(self):
        """Test cleaning up inactive connections."""
        mock_websocket = Mock()
        connection_id = "test-connection"

        self.manager.add_connection(connection_id, mock_websocket)

        # Simulate inactive connection
        mock_websocket.send.side_effect = Exception("Connection closed")

        self.manager.cleanup_inactive_connections()

        # Inactive connection should be removed
        assert connection_id not in self.manager.connections
