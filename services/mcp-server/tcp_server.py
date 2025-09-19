#!/usr/bin/env python3
"""
TCP MCP Server for Reynard

This script runs the MCP server as a TCP server on port 8001
to allow communication with the FastAPI backend.
"""

import asyncio
import json
import sys

from main import MCPServer
from utils.logging_config import setup_logging

logger = setup_logging()


class TCPMCPServer:
    """TCP-based MCP server for backend communication."""

    def __init__(self, host: str = "localhost", port: int = 8001):
        """Initialize the TCP MCP server."""
        self.host = host
        self.port = port
        self.mcp_server = MCPServer()
        self.clients = set()

    async def handle_client(
        self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter
    ):
        """Handle a client connection."""
        client_addr = writer.get_extra_info("peername")
        logger.info(f"New client connected: {client_addr}")
        self.clients.add(writer)

        try:
            while True:
                # Read a line from the client
                data = await reader.readline()
                if not data:
                    break

                try:
                    # Parse JSON-RPC request
                    request = json.loads(data.decode().strip())
                    logger.debug(f"Received request: {request}")

                    # Handle the request
                    response = await self.mcp_server.handle_request(request)

                    if response:
                        # Send response back to client
                        response_data = json.dumps(response) + "\n"
                        writer.write(response_data.encode())
                        await writer.drain()
                        logger.debug(f"Sent response: {response}")

                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON from client {client_addr}: {e}")
                    error_response = {
                        "jsonrpc": "2.0",
                        "id": None,
                        "error": {"code": -32700, "message": "Parse error"},
                    }
                    writer.write((json.dumps(error_response) + "\n").encode())
                    await writer.drain()

                except Exception as e:
                    logger.error(f"Error handling request from {client_addr}: {e}")
                    error_response = {
                        "jsonrpc": "2.0",
                        "id": None,
                        "error": {"code": -32603, "message": "Internal error"},
                    }
                    writer.write((json.dumps(error_response) + "\n").encode())
                    await writer.drain()

        except asyncio.CancelledError:
            logger.info(f"Client {client_addr} disconnected")
        except Exception as e:
            logger.error(f"Error with client {client_addr}: {e}")
        finally:
            self.clients.discard(writer)
            writer.close()
            await writer.wait_closed()

    async def start_server(self):
        """Start the TCP server."""
        server = await asyncio.start_server(self.handle_client, self.host, self.port)

        logger.info(f"🚀 TCP MCP Server started on {self.host}:{self.port}")
        logger.info(
            f"📊 Registered {len(self.mcp_server.tool_registry.list_all_tools())} tools"
        )

        try:
            async with server:
                await server.serve_forever()
        except KeyboardInterrupt:
            logger.info("Server stopped by user")
        except Exception as e:
            logger.error(f"Server error: {e}")
            raise


async def main():
    """Main entry point."""
    server = TCPMCPServer()
    await server.start_server()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception:
        logger.exception("Server error")
        sys.exit(1)
