"""
PDF Processing Service
=====================

Service for converting PDF papers to markdown using the Marker library.
Supports lazy loading and conditional service loading based on environment variables.
"""

import asyncio
import json
import logging
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Environment variable checks
PDF_PROCESSING_ENABLED = os.getenv("PDF_PROCESSING_ENABLED", "true").lower() == "true"
MARKER_PACKAGE_ENABLED = os.getenv("MARKER_PACKAGE_ENABLED", "true").lower() == "true"
MARKER_LLM_ENHANCEMENT_ENABLED = (
    os.getenv("MARKER_LLM_ENHANCEMENT_ENABLED", "false").lower() == "true"
)

# Lazy imports - only import Marker when needed
_marker_imports = None


def _lazy_import_marker():
    """Lazy import Marker modules only when needed."""
    global _marker_imports

    if _marker_imports is None:
        if not PDF_PROCESSING_ENABLED or not MARKER_PACKAGE_ENABLED:
            raise RuntimeError("PDF processing is disabled via environment variables")

        try:
            from marker.config.parser import ConfigParser
            from marker.converters.pdf import PdfConverter
            from marker.models import create_model_dict
            from marker.output import save_output
            from marker.processors import BaseProcessor
            from marker.renderers.markdown import MarkdownRenderer
            from marker.services import BaseService

            _marker_imports = {
                'ConfigParser': ConfigParser,
                'create_model_dict': create_model_dict,
                'PdfConverter': PdfConverter,
                'MarkdownRenderer': MarkdownRenderer,
                'BaseProcessor': BaseProcessor,
                'BaseService': BaseService,
                'save_output': save_output,
            }

            logger.info("Marker package imported successfully")

        except ImportError as e:
            logger.error(f"Failed to import Marker package: {e}")
            raise RuntimeError(f"Marker package not available: {e}")

    return _marker_imports


