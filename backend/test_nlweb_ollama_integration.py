#!/usr/bin/env python3
"""
Comprehensive test suite for NLWeb API integration with Ollama models.

This test suite follows 2025 best practices for testing AI API integrations,
including proper tool calling validation, streaming response testing, and
comprehensive error handling.
"""

import asyncio
import json
import re
import time
from typing import Any, Dict, List, Optional

import aiohttp
import pytest


class NLWebOllamaTester:
    """Test suite for NLWeb API integration with Ollama models."""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    def format_response_with_thinking(self, response_text: str) -> str:
        """Format response with thinking sections in light grey."""
        # ANSI color codes
        LIGHT_GREY = '\033[90m'
        RESET = '\033[0m'
        
        # Split response into thinking and regular content
        parts = re.split(r'(<think>.*?</think>)', response_text, flags=re.DOTALL)
        
        formatted_parts = []
        for part in parts:
            if part.startswith('<think>') and part.endswith('</think>'):
                # Remove the <think> tags and colorize the content
                thinking_content = part[7:-8]  # Remove <think> and </think>
                formatted_parts.append(f"{LIGHT_GREY}{thinking_content}{RESET}")
            else:
                formatted_parts.append(part)
        
        return ''.join(formatted_parts)
    
    def analyze_tool_calls(self, response_text: str, tool_calls: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze tool calling behavior in the response."""
        # Check for tool calls in response text
        tool_call_patterns = [
            r'<tool_call>',
            r'```json\s*\{[^}]*"function"[^}]*\}',
            r'function_call',
            r'tool_use',
            r'<function_calls>'
        ]
        
        found_patterns = []
        for pattern in tool_call_patterns:
            if re.search(pattern, response_text, re.IGNORECASE):
                found_patterns.append(pattern)
        
        return {
            "has_tool_calls_in_text": len(found_patterns) > 0,
            "has_tool_calls_in_response": len(tool_calls) > 0,
            "patterns_found": found_patterns,
            "tool_calls": tool_calls,
            "tool_call_count": len(tool_calls)
        }
    
    async def test_ollama_chat_tool_calling(self) -> Dict[str, Any]:
        """Test Ollama chat endpoint with tool calling."""
        print("🦊> Testing Ollama chat endpoint with tool calling...")
        
        test_tools = [
            {
                "type": "function",
                "function": {
                    "name": "square_the_number",
                    "description": "Calculate the square of a number",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "input_num": {
                                "type": "number",
                                "description": "The number to be squared"
                            }
                        },
                        "required": ["input_num"]
                    }
                }
            }
        ]
        
        payload = {
            "message": "Square the number 7",
            "model": "qwen3:latest",
            "tools": test_tools,
            "temperature": 0.7,
            "max_tokens": 500
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/ollama/chat",
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    response_text = data.get('response', '')
                    tool_calls = data.get('tool_calls', [])
                    
                    analysis = self.analyze_tool_calls(response_text, tool_calls)
                    
                    print(f"✅ Chat endpoint response:")
                    print(f"   Success: {data.get('success', False)}")
                    print(f"   Model: {data.get('model', 'Unknown')}")
                    print(f"   Processing time: {data.get('processing_time', 0):.2f}s")
                    print(f"   Tokens generated: {data.get('tokens_generated', 0)}")
                    print(f"   Tool calls detected: {'✅ Yes' if analysis['has_tool_calls_in_response'] else '❌ No'}")
                    print(f"   Tool call count: {analysis['tool_call_count']}")
                    
                    if tool_calls:
                        print(f"   Tool calls: {tool_calls}")
                    
                    # Display formatted response
                    print("\n📝 Formatted Response:")
                    print("-" * 50)
                    formatted_response = self.format_response_with_thinking(response_text)
                    print(formatted_response)
                    print("-" * 50)
                    
                    return {
                        "success": True,
                        "tool_calls_working": analysis['has_tool_calls_in_response'],
                        "analysis": analysis,
                        "response_data": data
                    }
                else:
                    error_text = await response.text()
                    print(f"❌ Chat endpoint error: {error_text}")
                    return {"success": False, "error": error_text}
                    
        except Exception as e:
            print(f"❌ Chat endpoint exception: {e}")
            return {"success": False, "error": str(e)}
    
    async def test_ollama_assistant_tool_calling(self) -> Dict[str, Any]:
        """Test Ollama assistant endpoint with tool calling."""
        print("\n🦦> Testing Ollama assistant endpoint with tool calling...")
        
        payload = {
            "message": "Help me with a coding task - can you list files in the current directory?",
            "assistant_type": "reynard",
            "model": "qwen3:latest",
            "tools_enabled": True,
            "temperature": 0.7,
            "max_tokens": 500
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/ollama/assistant",
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    response_text = data.get('response', '')
                    tool_calls = data.get('tool_calls', [])
                    
                    analysis = self.analyze_tool_calls(response_text, tool_calls)
                    
                    print(f"✅ Assistant endpoint response:")
                    print(f"   Success: {data.get('success', False)}")
                    print(f"   Assistant type: {data.get('assistant_type', 'Unknown')}")
                    print(f"   Model: {data.get('model', 'Unknown')}")
                    print(f"   Processing time: {data.get('processing_time', 0):.2f}s")
                    print(f"   Tools used: {data.get('tools_used', [])}")
                    print(f"   Tool calls detected: {'✅ Yes' if analysis['has_tool_calls_in_response'] else '❌ No'}")
                    print(f"   Tool call count: {analysis['tool_call_count']}")
                    
                    if tool_calls:
                        print(f"   Tool calls: {tool_calls}")
                    
                    # Display formatted response
                    print("\n📝 Formatted Assistant Response:")
                    print("-" * 50)
                    formatted_response = self.format_response_with_thinking(response_text)
                    print(formatted_response)
                    print("-" * 50)
                    
                    return {
                        "success": True,
                        "tool_calls_working": analysis['has_tool_calls_in_response'],
                        "analysis": analysis,
                        "response_data": data
                    }
                else:
                    error_text = await response.text()
                    print(f"❌ Assistant endpoint error: {error_text}")
                    return {"success": False, "error": error_text}
                    
        except Exception as e:
            print(f"❌ Assistant endpoint exception: {e}")
            return {"success": False, "error": str(e)}
    
    async def test_nlweb_suggest_with_ollama(self) -> Dict[str, Any]:
        """Test NLWeb tool suggestion with Ollama context."""
        print("\n🌐> Testing NLWeb tool suggestion with Ollama context...")
        
        payload = {
            "query": "What is the weather like?",
            "context": {
                "current_path": "/home/user",
                "user_preferences": {
                    "preferred_llm": "ollama",
                    "default_model": "qwen3:latest"
                },
                "application_state": {
                    "ollama_available": True,
                    "available_models": ["qwen3:latest"]
                }
            },
            "max_suggestions": 3,
            "min_score": 70.0
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/nlweb/suggest",
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    print(f"✅ NLWeb suggestion response:")
                    print(f"   Query: {data.get('query', 'Unknown')}")
                    print(f"   Suggestions count: {len(data.get('suggestions', []))}")
                    print(f"   Processing time: {data.get('processing_time_ms', 0):.2f}ms")
                    
                    suggestions = data.get('suggestions', [])
                    for i, suggestion in enumerate(suggestions, 1):
                        tool = suggestion.get('tool', {})
                        print(f"   Suggestion {i}: {tool.get('name', 'Unknown')} (score: {suggestion.get('score', 0):.1f})")
                    
                    return {
                        "success": True,
                        "suggestions_count": len(suggestions),
                        "response_data": data
                    }
                else:
                    error_text = await response.text()
                    print(f"❌ NLWeb suggestion error: {error_text}")
                    return {"success": False, "error": error_text}
                    
        except Exception as e:
            print(f"❌ NLWeb suggestion exception: {e}")
            return {"success": False, "error": str(e)}
    
    async def test_streaming_responses(self) -> Dict[str, Any]:
        """Test streaming responses from Ollama endpoints."""
        print("\n🌊> Testing streaming responses...")
        
        payload = {
            "message": "Count from 1 to 5",
            "model": "qwen3:latest",
            "temperature": 0.7,
            "max_tokens": 100
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/ollama/chat/stream",
                json=payload
            ) as response:
                if response.status == 200:
                    print("✅ Streaming response received:")
                    print("   Content: ", end="", flush=True)
                    
                    content_parts = []
                    async for line in response.content:
                        if line:
                            try:
                                chunk = json.loads(line.decode('utf-8'))
                                if chunk.get('type') == 'token' and chunk.get('data'):
                                    content = chunk['data']
                                    print(content, end="", flush=True)
                                    content_parts.append(content)
                                elif chunk.get('type') == 'complete':
                                    print(f"\n   ✅ Streaming complete")
                                    break
                            except json.JSONDecodeError:
                                continue
                    
                    full_content = ''.join(content_parts)
                    return {
                        "success": True,
                        "content_length": len(full_content),
                        "content": full_content
                    }
                else:
                    error_text = await response.text()
                    print(f"❌ Streaming error: {error_text}")
                    return {"success": False, "error": error_text}
                    
        except Exception as e:
            print(f"❌ Streaming exception: {e}")
            return {"success": False, "error": str(e)}
    
    async def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run all tests and provide comprehensive analysis."""
        print("🦊> Running Comprehensive NLWeb-Ollama Integration Test")
        print("=" * 70)
        
        results = {}
        
        # Test 1: Ollama chat with tool calling
        results['chat_tool_calling'] = await self.test_ollama_chat_tool_calling()
        
        # Test 2: Ollama assistant with tool calling
        results['assistant_tool_calling'] = await self.test_ollama_assistant_tool_calling()
        
        # Test 3: NLWeb suggestions
        results['nlweb_suggestions'] = await self.test_nlweb_suggest_with_ollama()
        
        # Test 4: Streaming responses
        results['streaming'] = await self.test_streaming_responses()
        
        # Analysis
        print("\n" + "=" * 70)
        print("📊 Comprehensive Test Analysis:")
        
        chat_working = results['chat_tool_calling'].get('tool_calls_working', False)
        assistant_working = results['assistant_tool_calling'].get('tool_calls_working', False)
        nlweb_working = results['nlweb_suggestions'].get('success', False)
        streaming_working = results['streaming'].get('success', False)
        
        print(f"   Ollama chat tool calling: {'✅ Working' if chat_working else '❌ Not working'}")
        print(f"   Ollama assistant tool calling: {'✅ Working' if assistant_working else '❌ Not working'}")
        print(f"   NLWeb suggestions: {'✅ Working' if nlweb_working else '❌ Not working'}")
        print(f"   Streaming responses: {'✅ Working' if streaming_working else '❌ Not working'}")
        
        overall_success = chat_working and assistant_working and nlweb_working and streaming_working
        
        if overall_success:
            print("\n🎉 All tests passed! NLWeb-Ollama integration is working perfectly!")
        else:
            print("\n⚠️  Some tests failed. Check the output above for details.")
            print("   Common issues:")
            print("   - Ollama service not running")
            print("   - Model not available")
            print("   - Tool calling format issues")
            print("   - Network connectivity problems")
        
        return {
            "overall_success": overall_success,
            "results": results,
            "summary": {
                "chat_tool_calling": chat_working,
                "assistant_tool_calling": assistant_working,
                "nlweb_suggestions": nlweb_working,
                "streaming": streaming_working
            }
        }


async def main():
    """Run the comprehensive test suite."""
    async with NLWebOllamaTester() as tester:
        results = await tester.run_comprehensive_test()
        return results


if __name__ == "__main__":
    asyncio.run(main())
