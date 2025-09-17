# MCP Server Debugging Methodology

## Overview

This document outlines a systematic approach to debugging MCP server issues, based on real-world debugging experiences. It provides a structured methodology for identifying and resolving common problems.

## Debugging Process Overview

### 1. Problem Identification

- Define the exact symptoms
- Gather relevant error messages
- Identify when the problem occurs

### 2. System Verification

- Verify server startup
- Check protocol communication
- Validate tool definitions

### 3. Root Cause Analysis

- Test individual components
- Isolate problematic areas
- Identify specific failure points

### 4. Solution Implementation

- Apply targeted fixes
- Test solutions systematically
- Verify complete resolution

## Step-by-Step Debugging Guide

### Phase 1: Initial Assessment

#### 1.1 Define the Problem

```
Problem: MCP server shows 0 tools in Cursor
Symptoms:
- Server starts successfully
- Server responds to protocol requests
- Cursor shows "0 tools" or no tools available
- No error messages in logs
```

#### 1.2 Gather Information

```bash
# Check if server is running
ps aux | grep "python3 main.py"

# Check server logs
tail -f /path/to/server/logs

# Verify configuration
cat ~/.cursor/mcp.json
```

#### 1.3 Test Basic Connectivity

```python
# Quick server test
import subprocess
import json

def test_server_startup():
    try:
        result = subprocess.run(
            ["python3", "main.py"],
            capture_output=True,
            text=True,
            timeout=5
        )
        print("Server startup:", "SUCCESS" if result.returncode == 0 else "FAILED")
        if result.stderr:
            print("Errors:", result.stderr)
    except subprocess.TimeoutExpired:
        print("Server startup: TIMEOUT (may be normal)")
    except Exception as e:
        print(f"Server startup: ERROR - {e}")
```

### Phase 2: Protocol Testing

#### 2.1 Test MCP Protocol Communication

```python
import asyncio
import json

async def test_mcp_protocol():
    """Test complete MCP protocol flow."""

    # Start server process
    process = await asyncio.create_subprocess_exec(
        "python3", "main.py",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    try:
        # Test 1: Initialize
        print("Testing initialize...")
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test", "version": "1.0.0"}
            }
        }

        process.stdin.write((json.dumps(init_request) + "\n").encode())
        await process.stdin.drain()

        response_line = await asyncio.wait_for(process.stdout.readline(), timeout=10.0)
        if response_line:
            response = json.loads(response_line.decode().strip())
            print("✅ Initialize successful")
            print(f"Capabilities: {response.get('result', {}).get('capabilities', {})}")
        else:
            print("❌ No response to initialize")
            return False

        # Test 2: Tools list
        print("Testing tools/list...")
        tools_request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list"
        }

        process.stdin.write((json.dumps(tools_request) + "\n").encode())
        await process.stdin.drain()

        response_line = await asyncio.wait_for(process.stdout.readline(), timeout=10.0)
        if response_line:
            response = json.loads(response_line.decode().strip())
            tools = response.get('result', {}).get('tools', [])
            print(f"✅ Found {len(tools)} tools")
            return len(tools) > 0
        else:
            print("❌ No response to tools/list")
            return False

    except Exception as e:
        print(f"❌ Protocol test failed: {e}")
        return False
    finally:
        process.terminate()
        await process.wait()

# Run test
result = asyncio.run(test_mcp_protocol())
print(f"Protocol test result: {'PASS' if result else 'FAIL'}")
```

#### 2.2 Analyze Protocol Responses

```python
def analyze_tool_definitions(tools):
    """Analyze tool definitions for common issues."""

    issues = []

    for tool in tools:
        tool_name = tool.get('name', 'unknown')

        # Check schema format
        if 'parameters' in tool:
            issues.append(f"Tool {tool_name} uses 'parameters' instead of 'inputSchema'")
        elif 'inputSchema' not in tool:
            issues.append(f"Tool {tool_name} missing 'inputSchema'")

        # Check naming
        if '-' in tool_name:
            issues.append(f"Tool {tool_name} contains hyphens (may cause issues)")

        # Check required fields
        if not tool.get('description'):
            issues.append(f"Tool {tool_name} missing description")

    return issues
```

### Phase 3: Component Isolation

#### 3.1 Test Individual Components