class PDFProcessorService:
    """Service for processing PDF papers into markdown using Marker."""

    def __init__(self):
        self.models = None
        self.converter = None
        self._models_initialized = False
        self._marker_imports = None

    def _check_service_enabled(self):
        """Check if PDF processing service is enabled."""
        if not PDF_PROCESSING_ENABLED:
            raise RuntimeError(
                "PDF processing is disabled via PDF_PROCESSING_ENABLED environment variable"
            )
        if not MARKER_PACKAGE_ENABLED:
            raise RuntimeError(
                "Marker package is disabled via MARKER_PACKAGE_ENABLED environment variable"
            )

    def _get_marker_imports(self):
        """Get Marker imports, loading them lazily if needed."""
        if self._marker_imports is None:
            self._marker_imports = _lazy_import_marker()
        return self._marker_imports

    async def _ensure_models_initialized(self):
        """Ensure models are initialized, doing it asynchronously if needed."""
        if not self._models_initialized:
            self._check_service_enabled()

            try:
                logger.info("Initializing Marker models...")
                marker_imports = self._get_marker_imports()

                # Run model initialization in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                self.models = await loop.run_in_executor(
                    None, marker_imports['create_model_dict']
                )
                self._models_initialized = True
                logger.info("Marker models initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Marker models: {e}")
                self.models = None
                self._models_initialized = False
                raise

    async def _create_converter(self, use_llm: bool = False):
        """Create a PDF converter with appropriate configuration."""
        await self._ensure_models_initialized()

        if not self.models:
            raise RuntimeError("Marker models not initialized")

        # Check LLM enhancement setting
        if use_llm and not MARKER_LLM_ENHANCEMENT_ENABLED:
            logger.warning(
                "LLM enhancement requested but disabled via MARKER_LLM_ENHANCEMENT_ENABLED"
            )
            use_llm = False

        marker_imports = self._get_marker_imports()

        # Use ConfigParser approach like the CLI
        cli_options = {
            "output_format": "markdown",
            "use_llm": use_llm,
            "debug": False,
        }

        config_parser = marker_imports['ConfigParser'](cli_options)

        # Create converter using the same approach as CLI
        converter = config_parser.get_converter_cls()(
            config=config_parser.generate_config_dict(),
            artifact_dict=self.models,
            processor_list=config_parser.get_processors(),
            renderer=config_parser.get_renderer(),
            llm_service=config_parser.get_llm_service(),
        )

        return converter

    async def process_pdf_to_markdown(
        self, pdf_path: str, output_dir: Optional[str] = None, use_llm: bool = False
    ) -> Dict[str, Any]:
        """
        Process a PDF file to markdown.

        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save the markdown file (optional)
            use_llm: Whether to use LLM for enhanced processing

        Returns:
            Dictionary with processing results
        """
        try:
            pdf_path = Path(pdf_path)
            if not pdf_path.exists():
                return {"success": False, "error": f"PDF file not found: {pdf_path}"}

            logger.info(f"Processing PDF: {pdf_path}")

            # Create converter
            converter = await self._create_converter(use_llm=use_llm)

            # Process PDF
            start_time = datetime.now()

            # Run conversion in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            rendered = await loop.run_in_executor(
                None, lambda: converter(str(pdf_path))
            )

            processing_time = (datetime.now() - start_time).total_seconds()

            # Determine output directory
            if output_dir is None:
                output_dir = pdf_path.parent / "markdown"
            else:
                output_dir = Path(output_dir)

            output_dir.mkdir(parents=True, exist_ok=True)

            # Use Marker's save_output function
            marker_imports = self._get_marker_imports()
            base_filename = pdf_path.stem
            marker_imports['save_output'](rendered, str(output_dir), base_filename)

            # Get file stats
            markdown_path = output_dir / f"{base_filename}.md"
            markdown_size = markdown_path.stat().st_size
            pdf_size = pdf_path.stat().st_size

            logger.info(f"Successfully processed PDF to markdown: {markdown_path}")

            return {
                "success": True,
                "pdf_path": str(pdf_path),
                "markdown_path": str(markdown_path),
                "pdf_size": pdf_size,
                "markdown_size": markdown_size,
                "processing_time": processing_time,
                "use_llm": use_llm,
                "compression_ratio": markdown_size / pdf_size if pdf_size > 0 else 0,
            }

        except Exception as e:
            logger.error(f"Error processing PDF {pdf_path}: {e}")
            return {"success": False, "error": str(e), "pdf_path": str(pdf_path)}

    async def process_paper_collection(
        self, papers_dir: str, use_llm: bool = False, max_papers: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Process a collection of PDF papers to markdown.

        Args:
            papers_dir: Directory containing PDF papers
            use_llm: Whether to use LLM for enhanced processing
            max_papers: Maximum number of papers to process

        Returns:
            Dictionary with processing results
        """
        papers_dir = Path(papers_dir)
        if not papers_dir.exists():
            return {
                "success": False,
                "error": f"Papers directory not found: {papers_dir}",
            }

        # Find all PDF files
        pdf_files = list(papers_dir.rglob("*.pdf"))

        if max_papers:
            pdf_files = pdf_files[:max_papers]

        logger.info(f"Found {len(pdf_files)} PDF files to process")

        results = []
        successful = 0
        failed = 0

        for pdf_file in pdf_files:
            logger.info(
                f"Processing paper {successful + failed + 1}/{len(pdf_files)}: {pdf_file.name}"
            )

            result = await self.process_pdf_to_markdown(str(pdf_file), use_llm=use_llm)

            results.append(result)

            if result["success"]:
                successful += 1
            else:
                failed += 1

        return {
            "success": True,
            "total_papers": len(pdf_files),
            "successful": successful,
            "failed": failed,
            "results": results,
        }

    def get_processing_stats(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get processing statistics from results."""
        if not results:
            return {}

        successful_results = [r for r in results if r.get("success", False)]

        if not successful_results:
            return {
                "total_papers": len(results),
                "successful": 0,
                "failed": len(results),
                "success_rate": 0.0,
            }

        total_pdf_size = sum(r.get("pdf_size", 0) for r in successful_results)
        total_markdown_size = sum(r.get("markdown_size", 0) for r in successful_results)
        total_processing_time = sum(
            r.get("processing_time", 0) for r in successful_results
        )

        return {
            "total_papers": len(results),
            "successful": len(successful_results),
            "failed": len(results) - len(successful_results),
            "success_rate": len(successful_results) / len(results),
            "total_pdf_size": total_pdf_size,
            "total_markdown_size": total_markdown_size,
            "total_processing_time": total_processing_time,
            "average_processing_time": total_processing_time / len(successful_results),
            "average_compression_ratio": (
                total_markdown_size / total_pdf_size if total_pdf_size > 0 else 0
            ),
        }


# Global instance
pdf_processor = PDFProcessorService()
