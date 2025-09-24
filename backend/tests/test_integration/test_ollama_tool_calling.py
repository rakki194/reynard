#!/usr/bin/env python3
"""Test script to verify backend tool calling functionality with qwen3:latest.
"""

import asyncio
import json
import re
from typing import Any

import aiohttp
import pytest


def format_response_with_thinking(response_text: str) -> str:
    """Format response with thinking sections in light grey."""
    # ANSI color codes
    LIGHT_GREY = "\033[90m"
    RESET = "\033[0m"

    # Split response into thinking and regular content
    parts = re.split(r"(<think>.*?</think>)", response_text, flags=re.DOTALL)

    formatted_parts = []
    for part in parts:
        if part.startswith("<think>") and part.endswith("</think>"):
            # Remove the <think> tags and colorize the content
            thinking_content = part[7:-8]  # Remove <think> and </think>
            formatted_parts.append(f"{LIGHT_GREY}{thinking_content}{RESET}")
        else:
            formatted_parts.append(part)

    return "".join(formatted_parts)


def check_tool_calls(response_text: str) -> dict[str, Any]:
    """Check if the response contains tool calls."""
    tool_call_patterns = [
        r"<tool_call>",
        r'```json\s*\{[^}]*"function"[^}]*\}',
        r"function_call",
        r"tool_use",
        r"<function_calls>",
    ]

    found_patterns = []
    for pattern in tool_call_patterns:
        if re.search(pattern, response_text, re.IGNORECASE):
            found_patterns.append(pattern)

    return {
        "has_tool_calls": len(found_patterns) > 0,
        "patterns_found": found_patterns,
        "raw_response": response_text,
    }


def execute_tool_call(tool_call: dict[str, Any]) -> dict[str, Any]:
    """Execute a tool call and return the result."""
    tool_name = tool_call.get("name", "unknown")
    tool_args = tool_call.get("args", {})

    print("\n🔧 Executing Tool Call:")
    print(f"   Tool: {tool_name}")
    print(f"   Arguments: {tool_args}")

    # Simulate tool execution
    if tool_name == "square_the_number":
        input_num = tool_args.get("input_num", 0)
        result = input_num**2
        return {
            "tool_name": tool_name,
            "result": f"The square of {input_num} is {result}",
            "value": result,
        }
    if tool_name == "file_list":
        path = tool_args.get("path", ".")
        # Simulate file listing
        files = ["test.py", "main.py", "config.json", "README.md"]
        return {
            "tool_name": tool_name,
            "result": f"Files in {path}: {', '.join(files)}",
            "files": files,
        }
    return {
        "tool_name": tool_name,
        "result": f"Tool {tool_name} executed with args {tool_args}",
        "error": "Unknown tool",
    }


@pytest.mark.asyncio
async def test_backend_tool_calling():
    """Test the backend tool calling functionality."""
    # Test tools in correct format
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
                            "description": "The number to be squared",
                        },
                    },
                    "required": ["input_num"],
                },
            },
        },
    ]

    # Test payload
    payload = {
        "message": "Square the number 5",
        "model": "qwen3:latest",
        "tools": test_tools,
        "temperature": 0.7,
        "max_tokens": 500,
    }

    print("🦊> Testing backend tool calling with qwen3:latest...")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:8000/api/ollama/chat", json=payload,
            ) as response:
                print(f"Response status: {response.status}")

                if response.status == 200:
                    data = await response.json()
                    response_text = data.get("response", "No response")

                    print("✅ Backend response:")
                    print(f"   Success: {data.get('success', False)}")
                    print(f"   Model: {data.get('model', 'Unknown')}")
                    print(f"   Processing time: {data.get('processing_time', 0):.2f}s")
                    print(f"   Tokens generated: {data.get('tokens_generated', 0)}")

                    # Check for tool calls in response text
                    tool_analysis = check_tool_calls(response_text)
                    print(
                        f"   Tool calls in text: {'✅ Yes' if tool_analysis['has_tool_calls'] else '❌ No'}",
                    )
                    if tool_analysis["patterns_found"]:
                        print(f"   Patterns found: {tool_analysis['patterns_found']}")

                    # Check for tool calls in response data
                    tool_calls = data.get("tool_calls", [])
                    tools_used = data.get("tools_used", [])
                    print(
                        f"   Tool calls in response: {'✅ Yes' if tool_calls else '❌ No'}",
                    )
                    if tool_calls:
                        print(f"   Tool calls: {tool_calls}")

                        # Execute tool calls and show results
                        print("\n🛠️ Tool Call Execution Results:")
                        for i, tool_call in enumerate(tool_calls, 1):
                            result = execute_tool_call(tool_call)
                            print(f"   Result {i}: {result['result']}")

                    if tools_used:
                        print(f"   Tools used: {tools_used}")

                    # Format and display response with thinking in light grey
                    print("\n📝 Full Response (with thinking in light grey):")
                    print("-" * 50)
                    formatted_response = format_response_with_thinking(response_text)
                    print(formatted_response)
                    print("-" * 50)

                    # Show raw response for debugging
                    print("\n🔍 Raw Response Text:")
                    print("-" * 30)
                    print(repr(response_text))
                    print("-" * 30)

                    return len(tool_calls) > 0
                error_text = await response.text()
                print(f"❌ Backend error: {error_text}")
                return False

    except aiohttp.ClientConnectorError:
        print(
            "❌ Cannot connect to backend server. Make sure it's running on port 8000.",
        )
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


