# MCP (Model Context Protocol) Documentation

## Overview

This directory contains comprehensive documentation for the Reynard MCP server, including development guides, troubleshooting resources, and architectural patterns. The documentation is based on real-world development experiences and web research.

## Documentation Structure

### 📋 [Schema Format Reference](./schema-format.md)

Complete guide to MCP tool schema format, including:

- Core schema structure and required properties
- Common schema patterns and examples
- Validation rules and best practices
- Common mistakes and how to avoid them
- Schema testing and validation tools

### 🔧 [Troubleshooting Guide](./troubleshooting.md)

Comprehensive troubleshooting guide covering:

- Common issues and their solutions
- Tools not appearing in Cursor
- MCP server startup problems
- Authentication and authorization issues
- Performance and resource problems
- Diagnostic commands and testing tools

### 🛠️ [Tool Development Guide](./tool-development-guide.md)

Complete guide for developing MCP tools, including:

- Architecture overview and modular design principles
- Step-by-step development workflow
- Best practices for schema design and error handling
- Testing strategies (unit and integration)
- Advanced patterns (async tools, caching, configuration)
- Deployment checklist

### 🔐 [Authentication and Middleware](./authentication-middleware.md)

In-depth coverage of security patterns:

- Authentication middleware architecture
- Token management and JWT implementation
- Permission systems and access control
- Security best practices
- Rate limiting and input validation
- Testing authentication systems

### 🔗 [Cursor Integration](./cursor-integration.md)

Guide for integrating MCP servers with Cursor IDE:

- Configuration setup
- Connection troubleshooting
- Tool discovery and usage
- Common integration issues

### 🐛 [Debugging Methodology](./debugging-methodology.md)

Systematic approach to debugging MCP issues:

- Debugging tools and techniques
- Log analysis and monitoring
- Performance profiling
- Error tracking and resolution

## Quick Start

### For Developers

1. Start with the [Tool Development Guide](./tool-development-guide.md) to understand the architecture
2. Reference the [Schema Format Reference](./schema-format.md) for correct tool definitions
3. Use the [Troubleshooting Guide](./troubleshooting.md) when issues arise

### For Troubleshooting

1. Check the [Troubleshooting Guide](./troubleshooting.md) for common issues
2. Use the [Debugging Methodology](./debugging-methodology.md) for systematic debugging
3. Reference the [Authentication and Middleware](./authentication-middleware.md) for security issues

### For Integration

1. Follow the [Cursor Integration](./cursor-integration.md) guide for setup
2. Use the [Schema Format Reference](./schema-format.md) to ensure compatibility
3. Check the [Troubleshooting Guide](./troubleshooting.md) for connection issues

## Key Concepts

### MCP Schema Format

- Use `inputSchema` (not `parameters`) for tool definitions
- Always include `type: "object"` in input schemas
- Provide clear descriptions and parameter documentation
- Use appropriate parameter types and validation

### Tool Development

- Follow modular architecture with separate definition and implementation files
- Implement comprehensive error handling
- Use lazy imports for better performance
- Register tools in both the registry and configuration

### Authentication

- Not all tools require authentication
- Use JWT tokens for secure authentication
- Implement proper permission systems
- Apply rate limiting and input validation

### Troubleshooting

- Check schema format first (most common issue)
- Verify tool registration and configuration
- Test MCP server connectivity
- Restart Cursor's MCP connection when needed

## Common Issues and Solutions

### Tools Not Appearing in Cursor

**Cause**: Schema format issues, connection problems, or disabled tools
**Solution**:

1. Verify `inputSchema` format (not `parameters`)
2. Restart Cursor's MCP connection
3. Confirm tool is enabled via `GET /api/mcp/tool-config/tools/{name}`

### Authentication Errors

**Cause**: Missing or invalid authentication tokens
**Solution**:

1. Check if tool requires authentication
2. Verify token format and validity
3. Ensure proper permissions are granted

### Server Startup Issues

**Cause**: Missing dependencies or configuration problems
**Solution**:

1. Activate virtual environment
2. Install missing dependencies
3. Check import paths and configuration

## Best Practices

### Development

- Follow the 140-line axiom for code organization
- Use descriptive tool and parameter names
- Implement comprehensive error handling
- Write tests for all tools
- Document tool usage and parameters

### Security

- Use proper authentication for sensitive tools
- Implement rate limiting
- Validate all inputs
- Use secure token storage
- Follow principle of least privilege

### Performance

- Use async/await for I/O operations
- Implement caching for expensive operations
- Monitor resource usage
- Optimize tool execution paths

## Resources

### Official Documentation

- [MCP Specification](https://modelcontextprotocol.io/docs)
- [Cursor MCP Integration](https://cursor.sh/docs/mcp)
- [JSON Schema Documentation](https://json-schema.org/learn/)

### Reynard Project

- [Reynard MCP Server](https://github.com/your-org/reynard/tree/main/services/mcp-server)
- [Tool Registry](https://github.com/your-org/reynard/tree/main/services/mcp-server/tools)
- Tool Configuration API: `/api/mcp/tool-config/*` (FastAPI backend)

### Community

- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
- [Cursor Community](https://cursor.sh/community)
- [Discord Server](https://discord.gg/cursor)

## Contributing

When contributing to MCP documentation:

1. Follow the established structure and format
2. Include practical examples and code snippets
3. Test all examples and commands
4. Update the README when adding new documents
5. Use clear, concise language
6. Include troubleshooting information

## Version History

- **v1.0.0**: Initial documentation set
  - Schema format reference
  - Troubleshooting guide
  - Tool development guide
  - Authentication and middleware patterns

---

_This documentation is maintained as part of the Reynard project and reflects real-world development experiences and best practices._
