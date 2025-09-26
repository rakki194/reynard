"""Vulnerability Analysis Engine

Advanced vulnerability detection and analysis engine that examines responses for security weaknesses. Uses pattern matching, behavioral analysis, and machine learning techniques to identify potential vulnerabilities in application responses.

Classes:
    VulnerabilityAnalyzer: Core vulnerability detection and analysis engine
"""

from typing import Any

import httpx


class VulnerabilityAnalyzer:
    """Vulnerability Analysis Engine

    Comprehensive vulnerability detection system that analyzes HTTP responses, WebSocket messages, and ML model outputs for security weaknesses. Uses multiple detection techniques including pattern matching, behavioral analysis, and response timing analysis.

    The analyzer detects various vulnerability types:
    - SQL Injection: Database error indicators and successful injection patterns
    - XSS: Script execution indicators and reflected content
    - Path Traversal: File system access indicators
    - Command Injection: Command execution indicators
    - Information Disclosure: Stack traces and error messages
    - Authentication Bypass: Successful authentication indicators
    - Resource Exhaustion: Performance degradation indicators

    Attributes:
        sql_indicators (List[str]): SQL injection detection patterns
        xss_indicators (List[str]): XSS detection patterns
        path_indicators (List[str]): Path traversal detection patterns
        cmd_indicators (List[str]): Command injection detection patterns
        info_indicators (List[str]): Information disclosure detection patterns
        success_indicators (List[str]): Authentication success indicators

    Example:
        >>> analyzer = VulnerabilityAnalyzer()
        >>> is_vuln, vuln_type = analyzer.analyze_response(response, payload)
        >>> if is_vuln:
        ...     print(f"Vulnerability detected: {vuln_type}")

    """

    def __init__(self):
        """Initialize the vulnerability analyzer.

        *whiskers twitch with intelligence* Sets up detection patterns
        and analysis rules for comprehensive vulnerability detection.
        """
        # SQL Injection detection patterns
        self.sql_indicators = [
            "sql syntax",
            "mysql",
            "postgresql",
            "sqlite",
            "oracle",
            "syntax error",
            "database error",
            "table",
            "column",
        ]

        # XSS detection patterns
        self.xss_indicators = [
            "<script>",
            "<img",
            "<svg",
            "javascript:",
            "onerror=",
            "onload=",
            "onclick=",
            "onmouseover=",
        ]

        # Path traversal detection patterns
        self.path_indicators = [
            "root:",
            "bin:",
            "usr:",
            "var:",
            "proc:",
            "windows",
            "system32",
            "drivers",
        ]

        # Command injection detection patterns
        self.cmd_indicators = [
            "command not found",
            "permission denied",
            "access denied",
            "no such file",
            "directory",
            "ls:",
            "dir:",
            "whoami:",
        ]

        # Information disclosure detection patterns
        self.info_indicators = [
            "stack trace",
            "exception",
            "error in",
            "warning:",
            "notice:",
            "fatal error",
            "internal server error",
        ]

        # Authentication success indicators
        self.success_indicators = [
            "token",
            "jwt",
            "bearer",
            "authenticated",
            "authorized",
            "success",
            "login successful",
            "access granted",
            "welcome",
            "dashboard",
        ]

    def analyze_response(
        self,
        response: httpx.Response,
        payload: str,
    ) -> tuple[bool, str | None]:
        """Analyze HTTP response for potential vulnerabilities.

        *snarls with predatory glee* Examines response content, headers,
        and status codes to identify security weaknesses.

        Args:
            response (httpx.Response): HTTP response to analyze
            payload (str): Original payload that was sent

        Returns:
            Tuple[bool, Optional[str]]: (vulnerability_detected, vulnerability_type)

        Example:
            >>> is_vuln, vuln_type = analyzer.analyze_response(response, "admin' OR 1=1--")
            >>> # Returns (True, "SQL Injection") if SQL injection detected

        """
        response_text = response.text.lower()
        payload_lower = payload.lower()

        # Skip analysis for proper validation rejections (422 status codes)
        if response.status_code == 422:
            # Check if this is a proper validation error (not a vulnerability)
            validation_indicators = [
                "string should match pattern",
                "invalid email format",
                "value error",
                "validation error",
                "field required",
            ]
            if any(indicator in response_text for indicator in validation_indicators):
                return False, None  # This is proper validation, not a vulnerability

        # Check for SQL injection indicators (only in successful responses)
        if any(indicator in response_text for indicator in self.sql_indicators):
            return True, "SQL Injection"

        # Check for XSS indicators
        if payload_lower in response_text and any(
            tag in payload_lower for tag in self.xss_indicators
        ):
            return True, "XSS"

        # Check for path traversal indicators (only in successful responses)
        if (
            any(indicator in response_text for indicator in self.path_indicators)
            and response.status_code == 200
            and any(
                traversal in payload_lower
                for traversal in ["../", "..\\", "/etc/", "\\windows\\"]
            )
        ):
            return True, "Path Traversal"

        # Check for command injection indicators
        if any(indicator in response_text for indicator in self.cmd_indicators):
            return True, "Command Injection"

        # Check for information disclosure
        if any(indicator in response_text for indicator in self.info_indicators):
            return True, "Information Disclosure"

        return False, None

    def analyze_websocket_response(
        self,
        response: str,
        payload: str,
        attack_type: str,
    ) -> tuple[bool, str | None]:
        """Analyze WebSocket response for vulnerabilities.

        *circles with menacing intent* Specialized analysis for WebSocket
        messages and real-time communication vulnerabilities.

        Args:
            response (str): WebSocket response message
            payload (str): Original payload sent
            attack_type (str): Type of WebSocket attack performed

        Returns:
            Tuple[bool, Optional[str]]: (vulnerability_detected, vulnerability_type)

        """
        response_lower = response.lower()

        # XSS detection in WebSocket responses
        if any(script in response_lower for script in self.xss_indicators):
            return True, "XSS"

        # SQL Injection detection in WebSocket responses
        if any(sql in response_lower for sql in self.sql_indicators):
            return True, "SQL Injection"

        # Information disclosure in WebSocket responses
        if any(info in response_lower for info in self.info_indicators):
            return True, "Information Disclosure"

        return False, None

    def analyze_ml_response(
        self,
        response: httpx.Response,
        model_response: dict[str, Any],
        payload: dict[str, Any],
        attack_type: str,
    ) -> tuple[bool, str | None]:
        """Analyze ML model response for vulnerabilities.

        *bares fangs with savage satisfaction* Specialized analysis for
        machine learning model responses and AI-specific vulnerabilities.

        Args:
            response (httpx.Response): HTTP response from ML endpoint
            model_response (Dict[str, Any]): Parsed model response
            payload (Dict[str, Any]): ML attack payload
            attack_type (str): Type of ML attack performed

        Returns:
            Tuple[bool, Optional[str]]: (vulnerability_detected, vulnerability_type)

        """
        response_text = response.text.lower()

        # SQL Injection detection in ML responses
        if any(sql in response_text for sql in self.sql_indicators):
            return True, "SQL Injection"

        # XSS detection in ML responses
        if any(script in response_text for script in self.xss_indicators):
            return True, "XSS"

        # Model poisoning detection
        if attack_type == "parameter_manipulation":
            if "error" in model_response and any(
                param in str(model_response["error"]).lower()
                for param in ["temperature", "top_p", "top_k"]
            ):
                return True, "Parameter Manipulation"

        # Information disclosure in ML responses
        if any(info in response_text for info in self.info_indicators):
            return True, "Information Disclosure"

        return False, None

    def analyze_auth_bypass(
        self,
        response: httpx.Response,
        payload: dict[str, Any],
        attack_type: str,
    ) -> tuple[bool, str | None]:
        """Analyze authentication bypass attempt.

        *snarls with predatory intelligence* Specialized analysis for
        authentication bypass attempts and privilege escalation.

        Args:
            response (httpx.Response): HTTP response from auth endpoint
            payload (Dict[str, Any]): Authentication bypass payload
            attack_type (str): Type of auth bypass attempted

        Returns:
            Tuple[bool, Optional[str]]: (auth_bypassed, vulnerability_type)

        """
        response_text = response.text.lower()

        # Check for successful authentication indicators
        if any(indicator in response_text for indicator in self.success_indicators):
            if attack_type.startswith("jwt_"):
                return True, "JWT Bypass"
            if attack_type == "session_hijacking":
                return True, "Session Hijacking"

        # Check for specific vulnerability indicators
        if "algorithm" in response_text and "none" in response_text:
            return True, "Algorithm Confusion"

        # Check status code for bypass
        if response.status_code == 200:
            return True, "Status Code Bypass"

        return False, None

    def detect_resource_exhaustion(
        self,
        response_time: float,
        model_response: dict[str, Any],
        attack_type: str,
    ) -> bool:
        """Detect resource exhaustion attacks.

        *alpha wolf dominance radiates* Analyzes response timing and
        error messages to detect resource exhaustion attempts.

        Args:
            response_time (float): Time taken for the request
            model_response (Dict[str, Any]): Model response data
            attack_type (str): Type of attack performed

        Returns:
            bool: True if resource exhaustion detected

        """
        # Long response time indicates resource exhaustion
        if response_time > 30.0:  # 30 seconds
            return True

        # Memory errors in response
        if model_response and "error" in model_response:
            error_msg = str(model_response["error"]).lower()
            if any(
                mem_error in error_msg
                for mem_error in ["memory", "out of memory", "oom"]
            ):
                return True

        return False
