"""
Fuzzing Result Data Structures

Result tracking for all fuzzing operations.
These data structures capture every aspect of fuzzing attempts, from basic HTTP responses
to complex ML model interactions and WebSocket communications.

Classes:
    FuzzResult: Standard HTTP fuzzing result with vulnerability analysis
    WebSocketResult: WebSocket-specific fuzzing result with connection tracking
    MLFuzzResult: Machine learning model fuzzing result with resource monitoring
    AuthBypassResult: Authentication bypass attempt result with security analysis
"""

from dataclasses import dataclass
from typing import Any


@dataclass
class FuzzResult:
    """
    Standard HTTP Fuzzing Result

    Captures comprehensive information about a single fuzzing attempt against an HTTP endpoint. Includes response analysis, vulnerability detection, and performance metrics.

    Attributes:
        url (str): Target URL that was fuzzed
        method (str): HTTP method used (GET, POST, etc.)
        payload (str): The malicious payload that was sent
        status_code (int): HTTP response status code
        response_time (float): Time taken for the request in seconds
        response_size (int): Size of the response body in bytes
        error (Optional[str]): Error message if request failed
        vulnerability_detected (bool): Whether a vulnerability was found
        vulnerability_type (Optional[str]): Type of vulnerability detected
        response_body (Optional[str]): Full response body content
        response_text (Optional[str]): Response text content
        response_headers (Optional[Dict[str, str]]): Response headers
        request_headers (Optional[Dict[str, str]]): Request headers sent
        attack_type (Optional[str]): Type of attack performed
        grammar_rule (Optional[str]): Grammar rule used for payload generation
        learning_score (float): Learning-based mutation score (0.0-1.0)

    Example:
        >>> result = FuzzResult(
        ...     url="http://localhost:8000/api/auth/login",
        ...     method="POST",
        ...     payload="admin' OR 1=1--",
        ...     status_code=200,
        ...     response_time=0.5,
        ...     response_size=1024,
        ...     vulnerability_detected=True,
        ...     vulnerability_type="SQL Injection"
        ... )
    """

    url: str
    method: str
    payload: str
    status_code: int
    response_time: float
    response_size: int
    error: str | None = None
    vulnerability_detected: bool = False
    vulnerability_type: str | None = None
    # Enhanced response capture
    response_body: str | None = None
    response_text: str | None = None
    response_headers: dict[str, str] | None = None
    request_headers: dict[str, str] | None = None
    # Advanced attack tracking
    attack_type: str | None = None
    grammar_rule: str | None = None
    learning_score: float = 0.0


@dataclass
class WebSocketResult:
    """
    🐺 WebSocket Fuzzing Result

    *circles with menacing intent* Specialized result tracking for WebSocket
    fuzzing attempts. Captures connection status, message flow, and real-time
    vulnerability detection.

    Attributes:
        url (str): WebSocket URL that was targeted
        attack_type (str): Type of WebSocket attack performed
        payload (str): Message payload sent to WebSocket
        connection_successful (bool): Whether WebSocket connection was established
        response_received (bool): Whether a response was received
        response_data (Optional[str]): Response data received from WebSocket
        error_message (Optional[str]): Error message if connection/operation failed
        vulnerability_detected (bool): Whether a vulnerability was detected
        vulnerability_type (Optional[str]): Type of vulnerability found
        connection_time (float): Time taken to establish connection in seconds

    Example:
        >>> ws_result = WebSocketResult(
        ...     url="ws://localhost:8000/api/embedding-visualization/progress",
        ...     attack_type="message_injection",
        ...     payload='{"type": "progress", "data": "<script>alert(\'XSS\')</script>"}',
        ...     connection_successful=True,
        ...     response_received=True,
        ...     vulnerability_detected=True,
        ...     vulnerability_type="XSS"
        ... )
    """

    url: str
    attack_type: str
    payload: str
    connection_successful: bool
    response_received: bool
    response_data: str | None = None
    error_message: str | None = None
    vulnerability_detected: bool = False
    vulnerability_type: str | None = None
    connection_time: float = 0.0


@dataclass
class MLFuzzResult:
    """
    🐺 Machine Learning Model Fuzzing Result

    *bares fangs with savage satisfaction* Specialized result tracking for
    ML model fuzzing attempts. Includes model response analysis, resource
    exhaustion detection, and AI-specific vulnerability identification.

    Attributes:
        url (str): ML endpoint URL that was fuzzed
        method (str): HTTP method used
        attack_type (str): Type of ML attack performed
        payload (Dict[str, Any]): ML-specific attack payload
        status_code (int): HTTP response status code
        response_time (float): Time taken for the request in seconds
        model_response (Optional[Dict[str, Any]]): Parsed model response
        vulnerability_detected (bool): Whether a vulnerability was found
        vulnerability_type (Optional[str]): Type of vulnerability detected
        resource_exhaustion (bool): Whether resource exhaustion was detected

    Example:
        >>> ml_result = MLFuzzResult(
        ...     url="http://localhost:8000/api/embedding-visualization/reduce",
        ...     method="POST",
        ...     attack_type="parameter_manipulation",
        ...     payload={"temperature": -1.0, "max_length": 100000},
        ...     status_code=200,
        ...     response_time=45.2,
        ...     resource_exhaustion=True,
        ...     vulnerability_detected=True,
        ...     vulnerability_type="Resource Exhaustion"
        ... )
    """

    url: str
    method: str
    attack_type: str
    payload: dict[str, Any]
    status_code: int
    response_time: float
    model_response: dict[str, Any] | None = None
    vulnerability_detected: bool = False
    vulnerability_type: str | None = None
    resource_exhaustion: bool = False


@dataclass
class AuthBypassResult:
    """
    🐺 Authentication Bypass Fuzzing Result

    *snarls with predatory glee* Specialized result tracking for authentication
    bypass attempts. Captures JWT manipulation, session hijacking, and privilege
    escalation attempts.

    Attributes:
        url (str): Authentication endpoint URL that was targeted
        method (str): HTTP method used
        attack_type (str): Type of authentication bypass attempted
        payload (Dict[str, Any]): Authentication bypass payload
        status_code (int): HTTP response status code
        response_time (float): Time taken for the request in seconds
        auth_bypassed (bool): Whether authentication was successfully bypassed
        vulnerability_type (Optional[str]): Type of vulnerability detected
        token_manipulated (bool): Whether JWT token was manipulated
        response_headers (Optional[Dict[str, str]]): Response headers

    Example:
        >>> auth_result = AuthBypassResult(
        ...     url="http://localhost:8000/api/auth/login",
        ...     method="POST",
        ...     attack_type="jwt_algorithm_confusion",
        ...     payload={"alg": "none", "sub": "admin"},
        ...     status_code=200,
        ...     auth_bypassed=True,
        ...     vulnerability_type="JWT Bypass",
        ...     token_manipulated=True
        ... )
    """

    url: str
    method: str
    attack_type: str
    payload: dict[str, Any]
    status_code: int
    response_time: float
    auth_bypassed: bool = False
    vulnerability_type: str | None = None
    token_manipulated: bool = False
    response_headers: dict[str, str] | None = None
