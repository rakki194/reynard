#!/usr/bin/env python3
"""
MCP TCP Server Wrapper
======================

A simple TCP server wrapper for the MCP server to allow HTTP clients to connect.
"""

import asyncio
import json
import logging
import sys
from typing import Any

from main import MCPServer

logger = logging.getLogger(__name__)

class MCPTCPServer:
    """TCP server wrapper for MCP server."""
    
    def __init__(self, host: str = "localhost", port: int = 8001):
        self.host = host
        self.port = port
        self.mcp_server = MCPServer()
        self.server = None
        
    async def handle_client(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        """Handle a client connection."""
        client_addr = writer.get_extra_info('peername')
        logger.info(f"Client connected from {client_addr}")
        
        try:
            while True:
                # Read a line from the client
                data = await reader.readline()
                if not data:
                    break
                
                try:
                    # Parse the JSON-RPC request
                    request = json.loads(data.decode().strip())
                    logger.debug(f"Received request: {request}")
                    
                    # Handle the request using the MCP server
                    response = await self.mcp_server.handle_request(request)
                    
                    if response is not None:
                        # Send the response back to the client
                        response_data = json.dumps(response) + "\n"
                        writer.write(response_data.encode())
                        await writer.drain()
                        logger.debug(f"Sent response: {response}")
                        
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON from client: {e}")
                    error_response = {
                        "jsonrpc": "2.0",
                        "id": None,
                        "error": {
                            "code": -32700,
                            "message": "Parse error"
                        }
                    }
                    writer.write(json.dumps(error_response).encode() + b"\n")
                    await writer.drain()
                    
                except Exception as e:
                    logger.error(f"Error handling request: {e}")
                    error_response = {
                        "jsonrpc": "2.0", 
                        "id": None,
                        "error": {
                            "code": -32603,
                            "message": "Internal error"
                        }
                    }
                    writer.write(json.dumps(error_response).encode() + b"\n")
                    await writer.drain()
                    
        except Exception as e:
            logger.error(f"Error in client handler: {e}")
        finally:
            writer.close()
            await writer.wait_closed()
            logger.info(f"Client {client_addr} disconnected")
    
    async def start_server(self):
        """Start the TCP server."""
        logger.info(f"Starting MCP TCP server on {self.host}:{self.port}")
        
        self.server = await asyncio.start_server(
            self.handle_client,
            self.host,
            self.port
        )
        
        logger.info(f"MCP TCP server listening on {self.host}:{self.port}")
        
        async with self.server:
            await self.server.serve_forever()
    
    async def stop_server(self):
        """Stop the TCP server."""
        if self.server:
            logger.info("Stopping MCP TCP server...")
            self.server.close()
            await self.server.wait_closed()
            logger.info("MCP TCP server stopped")

async def main():
    """Main entry point."""
    # Check for port argument
    port = 8001
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            logger.error(f"Invalid port number: {sys.argv[1]}")
            sys.exit(1)
    
    server = MCPTCPServer(port=port)
    
    try:
        await server.start_server()
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        sys.exit(1)
    finally:
        await server.stop_server()

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    asyncio.run(main())
