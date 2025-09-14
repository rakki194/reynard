"""
🐺 WebSocket Fuzzing Engine

*circles with menacing intent* Specialized fuzzing engine for WebSocket endpoints.
Targets real-time communication channels with message injection, connection flooding,
and frame manipulation attacks.

Classes:
    WebSocketFuzzer: WebSocket-specific fuzzing with real-time attacks
"""

import asyncio
import time
from typing import List, Dict, Any, Optional
import websockets

from ..core.base import BaseFuzzer
from ..core.results import WebSocketResult
from ..core.analysis import VulnerabilityAnalyzer


class WebSocketFuzzer(BaseFuzzer):
    """
    🐺 WebSocket Fuzzing Engine
    
    *snarls with predatory glee* Specialized fuzzing engine for WebSocket
    endpoints and real-time communication channels. Targets WebSocket-specific
    vulnerabilities including message injection, connection flooding, and
    frame manipulation attacks.
    
    This fuzzer specializes in:
    - Message injection attacks with malicious payloads
    - Frame manipulation to break WebSocket protocols
    - Connection flooding to test resource limits
    - Real-time vulnerability detection in WebSocket streams
    - Protocol-specific attack vectors
    
    Attack Types:
    - Message Injection: Malicious content in WebSocket messages
    - Frame Manipulation: Malformed frames and protocol violations
    - Connection Flooding: Multiple concurrent connections
    - Payload Size Attacks: Oversized and malformed payloads
    
    Attributes:
        websocket_attack_vectors (Dict[str, List[str]]): WebSocket-specific attack vectors
        analyzer (VulnerabilityAnalyzer): Vulnerability detection engine
        
    Example:
        >>> fuzzer = WebSocketFuzzer()
        >>> results = await fuzzer.fuzz_websocket_endpoint("/api/progress", ["message_injection"])
        >>> # Tests WebSocket endpoint with message injection attacks
    """
    
    def __init__(self, base_url: str = "ws://localhost:8000", max_concurrent: int = 5):
        """
        Initialize the WebSocket fuzzer.
        
        *whiskers twitch with intelligence* Sets up WebSocket attack
        vectors and vulnerability analyzer.
        
        Args:
            base_url (str): Base WebSocket URL (should start with ws:// or wss://)
            max_concurrent (int): Maximum concurrent WebSocket connections
        """
        super().__init__(base_url, max_concurrent)
        self.analyzer = VulnerabilityAnalyzer()
        self.websocket_attack_vectors = self._initialize_websocket_attack_vectors()
    
    def _initialize_websocket_attack_vectors(self) -> Dict[str, List[str]]:
        """
        Initialize WebSocket attack vectors.
        
        *bares fangs with savage satisfaction* Creates comprehensive
        WebSocket-specific attack vectors for different vulnerability types.
        
        Returns:
            Dict[str, List[str]]: WebSocket attack vectors organized by type
        """
        return {
            "message_injection": [
                '{"type": "progress", "data": "<script>alert(\'XSS\')</script>"}',
                '{"job_id": "1\'; DROP TABLE jobs; --", "status": "started"}',
                '{"method": "pca", "filters": {"$where": "1==1"}}',
                '{"parameters": {"temperature": "1\'; DELETE FROM models; --"}}',
                '{"max_samples": "../../../etc/passwd"}',
                '{"random_seed": "; cat /etc/passwd"}',
                '{"use_cache": true, "cache_ttl": "` whoami `"}',
                '{"filters": {"$ne": null, "$regex": ".*"}}',
                '{"method": "tsne", "data": "javascript:alert(\'XSS\')"}',
                '{"job_id": "1 OR 1=1", "status": "completed"}'
            ],
            "frame_manipulation": [
                '{"type": "progress", "data": "malformed json}',
                '{"job_id": "test", "status": "started",}',
                '{"method": "pca", "filters": {"invalid": json}}',
                '{"parameters": {"temperature": 1.0, "invalid_field": }}',
                '{"max_samples": 1000, "random_seed": null,}',
                '{"type": "progress", "data": "' + 'A' * 10000 + '"}',
                '{"job_id": "' + 'B' * 5000 + '", "status": "started"}',
                '{"type": "progress", "data": "测试🚀💀🔥"}',
                '{"type": "progress", "data": "test\\x00injection"}',
                '{"type": "progress", "data": "test\\n\\r\\t"}'
            ]
        }
    
    async def fuzz_endpoint(self, endpoint: str, attack_types: Optional[List[str]] = None, **kwargs) -> List[WebSocketResult]:
        """
        Fuzz WebSocket endpoint with specialized attacks.
        
        *alpha wolf dominance radiates* Performs comprehensive WebSocket
        fuzzing using multiple attack vectors and techniques.
        
        Args:
            endpoint (str): WebSocket endpoint to fuzz
            attack_types (Optional[List[str]]): Types of attacks to perform
            **kwargs: Additional fuzzing parameters
            
        Returns:
            List[WebSocketResult]: Results from WebSocket fuzzing
        """
        if attack_types is None:
            attack_types = ["message_injection", "frame_manipulation"]
        
        url = f"{self.base_url}{endpoint}"
        results = []
        
        for attack_type in attack_types:
            payloads = self.websocket_attack_vectors.get(attack_type, [])
            
            for payload in payloads:
                try:
                    result = await self._send_websocket_payload(url, payload, attack_type)
                    results.append(result)
                    
                    # Small delay between requests
                    await asyncio.sleep(0.1)
                    
                except Exception as e:
                    # Create error result
                    error_result = WebSocketResult(
                        url=url,
                        attack_type=attack_type,
                        payload=payload,
                        connection_successful=False,
                        response_received=False,
                        error_message=str(e),
                        vulnerability_detected=True,
                        vulnerability_type="Connection Error"
                    )
                    results.append(error_result)
        
        # Add results to collection
        self.results.extend(results)
        return results
    
    async def _send_websocket_payload(self, url: str, payload: str, attack_type: str) -> WebSocketResult:
        """
        Send WebSocket fuzzing payload.
        
        *snarls with predatory glee* Establishes WebSocket connection
        and sends malicious payload with vulnerability detection.
        
        Args:
            url (str): WebSocket URL
            payload (str): Malicious payload to send
            attack_type (str): Type of attack being performed
            
        Returns:
            WebSocketResult: Result of the WebSocket fuzzing attempt
        """
        try:
            start_time = time.time()
            async with websockets.connect(url) as websocket:
                connection_time = time.time() - start_time
                
                # Send payload
                await websocket.send(payload)
                
                # Try to receive response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    
                    # Detect vulnerabilities
                    vulnerability_detected, vuln_type = self.analyzer.analyze_websocket_response(
                        response, payload, attack_type
                    )
                    
                    return WebSocketResult(
                        url=url,
                        attack_type=attack_type,
                        payload=payload,
                        connection_successful=True,
                        response_received=True,
                        response_data=response,
                        vulnerability_detected=vulnerability_detected,
                        vulnerability_type=vuln_type,
                        connection_time=connection_time
                    )
                    
                except asyncio.TimeoutError:
                    return WebSocketResult(
                        url=url,
                        attack_type=attack_type,
                        payload=payload,
                        connection_successful=True,
                        response_received=False,
                        connection_time=connection_time
                    )
                
        except Exception as e:
            return WebSocketResult(
                url=url,
                attack_type=attack_type,
                payload=payload,
                connection_successful=False,
                response_received=False,
                error_message=str(e),
                vulnerability_detected=True,
                vulnerability_type="Connection Error"
            )
    
    async def fuzz_connection_flooding(self, endpoint: str, connection_count: int = 10) -> List[WebSocketResult]:
        """
        Perform connection flooding attack.
        
        *circles with menacing intent* Establishes multiple concurrent
        WebSocket connections to test resource limits and connection handling.
        
        Args:
            endpoint (str): WebSocket endpoint to flood
            connection_count (int): Number of concurrent connections
            
        Returns:
            List[WebSocketResult]: Results from connection flooding
        """
        url = f"{self.base_url}{endpoint}"
        results = []
        
        async def create_connection(connection_id: int) -> WebSocketResult:
            """Create a single WebSocket connection for flooding."""
            try:
                start_time = time.time()
                async with websockets.connect(url) as websocket:
                    connection_time = time.time() - start_time
                    
                    # Send test message
                    test_payload = f'{{"connection_id": {connection_id}, "test": "flood"}}'
                    await websocket.send(test_payload)
                    
                    # Try to receive response
                    try:
                        response = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                        return WebSocketResult(
                            url=url,
                            attack_type="connection_flooding",
                            payload=test_payload,
                            connection_successful=True,
                            response_received=True,
                            response_data=response,
                            connection_time=connection_time
                        )
                    except asyncio.TimeoutError:
                        return WebSocketResult(
                            url=url,
                            attack_type="connection_flooding",
                            payload=test_payload,
                            connection_successful=True,
                            response_received=False,
                            connection_time=connection_time
                        )
                        
            except Exception as e:
                return WebSocketResult(
                    url=url,
                    attack_type="connection_flooding",
                    payload=f'{{"connection_id": {connection_id}}}',
                    connection_successful=False,
                    response_received=False,
                    error_message=str(e),
                    vulnerability_detected=True,
                    vulnerability_type="Connection Error"
                )
        
        # Create concurrent connections
        tasks = [create_connection(i) for i in range(connection_count)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        valid_results = [r for r in results if isinstance(r, WebSocketResult)]
        self.results.extend(valid_results)
        return valid_results
