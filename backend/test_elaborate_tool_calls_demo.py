#!/usr/bin/env python3
"""
Elaborate NLWeb Tool Calls Demo

This script demonstrates advanced tool calling patterns with Ollama integration,
showcasing 2025 best practices for complex multi-tool workflows, streaming responses,
and sophisticated parameter handling.
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Any, Dict, List

# Add the backend app to the path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.services.nlweb.models import (
    NLWebConfiguration,
    NLWebContext,
    NLWebSuggestionRequest,
    NLWebTool,
    NLWebToolParameter,
)
from app.services.nlweb.nlweb_service import NLWebService
from app.services.nlweb.nlweb_tool_registry import NLWebToolRegistry


class ElaborateToolCallsDemo:
    """Demo class for elaborate tool calling patterns."""
    
    def __init__(self):
        self.registry = NLWebToolRegistry()
        self.service = None
        
    async def setup(self):
        """Set up the demo environment."""
        print("🦊> Setting up Elaborate Tool Calls Demo")
        print("=" * 60)
        
        # Create configuration
        config = NLWebConfiguration(
            enabled=True,
            base_url="http://localhost:3001",
            suggest_timeout_s=3.0,
            cache_ttl_s=20.0
        )
        
        # Create service
        self.service = NLWebService(config)
        await self.service.initialize()
        
        # Register elaborate tools
        await self._register_elaborate_tools()
        
        print("✅ Demo setup completed!")
        print()
    
    async def _register_elaborate_tools(self):
        """Register elaborate tools for demonstration."""
        print("🦦> Registering elaborate tools...")
        
        # File Operations Tool
        file_ops_tool = NLWebTool(
            name="file_operations",
            description="Perform comprehensive file operations including listing, searching, and analysis",
            category="file_management",
            tags=["files", "analysis", "search", "operations"],
            path="/api/tools/file-operations",
            method="POST",
            parameters=[
                NLWebToolParameter(
                    name="operation",
                    type="string",
                    description="Type of file operation to perform",
                    required=True,
                    constraints={"enum": ["list", "search", "analyze", "compare"]}
                ),
                NLWebToolParameter(
                    name="path",
                    type="string",
                    description="Directory or file path to operate on",
                    required=True
                ),
                NLWebToolParameter(
                    name="pattern",
                    type="string",
                    description="File pattern or search query (optional)",
                    required=False
                ),
                NLWebToolParameter(
                    name="options",
                    type="object",
                    description="Additional options for the file operation",
                    required=False,
                    default={
                        "recursive": False,
                        "include_hidden": False,
                        "sort_by": "name",
                        "max_results": 100
                    }
                )
            ],
            examples=[
                "analyze all Python files in the project",
                "search for TODO comments recursively",
                "compare file sizes between directories",
                "list files modified in the last week"
            ],
            priority=90
        )
        
        # Code Analysis Tool
        code_analysis_tool = NLWebTool(
            name="code_analysis",
            description="Analyze code files for patterns, complexity, and quality metrics",
            category="code_analysis",
            tags=["code", "quality", "metrics", "security"],
            path="/api/tools/code-analysis",
            method="POST",
            parameters=[
                NLWebToolParameter(
                    name="file_path",
                    type="string",
                    description="Path to the code file to analyze",
                    required=True
                ),
                NLWebToolParameter(
                    name="analysis_type",
                    type="array",
                    description="Types of analysis to perform",
                    required=True,
                    constraints={"items": {"enum": ["complexity", "patterns", "quality", "security", "performance"]}}
                ),
                NLWebToolParameter(
                    name="language",
                    type="string",
                    description="Programming language (auto-detect if not specified)",
                    required=False,
                    default="auto",
                    constraints={"enum": ["python", "javascript", "typescript", "java", "cpp", "auto"]}
                ),
                NLWebToolParameter(
                    name="output_format",
                    type="string",
                    description="Format of the analysis output",
                    required=False,
                    default="summary",
                    constraints={"enum": ["summary", "detailed", "json"]}
                )
            ],
            examples=[
                "analyze code complexity and quality",
                "find security vulnerabilities",
                "measure performance bottlenecks",
                "detect code patterns and anti-patterns"
            ],
            priority=85
        )
        
        # Web Search Tool
        web_search_tool = NLWebTool(
            name="web_search",
            description="Search the web for information with advanced filtering and ranking",
            category="research",
            tags=["web", "search", "information", "research"],
            path="/api/tools/web-search",
            method="POST",
            parameters=[
                NLWebToolParameter(
                    name="query",
                    type="string",
                    description="Search query",
                    required=True
                ),
                NLWebToolParameter(
                    name="search_type",
                    type="string",
                    description="Type of search to perform",
                    required=False,
                    default="general",
                    constraints={"enum": ["general", "academic", "news", "images", "videos"]}
                ),
                NLWebToolParameter(
                    name="filters",
                    type="object",
                    description="Search filters and constraints",
                    required=False,
                    default={
                        "date_range": "all",
                        "language": "en",
                        "exclude_sites": []
                    }
                ),
                NLWebToolParameter(
                    name="max_results",
                    type="integer",
                    description="Maximum number of results to return",
                    required=False,
                    default=10,
                    constraints={"minimum": 1, "maximum": 50}
                )
            ],
            examples=[
                "search for latest Python best practices",
                "find security vulnerabilities in web apps",
                "research machine learning algorithms",
                "look up API documentation"
            ],
            priority=80
        )
        
        # Data Processing Tool
        data_processing_tool = NLWebTool(
            name="data_processing",
            description="Process and analyze data with various statistical and ML operations",
            category="data_analysis",
            tags=["data", "analysis", "statistics", "ml"],
            path="/api/tools/data-processing",
            method="POST",
            parameters=[
                NLWebToolParameter(
                    name="data_source",
                    type="string",
                    description="Path to data file or data source identifier",
                    required=True
                ),
                NLWebToolParameter(
                    name="operations",
                    type="array",
                    description="List of data processing operations to perform",
                    required=True
                ),
                NLWebToolParameter(
                    name="output_format",
                    type="string",
                    description="Format of the processed data output",
                    required=False,
                    default="table",
                    constraints={"enum": ["table", "json", "csv", "chart"]}
                )
            ],
            examples=[
                "analyze security scan results",
                "process code quality metrics",
                "create data visualizations",
                "perform statistical analysis"
            ],
            priority=75
        )
        
        # Register all tools
        self.registry.register_tool(file_ops_tool)
        self.registry.register_tool(code_analysis_tool)
        self.registry.register_tool(web_search_tool)
        self.registry.register_tool(data_processing_tool)
        
        print(f"  ✅ Registered {len(self.registry.get_all_tools())} elaborate tools")
        print(f"  📁 Categories: {', '.join(self.registry.get_categories())}")
        print(f"  🏷️  Tags: {', '.join(sorted(self.registry.get_tags()))}")
    
    async def demo_complex_query_analysis(self):
        """Demonstrate complex query analysis and tool suggestion."""
        print("🦦> Demo: Complex Query Analysis")
        print("-" * 40)
        
        complex_queries = [
            "analyze my Python project for code quality and security issues, then research the latest best practices and create a comprehensive report",
            "help me improve the performance of my web application by analyzing the code, searching for optimization techniques, and processing performance metrics",
            "I need to audit my codebase for security vulnerabilities, research current threat patterns, and generate a security dashboard with recommendations"
        ]
        
        for i, query in enumerate(complex_queries, 1):
            print(f"\n📝 Query {i}: {query}")
            
            # Create suggestion request
            request = NLWebSuggestionRequest(
                query=query,
                context=NLWebContext(
                    current_path="/home/user/project",
                    project_type="python_web_application",
                    user_preferences={
                        "analysis_depth": "comprehensive",
                        "include_security": True,
                        "output_format": "detailed"
                    }
                ),
                max_suggestions=3,
                min_score=80.0,
                include_reasoning=True
            )
            
            # Get suggestions (mocked for demo)
            suggestions = await self._mock_suggest_tools(request)
            
            print(f"  🎯 Found {len(suggestions)} tool suggestions:")
            for j, suggestion in enumerate(suggestions, 1):
                tool = suggestion['tool']
                tool_name = tool.name if hasattr(tool, 'name') else tool['name']
                print(f"    {j}. {tool_name} (Score: {suggestion['score']:.1f})")
                print(f"       📋 {suggestion['reasoning']}")
                print(f"       ⚙️  Parameters: {json.dumps(suggestion['parameters'], indent=8)}")
    
    async def demo_multi_tool_workflow(self):
        """Demonstrate multi-tool workflow execution."""
        print("\n🦦> Demo: Multi-Tool Workflow Execution")
        print("-" * 40)
        
        workflow_steps = [
            {
                "step": 1,
                "tool": "web_search",
                "description": "Research latest security best practices",
                "parameters": {
                    "query": "Python web application security best practices 2025",
                    "search_type": "academic",
                    "filters": {"date_range": "year", "language": "en"},
                    "max_results": 15
                }
            },
            {
                "step": 2,
                "tool": "file_operations",
                "description": "Analyze project structure and identify security-sensitive files",
                "parameters": {
                    "operation": "analyze",
                    "path": "/home/user/project",
                    "options": {
                        "recursive": True,
                        "include_hidden": False,
                        "sort_by": "modified",
                        "max_results": 50
                    }
                }
            },
            {
                "step": 3,
                "tool": "code_analysis",
                "description": "Perform detailed security analysis on identified files",
                "parameters": {
                    "file_path": "/home/user/project/src/auth.py",
                    "analysis_type": ["security", "quality"],
                    "language": "python",
                    "output_format": "detailed"
                }
            },
            {
                "step": 4,
                "tool": "data_processing",
                "description": "Process analysis results and create security dashboard",
                "parameters": {
                    "data_source": "security_analysis_results",
                    "operations": [
                        {
                            "type": "analyze",
                            "parameters": {
                                "analysis_type": "security_metrics",
                                "thresholds": {"critical": 0, "high": 5, "medium": 10}
                            }
                        },
                        {
                            "type": "visualize",
                            "parameters": {
                                "chart_type": "security_dashboard",
                                "include_trends": True
                            }
                        }
                    ],
                    "output_format": "chart"
                }
            }
        ]
        
        print("🔄 Executing multi-tool workflow:")
        for step in workflow_steps:
            print(f"\n  Step {step['step']}: {step['tool']}")
            print(f"    📋 {step['description']}")
            print(f"    ⚙️  Parameters: {json.dumps(step['parameters'], indent=6)}")
            
            # Simulate tool execution
            await asyncio.sleep(0.5)  # Simulate processing time
            print(f"    ✅ Completed successfully")
        
        print(f"\n🎉 Workflow completed with {len(workflow_steps)} steps!")
    
    async def demo_streaming_tool_execution(self):
        """Demonstrate streaming tool execution with real-time updates."""
        print("\n🦦> Demo: Streaming Tool Execution")
        print("-" * 40)
        
        print("🔄 Starting streaming tool execution...")
        
        # Simulate streaming response
        async def simulate_streaming_execution():
            steps = [
                ("Initializing analysis...", 0.1),
                ("Searching for best practices...", 0.3),
                ("Analyzing project structure...", 0.5),
                ("Performing code analysis...", 0.7),
                ("Processing results...", 0.9),
                ("Generating final report...", 1.0)
            ]
            
            for message, progress in steps:
                print(f"  📊 {message} ({progress*100:.0f}%)")
                await asyncio.sleep(0.3)  # Simulate processing time
        
        await simulate_streaming_execution()
        print("  ✅ Streaming execution completed!")
    
    async def demo_error_handling_and_recovery(self):
        """Demonstrate error handling and recovery in tool calls."""
        print("\n🦦> Demo: Error Handling and Recovery")
        print("-" * 40)
        
        error_scenarios = [
            {
                "scenario": "Invalid file path",
                "error": "Path '/nonexistent/path' does not exist",
                "recovery": "Fallback to current directory",
                "success": True
            },
            {
                "scenario": "Network timeout",
                "error": "Web search request timed out",
                "recovery": "Retry with reduced scope",
                "success": True
            },
            {
                "scenario": "Tool execution failure",
                "error": "Code analysis tool crashed",
                "recovery": "Use alternative analysis method",
                "success": True
            }
        ]
        
        for scenario in error_scenarios:
            print(f"\n  🚨 Scenario: {scenario['scenario']}")
            print(f"    ❌ Error: {scenario['error']}")
            print(f"    🔄 Recovery: {scenario['recovery']}")
            print(f"    ✅ Success: {scenario['success']}")
            await asyncio.sleep(0.2)
        
        print("\n  🎯 All error scenarios handled gracefully!")
    
    async def demo_tool_parameter_validation(self):
        """Demonstrate sophisticated tool parameter validation."""
        print("\n🦦> Demo: Tool Parameter Validation")
        print("-" * 40)
        
        validation_tests = [
            {
                "tool": "file_operations",
                "parameters": {
                    "operation": "analyze",
                    "path": "/valid/path",
                    "options": {
                        "recursive": True,
                        "max_results": 50
                    }
                },
                "valid": True
            },
            {
                "tool": "code_analysis",
                "parameters": {
                    "file_path": "/valid/file.py",
                    "analysis_type": ["security", "quality"],
                    "language": "python"
                },
                "valid": True
            },
            {
                "tool": "web_search",
                "parameters": {
                    "query": "test query",
                    "max_results": 100  # Invalid: exceeds maximum
                },
                "valid": False
            }
        ]
        
        for test in validation_tests:
            print(f"\n  🔍 Testing {test['tool']}:")
            print(f"    📋 Parameters: {json.dumps(test['parameters'], indent=6)}")
            
            # Simulate validation
            if test['valid']:
                print(f"    ✅ Validation passed")
            else:
                print(f"    ❌ Validation failed - parameter constraints violated")
                print(f"    🔧 Suggested fix: Adjust parameter values to meet constraints")
    
    async def _mock_suggest_tools(self, request: NLWebSuggestionRequest) -> List[Dict[str, Any]]:
        """Mock tool suggestions for demo purposes."""
        # This would normally call the actual service
        # For demo, we'll return mock suggestions based on the query
        
        suggestions = []
        
        if "security" in request.query.lower():
            suggestions.append({
                "tool": self.registry.get_tool("web_search"),
                "score": 92.0,
                "parameters": {
                    "query": "security best practices 2025",
                    "search_type": "academic",
                    "max_results": 15
                },
                "reasoning": "Query mentions security - suggesting web search for latest practices"
            })
            
            suggestions.append({
                "tool": self.registry.get_tool("code_analysis"),
                "score": 88.0,
                "parameters": {
                    "file_path": "/home/user/project/src/main.py",
                    "analysis_type": ["security", "quality"],
                    "output_format": "detailed"
                },
                "reasoning": "Security analysis requires code examination"
            })
        
        if "analyze" in request.query.lower():
            suggestions.append({
                "tool": self.registry.get_tool("file_operations"),
                "score": 85.0,
                "parameters": {
                    "operation": "analyze",
                    "path": request.context.current_path or "/home/user/project",
                    "options": {"recursive": True, "max_results": 50}
                },
                "reasoning": "Analysis request suggests file operations tool"
            })
        
        return suggestions[:request.max_suggestions or 3]
    
    async def run_demo(self):
        """Run the complete elaborate tool calls demo."""
        print("🦊> Elaborate NLWeb Tool Calls Demo")
        print("=" * 60)
        print("Demonstrating 2025 best practices for advanced tool calling")
        print("with Ollama integration, streaming responses, and complex workflows.")
        print()
        
        try:
            await self.setup()
            await self.demo_complex_query_analysis()
            await self.demo_multi_tool_workflow()
            await self.demo_streaming_tool_execution()
            await self.demo_error_handling_and_recovery()
            await self.demo_tool_parameter_validation()
            
            print("\n🎉 Elaborate Tool Calls Demo Completed Successfully!")
            print("=" * 60)
            print("Key Features Demonstrated:")
            print("  ✅ Complex multi-tool workflows")
            print("  ✅ Sophisticated parameter handling")
            print("  ✅ Streaming execution with real-time updates")
            print("  ✅ Error handling and graceful recovery")
            print("  ✅ Advanced tool parameter validation")
            print("  ✅ Context-aware tool suggestions")
            print()
            print("💡 This demonstrates the power of NLWeb + Ollama integration")
            print("   for building sophisticated AI-powered applications!")
            
        except Exception as e:
            print(f"❌ Demo failed with error: {e}")
            import traceback
            traceback.print_exc()


async def main():
    """Run the elaborate tool calls demo."""
    demo = ElaborateToolCallsDemo()
    await demo.run_demo()


if __name__ == "__main__":
    asyncio.run(main())
