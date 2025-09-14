"""
🐺 WebSocket Fuzzer

*snarls with predatory glee* Specialized fuzzing for WebSocket endpoints
with real-time communication attacks and protocol manipulation!
"""

import asyncio
import httpx
import time
import json
import websockets
from typing import List, Dict, Any, Optional
from rich.console import Console
from rich.panel import Panel

from ..core.results import FuzzResult, WebSocketResult
from ..generators.payload_generator import PayloadGenerator

console = Console()

class WebSocketFuzzer:
    """
    *circles with menacing intent* Specialized fuzzing for WebSocket endpoints
    
    *bares fangs with savage satisfaction* Targets real-time communication
    vulnerabilities, message injection, and protocol manipulation attacks!
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.ws_base_url = base_url.replace("http://", "ws://").replace("https://", "wss://")
        self.payload_generator = PayloadGenerator()
        self.session = httpx.AsyncClient(timeout=30.0)
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.aclose()
    
    async def fuzz_websocket_endpoints(self) -> List[WebSocketResult]:
        """Fuzz all WebSocket endpoints with specialized attacks"""
        console.print(Panel.fit(
            "[bold red]🐺 FUZZING WEBSOCKET ENDPOINTS[/bold red]\n"
            "*snarls with predatory glee* Time to break your real-time communication!",
            border_style="red"
        ))
        
        results = []
        
        # Fuzz each WebSocket endpoint with specialized attacks
        endpoints = [
            ("/api/embedding-visualization/progress", self._fuzz_progress_websocket),
        ]
        
        for endpoint, fuzz_func in endpoints:
            console.print(f"🔍 Fuzzing WebSocket {endpoint}")
            endpoint_results = await fuzz_func(endpoint)
            results.extend(endpoint_results)
        
        return results
    
    async def _fuzz_progress_websocket(self, endpoint: str) -> List[WebSocketResult]:
        """Fuzz embedding visualization progress WebSocket endpoint"""
        results = []
        url = f"{self.ws_base_url}{endpoint}"
        
        # WebSocket message injection payloads
        message_payloads = [
            # Valid progress message
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing"}
            },
            # Malicious message types
            {
                "type": "' OR 1=1 --",
                "data": {"progress": 50, "status": "processing"}
            },
            {
                "type": "<script>alert('XSS')</script>",
                "data": {"progress": 50, "status": "processing"}
            },
            {
                "type": "; ls -la",
                "data": {"progress": 50, "status": "processing"}
            },
            {
                "type": "| whoami",
                "data": {"progress": 50, "status": "processing"}
            },
            # Malicious data payloads
            {
                "type": "progress",
                "data": {"progress": "' OR 1=1 --", "status": "processing"}
            },
            {
                "type": "progress",
                "data": {"progress": 50, "status": "<script>alert('XSS')</script>"}
            },
            {
                "type": "progress",
                "data": {"progress": 50, "status": "; ls -la"}
            },
            {
                "type": "progress",
                "data": {"progress": 50, "status": "| whoami"}
            },
            # Malformed messages
            {
                "type": None,
                "data": {"progress": 50, "status": "processing"}
            },
            {
                "type": "",
                "data": {"progress": 50, "status": "processing"}
            },
            {
                "type": "progress",
                "data": None
            },
            {
                "type": "progress",
                "data": ""
            },
            # Missing required fields
            {
                "data": {"progress": 50, "status": "processing"}
            },
            {
                "type": "progress"
            },
            # Oversized messages
            {
                "type": "progress",
                "data": {"progress": 50, "status": "a" * 10000}
            },
            {
                "type": "a" * 1000,
                "data": {"progress": 50, "status": "processing"}
            },
            # Command injection in data
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "command": "; ls -la"}
            },
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "command": "| whoami"}
            },
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "command": "` id `"}
            },
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "command": "$(whoami)"}
            },
            # Path traversal in data
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "path": "../../../etc/passwd"}
            },
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "path": "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts"}
            },
            # SQL injection in data
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "query": "' OR 1=1 --"}
            },
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "query": "'; DROP TABLE progress; --"}
            },
            # XSS in data
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "message": "<script>alert('XSS')</script>"}
            },
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "message": "<img src=x onerror=alert('XSS')>"}
            },
            {
                "type": "progress",
                "data": {"progress": 50, "status": "processing", "message": "<svg onload=alert('XSS')>"}
            },
        ]
        
        for payload in message_payloads:
            result = await self._send_websocket_message(url, payload)
            results.append(result)
        
        return results
    
    async def _send_websocket_message(self, url: str, payload: dict) -> WebSocketResult:
        """Send a WebSocket message and analyze for vulnerabilities"""
        start_time = time.time()
        
        try:
            async with websockets.connect(url, timeout=10) as websocket:
                # Send the malicious message
                message = json.dumps(payload)
                await websocket.send(message)
                
                # Try to receive a response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    end_time = time.time()
                    
                    # Analyze response for WebSocket-specific vulnerabilities
                    vulnerability_detected, vulnerability_type = self._analyze_websocket_response(response, payload)
                    
                    return WebSocketResult(
                        url=url,
                        message=message,
                        response=response,
                        response_time=end_time - start_time,
                        vulnerability_detected=vulnerability_detected,
                        vulnerability_type=vulnerability_type,
                        connection_successful=True,
                        response_received=True
                    )
                    
                except asyncio.TimeoutError:
                    end_time = time.time()
                    return WebSocketResult(
                        url=url,
                        message=message,
                        response=None,
                        response_time=end_time - start_time,
                        vulnerability_detected=False,
                        vulnerability_type=None,
                        connection_successful=True,
                        response_received=False
                    )
                    
        except Exception as e:
            end_time = time.time()
            return WebSocketResult(
                url=url,
                message=json.dumps(payload),
                response=None,
                response_time=end_time - start_time,
                vulnerability_detected=False,
                vulnerability_type=None,
                connection_successful=False,
                response_received=False,
                error=str(e)
            )
    
    def _analyze_websocket_response(self, response: str, payload: dict) -> tuple[bool, Optional[str]]:
        """Analyze WebSocket response for vulnerabilities"""
        response_lower = response.lower()
        
        # Check for WebSocket-specific vulnerabilities
        if any(indicator in response_lower for indicator in ["internal_error", "stack_trace", "database_error", "sql_error"]):
            return True, "WebSocket Information Disclosure"
        
        # Check for command execution
        if any(indicator in response_lower for indicator in ["command not found", "permission denied", "whoami:", "ls:", "id:"]):
            return True, "WebSocket Command Injection"
        
        # Check for SQL injection
        if any(indicator in response_lower for indicator in ["sql", "database", "mysql", "postgresql", "sqlite"]):
            return True, "WebSocket SQL Injection"
        
        # Check for XSS
        if any(indicator in response_lower for indicator in ["<script>", "javascript:", "onerror="]):
            return True, "WebSocket XSS"
        
        # Check for path traversal
        if any(indicator in response_lower for indicator in ["root:", "etc:", "windows", "system32"]):
            return True, "WebSocket Path Traversal"
        
        # Check for message injection success
        if isinstance(payload, dict):
            # Check if malicious payload was processed
            if "type" in payload:
                payload_type = payload["type"]
                if any(malicious in payload_type for malicious in ["'; DROP TABLE", "<script>", "; ls", "| whoami"]):
                    if any(success in response_lower for success in ["processed", "accepted", "executed"]):
                        return True, "WebSocket Message Injection"
            
            # Check if malicious data was processed
            if "data" in payload and isinstance(payload["data"], dict):
                for key, value in payload["data"].items():
                    if isinstance(value, str):
                        if any(malicious in value for malicious in ["'; DROP TABLE", "<script>", "; ls", "| whoami"]):
                            if any(success in response_lower for success in ["processed", "accepted", "executed"]):
                                return True, "WebSocket Data Injection"
        
        return False, None
    
    async def fuzz_websocket_connection_flooding(self, endpoint: str, connection_count: int = 10) -> List[WebSocketResult]:
        """Fuzz WebSocket endpoint with connection flooding attacks"""
        results = []
        url = f"{self.ws_base_url}{endpoint}"
        
        console.print(f"🌊 Flooding WebSocket with {connection_count} concurrent connections...")
        
        # Create multiple concurrent connections
        tasks = []
        for i in range(connection_count):
            task = asyncio.create_task(self._flood_websocket_connection(url, i))
            tasks.append(task)
        
        # Wait for all connections to complete
        connection_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in connection_results:
            if isinstance(result, WebSocketResult):
                results.append(result)
            elif isinstance(result, Exception):
                # Create a failed result for exceptions
                results.append(WebSocketResult(
                    url=url,
                    message="connection_flood",
                    response=None,
                    response_time=0.0,
                    vulnerability_detected=False,
                    vulnerability_type=None,
                    connection_successful=False,
                    response_received=False,
                    error=str(result)
                ))
        
        return results
    
    async def _flood_websocket_connection(self, url: str, connection_id: int) -> WebSocketResult:
        """Create a single flooding connection"""
        start_time = time.time()
        
        try:
            async with websockets.connect(url, timeout=5) as websocket:
                # Send multiple messages rapidly
                for i in range(5):
                    message = json.dumps({
                        "type": "flood",
                        "data": {"connection_id": connection_id, "message_id": i}
                    })
                    await websocket.send(message)
                    await asyncio.sleep(0.1)  # Small delay between messages
                
                # Try to receive responses
                responses = []
                try:
                    for _ in range(5):
                        response = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                        responses.append(response)
                except asyncio.TimeoutError:
                    pass
                
                end_time = time.time()
                
                return WebSocketResult(
                    url=url,
                    message=f"flood_connection_{connection_id}",
                    response="; ".join(responses) if responses else None,
                    response_time=end_time - start_time,
                    vulnerability_detected=len(responses) > 0,  # If we got responses, it might be vulnerable
                    vulnerability_type="WebSocket Connection Flooding" if len(responses) > 0 else None,
                    connection_successful=True,
                    response_received=len(responses) > 0
                )
                
        except Exception as e:
            end_time = time.time()
            return WebSocketResult(
                url=url,
                message=f"flood_connection_{connection_id}",
                response=None,
                response_time=end_time - start_time,
                vulnerability_detected=False,
                vulnerability_type=None,
                connection_successful=False,
                response_received=False,
                error=str(e)
            )

async def main():
    """Main execution function for testing"""
    async with WebSocketFuzzer() as fuzzer:
        # Test regular WebSocket fuzzing
        results = await fuzzer.fuzz_websocket_endpoints()
        console.print(f"🐺 WebSocket fuzzing completed: {len(results)} requests made")
        
        # Test connection flooding
        flood_results = await fuzzer.fuzz_websocket_connection_flooding("/api/embedding-visualization/progress", 5)
        console.print(f"🌊 WebSocket flooding completed: {len(flood_results)} connections tested")

if __name__ == "__main__":
    asyncio.run(main())
