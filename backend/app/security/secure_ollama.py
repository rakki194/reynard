"""Secure Ollama Service Wrapper for Reynard Backend

This module provides a secure wrapper around the Ollama service
to prevent information disclosure and other security vulnerabilities.
"""

import logging
from typing import Any

from fastapi import HTTPException, status

from ..security.input_validator import (
    SecureChatRequest,
    validate_command_input,
)

logger = logging.getLogger(__name__)


class SecureOllamaService:
    """Secure wrapper around the Ollama service that validates
    all inputs and prevents information disclosure.
    """

    def __init__(self, ollama_service):
        self.ollama_service = ollama_service

    async def chat_secure(self, request: SecureChatRequest) -> dict[str, Any]:
        """Securely process a chat request with comprehensive input validation.

        Args:
            request: Validated chat request data

        Returns:
            Dict containing chat response

        Raises:
            HTTPException: If chat processing fails or security violation detected

        """
        try:
            # Additional security checks
            if not self._validate_chat_security(request):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Security validation failed",
                )

            # Process chat through the original service
            response = await self.ollama_service.chat(request)

            # Sanitize response to prevent information disclosure
            return self._sanitize_chat_response(response)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Secure chat processing failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Chat processing failed",
            )

    async def assistant_chat_secure(self, request: SecureChatRequest) -> dict[str, Any]:
        """Securely process an assistant chat request with comprehensive input validation.

        Args:
            request: Validated assistant chat request data

        Returns:
            Dict containing assistant response

        Raises:
            HTTPException: If assistant processing fails or security violation detected

        """
        try:
            # Additional security checks
            if not self._validate_chat_security(request):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Security validation failed",
                )

            # Process assistant chat through the original service
            response = await self.ollama_service.assistant_chat(request)

            # Sanitize response to prevent information disclosure
            return self._sanitize_assistant_response(response)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Secure assistant processing failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Assistant processing failed",
            )

    def _validate_chat_security(self, request: SecureChatRequest) -> bool:
        """Validate chat request data for security issues."""
        try:
            # Check for command injection patterns in message
            if not validate_command_input(request.message):
                logger.warning(
                    f"Command injection attempt in chat message: {request.message[:100]}...",
                )
                return False

            # Check for suspicious patterns in message
            if self._contains_suspicious_patterns(request.message):
                logger.warning(
                    f"Suspicious pattern in chat message: {request.message[:100]}...",
                )
                return False

            # Validate system prompt if provided
            if request.system_prompt:
                if not validate_command_input(request.system_prompt):
                    logger.warning(
                        f"Command injection attempt in system prompt: {request.system_prompt[:100]}...",
                    )
                    return False

                if self._contains_suspicious_patterns(request.system_prompt):
                    logger.warning(
                        f"Suspicious pattern in system prompt: {request.system_prompt[:100]}...",
                    )
                    return False

            # Validate model name if provided
            if request.model:
                if not self._validate_model_name(request.model):
                    logger.warning(f"Invalid model name: {request.model}")
                    return False

            return True

        except Exception as e:
            logger.error(f"Chat security validation error: {e}")
            return False

    def _contains_suspicious_patterns(self, text: str) -> bool:
        """Check for suspicious patterns in text."""
        suspicious_patterns = [
            # System information disclosure
            r"pwd|whoami|id|uname|ps|top|kill|rm|mv|cp|chmod|chown",
            r"cat\s+/etc/passwd|cat\s+/etc/shadow|cat\s+/etc/hosts",
            r"ls\s+-la|ls\s+-l|ls\s+/|ls\s+/home|ls\s+/root",
            r"find\s+/|locate\s+|which\s+|whereis\s+",
            r"ifconfig|ip\s+addr|route\s+-n|netstat\s+-an",
            r"env|export|set|unset|alias|unalias",
            r"history|clear|reset|logout|exit|shutdown|reboot",
            # File system access
            r"cat\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)",
            r"head\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)",
            r"tail\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)",
            r"grep\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)",
            r"awk\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)",
            r"sed\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)",
            # Network access
            r"curl\s+|wget\s+|nc\s+|netcat\s+|telnet\s+",
            r"ssh\s+|scp\s+|rsync\s+|ftp\s+|sftp\s+",
            r"ping\s+|traceroute\s+|nslookup\s+|dig\s+",
            # Process manipulation
            r"kill\s+|killall\s+|pkill\s+|kill\s+-9",
            r"ps\s+aux|ps\s+-ef|top\s+|htop\s+",
            r"nice\s+|renice\s+|nohup\s+|screen\s+|tmux\s+",
            # System administration
            r"sudo\s+|su\s+|passwd\s+|useradd\s+|userdel\s+",
            r"groupadd\s+|groupdel\s+|usermod\s+|groupmod\s+",
            r"systemctl\s+|service\s+|init\s+|rc\s+|chkconfig\s+",
            r"mount\s+|umount\s+|fdisk\s+|mkfs\s+|fsck\s+",
            r"dd\s+|tar\s+|zip\s+|unzip\s+|gzip\s+|gunzip\s+",
            # Programming language execution
            r"python\s+|python3\s+|node\s+|npm\s+|pip\s+",
            r"apt\s+|yum\s+|brew\s+|pacman\s+|dnf\s+",
            r"git\s+|svn\s+|hg\s+|bzr\s+|cvs\s+",
            # Database access
            r"mysql\s+|psql\s+|sqlite3\s+|mongo\s+|redis-cli\s+",
            r"sql\s+select|sql\s+insert|sql\s+update|sql\s+delete",
            r"drop\s+table|create\s+table|alter\s+table",
            r"union\s+select|or\s+1=1|and\s+1=1",
            # Web server access
            r"apache2\s+|nginx\s+|httpd\s+|lighttpd\s+",
            r"php\s+|perl\s+|ruby\s+|java\s+|dotnet\s+",
            # Security tools
            r"nmap\s+|masscan\s+|zmap\s+|nikto\s+|sqlmap\s+",
            r"hydra\s+|john\s+|hashcat\s+|aircrack-ng\s+",
            r"wireshark\s+|tcpdump\s+|netcat\s+|socat\s+",
        ]

        import re

        for pattern in suspicious_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True

        return False

    def _validate_model_name(self, model_name: str) -> bool:
        """Validate model name for security."""
        # Allow only alphanumeric characters, hyphens, underscores, and dots
        import re

        if not re.match(r"^[a-zA-Z0-9._-]+$", model_name):
            return False

        # Prevent path traversal
        if ".." in model_name or "/" in model_name or "\\" in model_name:
            return False

        # Prevent suspicious patterns
        suspicious_patterns = [
            r"admin",
            r"root",
            r"system",
            r"test",
            r"user",
            r"guest",
            r"null",
            r"undefined",
            r"<script",
            r"javascript:",
            r"vbscript:",
            r"data:",
            r"file:",
            r"ftp:",
            r"gopher:",
            r"http:",
            r"https:",
        ]

        for pattern in suspicious_patterns:
            if re.search(pattern, model_name, re.IGNORECASE):
                return False

        return True

    def _sanitize_chat_response(self, response: Any) -> dict[str, Any]:
        """Sanitize chat response to prevent information disclosure."""
        try:
            # Convert response to dict if needed
            if hasattr(response, "dict"):
                response_dict = response.dict()
            elif hasattr(response, "__dict__"):
                response_dict = response.__dict__
            else:
                response_dict = dict(response)

            # Remove sensitive fields
            sensitive_fields = [
                "internal_state",
                "debug_info",
                "error_details",
                "stack_trace",
                "file_paths",
                "system_info",
                "environment_variables",
                "database_queries",
                "api_keys",
                "secrets",
                "tokens",
            ]

            for field in sensitive_fields:
                response_dict.pop(field, None)

            # Sanitize text fields
            text_fields = ["response", "message", "content", "text", "output"]
            for field in text_fields:
                if field in response_dict and isinstance(response_dict[field], str):
                    response_dict[field] = self._sanitize_text_content(
                        response_dict[field],
                    )

            # Sanitize metadata
            if "metadata" in response_dict:
                response_dict["metadata"] = self._sanitize_metadata(
                    response_dict["metadata"],
                )

            return response_dict

        except Exception as e:
            logger.error(f"Error sanitizing chat response: {e}")
            return {"error": "Failed to sanitize response"}

    def _sanitize_assistant_response(self, response: Any) -> dict[str, Any]:
        """Sanitize assistant response to prevent information disclosure."""
        try:
            # Convert response to dict if needed
            if hasattr(response, "dict"):
                response_dict = response.dict()
            elif hasattr(response, "__dict__"):
                response_dict = response.__dict__
            else:
                response_dict = dict(response)

            # Remove sensitive fields
            sensitive_fields = [
                "internal_state",
                "debug_info",
                "error_details",
                "stack_trace",
                "file_paths",
                "system_info",
                "environment_variables",
                "database_queries",
                "api_keys",
                "secrets",
                "tokens",
                "tool_calls",
                "function_calls",
                "execution_details",
            ]

            for field in sensitive_fields:
                response_dict.pop(field, None)

            # Sanitize text fields
            text_fields = ["response", "message", "content", "text", "output"]
            for field in text_fields:
                if field in response_dict and isinstance(response_dict[field], str):
                    response_dict[field] = self._sanitize_text_content(
                        response_dict[field],
                    )

            # Sanitize metadata
            if "metadata" in response_dict:
                response_dict["metadata"] = self._sanitize_metadata(
                    response_dict["metadata"],
                )

            return response_dict

        except Exception as e:
            logger.error(f"Error sanitizing assistant response: {e}")
            return {"error": "Failed to sanitize response"}

    def _sanitize_text_content(self, text: str) -> str:
        """Sanitize text content to prevent information disclosure."""
        try:
            # Remove file paths
            import re

            text = re.sub(r"/[^\s]*", "[PATH]", text)

            # Remove IP addresses
            text = re.sub(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", "[IP]", text)

            # Remove email addresses
            text = re.sub(
                r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
                "[EMAIL]",
                text,
            )

            # Remove tokens and keys
            text = re.sub(r"\b[A-Za-z0-9]{20,}\b", "[TOKEN]", text)

            # Remove system information
            system_patterns = [
                r"Linux\s+[^\s]+",
                r"Ubuntu\s+[^\s]+",
                r"CentOS\s+[^\s]+",
                r"Debian\s+[^\s]+",
                r"Red\s+Hat\s+[^\s]+",
                r"Fedora\s+[^\s]+",
                r"Arch\s+Linux",
                r"Gentoo\s+[^\s]+",
                r"Slackware\s+[^\s]+",
                r"FreeBSD\s+[^\s]+",
                r"OpenBSD\s+[^\s]+",
                r"NetBSD\s+[^\s]+",
                r"Darwin\s+[^\s]+",
                r"macOS\s+[^\s]+",
                r"Windows\s+[^\s]+",
            ]

            for pattern in system_patterns:
                text = re.sub(pattern, "[SYSTEM]", text, flags=re.IGNORECASE)

            return text

        except Exception as e:
            logger.error(f"Error sanitizing text content: {e}")
            return "[CONTENT_SANITIZED]"

    def _sanitize_metadata(self, metadata: Any) -> dict[str, Any]:
        """Sanitize metadata to prevent information disclosure."""
        try:
            if not isinstance(metadata, dict):
                return {}

            # Remove sensitive metadata fields
            sensitive_fields = [
                "file_paths",
                "system_info",
                "environment_variables",
                "database_queries",
                "api_keys",
                "secrets",
                "tokens",
                "internal_state",
                "debug_info",
                "error_details",
            ]

            sanitized = {}
            for key, value in metadata.items():
                if key not in sensitive_fields:
                    if isinstance(value, str):
                        sanitized[key] = self._sanitize_text_content(value)
                    else:
                        sanitized[key] = value

            return sanitized

        except Exception as e:
            logger.error(f"Error sanitizing metadata: {e}")
            return {}


def create_secure_ollama_service(ollama_service) -> SecureOllamaService:
    """Create a secure Ollama service wrapper."""
    return SecureOllamaService(ollama_service)
