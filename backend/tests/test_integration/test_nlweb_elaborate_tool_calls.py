"""Elaborate NLWeb API tool calls with Ollama integration tests.

This module demonstrates advanced tool calling patterns using 2025 best practices
for NLWeb and Ollama integration, including complex multi-tool workflows,
streaming responses, and sophisticated tool parameter handling.
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Add the backend app to the path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "app"))

# Mock gatekeeper before importing the app
sys.modules["gatekeeper"] = __import__("tests.mocks.gatekeeper", fromlist=[""])
sys.modules["gatekeeper.api"] = sys.modules["gatekeeper"]
sys.modules["gatekeeper.api.routes"] = sys.modules["gatekeeper"]
sys.modules["gatekeeper.api.dependencies"] = sys.modules["gatekeeper"]
sys.modules["gatekeeper.models"] = sys.modules["gatekeeper"]
sys.modules["gatekeeper.models.user"] = sys.modules["gatekeeper"]

from main import create_app


class TestElaborateNLWebToolCalls:
    """Test elaborate NLWeb tool calling patterns with Ollama."""

    @pytest.fixture(scope="class")
    def app(self):
        """Create the FastAPI app for testing."""
        return create_app()

    @pytest.fixture(scope="class")
    def client(self, app):
        """Create test client."""
        return TestClient(app)

    @pytest_asyncio.fixture(scope="class")
    async def async_client(self, app):
        """Create async test client."""
        from httpx import ASGITransport

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

    @pytest.fixture
    def mock_auth_token(self):
        """Mock authentication token."""
        return "mock_bearer_token"

    @pytest.fixture
    def auth_headers(self, mock_auth_token):
        """Authentication headers."""
        return {"Authorization": f"Bearer {mock_auth_token}"}

    @pytest.fixture
    def elaborate_tools(self):
        """Define elaborate tool schemas for testing."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "file_operations",
                    "description": "Perform comprehensive file operations including listing, searching, and analysis",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "operation": {
                                "type": "string",
                                "enum": ["list", "search", "analyze", "compare"],
                                "description": "Type of file operation to perform",
                            },
                            "path": {
                                "type": "string",
                                "description": "Directory or file path to operate on",
                            },
                            "pattern": {
                                "type": "string",
                                "description": "File pattern or search query (optional)",
                            },
                            "options": {
                                "type": "object",
                                "properties": {
                                    "recursive": {"type": "boolean", "default": False},
                                    "include_hidden": {
                                        "type": "boolean",
                                        "default": False,
                                    },
                                    "sort_by": {
                                        "type": "string",
                                        "enum": ["name", "size", "modified"],
                                        "default": "name",
                                    },
                                    "max_results": {
                                        "type": "integer",
                                        "minimum": 1,
                                        "maximum": 1000,
                                        "default": 100,
                                    },
                                },
                                "description": "Additional options for the file operation",
                            },
                        },
                        "required": ["operation", "path"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "code_analysis",
                    "description": "Analyze code files for patterns, complexity, and quality metrics",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to the code file to analyze",
                            },
                            "analysis_type": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "enum": [
                                        "complexity",
                                        "patterns",
                                        "quality",
                                        "security",
                                        "performance",
                                    ],
                                },
                                "description": "Types of analysis to perform",
                            },
                            "language": {
                                "type": "string",
                                "enum": [
                                    "python",
                                    "javascript",
                                    "typescript",
                                    "java",
                                    "cpp",
                                    "auto",
                                ],
                                "default": "auto",
                                "description": "Programming language (auto-detect if not specified)",
                            },
                            "output_format": {
                                "type": "string",
                                "enum": ["summary", "detailed", "json"],
                                "default": "summary",
                                "description": "Format of the analysis output",
                            },
                        },
                        "required": ["file_path", "analysis_type"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "Search the web for information with advanced filtering and ranking",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query"},
                            "search_type": {
                                "type": "string",
                                "enum": [
                                    "general",
                                    "academic",
                                    "news",
                                    "images",
                                    "videos",
                                ],
                                "default": "general",
                                "description": "Type of search to perform",
                            },
                            "filters": {
                                "type": "object",
                                "properties": {
                                    "date_range": {
                                        "type": "string",
                                        "enum": ["day", "week", "month", "year", "all"],
                                        "default": "all",
                                    },
                                    "language": {"type": "string", "default": "en"},
                                    "site": {
                                        "type": "string",
                                        "description": "Specific site to search within",
                                    },
                                    "exclude_sites": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "description": "Sites to exclude from results",
                                    },
                                },
                                "description": "Search filters and constraints",
                            },
                            "max_results": {
                                "type": "integer",
                                "minimum": 1,
                                "maximum": 50,
                                "default": 10,
                                "description": "Maximum number of results to return",
                            },
                        },
                        "required": ["query"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "data_processing",
                    "description": "Process and analyze data with various statistical and ML operations",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "data_source": {
                                "type": "string",
                                "description": "Path to data file or data source identifier",
                            },
                            "operations": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "filter",
                                                "aggregate",
                                                "transform",
                                                "analyze",
                                                "visualize",
                                            ],
                                        },
                                        "parameters": {
                                            "type": "object",
                                            "description": "Operation-specific parameters",
                                        },
                                    },
                                    "required": ["type"],
                                },
                                "description": "List of data processing operations to perform",
                            },
                            "output_format": {
                                "type": "string",
                                "enum": ["table", "json", "csv", "chart"],
                                "default": "table",
                                "description": "Format of the processed data output",
                            },
                        },
                        "required": ["data_source", "operations"],
                    },
                },
            },
        ]

    def test_elaborate_tool_suggestion_workflow(
        self,
        client,
        auth_headers,
        elaborate_tools,
    ):
        """Test NLWeb suggesting elaborate tools for complex queries."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock the service with elaborate tool suggestions
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True

            # Mock complex tool suggestion response
            mock_suggestions = [
                {
                    "tool": {
                        "name": "file_operations",
                        "description": "Perform comprehensive file operations including listing, searching, and analysis",
                        "category": "file_management",
                        "tags": ["files", "analysis", "search"],
                        "path": "/api/tools/file-operations",
                        "method": "POST",
                        "parameters": elaborate_tools[0]["function"]["parameters"],
                        "examples": [
                            "analyze all Python files in the project",
                            "search for TODO comments recursively",
                            "compare file sizes between directories",
                        ],
                    },
                    "score": 95.0,
                    "parameters": {
                        "operation": "analyze",
                        "path": "/home/user/project",
                        "options": {
                            "recursive": True,
                            "include_hidden": False,
                            "sort_by": "modified",
                            "max_results": 50,
                        },
                    },
                    "reasoning": "User wants to analyze project files, suggesting file_operations tool with analyze operation and recursive search",
                    "parameter_hints": {
                        "operation": "Use 'analyze' to examine file contents and patterns",
                        "path": "Project root directory for comprehensive analysis",
                        "options": "Enable recursive search to include subdirectories",
                    },
                },
                {
                    "tool": {
                        "name": "code_analysis",
                        "description": "Analyze code files for patterns, complexity, and quality metrics",
                        "category": "code_analysis",
                        "tags": ["code", "quality", "metrics"],
                        "path": "/api/tools/code-analysis",
                        "method": "POST",
                        "parameters": elaborate_tools[1]["function"]["parameters"],
                        "examples": [
                            "analyze code complexity and quality",
                            "find security vulnerabilities",
                            "measure performance bottlenecks",
                        ],
                    },
                    "score": 88.0,
                    "parameters": {
                        "file_path": "/home/user/project/main.py",
                        "analysis_type": ["complexity", "quality", "security"],
                        "language": "python",
                        "output_format": "detailed",
                    },
                    "reasoning": "Secondary suggestion for detailed code analysis of specific files",
                    "parameter_hints": {
                        "analysis_type": "Include complexity, quality, and security analysis",
                        "output_format": "Use detailed format for comprehensive results",
                    },
                },
            ]

            mock_suggestion_response = {
                "suggestions": mock_suggestions,
                "query": "analyze my Python project for code quality and find any issues",
                "processing_time_ms": 250.0,
                "cache_hit": False,
                "total_tools_considered": 15,
            }

            mock_nlweb_service.suggest_tools.return_value = mock_suggestion_response
            mock_service.return_value = mock_nlweb_service

            # Make complex request
            request_data = {
                "query": "analyze my Python project for code quality and find any issues",
                "context": {
                    "current_path": "/home/user/project",
                    "project_type": "python_application",
                    "git_status": {
                        "is_repository": True,
                        "branch": "main",
                        "is_dirty": True,
                        "modified_files": ["src/main.py", "tests/test_main.py"],
                    },
                    "user_preferences": {
                        "analysis_depth": "comprehensive",
                        "include_security": True,
                        "output_format": "detailed",
                    },
                },
                "max_suggestions": 3,
                "min_score": 80.0,
                "include_reasoning": True,
            }

            response = client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert "suggestions" in data
            assert len(data["suggestions"]) == 2

            # Verify first suggestion
            first_suggestion = data["suggestions"][0]
            assert first_suggestion["tool"]["name"] == "file_operations"
            assert first_suggestion["score"] == 95.0
            assert first_suggestion["parameters"]["operation"] == "analyze"
            assert first_suggestion["parameters"]["options"]["recursive"] is True

            # Verify second suggestion
            second_suggestion = data["suggestions"][1]
            assert second_suggestion["tool"]["name"] == "code_analysis"
            assert second_suggestion["score"] == 88.0
            assert "complexity" in second_suggestion["parameters"]["analysis_type"]
            assert "quality" in second_suggestion["parameters"]["analysis_type"]
            assert "security" in second_suggestion["parameters"]["analysis_type"]

    @pytest.mark.asyncio
    async def test_elaborate_ollama_tool_calling_workflow(
        self,
        async_client,
        auth_headers,
        elaborate_tools,
    ):
        """Test elaborate Ollama tool calling with multiple tools and complex parameters."""
        with patch("app.api.ollama.endpoints.get_ollama_service") as mock_service:
            # Mock the service
            mock_ollama_service = MagicMock()
            mock_ollama_service.is_available.return_value = True

            # Mock elaborate streaming response with multiple tool calls
            async def mock_elaborate_stream():
                # Initial response
                yield {
                    "type": "token",
                    "data": "I'll help you analyze your project comprehensively. Let me start by examining the file structure and then perform detailed code analysis.",
                    "timestamp": 1234567890,
                    "metadata": {"model": "qwen3:latest"},
                }

                # First tool call - file operations
                yield {
                    "type": "tool_call",
                    "data": "",
                    "timestamp": 1234567891,
                    "metadata": {
                        "tool_name": "file_operations",
                        "tool_args": {
                            "operation": "analyze",
                            "path": "/home/user/project",
                            "options": {
                                "recursive": True,
                                "include_hidden": False,
                                "sort_by": "modified",
                                "max_results": 50,
                            },
                        },
                        "tool_call_id": "call_1",
                    },
                }

                # Response after first tool
                yield {
                    "type": "token",
                    "data": " Now let me perform detailed code analysis on the main files.",
                    "timestamp": 1234567892,
                    "metadata": {"model": "qwen3:latest"},
                }

                # Second tool call - code analysis
                yield {
                    "type": "tool_call",
                    "data": "",
                    "timestamp": 1234567893,
                    "metadata": {
                        "tool_name": "code_analysis",
                        "tool_args": {
                            "file_path": "/home/user/project/src/main.py",
                            "analysis_type": ["complexity", "quality", "security"],
                            "language": "python",
                            "output_format": "detailed",
                        },
                        "tool_call_id": "call_2",
                    },
                }

                # Final response
                yield {
                    "type": "token",
                    "data": " Based on the analysis, I found several areas for improvement in your code quality and security.",
                    "timestamp": 1234567894,
                    "metadata": {"model": "qwen3:latest"},
                }

                # Completion event
                yield {
                    "type": "complete",
                    "data": "",
                    "timestamp": 1234567895,
                    "metadata": {
                        "processing_time": 3.5,
                        "tokens_generated": 45,
                        "model": "qwen3:latest",
                        "tools_used": ["file_operations", "code_analysis"],
                        "tool_calls_made": 2,
                    },
                }

            mock_ollama_service.chat_stream.return_value = mock_elaborate_stream()
            mock_service.return_value = mock_ollama_service

            # Make elaborate request
            request_data = {
                "message": "Please analyze my Python project comprehensively. I want to understand the code quality, find any security issues, and get recommendations for improvement. Focus on the main source files and include both structural analysis and detailed code review.",
                "model": "qwen3:latest",
                "system_prompt": "You are an expert code analyst with access to comprehensive file and code analysis tools. Provide detailed, actionable insights.",
                "temperature": 0.3,
                "max_tokens": 2000,
                "tools": elaborate_tools,
                "context": {
                    "current_path": "/home/user/project",
                    "project_type": "python_application",
                    "user_experience": "intermediate",
                    "analysis_goals": ["quality", "security", "performance"],
                },
            }

            response = await async_client.post(
                "/api/ollama/chat",
                json=request_data,
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["model"] == "qwen3:latest"
            assert data["processing_time"] == 3.5
            assert data["tokens_generated"] == 45
            assert "tools_used" in data
            assert len(data["tools_used"]) == 2
            assert "file_operations" in data["tools_used"]
            assert "code_analysis" in data["tools_used"]

    def test_multi_tool_workflow_suggestion(
        self,
        client,
        auth_headers,
        elaborate_tools,
    ):
        """Test NLWeb suggesting multi-tool workflows for complex tasks."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True

            # Mock multi-tool workflow suggestion
            mock_workflow_suggestions = [
                {
                    "tool": {
                        "name": "web_search",
                        "description": "Search the web for information with advanced filtering and ranking",
                        "category": "research",
                        "tags": ["web", "search", "information"],
                        "path": "/api/tools/web-search",
                        "method": "POST",
                        "parameters": elaborate_tools[2]["function"]["parameters"],
                        "examples": [
                            "search for latest Python best practices",
                            "find security vulnerabilities in web apps",
                        ],
                    },
                    "score": 92.0,
                    "parameters": {
                        "query": "Python security best practices 2025",
                        "search_type": "academic",
                        "filters": {
                            "date_range": "year",
                            "language": "en",
                            "exclude_sites": ["stackoverflow.com"],
                        },
                        "max_results": 20,
                    },
                    "reasoning": "First step: Research current best practices and security guidelines",
                    "parameter_hints": {
                        "query": "Focus on recent security best practices",
                        "search_type": "Use academic sources for reliable information",
                    },
                },
                {
                    "tool": {
                        "name": "code_analysis",
                        "description": "Analyze code files for patterns, complexity, and quality metrics",
                        "category": "code_analysis",
                        "tags": ["code", "quality", "metrics"],
                        "path": "/api/tools/code-analysis",
                        "method": "POST",
                        "parameters": elaborate_tools[1]["function"]["parameters"],
                        "examples": [
                            "analyze code complexity and quality",
                            "find security vulnerabilities",
                        ],
                    },
                    "score": 89.0,
                    "parameters": {
                        "file_path": "/home/user/project/src/auth.py",
                        "analysis_type": ["security", "quality"],
                        "language": "python",
                        "output_format": "detailed",
                    },
                    "reasoning": "Second step: Analyze authentication code for security issues",
                    "parameter_hints": {
                        "analysis_type": "Focus on security and quality metrics",
                        "output_format": "Detailed format for comprehensive security analysis",
                    },
                },
                {
                    "tool": {
                        "name": "data_processing",
                        "description": "Process and analyze data with various statistical and ML operations",
                        "category": "data_analysis",
                        "tags": ["data", "analysis", "statistics"],
                        "path": "/api/tools/data-processing",
                        "method": "POST",
                        "parameters": elaborate_tools[3]["function"]["parameters"],
                        "examples": [
                            "analyze security scan results",
                            "process code quality metrics",
                        ],
                    },
                    "score": 85.0,
                    "parameters": {
                        "data_source": "security_analysis_results",
                        "operations": [
                            {
                                "type": "analyze",
                                "parameters": {
                                    "analysis_type": "security_metrics",
                                    "thresholds": {
                                        "critical": 0,
                                        "high": 5,
                                        "medium": 10,
                                    },
                                },
                            },
                            {
                                "type": "visualize",
                                "parameters": {
                                    "chart_type": "security_dashboard",
                                    "include_trends": True,
                                },
                            },
                        ],
                        "output_format": "chart",
                    },
                    "reasoning": "Third step: Process and visualize security analysis results",
                    "parameter_hints": {
                        "operations": "Analyze security metrics and create visualizations",
                        "output_format": "Use chart format for dashboard visualization",
                    },
                },
            ]

            mock_suggestion_response = {
                "suggestions": mock_workflow_suggestions,
                "query": "help me improve the security of my Python web application by researching best practices, analyzing my code, and creating a security dashboard",
                "processing_time_ms": 320.0,
                "cache_hit": False,
                "total_tools_considered": 20,
                "workflow_detected": True,
                "workflow_steps": 3,
            }

            mock_nlweb_service.suggest_tools.return_value = mock_suggestion_response
            mock_service.return_value = mock_nlweb_service

            # Make complex workflow request
            request_data = {
                "query": "help me improve the security of my Python web application by researching best practices, analyzing my code, and creating a security dashboard",
                "context": {
                    "current_path": "/home/user/project",
                    "project_type": "python_web_application",
                    "security_concerns": [
                        "authentication",
                        "data_validation",
                        "injection_attacks",
                    ],
                    "user_goals": ["research", "analysis", "visualization"],
                    "timeline": "comprehensive_analysis",
                },
                "max_suggestions": 5,
                "min_score": 80.0,
                "include_reasoning": True,
                "workflow_mode": True,
            }

            response = client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert "suggestions" in data
            assert len(data["suggestions"]) == 3
            assert data["workflow_detected"] is True
            assert data["workflow_steps"] == 3

            # Verify workflow progression
            suggestions = data["suggestions"]
            assert suggestions[0]["tool"]["name"] == "web_search"
            assert suggestions[1]["tool"]["name"] == "code_analysis"
            assert suggestions[2]["tool"]["name"] == "data_processing"

            # Verify reasoning shows workflow progression
            assert "First step" in suggestions[0]["reasoning"]
            assert "Second step" in suggestions[1]["reasoning"]
            assert "Third step" in suggestions[2]["reasoning"]

    @pytest.mark.asyncio
    async def test_streaming_elaborate_tool_execution(
        self,
        async_client,
        auth_headers,
        elaborate_tools,
    ):
        """Test streaming execution of elaborate tool calls with real-time updates."""
        with patch("app.api.ollama.endpoints.get_ollama_service") as mock_service:
            # Mock the service
            mock_ollama_service = MagicMock()
            mock_ollama_service.is_available.return_value = True

            # Mock streaming response with tool execution updates
            async def mock_streaming_tool_execution():
                # Initial response
                yield {
                    "type": "token",
                    "data": "I'll help you with a comprehensive data analysis workflow. Let me start by searching for the latest methodologies.",
                    "timestamp": 1234567890,
                    "metadata": {"model": "qwen3:latest", "step": 1},
                }

                # First tool call
                yield {
                    "type": "tool_call",
                    "data": "",
                    "timestamp": 1234567891,
                    "metadata": {
                        "tool_name": "web_search",
                        "tool_args": {
                            "query": "data analysis methodologies 2025",
                            "search_type": "academic",
                            "max_results": 15,
                        },
                        "tool_call_id": "call_1",
                        "step": 1,
                    },
                }

                # Tool execution update
                yield {
                    "type": "tool_execution",
                    "data": "Searching academic sources for data analysis methodologies...",
                    "timestamp": 1234567892,
                    "metadata": {
                        "tool_name": "web_search",
                        "status": "executing",
                        "progress": 0.3,
                        "step": 1,
                    },
                }

                # Tool result
                yield {
                    "type": "tool_result",
                    "data": "Found 15 relevant academic papers on modern data analysis methodologies",
                    "timestamp": 1234567893,
                    "metadata": {
                        "tool_name": "web_search",
                        "status": "completed",
                        "results_count": 15,
                        "step": 1,
                    },
                }

                # Continue with analysis
                yield {
                    "type": "token",
                    "data": " Now let me analyze your dataset using the most current methodologies.",
                    "timestamp": 1234567894,
                    "metadata": {"model": "qwen3:latest", "step": 2},
                }

                # Second tool call
                yield {
                    "type": "tool_call",
                    "data": "",
                    "timestamp": 1234567895,
                    "metadata": {
                        "tool_name": "data_processing",
                        "tool_args": {
                            "data_source": "/home/user/project/data.csv",
                            "operations": [
                                {
                                    "type": "analyze",
                                    "parameters": {
                                        "analysis_type": "statistical_summary",
                                        "include_correlations": True,
                                    },
                                },
                                {
                                    "type": "transform",
                                    "parameters": {
                                        "transform_type": "normalization",
                                        "method": "z_score",
                                    },
                                },
                            ],
                            "output_format": "json",
                        },
                        "tool_call_id": "call_2",
                        "step": 2,
                    },
                }

                # Tool execution progress
                yield {
                    "type": "tool_execution",
                    "data": "Processing dataset: 45% complete",
                    "timestamp": 1234567896,
                    "metadata": {
                        "tool_name": "data_processing",
                        "status": "executing",
                        "progress": 0.45,
                        "step": 2,
                    },
                }

                # Final completion
                yield {
                    "type": "complete",
                    "data": "",
                    "timestamp": 1234567897,
                    "metadata": {
                        "processing_time": 5.2,
                        "tokens_generated": 78,
                        "model": "qwen3:latest",
                        "tools_used": ["web_search", "data_processing"],
                        "total_steps": 2,
                        "workflow_completed": True,
                    },
                }

            mock_ollama_service.chat_stream.return_value = (
                mock_streaming_tool_execution()
            )
            mock_service.return_value = mock_ollama_service

            # Make streaming request
            request_data = {
                "message": "I need a comprehensive data analysis of my dataset. Please research the latest methodologies and then apply them to analyze my data file. I want to see the progress as you work.",
                "model": "qwen3:latest",
                "system_prompt": "You are a data science expert. Provide real-time updates on your analysis progress and use the most current methodologies.",
                "temperature": 0.2,
                "max_tokens": 3000,
                "tools": elaborate_tools,
                "context": {
                    "current_path": "/home/user/project",
                    "data_file": "data.csv",
                    "analysis_requirements": [
                        "statistical_summary",
                        "data_transformation",
                        "methodology_research",
                    ],
                    "user_preferences": {
                        "show_progress": True,
                        "use_latest_methods": True,
                        "detailed_output": True,
                    },
                },
            }

            response = await async_client.post(
                "/api/ollama/chat",
                json=request_data,
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["model"] == "qwen3:latest"
            assert data["processing_time"] == 5.2
            assert data["tokens_generated"] == 78
            assert "tools_used" in data
            assert len(data["tools_used"]) == 2
            assert "web_search" in data["tools_used"]
            assert "data_processing" in data["tools_used"]

    def test_error_handling_in_elaborate_tool_calls(
        self,
        client,
        auth_headers,
        elaborate_tools,
    ):
        """Test error handling in elaborate tool calling scenarios."""
        with patch("app.api.ollama.endpoints.get_ollama_service") as mock_service:
            # Mock the service
            mock_ollama_service = MagicMock()
            mock_ollama_service.is_available.return_value = True

            # Mock error response
            async def mock_error_stream():
                yield {
                    "type": "token",
                    "data": "I'll help you analyze your code. Let me start with the file operations.",
                    "timestamp": 1234567890,
                    "metadata": {"model": "qwen3:latest"},
                }

                # Tool call that will fail
                yield {
                    "type": "tool_call",
                    "data": "",
                    "timestamp": 1234567891,
                    "metadata": {
                        "tool_name": "file_operations",
                        "tool_args": {
                            "operation": "analyze",
                            "path": "/nonexistent/path",
                        },
                        "tool_call_id": "call_1",
                    },
                }

                # Tool execution error
                yield {
                    "type": "tool_error",
                    "data": "Error: Path '/nonexistent/path' does not exist",
                    "timestamp": 1234567892,
                    "metadata": {
                        "tool_name": "file_operations",
                        "error_type": "path_not_found",
                        "recoverable": True,
                    },
                }

                # Recovery attempt
                yield {
                    "type": "token",
                    "data": " I see the path doesn't exist. Let me try with the current directory instead.",
                    "timestamp": 1234567893,
                    "metadata": {"model": "qwen3:latest", "recovery_attempt": True},
                }

                # Successful retry
                yield {
                    "type": "tool_call",
                    "data": "",
                    "timestamp": 1234567894,
                    "metadata": {
                        "tool_name": "file_operations",
                        "tool_args": {
                            "operation": "analyze",
                            "path": "/home/user/project",
                        },
                        "tool_call_id": "call_2",
                    },
                }

                # Completion
                yield {
                    "type": "complete",
                    "data": "",
                    "timestamp": 1234567895,
                    "metadata": {
                        "processing_time": 2.1,
                        "tokens_generated": 32,
                        "model": "qwen3:latest",
                        "tools_used": ["file_operations"],
                        "errors_handled": 1,
                        "recovery_successful": True,
                    },
                }

            mock_ollama_service.chat_stream.return_value = mock_error_stream()
            mock_service.return_value = mock_ollama_service

            # Make request that will trigger error handling
            request_data = {
                "message": "Analyze the files in /nonexistent/path for code quality issues",
                "model": "qwen3:latest",
                "system_prompt": "You are a helpful code analyst. If you encounter errors, try to recover gracefully.",
                "temperature": 0.5,
                "max_tokens": 1000,
                "tools": elaborate_tools,
                "context": {
                    "current_path": "/home/user/project",
                    "error_handling": "graceful_recovery",
                },
            }

            response = client.post(
                "/api/ollama/chat",
                json=request_data,
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["model"] == "qwen3:latest"
            assert data["processing_time"] == 2.1
            assert "tools_used" in data
            assert "file_operations" in data["tools_used"]
