#!/usr/bin/env python3
"""🦊 Fenrir Comprehensive Attack Suite Runner
==========================================

Main runner for the Fenrir MCP server and network attack suite.
This script orchestrates all attack vectors and provides comprehensive security testing.

Attack Suites:
1. MCP Server Attacks (Authentication, JWT, Configuration)
2. Network Attacks (Port Scanning, Protocol Exploitation, Service Enumeration)
3. Backend Integration Attacks (FastAPI, Database, Redis)
4. Security Validation (Rate Limiting, Input Validation, Authorization)

Author: Odonata-Oracle-6 (Dragonfly Specialist)
Version: 1.0.0
"""

import asyncio
import json
import logging
import sys
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

# Import attack modules
from exploits.mcp_server_attacks import MCPServerAttacker
from exploits.network_attacks import NetworkAttacker

logger = logging.getLogger(__name__)


class FenrirAttackOrchestrator:
    """Orchestrates all Fenrir attack suites."""

    def __init__(self):
        """Initialize the attack orchestrator."""
        self.start_time = time.time()
        self.attack_results = {}
        self.total_attacks = 0
        self.total_successful = 0

    def log_banner(self):
        """Log the Fenrir attack suite banner."""
        banner = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🦊 FENRIR MCP SERVER & NETWORK ATTACK SUITE                                ║
