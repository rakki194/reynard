"""
Enhanced Search Tools Implementation
==================================

MCP tool implementations for enhanced semantic search capabilities.
"""

import logging
from typing import Any, Dict, List, Optional

from tools.search.enhanced_search_definitions import (
    get_enhanced_search_tool_definitions,
)
from tools.search.enhanced_semantic_search import EnhancedSemanticSearchEngine

logger = logging.getLogger(__name__)


class EnhancedSearchTools:
    """Enhanced search tools for natural language semantic search."""

    def __init__(self, project_root=None):
        """Initialize the enhanced search tools."""
        self.search_engine = EnhancedSemanticSearchEngine(project_root)

    async def natural_language_search(
        self,
        query: str,
        max_results: int = 20,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        enable_expansion: bool = True,
        confidence_threshold: float = 0.6,
    ) -> Dict[str, Any]:
        """Perform natural language search with intelligent query processing."""
        try:
            result = await self.search_engine.natural_language_search(
                query=query,
                max_results=max_results,
                file_types=file_types,
                directories=directories,
                enable_expansion=enable_expansion,
                confidence_threshold=confidence_threshold,
            )
            
            # Format the result for MCP response
            if result.get("success"):
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"🔍 **Natural Language Search Results**\n\n"
                                   f"**Query:** {query}\n"
                                   f"**Total Results:** {result['total_results']}\n"
                                   f"**Search Time:** {result.get('search_time', 0):.3f}s\n"
                                   f"**Strategies:** {', '.join(result.get('search_strategies', []))}\n\n"
                                   f"**Results:**\n" + self._format_search_results(result['results'])
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ **Natural Language Search Failed**\n\n"
                                   f"**Query:** {query}\n"
                                   f"**Error:** {result.get('error', 'Unknown error')}"
                        }
                    ]
                }
                
        except Exception as e:
            logger.exception("Natural language search tool failed")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ **Natural Language Search Error**\n\n"
                               f"**Query:** {query}\n"
                               f"**Error:** {str(e)}"
                    }
                ]
            }

    async def intelligent_search(
        self,
        query: str,
        max_results: int = 20,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        search_modes: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Perform intelligent search that automatically chooses the best approach."""
        try:
            result = await self.search_engine.intelligent_search(
                query=query,
                max_results=max_results,
                file_types=file_types,
                directories=directories,
                search_modes=search_modes,
            )
            
            # Format the result for MCP response
            if result.get("success"):
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"🧠 **Intelligent Search Results**\n\n"
                                   f"**Query:** {query}\n"
                                   f"**Total Results:** {result['total_results']}\n"
                                   f"**Search Time:** {result.get('search_time', 0):.3f}s\n"
                                   f"**Strategies:** {', '.join(result.get('search_strategies', []))}\n\n"
                                   f"**Results:**\n" + self._format_search_results(result['results'])
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ **Intelligent Search Failed**\n\n"
                                   f"**Query:** {query}\n"
                                   f"**Error:** {result.get('error', 'Unknown error')}"
                        }
                    ]
                }
                
        except Exception as e:
            logger.exception("Intelligent search tool failed")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ **Intelligent Search Error**\n\n"
                               f"**Query:** {query}\n"
                               f"**Error:** {str(e)}"
                    }
                ]
            }

    async def contextual_search(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        max_results: int = 20,
    ) -> Dict[str, Any]:
        """Perform contextual search with additional context information."""
        try:
            result = await self.search_engine.contextual_search(
                query=query,
                context=context,
                max_results=max_results,
            )
            
            # Format the result for MCP response
            if result.get("success"):
                context_info = ""
                if context:
                    context_info = f"**Context:** {context}\n"
                
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"🎯 **Contextual Search Results**\n\n"
                                   f"**Query:** {query}\n"
                                   f"{context_info}"
                                   f"**Total Results:** {result['total_results']}\n"
                                   f"**Search Time:** {result.get('search_time', 0):.3f}s\n"
                                   f"**Strategies:** {', '.join(result.get('search_strategies', []))}\n\n"
                                   f"**Results:**\n" + self._format_search_results(result['results'])
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ **Contextual Search Failed**\n\n"
                                   f"**Query:** {query}\n"
                                   f"**Error:** {result.get('error', 'Unknown error')}"
                        }
                    ]
                }
                
        except Exception as e:
            logger.exception("Contextual search tool failed")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ **Contextual Search Error**\n\n"
                               f"**Query:** {query}\n"
                               f"**Error:** {str(e)}"
                    }
                ]
            }

    async def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analyze a query to understand its intent and structure."""
        try:
            result = await self.search_engine.analyze_query(query)
            
            # Format the result for MCP response
            if result.get("success"):
                analysis = result["analysis"]
                
                # Format entities
                entities_text = ""
                if analysis.get("entities"):
                    entities_text = "\n**Entities:**\n"
                    for entity in analysis["entities"]:
                        entities_text += f"- {entity['type']}: {entity['value']} (confidence: {entity['confidence']})\n"
                
                # Format expanded terms
                expanded_text = ""
                if analysis.get("expanded_terms"):
                    expanded_text = f"\n**Expanded Terms:** {', '.join(analysis['expanded_terms'])}\n"
                
                # Format code patterns
                patterns_text = ""
                if analysis.get("code_patterns"):
                    patterns_text = f"\n**Code Patterns:** {', '.join(analysis['code_patterns'])}\n"
                
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"🔍 **Query Analysis**\n\n"
                                   f"**Original Query:** {analysis['original_query']}\n"
                                   f"**Normalized Query:** {analysis['normalized_query']}\n"
                                   f"**Intent:** {analysis['intent']}\n"
                                   f"**Search Strategy:** {analysis['search_strategy']}\n"
                                   f"**Confidence:** {analysis['confidence']:.2f}\n"
                                   f"{entities_text}"
                                   f"{expanded_text}"
                                   f"{patterns_text}"
                                   f"\n**File Filters:**\n"
                                   f"- File Types: {analysis['file_filters']['file_types'] or 'All'}\n"
                                   f"- Directories: {analysis['file_filters']['directories'] or 'All'}"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ **Query Analysis Failed**\n\n"
                                   f"**Query:** {query}\n"
                                   f"**Error:** {result.get('error', 'Unknown error')}"
                        }
                    ]
                }
                
        except Exception as e:
            logger.exception("Query analysis tool failed")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ **Query Analysis Error**\n\n"
                               f"**Query:** {query}\n"
                               f"**Error:** {str(e)}"
                    }
                ]
            }

    async def get_intelligent_suggestions(
        self, query: str, max_suggestions: int = 5
    ) -> Dict[str, Any]:
        """Get intelligent query suggestions based on natural language processing."""
        try:
            result = await self.search_engine.get_intelligent_suggestions(
                query=query,
                max_suggestions=max_suggestions,
            )
            
            # Format the result for MCP response
            if result.get("success"):
                suggestions_text = ""
                for i, suggestion in enumerate(result.get("suggestions", []), 1):
                    suggestions_text += f"{i}. **{suggestion['suggestion']}**\n"
                    suggestions_text += f"   - Type: {suggestion.get('type', 'unknown')}\n"
                    suggestions_text += f"   - Confidence: {suggestion.get('confidence', 0):.2f}\n"
                    suggestions_text += f"   - Source: {suggestion.get('source', 'unknown')}\n\n"
                
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"💡 **Intelligent Query Suggestions**\n\n"
                                   f"**Query:** {query}\n\n"
                                   f"**Suggestions:**\n{suggestions_text}"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ **Intelligent Suggestions Failed**\n\n"
                                   f"**Query:** {query}\n"
                                   f"**Error:** {result.get('error', 'Unknown error')}"
                        }
                    ]
                }
                
        except Exception as e:
            logger.exception("Intelligent suggestions tool failed")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ **Intelligent Suggestions Error**\n\n"
                               f"**Query:** {query}\n"
                               f"**Error:** {str(e)}"
                    }
                ]
            }

    async def search_with_examples(
        self, query: str, max_results: int = 10
    ) -> Dict[str, Any]:
        """Search with example queries to demonstrate capabilities."""
        try:
            result = await self.search_engine.search_with_examples(
                query=query,
                max_results=max_results,
            )
            
            # Format the result for MCP response
            if result.get("success"):
                examples_text = ""
                for example in result.get("example_queries", []):
                    examples_text += f"- {example}\n"
                
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"📚 **Search with Examples**\n\n"
                                   f"**Query:** {query}\n"
                                   f"**Query Type:** {result.get('query_type', 'unknown')}\n"
                                   f"**Total Results:** {result['total_results']}\n"
                                   f"**Search Time:** {result.get('search_time', 0):.3f}s\n\n"
                                   f"**Example Natural Language Queries:**\n{examples_text}\n"
                                   f"**Results:**\n" + self._format_search_results(result['results'])
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ **Search with Examples Failed**\n\n"
                                   f"**Query:** {query}\n"
                                   f"**Error:** {result.get('error', 'Unknown error')}"
                        }
                    ]
                }
                
        except Exception as e:
            logger.exception("Search with examples tool failed")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ **Search with Examples Error**\n\n"
                               f"**Query:** {query}\n"
                               f"**Error:** {str(e)}"
                    }
                ]
            }

    async def enhanced_search_health_check(self) -> Dict[str, Any]:
        """Check the health of the enhanced semantic search service."""
        try:
            result = await self.search_engine.health_check()
            
            # Format the result for MCP response
            if result.get("success"):
                nlp_info = result.get("nlp_processor", {})
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"🏥 **Enhanced Search Health Check**\n\n"
                                   f"**Status:** {result.get('status', 'unknown')}\n"
                                   f"**Service:** {result.get('service', 'unknown')}\n"
                                   f"**Timestamp:** {result.get('timestamp', 'unknown')}\n\n"
                                   f"**NLP Processor:**\n"
                                   f"- Enabled: {nlp_info.get('enabled', False)}\n"
                                   f"- Query Expansion: {nlp_info.get('query_expansion', False)}\n"
                                   f"- Intent Detection: {nlp_info.get('intent_detection', False)}\n"
                                   f"- Test Query Processed: {nlp_info.get('test_query_processed', False)}"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ **Enhanced Search Health Check Failed**\n\n"
                                   f"**Status:** {result.get('status', 'unknown')}\n"
                                   f"**Error:** {result.get('error', 'Unknown error')}"
                        }
                    ]
                }
                
        except Exception as e:
            logger.exception("Enhanced search health check tool failed")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ **Enhanced Search Health Check Error**\n\n"
                               f"**Error:** {str(e)}"
                    }
                ]
            }

    def _format_search_results(self, results: List[Dict[str, Any]]) -> str:
        """Format search results for display."""
        if not results:
            return "No results found."
        
        formatted_results = ""
        for i, result in enumerate(results, 1):
            formatted_results += f"{i}. **{result.get('file_path', 'Unknown file')}**\n"
            formatted_results += f"   - Line: {result.get('line_number', 0)}\n"
            formatted_results += f"   - Score: {result.get('score', 0):.3f}\n"
            formatted_results += f"   - Type: {result.get('match_type', 'unknown')}\n"
            
            # Add snippet if available
            snippet = result.get('snippet', '')
            if snippet:
                formatted_results += f"   - Snippet: {snippet[:100]}{'...' if len(snippet) > 100 else ''}\n"
            
            formatted_results += "\n"
        
        return formatted_results