@pytest.mark.asyncio
async def test_backend_assistant():
    """Test the backend assistant functionality."""
    payload = {
        "message": "Help me with a coding task - can you list files in the current directory?",
        "assistant_type": "reynard",
        "model": "qwen3:latest",
        "tools_enabled": True,
        "temperature": 0.7,
        "max_tokens": 500,
    }

    print("\n🦦> Testing backend assistant with qwen3:latest...")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:8000/api/ollama/assistant", json=payload,
            ) as response:
                print(f"Response status: {response.status}")

                if response.status == 200:
                    data = await response.json()
                    response_text = data.get("response", "No response")

                    print("✅ Assistant response:")
                    print(f"   Success: {data.get('success', False)}")
                    print(f"   Assistant type: {data.get('assistant_type', 'Unknown')}")
                    print(f"   Model: {data.get('model', 'Unknown')}")
                    print(f"   Processing time: {data.get('processing_time', 0):.2f}s")
                    print(f"   Tools used: {data.get('tools_used', [])}")

                    # Check for tool calls in response text
                    tool_analysis = check_tool_calls(response_text)
                    print(
                        f"   Tool calls in text: {'✅ Yes' if tool_analysis['has_tool_calls'] else '❌ No'}",
                    )
                    if tool_analysis["patterns_found"]:
                        print(f"   Patterns found: {tool_analysis['patterns_found']}")

                    # Check for tool calls in response data
                    tool_calls = data.get("tool_calls", [])
                    tools_used = data.get("tools_used", [])
                    print(
                        f"   Tool calls in response: {'✅ Yes' if tool_calls else '❌ No'}",
                    )
                    if tool_calls:
                        print(f"   Tool calls: {tool_calls}")

                        # Execute tool calls and show results
                        print("\n🛠️ Tool Call Execution Results:")
                        for i, tool_call in enumerate(tool_calls, 1):
                            result = execute_tool_call(tool_call)
                            print(f"   Result {i}: {result['result']}")

                    if tools_used:
                        print(f"   Tools used: {tools_used}")

                    # Format and display response with thinking in light grey
                    print("\n📝 Full Assistant Response (with thinking in light grey):")
                    print("-" * 50)
                    formatted_response = format_response_with_thinking(response_text)
                    print(formatted_response)
                    print("-" * 50)

                    # Show raw response for debugging
                    print("\n🔍 Raw Assistant Response Text:")
                    print("-" * 30)
                    print(repr(response_text))
                    print("-" * 30)

                    return len(tool_calls) > 0
                error_text = await response.text()
                print(f"❌ Assistant error: {error_text}")
                return False

    except aiohttp.ClientConnectorError:
        print(
            "❌ Cannot connect to backend server. Make sure it's running on port 8000.",
        )
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


async def main():
    """Run all backend tests."""
    print("🦊> Testing Reynard Backend Tool Calling Integration")
    print("=" * 60)

    # Test basic chat with tools
    chat_tool_calls = await test_backend_tool_calling()

    # Test assistant
    assistant_tool_calls = await test_backend_assistant()

    print("\n" + "=" * 60)
    print("📊 Tool Calling Analysis:")
    print(
        f"   Chat endpoint tool calls: {'✅ Working' if chat_tool_calls else '❌ Not working'}",
    )
    print(
        f"   Assistant endpoint tool calls: {'✅ Working' if assistant_tool_calls else '❌ Not working'}",
    )

    if chat_tool_calls or assistant_tool_calls:
        print("🎉 Tool calling is working! The model is successfully using tools.")
    else:
        print(
            "⚠️  Tool calling may not be working properly. The model is showing thinking but not making tool calls.",
        )
        print("   This could be due to:")
        print("   - Model not recognizing the tool format")
        print("   - Tool call parsing issues")
        print("   - Model configuration problems")


if __name__ == "__main__":
    asyncio.run(main())
