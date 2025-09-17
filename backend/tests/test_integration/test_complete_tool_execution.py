#!/usr/bin/env python3
"""
Test complete tool execution workflow with Ollama.

This test demonstrates the full tool calling workflow:
1. Model makes tool call
2. Tool is executed
3. Result is fed back to model
4. Model provides final answer
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
            "tool_call_id": tool_call.get("id", "unknown"),
            "tool_name": tool_name,
            "result": f"The square of {input_num} is {result}",
            "value": result,
        }
    if tool_name == "file_list":
        path = tool_args.get("path", ".")
        # Simulate file listing
        files = ["test.py", "main.py", "config.json", "README.md", "requirements.txt"]
        return {
            "tool_call_id": tool_call.get("id", "unknown"),
            "tool_name": tool_name,
            "result": f"Files in {path}: {', '.join(files)}",
            "files": files,
        }
    return {
        "tool_call_id": tool_call.get("id", "unknown"),
        "tool_name": tool_name,
        "result": f"Tool {tool_name} executed with args {tool_args}",
        "error": "Unknown tool",
    }


@pytest.mark.asyncio
async def test_complete_tool_execution_workflow() -> dict[str, Any]:
    """Test the complete tool execution workflow."""
    print("🦊> Testing Complete Tool Execution Workflow")
    print("=" * 60)

    async with aiohttp.ClientSession() as session:
        # Step 1: Initial request with tool calling
        print("\n📝 Step 1: Initial request with tool calling")
        print("-" * 40)

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
                            }
                        },
                        "required": ["input_num"],
                    },
                },
            }
        ]

        payload = {
            "message": "Square the number 9 and tell me the result",
            "model": "qwen3:latest",
            "tools": test_tools,
            "temperature": 0.7,
            "max_tokens": 500,
        }

        async with session.post(
            "http://localhost:8000/api/ollama/chat", json=payload
        ) as response:
            if response.status == 200:
                data = await response.json()
                response_text = data.get("response", "")
                tool_calls = data.get("tool_calls", [])

                print("✅ Initial response received")
                print(f"   Model: {data.get('model', 'Unknown')}")
                print(f"   Processing time: {data.get('processing_time', 0):.2f}s")
                print(f"   Tool calls made: {len(tool_calls)}")

                # Display the thinking process
                print("\n🧠 Model's Thinking Process:")
                print("-" * 30)
                formatted_response = format_response_with_thinking(response_text)
                print(formatted_response)
                print("-" * 30)

                if tool_calls:
                    # Step 2: Execute tool calls
                    print("\n🛠️ Step 2: Executing tool calls")
                    print("-" * 40)

                    tool_results = []
                    for i, tool_call in enumerate(tool_calls, 1):
                        result = execute_tool_call(tool_call)
                        tool_results.append(result)
                        print(f"   Result {i}: {result['result']}")

                    # Step 3: Feed results back to model
                    print("\n🔄 Step 3: Feeding results back to model")
                    print("-" * 40)

                    # Create follow-up message with tool results
                    follow_up_payload = {
                        "message": f"Here are the tool execution results: {json.dumps(tool_results, indent=2)}. Please provide a clear final answer.",
                        "model": "qwen3:latest",
                        "temperature": 0.7,
                        "max_tokens": 300,
                    }

                    async with session.post(
                        "http://localhost:8000/api/ollama/chat", json=follow_up_payload
                    ) as follow_up_response:
                        if follow_up_response.status == 200:
                            follow_up_data = await follow_up_response.json()
                            final_response = follow_up_data.get("response", "")

                            print("✅ Final response received")
                            processing_time = follow_up_data.get("processing_time", 0)
                            print(f"   Processing time: {processing_time:.2f}s")

                            # Display the final answer
                            print("\n🎯 Final Answer:")
                            print("-" * 20)
                            formatted_final = format_response_with_thinking(
                                final_response
                            )
                            print(formatted_final)
                            print("-" * 20)

                            return {
                                "success": True,
                                "tool_calls_made": len(tool_calls),
                                "tool_results": tool_results,
                                "final_answer": final_response,
                            }
                        error_text = await follow_up_response.text()
                        print(f"❌ Follow-up request failed: {error_text}")
                        return {"success": False, "error": error_text}
                else:
                    print("⚠️ No tool calls were made")
                    return {"success": False, "error": "No tool calls made"}
            else:
                error_text = await response.text()
                print(f"❌ Initial request failed: {error_text}")
                return {"success": False, "error": error_text}


@pytest.mark.asyncio
async def test_assistant_complete_workflow() -> dict[str, Any]:
    """Test complete workflow with assistant endpoint."""
    print("\n🦦> Testing Assistant Complete Workflow")
    print("=" * 60)

    async with aiohttp.ClientSession() as session:
        # Step 1: Initial assistant request
        print("\n📝 Step 1: Initial assistant request")
        print("-" * 40)

        payload = {
            "message": (
                "List the files in the current directory and tell me "
                "how many files there are"
            ),
            "assistant_type": "reynard",
            "model": "qwen3:latest",
            "tools_enabled": True,
            "temperature": 0.7,
            "max_tokens": 500,
        }

        async with session.post(
            "http://localhost:8000/api/ollama/assistant", json=payload
        ) as response:
            if response.status == 200:
                data = await response.json()
                response_text = data.get("response", "")
                tool_calls = data.get("tool_calls", [])

                print("✅ Assistant response received")
                print(f"   Assistant type: {data.get('assistant_type', 'Unknown')}")
                print(f"   Model: {data.get('model', 'Unknown')}")
                print(f"   Processing time: {data.get('processing_time', 0):.2f}s")
                print(f"   Tool calls made: {len(tool_calls)}")

                # Display the thinking process
                print("\n🧠 Assistant's Thinking Process:")
                print("-" * 30)
                formatted_response = format_response_with_thinking(response_text)
                print(formatted_response)
                print("-" * 30)

                if tool_calls:
                    # Step 2: Execute tool calls
                    print("\n🛠️ Step 2: Executing tool calls")
                    print("-" * 40)

                    tool_results = []
                    for i, tool_call in enumerate(tool_calls, 1):
                        result = execute_tool_call(tool_call)
                        tool_results.append(result)
                        print(f"   Result {i}: {result['result']}")

                    # Step 3: Feed results back to assistant
                    print("\n🔄 Step 3: Feeding results back to assistant")
                    print("-" * 40)

                    follow_up_payload = {
                        "message": (
                            f"Here are the tool execution results: "
                            f"{json.dumps(tool_results, indent=2)}. "
                            f"Please provide a clear final answer with the file count."
                        ),
                        "assistant_type": "reynard",
                        "model": "qwen3:latest",
                        "tools_enabled": False,  # Disable tools for final answer
                        "temperature": 0.7,
                        "max_tokens": 300,
                    }

                    async with session.post(
                        "http://localhost:8000/api/ollama/assistant",
                        json=follow_up_payload,
                    ) as follow_up_response:
                        if follow_up_response.status == 200:
                            follow_up_data = await follow_up_response.json()
                            final_response = follow_up_data.get("response", "")

                            print("✅ Final assistant response received")
                            processing_time = follow_up_data.get("processing_time", 0)
                            print(f"   Processing time: {processing_time:.2f}s")

                            # Display the final answer
                            print("\n🎯 Final Assistant Answer:")
                            print("-" * 20)
                            formatted_final = format_response_with_thinking(
                                final_response
                            )
                            print(formatted_final)
                            print("-" * 20)

                            return {
                                "success": True,
                                "tool_calls_made": len(tool_calls),
                                "tool_results": tool_results,
                                "final_answer": final_response,
                            }
                        error_text = await follow_up_response.text()
                        print(f"❌ Follow-up request failed: {error_text}")
                        return {"success": False, "error": error_text}
                else:
                    print("⚠️ No tool calls were made")
                    return {"success": False, "error": "No tool calls made"}
            else:
                error_text = await response.text()
                print(f"❌ Initial request failed: {error_text}")
                return {"success": False, "error": error_text}


async def main() -> None:
    """Run the complete tool execution tests."""
    print("🦊> Complete Tool Execution Workflow Test")
    print("=" * 70)

    # Test chat endpoint workflow
    chat_result = await test_complete_tool_execution_workflow()

    # Test assistant endpoint workflow
    assistant_result = await test_assistant_complete_workflow()

    # Summary
    print("\n" + "=" * 70)
    print("📊 Complete Workflow Analysis:")
    chat_status = "✅ Success" if chat_result.get("success") else "❌ Failed"
    print(f"   Chat endpoint workflow: {chat_status}")
    assistant_status = "✅ Success" if assistant_result.get("success") else "❌ Failed"
    print(f"   Assistant endpoint workflow: {assistant_status}")

    if chat_result.get("success") and assistant_result.get("success"):
        print("\n🎉 Complete tool execution workflow is working perfectly!")
        print("   The model can:")
        print("   - Make tool calls")
        print("   - Execute tools")
        print("   - Process results")
        print("   - Provide final answers")
    else:
        print("\n⚠️ Some workflow tests failed. Check the output above for details.")


if __name__ == "__main__":
    asyncio.run(main())
