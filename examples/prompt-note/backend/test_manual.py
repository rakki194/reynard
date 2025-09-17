#!/usr/bin/env python3
"""
Manual test script for uvicorn reload functionality
Provides interactive testing of reload behavior
"""

import os
import sys
import time

import requests


class ManualReloadTester:
    """Interactive manual testing for uvicorn reload"""

    def __init__(self, host: str = "localhost", port: int = 8000):
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}"

    def check_server_status(self) -> bool:
        """Check if server is running"""
        try:
            response = requests.get(f"{self.base_url}/api/health/simple", timeout=2)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False

    def wait_for_server(self, timeout: int = 30) -> bool:
        """Wait for server to be ready"""
        print("[INFO] Waiting for server to be ready...")

        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.check_server_status():
                print("[OK] Server is ready!")
                return True
            time.sleep(1)

        print("[FAIL] Server not ready after timeout")
        return False

    def test_endpoint(self, endpoint: str, description: str) -> bool:
        """Test a specific endpoint"""
        try:
            print(f"[INFO] Testing: {description}")
            response = requests.get(f"{self.base_url}{endpoint}", timeout=5)

            if response.status_code == 200:
                print(f"  [OK] {description}: OK")
                return True
            print(f"  [FAIL] {description}: HTTP {response.status_code}")
            return False
        except requests.exceptions.RequestException as e:
            print(f"  [FAIL] {description}: {e}")
            return False

    def show_system_info(self):
        """Show system information"""
        try:
            response = requests.get(f"{self.base_url}/api/system", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("\n[INFO] System Information:")
                print(f"  [INFO] Reload Mode: {data.get('reload_mode', 'Unknown')}")
                print("  [INFO] Services:")
                for service, status in data.get("services", {}).items():
                    available = status.get("available", False)
                    print(f"    - {service}: {'[OK]' if available else '[FAIL]'}")
                print("  [INFO] Environment:")
                for key, value in data.get("environment", {}).items():
                    print(f"    - {key}: {value}")
            else:
                print("[FAIL] Failed to get system information")
        except requests.exceptions.RequestException as e:
            print(f"[FAIL] Error getting system information: {e}")

    def show_health_status(self):
        """Show health status"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("\n[INFO] Health Status:")
                print(f"  [INFO] Overall Status: {data.get('status', 'Unknown')}")
                print(f"  [INFO] Uptime: {data.get('uptime', 0):.2f}s")
                print("  [INFO] Services:")
                for service, info in data.get("services", {}).items():
                    status = info.get("status", "Unknown")
                    print(f"    - {service}: {status}")
            else:
                print("[FAIL] Failed to get health status")
        except requests.exceptions.RequestException as e:
            print(f"[FAIL] Error getting health status: {e}")

    def create_test_file(self) -> str:
        """Create a test file to trigger reload"""
        test_file = "test_reload_trigger.py"
        timestamp = time.time()

        with open(test_file, "w") as f:
            f.write(f"# Test file created at {timestamp}\n")
            f.write("# This file will trigger uvicorn reload\n")
            f.write("print('Reload triggered!')\n")

        return test_file

    def delete_test_file(self, filename: str):
        """Delete test file"""
        if os.path.exists(filename):
            os.remove(filename)
            print(f"[INFO] Deleted test file: {filename}")

    def interactive_menu(self):
        """Show interactive menu"""
        while True:
            print("\n" + "=" * 50)
            print("[INFO] Reynard Basic Backend - Manual Reload Test")
            print("=" * 50)
            print("1. Check server status")
            print("2. Show system information")
            print("3. Show health status")
            print("4. Test basic endpoints")
            print("5. Test authentication endpoints")
            print("6. Test user management endpoints")
            print("7. Trigger reload (create test file)")
            print("8. Monitor reload behavior")
            print("9. Performance test")
            print("0. Exit")
            print("-" * 50)

            choice = input("Enter your choice (0-9): ").strip()

            if choice == "0":
                print("[INFO] Goodbye!")
                break
            if choice == "1":
                if self.check_server_status():
                    print("[OK] Server is running and responding")
                else:
                    print("[FAIL] Server is not responding")
            elif choice == "2":
                self.show_system_info()
            elif choice == "3":
                self.show_health_status()
            elif choice == "4":
                self.test_basic_endpoints()
            elif choice == "5":
                self.test_auth_endpoints()
            elif choice == "6":
                self.test_user_endpoints()
            elif choice == "7":
                self.trigger_reload()
            elif choice == "8":
                self.monitor_reload()
            elif choice == "9":
                self.performance_test()
            else:
                print("[FAIL] Invalid choice. Please try again.")

    def test_basic_endpoints(self):
        """Test basic endpoints"""
        print("\n[INFO] Testing Basic Endpoints:")
        endpoints = [
            ("/", "Root endpoint"),
            ("/api/health/simple", "Simple health check"),
            ("/api/system", "System info"),
            ("/api/health", "Full health check"),
            ("/api/health/ready", "Readiness check"),
            ("/api/health/live", "Liveness check"),
        ]

        for endpoint, description in endpoints:
            self.test_endpoint(endpoint, description)

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n[INFO] Testing Authentication Endpoints:")
        endpoints = [
            ("/api/auth/users", "List users (requires auth)"),
        ]

        for endpoint, description in endpoints:
            self.test_endpoint(endpoint, description)

    def test_user_endpoints(self):
        """Test user management endpoints"""
        print("\n[INFO] Testing User Management Endpoints:")
        endpoints = [
            ("/api/users/", "List users"),
            ("/api/users/stats/overview", "User statistics"),
        ]

        for endpoint, description in endpoints:
            self.test_endpoint(endpoint, description)

    def trigger_reload(self):
        """Trigger reload by creating a test file"""
        print("\n[INFO] Triggering reload...")

        test_file = self.create_test_file()
        print(f"[INFO] Created test file: {test_file}")
        print("[INFO] Waiting for reload to complete...")

        # Wait a moment for reload
        time.sleep(3)

        # Check if server is still responding
        if self.check_server_status():
            print("[OK] Server is responding after reload")
        else:
            print("[FAIL] Server is not responding after reload")

        # Clean up
        self.delete_test_file(test_file)

    def monitor_reload(self):
        """Monitor reload behavior"""
        print("\n[INFO] Monitoring reload behavior...")
        print("Press Ctrl+C to stop monitoring")

        try:
            while True:
                if self.check_server_status():
                    print(f"[OK] Server OK - {time.strftime('%H:%M:%S')}")
                else:
                    print(f"[FAIL] Server DOWN - {time.strftime('%H:%M:%S')}")

                time.sleep(2)
        except KeyboardInterrupt:
            print("\n[INFO] Monitoring stopped")

    def performance_test(self):
        """Run performance test"""
        print("\n[INFO] Running Performance Test...")

        try:
            start_time = time.time()
            success_count = 0
            total_requests = 20

            for i in range(total_requests):
                try:
                    response = requests.get(
                        f"{self.base_url}/api/health/simple", timeout=2
                    )
                    if response.status_code == 200:
                        success_count += 1
                except requests.exceptions.RequestException:
                    pass

            end_time = time.time()
            duration = end_time - start_time
            success_rate = (success_count / total_requests) * 100

            print("[INFO] Results:")
            print(f"  - Requests: {success_count}/{total_requests}")
            print(f"  - Duration: {duration:.2f}s")
            print(f"  - Success Rate: {success_rate:.1f}%")
            print(f"  - Requests/sec: {total_requests/duration:.1f}")

        except Exception as e:
            print(f"[FAIL] Error running performance test: {e}")


def main():
    """Main function"""
    print("[INFO] Reynard Basic Backend - Manual Reload Test")
    print("Make sure the server is running with: python main.py")
    print("=" * 50)

    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print(
            "[FAIL] Error: main.py not found. Please run this script from the basic-backend directory."
        )
        sys.exit(1)

    # Create tester and run interactive menu
    tester = ManualReloadTester()

    if not tester.wait_for_server():
        print("[FAIL] Server is not running. Please start it with: python main.py")
        sys.exit(1)

    tester.interactive_menu()


if __name__ == "__main__":
    main()
