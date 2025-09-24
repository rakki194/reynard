"""Example of proper tool calling format for Ollama with qwen3:latest.

This demonstrates the correct format for native Ollama tool calling as of 2025.
"""

# Correct tool format for Ollama native tool calling
EXAMPLE_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "file_list",
            "description": "List files in a directory",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Directory path to list"},
                },
                "required": ["path"],
            },
        },
    },
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

# Example chat request with tools
EXAMPLE_CHAT_REQUEST = {
    "message": "List files in the current directory and then square the number 5",
    "model": "qwen3:latest",
    "system_prompt": "You are a helpful assistant with access to file system and math tools.",
    "temperature": 0.7,
    "max_tokens": 1000,
    "tools": EXAMPLE_TOOLS,
    "context": {"current_path": "/home/user/project", "user_id": "testuser"},
}


# Example of how to handle tool calls in streaming response
def handle_tool_call(tool_call_data):
    """Handle a tool call from Ollama streaming response.

    Args:
        tool_call_data: The tool call data from Ollama response

    Returns:
        dict: Tool execution result

    """
    tool_name = tool_call_data.get("function", {}).get("name")
    tool_args = tool_call_data.get("function", {}).get("arguments", {})

    if tool_name == "file_list":
        path = tool_args.get("path", ".")
        # Simulate file listing
        return {
            "tool_call_id": tool_call_data.get("id"),
            "role": "tool",
            "name": tool_name,
            "content": f"Files in {path}: file1.txt, file2.py, directory1/",
        }
    if tool_name == "square_the_number":
        num = tool_args.get("input_num", 0)
        result = num**2
        return {
            "tool_call_id": tool_call_data.get("id"),
            "role": "tool",
            "name": tool_name,
            "content": f"The square of {num} is {result}",
        }
    return {
        "tool_call_id": tool_call_data.get("id"),
        "role": "tool",
        "name": tool_name,
        "content": f"Unknown tool: {tool_name}",
    }


# Example streaming response handling
async def process_ollama_streaming_response(stream):
    """Process streaming response from Ollama with tool calling support.

    Args:
        stream: Async generator of Ollama response chunks

    """
    full_response = ""
    tool_calls = []

    async for chunk in stream:
        if chunk.get("message", {}).get("content"):
            # Regular text content
            content = chunk["message"]["content"]
            full_response += content
            print(f"Content: {content}")

        elif chunk.get("message", {}).get("tool_calls"):
            # Tool calls
            for tool_call in chunk["message"]["tool_calls"]:
                tool_calls.append(tool_call)
                print(
                    f"Tool call: {tool_call['function']['name']} with args {tool_call['function']['arguments']}",
                )

                # Execute the tool
                result = handle_tool_call(tool_call)
                print(f"Tool result: {result}")

        elif chunk.get("done"):
            # Response complete
            print(f"Final response: {full_response}")
            print(f"Tools used: {[tc['function']['name'] for tc in tool_calls]}")
            break


if __name__ == "__main__":
    print("Ollama Tool Calling Example for qwen3:latest")
    print("=" * 50)
    print("Tool format:")
    import json

    print(json.dumps(EXAMPLE_TOOLS[0], indent=2))
    print("\nChat request format:")
    print(json.dumps(EXAMPLE_CHAT_REQUEST, indent=2))
