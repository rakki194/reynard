#!/usr/bin/env python3
"""Test script for uvicorn reload functionality
Demonstrates how to test reload behavior programmatically
"""

import os
import subprocess
import sys
import time

import requests


class ReloadTester:
    """Test uvicorn reload functionality"""

    def __init__(self, host: str = "localhost", port: int = 8000):
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}"
        self.process: subprocess.Popen | None = None
        self.start_time: float | None = None

    def start_server(self) -> bool:
        """Start the uvicorn server with reload enabled"""
        print("[INFO] Starting uvicorn server with reload...")

        try:
            # Start server with reload
            self.process = subprocess.Popen(
                [
                    sys.executable,
                    "-m",
                    "uvicorn",
                    "main:app",
                    "--host",
                    self.host,
                    "--port",
                    str(self.port),
                    "--reload",
                    "--reload-dir",
                    ".",
                    "--log-level",
                    "info",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            self.start_time = time.time()

            # Wait for server to start
            if self._wait_for_server():
                print("[OK] Server started successfully")
                return True
            print("[FAIL] Server failed to start")
            return False

        except Exception as e:
            print(f"[FAIL] Error starting server: {e}")
            return False

    def stop_server(self):
        """Stop the uvicorn server"""
        if self.process:
            print("[INFO] Stopping server...")
            self.process.terminate()
            try:
                self.process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                print("[WARN] Server didn't stop gracefully, killing...")
                self.process.kill()
                self.process.wait()
            print("[OK] Server stopped")

    def _wait_for_server(self, timeout: int = 30) -> bool:
        """Wait for server to be ready"""
        start_time = time.time()

        while time.time() - start_time < timeout:
            try:
                response = requests.get(f"{self.base_url}/api/health/simple", timeout=1)
                if response.status_code == 200:
                    return True
            except requests.exceptions.RequestException:
                pass

            time.sleep(0.5)

        return False

    def test_basic_endpoints(self) -> bool:
        """Test basic endpoints are working"""
        print("[INFO] Testing basic endpoints...")

        endpoints = [
            ("/", "Root endpoint"),
            ("/api/health/simple", "Simple health check"),
            ("/api/system", "System info"),
            ("/api/health", "Full health check"),
        ]

        for endpoint, description in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=5)
                if response.status_code == 200:
                    print(f"  [OK] {description}: OK")
                else:
                    print(f"  [FAIL] {description}: HTTP {response.status_code}")
                    return False
            except requests.exceptions.RequestException as e:
                print(f"  [FAIL] {description}: {e}")
                return False

        return True

    def test_reload_detection(self) -> bool:
        """Test that reload mode is detected correctly"""
        print("[INFO] Testing reload mode detection...")

        try:
            response = requests.get(f"{self.base_url}/api/system", timeout=5)
            if response.status_code == 200:
                data = response.json()
                reload_mode = data.get("reload_mode", False)

                if reload_mode:
                    print("  [OK] Reload mode detected correctly")
                    return True
                print("  [FAIL] Reload mode not detected")
                return False
            print(f"  [FAIL] Failed to get system info: HTTP {response.status_code}")
            return False
        except requests.exceptions.RequestException as e:
            print(f"  [FAIL] Error testing reload detection: {e}")
            return False

    def test_service_status(self) -> bool:
        """Test service status endpoints"""
        print("[INFO] Testing service status...")

        try:
            response = requests.get(f"{self.base_url}/api/health/services", timeout=5)
            if response.status_code == 200:
                data = response.json()

                services = ["database", "cache", "background"]
                for service in services:
                    if service in data:
                        status = data[service]["status"]
                        print(f"  [OK] {service} service: {status}")
                    else:
                        print(f"  [FAIL] {service} service: not found")
                        return False

                return True
            print(f"  [FAIL] Failed to get service status: HTTP {response.status_code}")
            return False
        except requests.exceptions.RequestException as e:
            print(f"  [FAIL] Error testing service status: {e}")
            return False

    def simulate_file_change(self) -> bool:
        """Simulate a file change to trigger reload"""
        print("[INFO] Simulating file change...")

        # Create a temporary file to trigger reload
        temp_file = "temp_trigger.py"

        try:
            with open(temp_file, "w") as f:
                f.write("# Temporary file to trigger reload\n")
                f.write(f"# Created at: {time.time()}\n")

            # Wait a moment for reload to trigger
            time.sleep(2)

            # Check if server is still responding
            response = requests.get(f"{self.base_url}/api/health/simple", timeout=5)
            if response.status_code == 200:
                print("  [OK] Server responded after file change")

                # Clean up temp file
                os.remove(temp_file)
                return True
            print(
                f"  [FAIL] Server not responding after file change: HTTP {response.status_code}",
            )
            return False

        except Exception as e:
            print(f"  [FAIL] Error simulating file change: {e}")
            # Clean up temp file if it exists
            if os.path.exists(temp_file):
                os.remove(temp_file)
            return False

    def run_performance_test(self) -> bool:
        """Run a simple performance test"""
        print("[INFO] Running performance test...")

        try:
            start_time = time.time()
            success_count = 0
            total_requests = 10

            for i in range(total_requests):
                try:
                    response = requests.get(
                        f"{self.base_url}/api/health/simple",
                        timeout=2,
                    )
                    if response.status_code == 200:
                        success_count += 1
                except requests.exceptions.RequestException:
                    pass

            end_time = time.time()
            duration = end_time - start_time
            success_rate = (success_count / total_requests) * 100

            print(
                f"  [INFO] Results: {success_count}/{total_requests} requests successful",
            )
            print(f"  [INFO] Duration: {duration:.2f}s")
            print(f"  [INFO] Success rate: {success_rate:.1f}%")

            return success_rate >= 80  # 80% success rate threshold

        except Exception as e:
            print(f"  [FAIL] Error running performance test: {e}")
            return False

    def run_all_tests(self) -> bool:
        """Run all tests"""
        print("[INFO] Starting uvicorn reload tests...")
        print("=" * 50)

        if not self.start_server():
            return False

        try:
            tests = [
                ("Basic Endpoints", self.test_basic_endpoints),
                ("Reload Detection", self.test_reload_detection),
                ("Service Status", self.test_service_status),
                ("File Change Simulation", self.simulate_file_change),
                ("Performance Test", self.run_performance_test),
            ]

            passed = 0
            total = len(tests)

            for test_name, test_func in tests:
                print(f"\n[INFO] Running: {test_name}")
                if test_func():
                    passed += 1
                    print(f"[OK] {test_name}: PASSED")
                else:
                    print(f"[FAIL] {test_name}: FAILED")

            print("\n" + "=" * 50)
            print(f"[INFO] Test Results: {passed}/{total} tests passed")

            if passed == total:
                print("[OK] All tests passed!")
                return True
            print("[WARN] Some tests failed")
            return False

        finally:
            self.stop_server()


def main():
    """Main function"""
    print("[INFO] Reynard Basic Backend - Uvicorn Reload Test")
    print("=" * 50)

    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print(
            "[FAIL] Error: main.py not found. Please run this script from the basic-backend directory.",
        )
        sys.exit(1)

    # Run tests
    tester = ReloadTester()
    success = tester.run_all_tests()

    if success:
        print("\n[OK] All tests completed successfully!")
        sys.exit(0)
    else:
        print("\n[FAIL] Some tests failed. Check the output above for details.")
        sys.exit(1)


if __name__ == "__main__":
    main()
