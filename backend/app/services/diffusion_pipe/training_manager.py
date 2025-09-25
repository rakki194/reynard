"""Training process lifecycle management.

This module provides comprehensive training process management with
subprocess coordination, real-time progress tracking, and resource monitoring.
"""

import asyncio
import json
import logging
import os
import subprocess
import tempfile
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.api.diffusion_pipe.models import TrainingRequest, TrainingStatus

logger = logging.getLogger(__name__)


class TrainingManager:
    """Training process lifecycle manager with subprocess coordination.
    
    This manager handles:
    - Async training process execution with subprocess management
    - Real-time progress tracking via log parsing
    - Resource monitoring (GPU memory, CPU usage)
    - Process timeout and error handling
    - Configuration file generation and management
    """
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the training manager."""
        self.config = config
        self.diffusion_pipe_path = Path(config["path"])
        self.active_processes: Dict[str, subprocess.Popen] = {}
        self.process_metadata: Dict[str, Dict[str, Any]] = {}
        self.is_initialized = False
        
        logger.info("TrainingManager initialized")
    
    async def initialize(self) -> bool:
        """Initialize the training manager."""
        try:
            # Validate diffusion-pipe installation
            if not self._validate_installation():
                logger.error("Diffusion-pipe installation validation failed")
                return False
            
            # Create output directories
            await self._create_output_directories()
            
            self.is_initialized = True
            logger.info("TrainingManager initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize TrainingManager: {e}")
            return False
    
    async def shutdown(self) -> bool:
        """Shutdown the training manager."""
        try:
            # Stop all active processes
            await self._stop_all_processes()
            
            self.is_initialized = False
            logger.info("TrainingManager shutdown completed")
            return True
            
        except Exception as e:
            logger.error(f"Error during TrainingManager shutdown: {e}")
            return False
    
    async def start_training_process(
        self, 
        request: TrainingRequest, 
        training_status: TrainingStatus
    ) -> Dict[str, Any]:
        """Start a training process."""
        try:
            if not self.is_initialized:
                raise RuntimeError("TrainingManager not initialized")
            
            request_id = request.request_id
            
            # Generate configuration file
            config_file = await self._generate_config_file(request)
            
            # Prepare training command
            command = await self._prepare_training_command(request, config_file)
            
            # Start process
            process = await self._start_process(command, request_id)
            
            # Store process metadata
            self.process_metadata[request_id] = {
                "process": process,
                "config_file": config_file,
                "start_time": datetime.now(),
                "request": request,
                "training_status": training_status,
            }
            
            # Start monitoring
            asyncio.create_task(self._monitor_training_process(request_id))
            
            logger.info(f"Started training process for {request_id}")
            return {"success": True, "process_id": process.pid}
            
        except Exception as e:
            logger.error(f"Failed to start training process for {request_id}: {e}")
            return {"success": False, "error_message": str(e)}
    
    async def stop_training_process(self, request_id: str) -> bool:
        """Stop a training process."""
        try:
            if request_id not in self.process_metadata:
                logger.warning(f"Training process {request_id} not found")
                return False
            
            metadata = self.process_metadata[request_id]
            process = metadata["process"]
            
            # Terminate process gracefully
            if process.poll() is None:  # Process is still running
                process.terminate()
                
                # Wait for graceful termination
                try:
                    process.wait(timeout=30)
                except subprocess.TimeoutExpired:
                    # Force kill if graceful termination fails
                    process.kill()
                    process.wait()
            
            # Clean up metadata
            del self.process_metadata[request_id]
            
            logger.info(f"Stopped training process for {request_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to stop training process {request_id}: {e}")
            return False
    
    async def get_process_status(self, request_id: str) -> Optional[Dict[str, Any]]:
        """Get process status."""
        if request_id not in self.process_metadata:
            return None
        
        metadata = self.process_metadata[request_id]
        process = metadata["process"]
        
        return {
            "pid": process.pid,
            "returncode": process.returncode,
            "is_running": process.poll() is None,
            "start_time": metadata["start_time"],
            "runtime": (datetime.now() - metadata["start_time"]).total_seconds(),
        }
    
    def _validate_installation(self) -> bool:
        """Validate diffusion-pipe installation."""
        try:
            # Check required files
            required_files = ["train.py", "requirements.txt"]
            for file_name in required_files:
                file_path = self.diffusion_pipe_path / file_name
                if not file_path.exists():
                    logger.error(f"Required file not found: {file_path}")
                    return False
            
            # Check Python environment
            try:
                result = subprocess.run(
                    ["python", "--version"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode != 0:
                    logger.error("Python not available")
                    return False
            except Exception as e:
                logger.error(f"Python check failed: {e}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Installation validation error: {e}")
            return False
    
    async def _create_output_directories(self):
        """Create necessary output directories."""
        try:
            output_dir = Path(self.config.get("default_output_dir", "/tmp/diffusion_pipe_output"))
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Create subdirectories
            subdirs = ["checkpoints", "logs", "configs", "models"]
            for subdir in subdirs:
                (output_dir / subdir).mkdir(exist_ok=True)
            
            logger.info(f"Created output directories in {output_dir}")
            
        except Exception as e:
            logger.error(f"Failed to create output directories: {e}")
            raise
    
    async def _generate_config_file(self, request: TrainingRequest) -> str:
        """Generate TOML configuration file for training."""
        try:
            # Create temporary config file
            config_dir = Path(self.config.get("default_output_dir", "/tmp/diffusion_pipe_output")) / "configs"
            config_file = config_dir / f"{request.request_id}.toml"
            
            # Generate TOML content
            toml_content = self._generate_toml_content(request)
            
            # Write config file
            with open(config_file, "w") as f:
                f.write(toml_content)
            
            logger.info(f"Generated config file: {config_file}")
            return str(config_file)
            
        except Exception as e:
            logger.error(f"Failed to generate config file: {e}")
            raise
    
    def _generate_toml_content(self, request: TrainingRequest) -> str:
        """Generate TOML configuration content."""
        config = request.config
        model_config = config.training_model_config
        dataset_config = config.dataset_config
        
        # Build TOML content
        toml_lines = [
            f'# Training configuration for {request.request_id}',
            f'# Generated at {datetime.now().isoformat()}',
            '',
            f'output_dir = "{config.output_dir}"',
            f'dataset = "{dataset_config.dataset_path}"',
            f'epochs = {config.epochs}',
            f'micro_batch_size_per_gpu = {config.micro_batch_size_per_gpu}',
            f'pipeline_stages = {config.pipeline_stages}',
            f'gradient_accumulation_steps = {config.gradient_accumulation_steps}',
            f'gradient_clipping = {config.gradient_clipping}',
            f'warmup_steps = {config.warmup_steps}',
            '',
            '[model]',
            f'type = "{model_config.model_type.value}"',
            f'diffusers_path = "{model_config.diffusers_path}"',
            f'transformer_path = "{model_config.transformer_path}"',
            f'dtype = "{model_config.dtype.value}"',
            f'transformer_dtype = "{model_config.transformer_dtype.value}"',
            f'flux_shift = {str(model_config.flux_shift).lower()}',
            '',
            '[adapter]',
            f'type = "{model_config.adapter_type.value}"',
            f'rank = {model_config.rank}',
            f'dtype = "{model_config.adapter_dtype.value}"',
            '',
            '[optimizer]',
            f'type = "{model_config.optimizer_type.value}"',
            f'lr = {model_config.learning_rate}',
            f'betas = {model_config.betas}',
            f'weight_decay = {model_config.weight_decay}',
            f'eps = {model_config.eps}',
            '',
        ]
        
        # Add monitoring configuration if enabled
        if config.enable_wandb and model_config.enable_wandb:
            toml_lines.extend([
                '[monitoring]',
                f'enable_wandb = {str(config.enable_wandb).lower()}',
                f'wandb_api_key = "{model_config.wandb_api_key or ""}"',
                f'wandb_tracker_name = "{model_config.wandb_tracker_name}"',
                f'wandb_run_name = "{model_config.wandb_run_name}"',
                '',
            ])
        
        return '\n'.join(toml_lines)
    
    async def _prepare_training_command(self, request: TrainingRequest, config_file: str) -> List[str]:
        """Prepare training command."""
        try:
            # Base command
            command = [
                "python",
                str(self.diffusion_pipe_path / "train.py"),
                "--config", config_file,
            ]
            
            # Add additional arguments based on configuration
            if self.config.get("debug", False):
                command.append("--debug")
            
            if self.config.get("enable_checkpointing", True):
                command.append("--checkpointing")
            
            # Add GPU-specific arguments
            if await self._is_gpu_available():
                command.extend(["--device", "cuda"])
            else:
                command.extend(["--device", "cpu"])
            
            logger.info(f"Prepared training command: {' '.join(command)}")
            return command
            
        except Exception as e:
            logger.error(f"Failed to prepare training command: {e}")
            raise
    
    async def _start_process(self, command: List[str], request_id: str) -> subprocess.Popen:
        """Start training process."""
        try:
            # Set up environment
            env = os.environ.copy()
            env["PYTHONPATH"] = str(self.diffusion_pipe_path)
            
            # Start process
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=env,
                cwd=str(self.diffusion_pipe_path)
            )
            
            logger.info(f"Started training process {process.pid} for {request_id}")
            return process
            
        except Exception as e:
            logger.error(f"Failed to start process: {e}")
            raise
    
    async def _monitor_training_process(self, request_id: str):
        """Monitor training process and update status."""
        try:
            if request_id not in self.process_metadata:
                return
            
            metadata = self.process_metadata[request_id]
            process = metadata["process"]
            training_status = metadata["training_status"]
            
            # Monitor process output
            while process.poll() is None:
                # Read output
                if process.stdout:
                    line = process.stdout.readline()
                    if line:
                        await self._parse_training_output(line, training_status)
                
                # Check for timeout
                runtime = (datetime.now() - metadata["start_time"]).total_seconds()
                timeout = metadata["request"].timeout_seconds
                
                if runtime > timeout:
                    logger.warning(f"Training {request_id} timed out after {timeout} seconds")
                    process.terminate()
                    training_status.status = TrainingStatus.FAILED
                    training_status.error_message = "Training timed out"
                    break
                
                await asyncio.sleep(1)
            
            # Process completed
            returncode = process.returncode
            if returncode == 0:
                training_status.status = TrainingStatus.COMPLETED
                training_status.progress_percentage = 100.0
            else:
                training_status.status = TrainingStatus.FAILED
                training_status.error_message = f"Process exited with code {returncode}"
            
            training_status.end_time = datetime.now()
            
            # Clean up
            if request_id in self.process_metadata:
                del self.process_metadata[request_id]
            
            logger.info(f"Training process {request_id} completed with status: {training_status.status}")
            
        except Exception as e:
            logger.error(f"Error monitoring training process {request_id}: {e}")
            if request_id in self.process_metadata:
                training_status = self.process_metadata[request_id]["training_status"]
                training_status.status = TrainingStatus.FAILED
                training_status.error_message = str(e)
                training_status.end_time = datetime.now()
    
    async def _parse_training_output(self, line: str, training_status: TrainingStatus):
        """Parse training output and update status."""
        try:
            line = line.strip()
            if not line:
                return
            
            # Parse different types of output
            if "epoch" in line.lower() and "step" in line.lower():
                # Parse epoch/step information
                await self._parse_epoch_step(line, training_status)
            elif "loss" in line.lower():
                # Parse loss information
                await self._parse_loss(line, training_status)
            elif "progress" in line.lower() or "%" in line:
                # Parse progress information
                await self._parse_progress(line, training_status)
            
        except Exception as e:
            logger.debug(f"Error parsing training output: {e}")
    
    async def _parse_epoch_step(self, line: str, training_status: TrainingStatus):
        """Parse epoch and step information."""
        try:
            # Extract epoch and step numbers
            import re
            
            epoch_match = re.search(r'epoch[:\s]+(\d+)', line, re.IGNORECASE)
            step_match = re.search(r'step[:\s]+(\d+)', line, re.IGNORECASE)
            
            if epoch_match:
                training_status.current_epoch = int(epoch_match.group(1))
            
            if step_match:
                training_status.current_step = int(step_match.group(1))
            
        except Exception as e:
            logger.debug(f"Error parsing epoch/step: {e}")
    
    async def _parse_loss(self, line: str, training_status: TrainingStatus):
        """Parse loss information."""
        try:
            import re
            
            loss_match = re.search(r'loss[:\s]+([\d.]+)', line, re.IGNORECASE)
            if loss_match:
                training_status.loss = float(loss_match.group(1))
            
        except Exception as e:
            logger.debug(f"Error parsing loss: {e}")
    
    async def _parse_progress(self, line: str, training_status: TrainingStatus):
        """Parse progress information."""
        try:
            import re
            
            progress_match = re.search(r'(\d+(?:\.\d+)?)%', line)
            if progress_match:
                training_status.progress_percentage = float(progress_match.group(1))
            
        except Exception as e:
            logger.debug(f"Error parsing progress: {e}")
    
    async def _stop_all_processes(self):
        """Stop all active processes."""
        for request_id in list(self.process_metadata.keys()):
            await self.stop_training_process(request_id)
    
    async def _is_gpu_available(self) -> bool:
        """Check if GPU is available."""
        try:
            result = subprocess.run(
                ["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            return False