```python
def test_server_components():
    """Test individual server components."""

    print("Testing server components...")

    try:
        # Test 1: Import all modules
        from main import MCPServer
        print("✅ Main module import successful")

        # Test 2: Create server instance
        server = MCPServer()
        print("✅ Server instance creation successful")

        # Test 3: Check tool registry
        registry = server.tool_registry
        all_tools = registry.list_all_tools()
        print(f"✅ Tool registry: {len(all_tools)} tools registered")

        # Test 4: Check MCP handler
        handler = server.mcp_handler
        print("✅ MCP handler creation successful")

        # Test 5: Test tools list
        tools_list = handler.handle_tools_list(1)
        tools = tools_list.get('result', {}).get('tools', [])
        print(f"✅ Tools list: {len(tools)} tools returned")

        return True

    except Exception as e:
        print(f"❌ Component test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
```

#### 3.2 Test Tool Definitions

```python
def test_tool_definitions():
    """Test tool definition loading and validation."""

    print("Testing tool definitions...")

    try:
        from tools.definitions import get_tool_definitions

        # Get tool definitions
        definitions = get_tool_definitions()
        print(f"✅ Loaded {len(definitions)} tool definitions")

        # Validate each definition
        for tool_name, tool_def in definitions.items():
            # Check required fields
            if 'name' not in tool_def:
                print(f"❌ Tool {tool_name} missing 'name' field")
            if 'description' not in tool_def:
                print(f"❌ Tool {tool_name} missing 'description' field")
            if 'inputSchema' not in tool_def and 'parameters' not in tool_def:
                print(f"❌ Tool {tool_name} missing schema definition")
            elif 'parameters' in tool_def:
                print(f"⚠️ Tool {tool_name} uses 'parameters' instead of 'inputSchema'")

        return True

    except Exception as e:
        print(f"❌ Tool definition test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
```

### Phase 4: Root Cause Analysis

#### 4.1 Identify Common Issues

```python
def diagnose_common_issues():
    """Diagnose common MCP server issues."""

    issues = []

    # Check 1: Schema format
    try:
        from main import MCPServer
        server = MCPServer()
        tools_list = server.mcp_handler.handle_tools_list(1)
        tools = tools_list.get('result', {}).get('tools', [])

        for tool in tools:
            if 'parameters' in tool:
                issues.append("INCORRECT_SCHEMA_FORMAT")
                break
    except Exception as e:
        issues.append(f"SCHEMA_LOADING_ERROR: {e}")

    # Check 2: Tool naming
    try:
        hyphen_tools = [tool for tool in tools if '-' in tool.get('name', '')]
        if hyphen_tools:
            issues.append("HYPHEN_IN_TOOL_NAMES")
    except:
        pass

    # Check 3: Missing imports
    try:
        from tools.agent_management.base import BaseAgentTools
        from services.version_service import VersionService
    except ImportError as e:
        issues.append(f"MISSING_IMPORT: {e}")

    return issues
```

#### 4.2 Generate Diagnostic Report

```python
def generate_diagnostic_report():
    """Generate comprehensive diagnostic report."""

    report = {
        "timestamp": datetime.now().isoformat(),
        "server_status": "unknown",
        "tool_count": 0,
        "issues": [],
        "recommendations": []
    }

    try:
        # Test server startup
        from main import MCPServer
        server = MCPServer()
        report["server_status"] = "running"

        # Get tool count
        tools_list = server.mcp_handler.handle_tools_list(1)
        tools = tools_list.get('result', {}).get('tools', [])
        report["tool_count"] = len(tools)

        # Diagnose issues
        issues = diagnose_common_issues()
        report["issues"] = issues

        # Generate recommendations
        if "INCORRECT_SCHEMA_FORMAT" in issues:
            report["recommendations"].append("Change 'parameters' to 'inputSchema' in tool definitions")
        if "HYPHEN_IN_TOOL_NAMES" in issues:
            report["recommendations"].append("Replace hyphens with underscores in tool names")
        if "MISSING_IMPORT" in issues:
            report["recommendations"].append("Add missing import statements")

    except Exception as e:
        report["server_status"] = "failed"
        report["issues"].append(f"Server startup failed: {e}")
        report["recommendations"].append("Check server startup errors and fix import issues")

    return report
```

