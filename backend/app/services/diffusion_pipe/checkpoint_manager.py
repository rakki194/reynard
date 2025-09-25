"""Checkpoint management and resumption handling.

This module provides comprehensive checkpoint management with automatic
resumption, checkpoint validation, and storage optimization.
"""

import asyncio
import hashlib
import json
import logging
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.api.diffusion_pipe.models import CheckpointInfo, TrainingRequest, TrainingStatus

logger = logging.getLogger(__name__)


class CheckpointManager:
    """Checkpoint manager with automatic resumption and validation.
    
    This manager handles:
    - Checkpoint creation and storage with automatic intervals
    - Checkpoint validation and integrity checking
    - Automatic resumption from latest valid checkpoint
    - Checkpoint cleanup and storage optimization
    - Checkpoint metadata management and tracking
    """
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the checkpoint manager."""
        self.config = config
        self.checkpoint_dir = Path(config.get("default_output_dir", "/tmp/diffusion_pipe_output")) / "checkpoints"
        self.metadata_file = self.checkpoint_dir / "checkpoint_metadata.json"
        self.checkpoints: Dict[str, CheckpointInfo] = {}
        self.is_initialized = False
        
        logger.info("CheckpointManager initialized")
    
    async def initialize(self) -> bool:
        """Initialize the checkpoint manager."""
        try:
            # Create checkpoint directory
            self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
            
            # Load existing checkpoint metadata
            await self._load_checkpoint_metadata()
            
            # Clean up invalid checkpoints
            await self._cleanup_invalid_checkpoints()
            
            self.is_initialized = True
            logger.info("CheckpointManager initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize CheckpointManager: {e}")
            return False
    
    async def shutdown(self) -> bool:
        """Shutdown the checkpoint manager."""
        try:
            # Save checkpoint metadata
            await self._save_checkpoint_metadata()
            
            self.is_initialized = False
            logger.info("CheckpointManager shutdown completed")
            return True
            
        except Exception as e:
            logger.error(f"Error during CheckpointManager shutdown: {e}")
            return False
    
    async def create_checkpoint(
        self, 
        request_id: str, 
        training_status: TrainingStatus,
        checkpoint_data: Dict[str, Any]
    ) -> Optional[CheckpointInfo]:
        """Create a new checkpoint."""
        try:
            if not self.is_initialized:
                raise RuntimeError("CheckpointManager not initialized")
            
            # Generate checkpoint ID
            checkpoint_id = f"{request_id}_epoch_{training_status.current_epoch}_step_{training_status.current_step}"
            
            # Create checkpoint directory
            checkpoint_path = self.checkpoint_dir / checkpoint_id
            checkpoint_path.mkdir(exist_ok=True)
            
            # Save checkpoint data
            await self._save_checkpoint_data(checkpoint_path, checkpoint_data)
            
            # Calculate file size and checksum
            file_size_mb = await self._calculate_checkpoint_size(checkpoint_path)
            checksum = await self._calculate_checkpoint_checksum(checkpoint_path)
            
            # Create checkpoint info
            checkpoint_info = CheckpointInfo(
                checkpoint_id=checkpoint_id,
                request_id=request_id,
                checkpoint_path=str(checkpoint_path),
                epoch=training_status.current_epoch,
                step=training_status.current_step,
                timestamp=datetime.now(),
                is_valid=True,
                file_size_mb=file_size_mb,
                checksum=checksum,
                loss=training_status.loss or 0.0,
                learning_rate=training_status.learning_rate or 0.0,
                optimizer_state=checkpoint_data.get("optimizer_state"),
                model_state=checkpoint_data.get("model_state"),
                adapter_state=checkpoint_data.get("adapter_state"),
                metadata=checkpoint_data.get("metadata", {}),
            )
            
            # Store checkpoint info
            self.checkpoints[checkpoint_id] = checkpoint_info
            
            # Save metadata
            await self._save_checkpoint_metadata()
            
            logger.info(f"Created checkpoint {checkpoint_id} for training {request_id}")
            return checkpoint_info
            
        except Exception as e:
            logger.error(f"Failed to create checkpoint for {request_id}: {e}")
            return None
    
    async def get_latest_checkpoint(self, request_id: str) -> Optional[CheckpointInfo]:
        """Get the latest checkpoint for a training request."""
        try:
            # Find checkpoints for this request
            request_checkpoints = [
                checkpoint for checkpoint in self.checkpoints.values()
                if checkpoint.request_id == request_id and checkpoint.is_valid
            ]
            
            if not request_checkpoints:
                return None
            
            # Sort by timestamp and return latest
            latest_checkpoint = max(request_checkpoints, key=lambda c: c.timestamp)
            return latest_checkpoint
            
        except Exception as e:
            logger.error(f"Failed to get latest checkpoint for {request_id}: {e}")
            return None
    
    async def resume_from_checkpoint(
        self, 
        request_id: str, 
        checkpoint_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Resume training from a checkpoint."""
        try:
            # Get checkpoint
            if checkpoint_id:
                checkpoint = self.checkpoints.get(checkpoint_id)
            else:
                checkpoint = await self.get_latest_checkpoint(request_id)
            
            if not checkpoint:
                logger.warning(f"No checkpoint found for {request_id}")
                return None
            
            # Validate checkpoint
            if not await self._validate_checkpoint(checkpoint):
                logger.error(f"Checkpoint {checkpoint.checkpoint_id} is invalid")
                return None
            
            # Load checkpoint data
            checkpoint_data = await self._load_checkpoint_data(Path(checkpoint.checkpoint_path))
            
            logger.info(f"Resuming training {request_id} from checkpoint {checkpoint.checkpoint_id}")
            return checkpoint_data
            
        except Exception as e:
            logger.error(f"Failed to resume from checkpoint for {request_id}: {e}")
            return None
    
    async def list_checkpoints(self, request_id: Optional[str] = None) -> List[CheckpointInfo]:
        """List checkpoints with optional filtering."""
        try:
            checkpoints = list(self.checkpoints.values())
            
            if request_id:
                checkpoints = [c for c in checkpoints if c.request_id == request_id]
            
            # Sort by timestamp (newest first)
            checkpoints.sort(key=lambda c: c.timestamp, reverse=True)
            return checkpoints
            
        except Exception as e:
            logger.error(f"Failed to list checkpoints: {e}")
            return []
    
    async def delete_checkpoint(self, checkpoint_id: str) -> bool:
        """Delete a checkpoint."""
        try:
            if checkpoint_id not in self.checkpoints:
                logger.warning(f"Checkpoint {checkpoint_id} not found")
                return False
            
            checkpoint = self.checkpoints[checkpoint_id]
            
            # Delete checkpoint directory
            checkpoint_path = Path(checkpoint.checkpoint_path)
            if checkpoint_path.exists():
                shutil.rmtree(checkpoint_path)
            
            # Remove from metadata
            del self.checkpoints[checkpoint_id]
            
            # Save metadata
            await self._save_checkpoint_metadata()
            
            logger.info(f"Deleted checkpoint {checkpoint_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete checkpoint {checkpoint_id}: {e}")
            return False
    
    async def cleanup_old_checkpoints(self, keep_count: int = 5) -> int:
        """Clean up old checkpoints, keeping only the specified number."""
        try:
            # Group checkpoints by request_id
            request_checkpoints = {}
            for checkpoint in self.checkpoints.values():
                if checkpoint.request_id not in request_checkpoints:
                    request_checkpoints[checkpoint.request_id] = []
                request_checkpoints[checkpoint.request_id].append(checkpoint)
            
            deleted_count = 0
            
            # Clean up each request's checkpoints
            for request_id, checkpoints in request_checkpoints.items():
                # Sort by timestamp (newest first)
                checkpoints.sort(key=lambda c: c.timestamp, reverse=True)
                
                # Delete old checkpoints
                for checkpoint in checkpoints[keep_count:]:
                    if await self.delete_checkpoint(checkpoint.checkpoint_id):
                        deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} old checkpoints")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup old checkpoints: {e}")
            return 0
    
    async def _load_checkpoint_metadata(self):
        """Load checkpoint metadata from file."""
        try:
            if not self.metadata_file.exists():
                logger.info("No checkpoint metadata file found, starting fresh")
                return
            
            with open(self.metadata_file, "r") as f:
                metadata = json.load(f)
            
            # Load checkpoint info
            for checkpoint_data in metadata.get("checkpoints", []):
                checkpoint_info = CheckpointInfo(**checkpoint_data)
                self.checkpoints[checkpoint_info.checkpoint_id] = checkpoint_info
            
            logger.info(f"Loaded {len(self.checkpoints)} checkpoint metadata entries")
            
        except Exception as e:
            logger.error(f"Failed to load checkpoint metadata: {e}")
    
    async def _save_checkpoint_metadata(self):
        """Save checkpoint metadata to file."""
        try:
            metadata = {
                "version": "1.0.0",
                "last_updated": datetime.now().isoformat(),
                "checkpoints": [checkpoint.dict() for checkpoint in self.checkpoints.values()]
            }
            
            with open(self.metadata_file, "w") as f:
                json.dump(metadata, f, indent=2, default=str)
            
            logger.debug("Saved checkpoint metadata")
            
        except Exception as e:
            logger.error(f"Failed to save checkpoint metadata: {e}")
    
    async def _save_checkpoint_data(self, checkpoint_path: Path, checkpoint_data: Dict[str, Any]):
        """Save checkpoint data to files."""
        try:
            # Save model state
            if "model_state" in checkpoint_data:
                model_file = checkpoint_path / "model_state.pth"
                # In a real implementation, this would save PyTorch state dict
                with open(model_file, "w") as f:
                    json.dump({"model_state": "placeholder"}, f)
            
            # Save optimizer state
            if "optimizer_state" in checkpoint_data:
                optimizer_file = checkpoint_path / "optimizer_state.pth"
                with open(optimizer_file, "w") as f:
                    json.dump({"optimizer_state": "placeholder"}, f)
            
            # Save adapter state
            if "adapter_state" in checkpoint_data:
                adapter_file = checkpoint_path / "adapter_state.pth"
                with open(adapter_file, "w") as f:
                    json.dump({"adapter_state": "placeholder"}, f)
            
            # Save training metadata
            metadata_file = checkpoint_path / "training_metadata.json"
            with open(metadata_file, "w") as f:
                json.dump(checkpoint_data.get("metadata", {}), f, indent=2)
            
            logger.debug(f"Saved checkpoint data to {checkpoint_path}")
            
        except Exception as e:
            logger.error(f"Failed to save checkpoint data: {e}")
            raise
    
    async def _load_checkpoint_data(self, checkpoint_path: Path) -> Dict[str, Any]:
        """Load checkpoint data from files."""
        try:
            checkpoint_data = {}
            
            # Load model state
            model_file = checkpoint_path / "model_state.pth"
            if model_file.exists():
                with open(model_file, "r") as f:
                    checkpoint_data["model_state"] = json.load(f)
            
            # Load optimizer state
            optimizer_file = checkpoint_path / "optimizer_state.pth"
            if optimizer_file.exists():
                with open(optimizer_file, "r") as f:
                    checkpoint_data["optimizer_state"] = json.load(f)
            
            # Load adapter state
            adapter_file = checkpoint_path / "adapter_state.pth"
            if adapter_file.exists():
                with open(adapter_file, "r") as f:
                    checkpoint_data["adapter_state"] = json.load(f)
            
            # Load training metadata
            metadata_file = checkpoint_path / "training_metadata.json"
            if metadata_file.exists():
                with open(metadata_file, "r") as f:
                    checkpoint_data["metadata"] = json.load(f)
            
            logger.debug(f"Loaded checkpoint data from {checkpoint_path}")
            return checkpoint_data
            
        except Exception as e:
            logger.error(f"Failed to load checkpoint data: {e}")
            raise
    
    async def _calculate_checkpoint_size(self, checkpoint_path: Path) -> float:
        """Calculate checkpoint size in MB."""
        try:
            total_size = 0
            for file_path in checkpoint_path.rglob("*"):
                if file_path.is_file():
                    total_size += file_path.stat().st_size
            
            return total_size / (1024 * 1024)  # Convert to MB
            
        except Exception as e:
            logger.error(f"Failed to calculate checkpoint size: {e}")
            return 0.0
    
    async def _calculate_checkpoint_checksum(self, checkpoint_path: Path) -> str:
        """Calculate checkpoint checksum."""
        try:
            hasher = hashlib.sha256()
            
            # Hash all files in the checkpoint directory
            for file_path in sorted(checkpoint_path.rglob("*")):
                if file_path.is_file():
                    with open(file_path, "rb") as f:
                        for chunk in iter(lambda: f.read(4096), b""):
                            hasher.update(chunk)
            
            return hasher.hexdigest()
            
        except Exception as e:
            logger.error(f"Failed to calculate checkpoint checksum: {e}")
            return ""
    
    async def _validate_checkpoint(self, checkpoint: CheckpointInfo) -> bool:
        """Validate checkpoint integrity."""
        try:
            checkpoint_path = Path(checkpoint.checkpoint_path)
            
            # Check if checkpoint directory exists
            if not checkpoint_path.exists():
                logger.error(f"Checkpoint directory does not exist: {checkpoint_path}")
                return False
            
            # Check if required files exist
            required_files = ["training_metadata.json"]
            for file_name in required_files:
                file_path = checkpoint_path / file_name
                if not file_path.exists():
                    logger.error(f"Required checkpoint file missing: {file_path}")
                    return False
            
            # Verify checksum if available
            if checkpoint.checksum:
                current_checksum = await self._calculate_checkpoint_checksum(checkpoint_path)
                if current_checksum != checkpoint.checksum:
                    logger.error(f"Checkpoint checksum mismatch: {checkpoint.checkpoint_id}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Checkpoint validation error: {e}")
            return False
    
    async def _cleanup_invalid_checkpoints(self):
        """Clean up invalid checkpoints."""
        try:
            invalid_checkpoints = []
            
            for checkpoint_id, checkpoint in self.checkpoints.items():
                if not await self._validate_checkpoint(checkpoint):
                    invalid_checkpoints.append(checkpoint_id)
            
            # Delete invalid checkpoints
            for checkpoint_id in invalid_checkpoints:
                await self.delete_checkpoint(checkpoint_id)
            
            if invalid_checkpoints:
                logger.info(f"Cleaned up {len(invalid_checkpoints)} invalid checkpoints")
            
        except Exception as e:
            logger.error(f"Failed to cleanup invalid checkpoints: {e}")