║                                                                              ║
║  Comprehensive Security Testing for Reynard MCP Server and Backend          ║
║                                                                              ║
║  Attack Vectors:                                                             ║
║  • MCP Server Authentication & JWT Exploitation                             ║
║  • TCP Socket Communication & JSON-RPC Protocol Attacks                     ║
║  • FastAPI Backend Integration & Configuration Manipulation                 ║
║  • Network Protocol Exploitation & Service Enumeration                      ║
║  • Rate Limiting Bypass & Input Validation Testing                          ║
║                                                                              ║
║  Author: Odonata-Oracle-6 (Dragonfly Specialist)                            ║
║  Version: 1.0.0                                                             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
        """
        logger.info(banner)

    async def run_mcp_server_attacks(self) -> Dict[str, Any]:
        """Run MCP server attack suite."""
        logger.info("\n🔍 Starting MCP Server Attack Suite...")
        logger.info("=" * 60)

        try:
            attacker = MCPServerAttacker()
            results = await attacker.run_all_attacks()

            self.attack_results["mcp_server_attacks"] = results
            self.total_attacks += results["total_attacks"]
            self.total_successful += results["successful_attacks"]

            return results

        except Exception as e:
            logger.error(f"❌ MCP Server attacks failed: {e}")
            return {
                "total_attacks": 0,
                "successful_attacks": 0,
                "failed_attacks": 0,
                "success_rate": 0,
                "error": str(e)
            }

    async def run_network_attacks(self) -> Dict[str, Any]:
        """Run network attack suite."""
        logger.info("\n🔍 Starting Network Attack Suite...")
        logger.info("=" * 60)

        try:
            attacker = NetworkAttacker()
            results = await attacker.run_all_network_attacks()

            self.attack_results["network_attacks"] = results
            self.total_attacks += results["total_attacks"]
            self.total_successful += results["successful_attacks"]

            return results

        except Exception as e:
            logger.error(f"❌ Network attacks failed: {e}")
            return {
                "total_attacks": 0,
                "successful_attacks": 0,
                "failed_attacks": 0,
                "success_rate": 0,
                "error": str(e)
            }

    async def run_backend_integration_attacks(self) -> Dict[str, Any]:
        """Run backend integration attack suite."""
        logger.info("\n🔍 Starting Backend Integration Attack Suite...")
        logger.info("=" * 60)

        results = {
            "total_attacks": 0,
            "successful_attacks": 0,
            "failed_attacks": 0,
            "success_rate": 0,
            "results": []
        }

        # Attack 1: Database connection exploitation
        try:
            import psycopg2

            # Try to connect to databases with default credentials
            databases = [
                ("reynard", "postgres", "password"),
                ("reynard_auth", "postgres", "password"),
                ("reynard_ecs", "postgres", "password"),
                ("reynard_keys", "postgres", "password"),
            ]

            for db_name, username, password in databases:
                try:
                    conn = psycopg2.connect(
                        host="localhost",
                        database=db_name,
                        user=username,
                        password=password,
                        port=5432
                    )
                    conn.close()

                    results["results"].append({
                        "attack": f"database_access_{db_name}",
                        "success": True,
                        "details": f"Successfully connected to {db_name} database"
                    })
                    results["successful_attacks"] += 1

                except Exception as e:
                    results["results"].append({
                        "attack": f"database_access_{db_name}",
                        "success": False,
                        "details": f"Failed to connect to {db_name}: {e}"
                    })
                    results["failed_attacks"] += 1

                results["total_attacks"] += 1

        except ImportError:
            logger.warning("psycopg2 not available, skipping database attacks")
        except Exception as e:
            logger.error(f"Database attacks failed: {e}")

        # Attack 2: Redis connection exploitation
        try:
            import redis

            r = redis.Redis(host='localhost', port=6379, db=0)
            r.ping()

            results["results"].append({
                "attack": "redis_access",
                "success": True,
                "details": "Successfully connected to Redis"
            })
            results["successful_attacks"] += 1

        except ImportError:
            logger.warning("redis not available, skipping Redis attacks")
        except Exception as e:
            results["results"].append({
                "attack": "redis_access",
                "success": False,
                "details": f"Failed to connect to Redis: {e}"
            })
            results["failed_attacks"] += 1

        results["total_attacks"] += 1

        # Calculate success rate
        if results["total_attacks"] > 0:
            results["success_rate"] = (results["successful_attacks"] / results["total_attacks"]) * 100

        self.attack_results["backend_integration_attacks"] = results
        self.total_attacks += results["total_attacks"]
        self.total_successful += results["successful_attacks"]

        return results

    async def run_security_validation_attacks(self) -> Dict[str, Any]:
        """Run security validation attack suite."""
        logger.info("\n🔍 Starting Security Validation Attack Suite...")
        logger.info("=" * 60)

        results = {
            "total_attacks": 0,
            "successful_attacks": 0,
            "failed_attacks": 0,
            "success_rate": 0,
            "results": []
        }

        # Attack 1: Input validation testing
        import requests

        malicious_inputs = [
            "<script>alert('xss')</script>",
            "'; DROP TABLE users; --",
            "../../../etc/passwd",
            "{{7*7}}",
            "${7*7}",
            "{{config}}",
            "{{request}}",
            "{{self.__init__.__globals__.__builtins__.__import__('os').popen('id').read()}}"
        ]

        for payload in malicious_inputs:
            try:
                response = requests.post(
                    "http://localhost:8000/api/mcp/bootstrap/authenticate",
                    json={
                        "client_id": payload,
                        "client_secret": "test",
                        "client_type": "agent",
                        "permissions": ["mcp:read"]
                    },
                    timeout=5
                )

                # Check if payload was reflected or executed
                response_text = response.text.lower()
                payload_reflected = payload.lower() in response_text

                results["results"].append({
                    "attack": f"input_validation_{payload[:20].replace(' ', '_')}",
                    "success": payload_reflected,
                    "details": f"Input validation test: {payload[:50]}...",
                    "payload_reflected": payload_reflected,
                    "status_code": response.status_code
                })

                if payload_reflected:
                    results["successful_attacks"] += 1
                else:
                    results["failed_attacks"] += 1

                results["total_attacks"] += 1

            except Exception as e:
                results["results"].append({
                    "attack": f"input_validation_{payload[:20].replace(' ', '_')}",
                    "success": False,
                    "details": f"Input validation test failed: {e}",
                    "error": str(e)
                })
                results["failed_attacks"] += 1
                results["total_attacks"] += 1

        # Calculate success rate
        if results["total_attacks"] > 0:
            results["success_rate"] = (results["successful_attacks"] / results["total_attacks"]) * 100

        self.attack_results["security_validation_attacks"] = results
        self.total_attacks += results["total_attacks"]
        self.total_successful += results["successful_attacks"]

        return results

    def generate_attack_report(self) -> Dict[str, Any]:
        """Generate comprehensive attack report."""
        end_time = time.time()
        duration = end_time - self.start_time

        overall_success_rate = (self.total_successful / self.total_attacks) * 100 if self.total_attacks > 0 else 0

        report = {
            "fenrir_attack_report": {
                "metadata": {
                    "timestamp": datetime.now().isoformat(),
                    "duration_seconds": round(duration, 2),
                    "total_attack_suites": len(self.attack_results),
                    "total_attacks": self.total_attacks,
                    "total_successful_attacks": self.total_successful,
                    "total_failed_attacks": self.total_attacks - self.total_successful,
                    "overall_success_rate": round(overall_success_rate, 2)
                },
                "attack_suites": self.attack_results,
                "security_assessment": {
                    "risk_level": self._assess_risk_level(overall_success_rate),
                    "recommendations": self._generate_recommendations(),
                    "critical_vulnerabilities": self._identify_critical_vulnerabilities()
                }
            }
        }

        return report

    def _assess_risk_level(self, success_rate: float) -> str:
        """Assess overall risk level based on attack success rate."""
        if success_rate >= 50:
            return "CRITICAL"
        elif success_rate >= 25:
            return "HIGH"
        elif success_rate >= 10:
            return "MEDIUM"
        elif success_rate > 0:
            return "LOW"
        else:
            return "MINIMAL"

    def _generate_recommendations(self) -> List[str]:
        """Generate security recommendations based on attack results."""
        recommendations = []

        for suite_name, suite_results in self.attack_results.items():
            if suite_results.get("successful_attacks", 0) > 0:
                if "mcp_server" in suite_name:
                    recommendations.extend([
                        "Implement proper JWT token validation with signature verification",
                        "Add rate limiting to MCP authentication endpoints",
                        "Validate all JSON-RPC requests before processing",
                        "Implement proper error handling to prevent information disclosure"
                    ])
                elif "network" in suite_name:
                    recommendations.extend([
                        "Implement proper network access controls",
                        "Add input validation for all network protocols",
                        "Implement proper error handling for malformed requests",
                        "Add monitoring for suspicious network activity"
                    ])
                elif "backend_integration" in suite_name:
                    recommendations.extend([
                        "Secure database connections with proper authentication",
                        "Implement database access controls and permissions",
                        "Add monitoring for database access attempts",
                        "Use connection pooling with proper security"
                    ])
                elif "security_validation" in suite_name:
                    recommendations.extend([
                        "Implement comprehensive input validation",
                        "Add output encoding to prevent XSS",
                        "Implement proper SQL injection prevention",
                        "Add security headers to all HTTP responses"
                    ])

        # Remove duplicates
        return list(set(recommendations))

    def _identify_critical_vulnerabilities(self) -> List[Dict[str, Any]]:
        """Identify critical vulnerabilities from attack results."""
        critical_vulns = []

        for suite_name, suite_results in self.attack_results.items():
            for result in suite_results.get("results", []):
                if result.get("success", False):
                    attack_name = result.get("attack", "unknown")

                    # Identify critical attack types
                    if any(keyword in attack_name.lower() for keyword in [
                        "jwt", "token", "authentication", "admin", "database", "sql", "xss", "injection"
                    ]):
                        critical_vulns.append({
                            "suite": suite_name,
                            "attack": attack_name,
                            "details": result.get("details", ""),
                            "severity": "HIGH" if "admin" in attack_name or "database" in attack_name else "MEDIUM"
                        })

        return critical_vulns

    async def run_all_attacks(self) -> Dict[str, Any]:
        """Run all attack suites."""
        self.log_banner()

        logger.info(f"🚀 Starting Fenrir attack suite at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 80)

        # Run all attack suites
        await self.run_mcp_server_attacks()
        await self.run_network_attacks()
        await self.run_backend_integration_attacks()
        await self.run_security_validation_attacks()

        # Generate final report
        report = self.generate_attack_report()

        # Log summary
        logger.info("\n" + "=" * 80)
        logger.info("🦊 FENRIR ATTACK SUITE COMPLETE")
        logger.info("=" * 80)
        logger.info(f"Total Attack Suites: {len(self.attack_results)}")
        logger.info(f"Total Attacks: {self.total_attacks}")
        logger.info(f"Successful Attacks: {self.total_successful}")
        logger.info(f"Failed Attacks: {self.total_attacks - self.total_successful}")
        logger.info(f"Overall Success Rate: {(self.total_successful / self.total_attacks) * 100:.1f}%")
        logger.info(f"Risk Level: {report['fenrir_attack_report']['security_assessment']['risk_level']}")
        logger.info(f"Duration: {report['fenrir_attack_report']['metadata']['duration_seconds']} seconds")

        if self.total_successful > 0:
            logger.warning("⚠️  SECURITY VULNERABILITIES DETECTED!")
            logger.warning("Review the detailed report and implement recommended fixes.")
        else:
            logger.info("✅ No security vulnerabilities detected in the tested attack vectors.")

        return report


async def main():
    """Main entry point for Fenrir attack suite."""
    orchestrator = FenrirAttackOrchestrator()
    report = await orchestrator.run_all_attacks()

    # Save comprehensive report
    report_file = f"/tmp/fenrir_comprehensive_attack_report_{int(time.time())}.json"
    with open(report_file, "w") as f:
        json.dump(report, f, indent=2)

    logger.info(f"📊 Comprehensive attack report saved to {report_file}")

    return report


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("\n🛑 Attack suite interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Attack suite failed: {e}")
        sys.exit(1)
