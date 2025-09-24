"""Tests for the hf_cache module."""

import os
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

from app.utils.hf_cache import (
    clear_cache,
    ensure_hf_cache_dir,
    get_cache_size,
    get_hf_cache_dir,
    get_hf_hub_dir,
    get_model_cache_path,
    get_model_snapshot_path,
    is_model_cached,
)


class TestHFCache:
    """Test cases for HuggingFace cache utilities."""

    def test_get_hf_cache_dir_hf_home(self):
        """Test get_hf_cache_dir with HF_HOME environment variable."""
        with patch.dict(os.environ, {"HF_HOME": "/custom/hf/home"}):
            result = get_hf_cache_dir()
            assert result == Path("/custom/hf/home")

    def test_get_hf_cache_dir_hf_cache(self):
        """Test get_hf_cache_dir with HF_CACHE environment variable."""
        with patch.dict(os.environ, {"HF_CACHE": "/custom/hf/cache"}, clear=True):
            result = get_hf_cache_dir()
            assert result == Path("/custom/hf/cache")

    def test_get_hf_cache_dir_default(self):
        """Test get_hf_cache_dir with default fallback."""
        with patch.dict(os.environ, {}, clear=True):
            with patch("pathlib.Path.home") as mock_home:
                mock_home.return_value = Path("/home/user")
                result = get_hf_cache_dir()
                assert result == Path("/home/user/.cache/huggingface")

    def test_get_hf_cache_dir_priority_order(self):
        """Test that HF_HOME takes priority over HF_CACHE."""
        with patch.dict(
            os.environ, {"HF_HOME": "/priority/home", "HF_CACHE": "/secondary/cache"},
        ):
            result = get_hf_cache_dir()
            assert result == Path("/priority/home")

    def test_get_hf_hub_dir(self):
        """Test get_hf_hub_dir creates hub directory."""
        with patch("app.utils.hf_cache.get_hf_cache_dir") as mock_get_cache:
            mock_cache_dir = MagicMock()
            mock_hub_dir = MagicMock()
            mock_cache_dir.__truediv__ = MagicMock(return_value=mock_hub_dir)
            mock_get_cache.return_value = mock_cache_dir

            result = get_hf_hub_dir()

            mock_cache_dir.__truediv__.assert_called_once_with("hub")
            mock_hub_dir.mkdir.assert_called_once_with(parents=True, exist_ok=True)
            assert result == mock_hub_dir

    def test_get_model_cache_path(self):
        """Test get_model_cache_path with repository ID."""
        with patch("app.utils.hf_cache.get_hf_hub_dir") as mock_get_hub:
            mock_hub_dir = MagicMock()
            mock_model_path = MagicMock()
            mock_hub_dir.__truediv__ = MagicMock(return_value=mock_model_path)
            mock_get_hub.return_value = mock_hub_dir

            result = get_model_cache_path(
                "fancyfeast/llama-joycaption-beta-one-hf-llava",
            )

            expected_cache_name = (
                "models--fancyfeast--llama-joycaption-beta-one-hf-llava"
            )
            mock_hub_dir.__truediv__.assert_called_once_with(expected_cache_name)
            assert result == mock_model_path

    def test_get_model_cache_path_with_slash(self):
        """Test get_model_cache_path converts slashes to double dashes."""
        with patch("app.utils.hf_cache.get_hf_hub_dir") as mock_get_hub:
            mock_hub_dir = MagicMock()
            mock_model_path = MagicMock()
            mock_hub_dir.__truediv__ = MagicMock(return_value=mock_model_path)
            mock_get_hub.return_value = mock_hub_dir

            result = get_model_cache_path("user/model-name")

            expected_cache_name = "models--user--model-name"
            mock_hub_dir.__truediv__.assert_called_once_with(expected_cache_name)
            assert result == mock_model_path

    def test_ensure_hf_cache_dir(self):
        """Test ensure_hf_cache_dir creates directory and returns path."""
        with patch("app.utils.hf_cache.get_hf_cache_dir") as mock_get_cache:
            mock_cache_dir = MagicMock()
            mock_get_cache.return_value = mock_cache_dir

            result = ensure_hf_cache_dir()

            mock_cache_dir.mkdir.assert_called_once_with(parents=True, exist_ok=True)
            assert result == mock_cache_dir

    def test_get_model_snapshot_path_default_revision(self):
        """Test get_model_snapshot_path with default revision."""
        with patch("app.utils.hf_cache.get_model_cache_path") as mock_get_model_path:
            mock_model_path = MagicMock()
            mock_snapshot_path = MagicMock()
            mock_snapshots_dir = MagicMock()
            mock_model_path.__truediv__ = MagicMock(return_value=mock_snapshots_dir)
            mock_snapshots_dir.__truediv__ = MagicMock(return_value=mock_snapshot_path)
            mock_get_model_path.return_value = mock_model_path

            result = get_model_snapshot_path("user/model")

            mock_get_model_path.assert_called_once_with("user/model")
            mock_model_path.__truediv__.assert_called_once_with("snapshots")
            mock_snapshots_dir.__truediv__.assert_called_once_with("main")
            assert result == mock_snapshot_path

    def test_get_model_snapshot_path_custom_revision(self):
        """Test get_model_snapshot_path with custom revision."""
        with patch("app.utils.hf_cache.get_model_cache_path") as mock_get_model_path:
            mock_model_path = MagicMock()
            mock_snapshot_path = MagicMock()
            mock_snapshots_dir = MagicMock()
            mock_model_path.__truediv__ = MagicMock(return_value=mock_snapshots_dir)
            mock_snapshots_dir.__truediv__ = MagicMock(return_value=mock_snapshot_path)
            mock_get_model_path.return_value = mock_model_path

            result = get_model_snapshot_path("user/model", "v1.0")

            mock_get_model_path.assert_called_once_with("user/model")
            mock_model_path.__truediv__.assert_called_once_with("snapshots")
            mock_snapshots_dir.__truediv__.assert_called_once_with("v1.0")
            assert result == mock_snapshot_path

    def test_is_model_cached_true(self):
        """Test is_model_cached returns True when model exists."""
        with patch("app.utils.hf_cache.get_model_cache_path") as mock_get_model_path:
            mock_model_path = MagicMock()
            mock_model_path.exists.return_value = True
            mock_get_model_path.return_value = mock_model_path

            result = is_model_cached("user/model")

            mock_get_model_path.assert_called_once_with("user/model")
            mock_model_path.exists.assert_called_once()
            assert result is True

    def test_is_model_cached_false(self):
        """Test is_model_cached returns False when model doesn't exist."""
        with patch("app.utils.hf_cache.get_model_cache_path") as mock_get_model_path:
            mock_model_path = MagicMock()
            mock_model_path.exists.return_value = False
            mock_get_model_path.return_value = mock_model_path

            result = is_model_cached("user/model")

            mock_get_model_path.assert_called_once_with("user/model")
            mock_model_path.exists.assert_called_once()
            assert result is False

    def test_get_cache_size_exists(self):
        """Test get_cache_size when cache directory exists."""
        with patch("app.utils.hf_cache.get_hf_cache_dir") as mock_get_cache:
            # Create a temporary directory structure
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)

                # Create some test files
                (temp_path / "file1.txt").write_text("content1")
                (temp_path / "subdir").mkdir()
                (temp_path / "subdir" / "file2.txt").write_text("content2")

                mock_get_cache.return_value = temp_path

                result = get_cache_size()

                # Should be the size of both files (8 + 8 = 16 bytes)
                assert result == 16

    def test_get_cache_size_not_exists(self):
        """Test get_cache_size when cache directory doesn't exist."""
        with patch("app.utils.hf_cache.get_hf_cache_dir") as mock_get_cache:
            mock_cache_dir = MagicMock()
            mock_cache_dir.exists.return_value = False
            mock_get_cache.return_value = mock_cache_dir

            result = get_cache_size()

            mock_cache_dir.exists.assert_called_once()
            assert result == 0

    def test_clear_cache_success(self):
        """Test clear_cache successfully removes cache directory."""
        with patch("app.utils.hf_cache.get_hf_cache_dir") as mock_get_cache:
            with patch("shutil.rmtree") as mock_rmtree:
                mock_cache_dir = MagicMock()
                mock_cache_dir.exists.return_value = True
                mock_get_cache.return_value = mock_cache_dir

                result = clear_cache()

                mock_cache_dir.exists.assert_called_once()
                mock_rmtree.assert_called_once_with(mock_cache_dir)
                assert result is True

    def test_clear_cache_not_exists(self):
        """Test clear_cache when cache directory doesn't exist."""
        with patch("app.utils.hf_cache.get_hf_cache_dir") as mock_get_cache:
            mock_cache_dir = MagicMock()
            mock_cache_dir.exists.return_value = False
            mock_get_cache.return_value = mock_cache_dir

            result = clear_cache()

            mock_cache_dir.exists.assert_called_once()
            assert result is True

    def test_clear_cache_exception(self):
        """Test clear_cache handles exceptions gracefully."""
        with patch("app.utils.hf_cache.get_hf_cache_dir") as mock_get_cache:
            with patch("shutil.rmtree") as mock_rmtree:
                mock_cache_dir = MagicMock()
                mock_cache_dir.exists.return_value = True
                mock_rmtree.side_effect = Exception("Permission denied")
                mock_get_cache.return_value = mock_cache_dir

                result = clear_cache()

                mock_cache_dir.exists.assert_called_once()
                mock_rmtree.assert_called_once_with(mock_cache_dir)
                assert result is False