### Phase 5: Solution Implementation

#### 5.1 Apply Fixes Systematically

```python
def apply_schema_fix():
    """Fix schema format issues."""

    print("Applying schema format fix...")

    # Read tool definitions
    with open('tools/agent_management/definitions.py', 'r') as f:
        content = f.read()

    # Replace 'parameters' with 'inputSchema'
    fixed_content = content.replace('"parameters": {', '"inputSchema": {')

    # Write back
    with open('tools/agent_management/definitions.py', 'w') as f:
        f.write(fixed_content)

    print("✅ Schema format fix applied")

def apply_import_fix():
    """Fix missing import issues."""

    print("Applying import fix...")

    # Add missing imports
    import_statement = "from services.version_service import VersionService\n"

    with open('tools/agent_management/base.py', 'r') as f:
        content = f.read()

    # Add import if not present
    if "from services.version_service import VersionService" not in content:
        # Find the right place to add the import
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('from agent_naming import'):
                lines.insert(i + 1, import_statement.strip())
                break

        content = '\n'.join(lines)

        with open('tools/agent_management/base.py', 'w') as f:
            f.write(content)

        print("✅ Import fix applied")
    else:
        print("✅ Import already present")
```

#### 5.2 Verify Fixes

```python
def verify_fixes():
    """Verify that fixes have been applied correctly."""

    print("Verifying fixes...")

    # Test 1: Server startup
    try:
        from main import MCPServer
        server = MCPServer()
        print("✅ Server starts successfully")
    except Exception as e:
        print(f"❌ Server startup failed: {e}")
        return False

    # Test 2: Tool definitions
    tools_list = server.mcp_handler.handle_tools_list(1)
    tools = tools_list.get('result', {}).get('tools', [])

    # Check schema format
    for tool in tools:
        if 'parameters' in tool:
            print(f"❌ Tool {tool['name']} still uses 'parameters'")
            return False

    print("✅ All tools use correct 'inputSchema' format")
    print(f"✅ {len(tools)} tools available")

    return True
```

## Debugging Checklist

### Pre-Debugging

- [ ] Define the exact problem and symptoms
- [ ] Gather error messages and logs
- [ ] Document current configuration
- [ ] Create backup of current state

### During Debugging

- [ ] Test server startup independently
- [ ] Verify MCP protocol communication
- [ ] Check tool definition format
- [ ] Validate configuration files
- [ ] Test individual components
- [ ] Isolate problematic areas

### Post-Debugging

- [ ] Apply fixes systematically
- [ ] Test each fix individually
- [ ] Verify complete resolution
- [ ] Document the solution
- [ ] Update configuration if needed

## Common Debugging Tools

### 1. Protocol Testing Script

```python
#!/usr/bin/env python3
"""MCP Protocol Tester"""

import asyncio
import json
import sys

async def test_mcp_server(server_path):
    """Test MCP server with full protocol."""
    # Implementation as shown above
    pass

if __name__ == "__main__":
    server_path = sys.argv[1] if len(sys.argv) > 1 else "main.py"
    asyncio.run(test_mcp_server(server_path))
```

### 2. Tool Definition Validator

```python
#!/usr/bin/env python3
"""Tool Definition Validator"""

import json
import jsonschema

def validate_tool_definition(tool_def):
    """Validate tool definition against MCP schema."""
    # Implementation as shown above
    pass

if __name__ == "__main__":
    # Load and validate tool definitions
    pass
```

### 3. Diagnostic Reporter

```python
#!/usr/bin/env python3
"""MCP Server Diagnostic Reporter"""

def generate_diagnostic_report():
    """Generate comprehensive diagnostic report."""
    # Implementation as shown above
    pass

if __name__ == "__main__":
    report = generate_diagnostic_report()
    print(json.dumps(report, indent=2))
```

## Conclusion

This systematic debugging methodology helps identify and resolve MCP server issues efficiently. The key is to:

1. **Test systematically** - Don't skip steps
2. **Isolate components** - Test individual parts
3. **Document findings** - Keep track of what you discover
4. **Apply fixes incrementally** - Test each fix before moving on
5. **Verify solutions** - Ensure the problem is completely resolved

Following this methodology will help you quickly identify and resolve MCP server issues.
