"""
Syntax Search Module
===================

Handles syntax-based search functionality using ripgrep for fast text pattern matching.
"""

import asyncio
import logging
import time
from typing import Any, Dict, List

from .models import SearchResponse, SearchResult, SyntaxSearchRequest

logger = logging.getLogger(__name__)


class SyntaxSearchHandler:
    """Handles syntax search operations using ripgrep."""

    def __init__(self, search_service: Any) -> None:
        """Initialize the syntax search handler."""
        self.search_service = search_service

    async def search(self, request: SyntaxSearchRequest) -> SearchResponse:
        """Perform syntax-based search using ripgrep with caching."""
        start_time = time.time()
        cache_key = self.search_service._generate_cache_key(request, "syntax")

        try:
            # Check cache first
            cached_result = await self.search_service._get_cached_result(cache_key)
            if cached_result:
                self.search_service._metrics.record_search(
                    time.time() - start_time, cache_hit=True
                )
                logger.debug(f"Cache hit for syntax search: {request.query[:50]}...")
                return cached_result

            # Build ripgrep command
            command = self._build_ripgrep_command(request)

            # Execute ripgrep
            result = await self._run_ripgrep(command)

            # Parse results
            results = self._parse_ripgrep_results(result, request)

            search_response = SearchResponse(
                success=True,
                query=request.query,
                total_results=len(results),
                results=results,
                search_time=time.time() - start_time,
                search_strategies=["ripgrep"],
            )

            # Cache the result
            await self.search_service._cache_result(
                cache_key, search_response, ttl=1800
            )  # 30 minutes for syntax search
            self.search_service._metrics.record_search(
                time.time() - start_time, cache_hit=False
            )
            return search_response

        except Exception as e:
            logger.exception("Syntax search failed")
            error_result = SearchResponse(
                success=False,
                query=request.query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )
            self.search_service._metrics.record_search(
                time.time() - start_time, cache_hit=False
            )
            return error_result

    def _build_ripgrep_command(self, request: SyntaxSearchRequest) -> List[str]:
        """Build ripgrep command from request."""
        command = ["rg", "-n", "--color", "never", "--no-heading"]

        if not request.case_sensitive:
            command.append("-i")

        if request.whole_word:
            command.append("-w")

        if request.context_lines > 0:
            command.extend(["-C", str(request.context_lines)])

        if request.max_results:
            command.extend(["-m", str(request.max_results)])

        # Add file type filters
        if request.file_types:
            for file_type in request.file_types:
                command.extend(["-t", file_type])

        # Add pattern first
        command.append(request.query)

        # Add directory filters
        if request.directories:
            command.extend(request.directories)
        else:
            command.append(".")

        return command

    async def _run_ripgrep(self, command: List[str]) -> Dict[str, Any]:
        """Run ripgrep command."""
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                cwd=self.search_service.project_root,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            return {
                "success": process.returncode == 0,
                "stdout": stdout.decode("utf-8"),
                "stderr": stderr.decode("utf-8"),
                "returncode": process.returncode,
            }

        except Exception as e:
            return {"success": False, "stdout": "", "stderr": str(e), "returncode": -1}

    def _parse_ripgrep_results(
        self, result: Dict[str, Any], request: SyntaxSearchRequest
    ) -> List[SearchResult]:
        """Parse ripgrep output into SearchResult objects."""
        if not result["success"] or not result["stdout"]:
            return []

        results = []
        lines = result["stdout"].strip().split("\n")

        for line in lines:
            if not line.strip():
                continue

            # Parse ripgrep format: file:line:content
            parts = line.split(":", 2)
            if len(parts) < 3:
                continue

            file_path = parts[0]
            line_number = int(parts[1])
            content = parts[2]

            results.append(
                SearchResult(
                    file_path=file_path,
                    line_number=line_number,
                    content=content.strip(),
                    score=1.0,  # Ripgrep doesn't provide scores
                    match_type="syntax",
                    context=content,
                    snippet=self._extract_snippet(content),
                )
            )

        return results

    def _extract_snippet(self, text: str, max_length: int = 200) -> str:
        """Extract a meaningful snippet from text."""
        if len(text) <= max_length:
            return text

        words = text.split()
        snippet_words = []
        current_length = 0

        for word in words:
            if current_length + len(word) + 1 > max_length:
                break
            snippet_words.append(word)
            current_length += len(word) + 1

        snippet = " ".join(snippet_words)
        if len(snippet) < len(text):
            snippet += "..."

        return snippet
