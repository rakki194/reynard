"""
Performance Monitor

Provides performance monitoring and analysis for the Success-Advisor-8
distillation system including build time, test execution, and resource usage.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import asyncio
import subprocess
import time
import psutil
import os
from typing import Dict, Any, Optional, List
from pathlib import Path
from datetime import datetime

from ..utils.logging import PhoenixLogger


class PerformanceMonitor:
    """
    Performance monitoring system.

    Provides comprehensive performance analysis including build time,
    test execution, memory usage, and resource monitoring.
    """

    def __init__(self):
        """Initialize performance monitor."""
        self.logger = PhoenixLogger("performance_monitor")
        self.benchmarks = {
            "build_time": 300,  # 5 minutes
            "test_time": 600,  # 10 minutes
            "memory_usage": 2048,  # 2GB
            "bundle_size": 1024,  # 1MB
            "startup_time": 3,  # 3 seconds
        }

        self.logger.info("Performance monitor initialized", "initialization")

    async def run_performance_analysis(self) -> Dict[str, Any]:
        """
        Run comprehensive performance analysis.

        Returns:
            Performance analysis results
        """
        self.logger.info(
            "Running comprehensive performance analysis", "performance_analysis"
        )

        results = {
            "overall_status": "passed",
            "build_performance": {},
            "test_performance": {},
            "memory_usage": {},
            "bundle_analysis": {},
            "startup_performance": {},
            "recommendations": [],
        }

        try:
            # Build performance analysis
            build_results = await self._analyze_build_performance()
            results["build_performance"] = build_results

            # Test performance analysis
            test_results = await self._analyze_test_performance()
            results["test_performance"] = test_results

            # Memory usage analysis
            memory_results = await self._analyze_memory_usage()
            results["memory_usage"] = memory_results

            # Bundle size analysis
            bundle_results = await self._analyze_bundle_size()
            results["bundle_analysis"] = bundle_results

            # Startup performance analysis
            startup_results = await self._analyze_startup_performance()
            results["startup_performance"] = startup_results

            # Generate recommendations
            recommendations = await self._generate_recommendations(results)
            results["recommendations"] = recommendations

            # Determine overall status
            if any(
                result.get("status") == "failed"
                for result in [
                    build_results,
                    test_results,
                    memory_results,
                    bundle_results,
                    startup_results,
                ]
            ):
                results["overall_status"] = "failed"
                self.logger.error(
                    "Performance analysis found issues", "performance_analysis"
                )
            else:
                self.logger.success(
                    "Performance analysis passed", "performance_analysis"
                )

        except Exception as e:
            results["overall_status"] = "error"
            results["error"] = str(e)
            self.logger.error(
                f"Performance analysis failed: {e}", "performance_analysis"
            )

        return results

    async def _analyze_build_performance(self) -> Dict[str, Any]:
        """
        Analyze build performance.

        Returns:
            Build performance results
        """
        try:
            if not Path("package.json").exists():
                return {"status": "skipped", "reason": "No package.json found"}

            # Check if build script exists
            import json

            with open("package.json", "r") as f:
                package_data = json.load(f)

            if "scripts" not in package_data or "build" not in package_data["scripts"]:
                return {"status": "skipped", "reason": "No build script found"}

            # Run build and measure time
            start_time = time.time()

            result = subprocess.run(
                ["npm", "run", "build"],
                capture_output=True,
                text=True,
                timeout=self.benchmarks["build_time"] + 60,  # Add 1 minute buffer
            )

            end_time = time.time()
            build_time = end_time - start_time

            if result.returncode == 0:
                status = (
                    "passed"
                    if build_time <= self.benchmarks["build_time"]
                    else "warning"
                )
                return {
                    "status": status,
                    "build_time": round(build_time, 2),
                    "benchmark": self.benchmarks["build_time"],
                    "output": result.stdout[-500:],  # Last 500 characters
                    "message": f"Build completed in {build_time:.2f}s",
                }
            else:
                return {
                    "status": "failed",
                    "build_time": round(build_time, 2),
                    "error": result.stderr,
                    "message": "Build failed",
                }

        except subprocess.TimeoutExpired:
            return {
                "status": "failed",
                "build_time": self.benchmarks["build_time"] + 60,
                "error": "Build timed out",
                "message": "Build exceeded time limit",
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def _analyze_test_performance(self) -> Dict[str, Any]:
        """
        Analyze test execution performance.

        Returns:
            Test performance results
        """
        try:
            if not Path("package.json").exists():
                return {"status": "skipped", "reason": "No package.json found"}

            # Check if test script exists
            import json

            with open("package.json", "r") as f:
                package_data = json.load(f)

            test_scripts = ["test", "test:unit", "test:integration", "test:e2e"]
            test_script = None

            for script in test_scripts:
                if "scripts" in package_data and script in package_data["scripts"]:
                    test_script = script
                    break

            if not test_script:
                return {"status": "skipped", "reason": "No test script found"}

            # Run tests and measure time
            start_time = time.time()

            result = subprocess.run(
                ["npm", "run", test_script],
                capture_output=True,
                text=True,
                timeout=self.benchmarks["test_time"] + 120,  # Add 2 minute buffer
            )

            end_time = time.time()
            test_time = end_time - start_time

            if result.returncode == 0:
                status = (
                    "passed" if test_time <= self.benchmarks["test_time"] else "warning"
                )
                return {
                    "status": status,
                    "test_time": round(test_time, 2),
                    "benchmark": self.benchmarks["test_time"],
                    "script": test_script,
                    "output": result.stdout[-500:],  # Last 500 characters
                    "message": f"Tests completed in {test_time:.2f}s",
                }
            else:
                return {
                    "status": "failed",
                    "test_time": round(test_time, 2),
                    "script": test_script,
                    "error": result.stderr,
                    "message": "Tests failed",
                }

        except subprocess.TimeoutExpired:
            return {
                "status": "failed",
                "test_time": self.benchmarks["test_time"] + 120,
                "error": "Tests timed out",
                "message": "Tests exceeded time limit",
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def _analyze_memory_usage(self) -> Dict[str, Any]:
        """
        Analyze memory usage during operations.

        Returns:
            Memory usage results
        """
        try:
            # Get current memory usage
            process = psutil.Process()
            memory_info = process.memory_info()
            memory_mb = memory_info.rss / 1024 / 1024

            # Get system memory info
            system_memory = psutil.virtual_memory()

            status = (
                "passed" if memory_mb <= self.benchmarks["memory_usage"] else "warning"
            )

            return {
                "status": status,
                "current_memory_mb": round(memory_mb, 2),
                "benchmark_mb": self.benchmarks["memory_usage"],
                "system_total_mb": round(system_memory.total / 1024 / 1024, 2),
                "system_available_mb": round(system_memory.available / 1024 / 1024, 2),
                "system_usage_percent": system_memory.percent,
                "message": f"Current memory usage: {memory_mb:.2f}MB",
            }

        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def _analyze_bundle_size(self) -> Dict[str, Any]:
        """
        Analyze bundle size for frontend projects.

        Returns:
            Bundle size results
        """
        try:
            if not Path("package.json").exists():
                return {"status": "skipped", "reason": "No package.json found"}

            # Look for common build output directories
            build_dirs = ["dist", "build", "out", "public"]
            bundle_files = []

            for build_dir in build_dirs:
                if Path(build_dir).exists():
                    for file_path in Path(build_dir).glob("**/*.{js,css,html}"):
                        if file_path.is_file():
                            bundle_files.append(file_path)

            if not bundle_files:
                return {"status": "skipped", "reason": "No bundle files found"}

            # Calculate total bundle size
            total_size = 0
            file_sizes = []

            for file_path in bundle_files:
                file_size = file_path.stat().st_size
                total_size += file_size
                file_sizes.append(
                    {
                        "file": str(file_path),
                        "size_mb": round(file_size / 1024 / 1024, 2),
                    }
                )

            total_size_mb = total_size / 1024 / 1024
            status = (
                "passed"
                if total_size_mb <= self.benchmarks["bundle_size"]
                else "warning"
            )

            return {
                "status": status,
                "total_size_mb": round(total_size_mb, 2),
                "benchmark_mb": self.benchmarks["bundle_size"],
                "file_count": len(bundle_files),
                "files": file_sizes,
                "message": f"Total bundle size: {total_size_mb:.2f}MB",
            }

        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def _analyze_startup_performance(self) -> Dict[str, Any]:
        """
        Analyze startup performance for applications.

        Returns:
            Startup performance results
        """
        try:
            # This is a simplified startup test
            # In a real implementation, you would start the application and measure startup time

            # For now, we'll simulate startup time based on project complexity
            project_files = list(Path(".").glob("**/*.{js,ts,tsx,jsx,py}"))
            file_count = len(
                [
                    f
                    for f in project_files
                    if not any(
                        skip in str(f)
                        for skip in ["node_modules", ".git", "__pycache__"]
                    )
                ]
            )

            # Estimate startup time based on file count (very rough approximation)
            estimated_startup_time = min(file_count * 0.01, 10)  # Max 10 seconds

            status = (
                "passed"
                if estimated_startup_time <= self.benchmarks["startup_time"]
                else "warning"
            )

            return {
                "status": status,
                "estimated_startup_time": round(estimated_startup_time, 2),
                "benchmark": self.benchmarks["startup_time"],
                "file_count": file_count,
                "message": f"Estimated startup time: {estimated_startup_time:.2f}s",
            }

        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def _generate_recommendations(self, results: Dict[str, Any]) -> List[str]:
        """
        Generate performance recommendations based on analysis results.

        Args:
            results: Performance analysis results

        Returns:
            List of recommendations
        """
        recommendations = []

        # Build performance recommendations
        build_perf = results.get("build_performance", {})
        if build_perf.get("status") == "warning":
            recommendations.append(
                "Consider optimizing build process - build time exceeds benchmark"
            )

        # Test performance recommendations
        test_perf = results.get("test_performance", {})
        if test_perf.get("status") == "warning":
            recommendations.append(
                "Consider optimizing test suite - test execution time exceeds benchmark"
            )

        # Memory usage recommendations
        memory_usage = results.get("memory_usage", {})
        if memory_usage.get("status") == "warning":
            recommendations.append(
                "Consider optimizing memory usage - current usage exceeds benchmark"
            )

        # Bundle size recommendations
        bundle_analysis = results.get("bundle_analysis", {})
        if bundle_analysis.get("status") == "warning":
            recommendations.append(
                "Consider optimizing bundle size - current size exceeds benchmark"
            )

        # Startup performance recommendations
        startup_perf = results.get("startup_performance", {})
        if startup_perf.get("status") == "warning":
            recommendations.append(
                "Consider optimizing startup performance - estimated time exceeds benchmark"
            )

        # General recommendations
        if not recommendations:
            recommendations.append(
                "Performance analysis passed - no optimizations needed"
            )

        return recommendations

    async def monitor_resource_usage(self, duration: int = 60) -> Dict[str, Any]:
        """
        Monitor resource usage over a specified duration.

        Args:
            duration: Monitoring duration in seconds

        Returns:
            Resource usage monitoring results
        """
        try:
            self.logger.info(
                f"Monitoring resource usage for {duration} seconds",
                "resource_monitoring",
            )

            start_time = time.time()
            samples = []

            while time.time() - start_time < duration:
                # Get current resource usage
                process = psutil.Process()
                memory_info = process.memory_info()
                cpu_percent = process.cpu_percent()

                system_memory = psutil.virtual_memory()
                system_cpu = psutil.cpu_percent()

                sample = {
                    "timestamp": datetime.now().isoformat(),
                    "process_memory_mb": round(memory_info.rss / 1024 / 1024, 2),
                    "process_cpu_percent": cpu_percent,
                    "system_memory_percent": system_memory.percent,
                    "system_cpu_percent": system_cpu,
                }

                samples.append(sample)

                # Wait 5 seconds before next sample
                await asyncio.sleep(5)

            # Calculate statistics
            if samples:
                memory_values = [s["process_memory_mb"] for s in samples]
                cpu_values = [s["process_cpu_percent"] for s in samples]

                return {
                    "duration": duration,
                    "sample_count": len(samples),
                    "memory_stats": {
                        "min": min(memory_values),
                        "max": max(memory_values),
                        "avg": sum(memory_values) / len(memory_values),
                    },
                    "cpu_stats": {
                        "min": min(cpu_values),
                        "max": max(cpu_values),
                        "avg": sum(cpu_values) / len(cpu_values),
                    },
                    "samples": samples,
                }
            else:
                return {"error": "No samples collected"}

        except Exception as e:
            return {"error": str(e)}

    async def generate_performance_report(self, results: Dict[str, Any]) -> str:
        """
        Generate a human-readable performance report.

        Args:
            results: Performance analysis results

        Returns:
            Formatted performance report
        """
        report = []
        report.append("# Performance Analysis Report")
        report.append(f"**Overall Status:** {results['overall_status'].upper()}")
        report.append("")

        # Build performance section
        build_perf = results.get("build_performance", {})
        if build_perf.get("status") != "skipped":
            report.append("## 🏗️ Build Performance")
            report.append(f"- **Status:** {build_perf.get('status', 'unknown')}")
            report.append(f"- **Build Time:** {build_perf.get('build_time', 'N/A')}s")
            report.append(f"- **Benchmark:** {build_perf.get('benchmark', 'N/A')}s")
            report.append(f"- **Message:** {build_perf.get('message', 'N/A')}")
            report.append("")

        # Test performance section
        test_perf = results.get("test_performance", {})
        if test_perf.get("status") != "skipped":
            report.append("## 🧪 Test Performance")
            report.append(f"- **Status:** {test_perf.get('status', 'unknown')}")
            report.append(f"- **Test Time:** {test_perf.get('test_time', 'N/A')}s")
            report.append(f"- **Benchmark:** {test_perf.get('benchmark', 'N/A')}s")
            report.append(f"- **Script:** {test_perf.get('script', 'N/A')}")
            report.append(f"- **Message:** {test_perf.get('message', 'N/A')}")
            report.append("")

        # Memory usage section
        memory_usage = results.get("memory_usage", {})
        report.append("## 💾 Memory Usage")
        report.append(f"- **Status:** {memory_usage.get('status', 'unknown')}")
        report.append(
            f"- **Current Memory:** {memory_usage.get('current_memory_mb', 'N/A')}MB"
        )
        report.append(f"- **Benchmark:** {memory_usage.get('benchmark_mb', 'N/A')}MB")
        report.append(
            f"- **System Usage:** {memory_usage.get('system_usage_percent', 'N/A')}%"
        )
        report.append("")

        # Bundle analysis section
        bundle_analysis = results.get("bundle_analysis", {})
        if bundle_analysis.get("status") != "skipped":
            report.append("## 📦 Bundle Analysis")
            report.append(f"- **Status:** {bundle_analysis.get('status', 'unknown')}")
            report.append(
                f"- **Total Size:** {bundle_analysis.get('total_size_mb', 'N/A')}MB"
            )
            report.append(
                f"- **Benchmark:** {bundle_analysis.get('benchmark_mb', 'N/A')}MB"
            )
            report.append(
                f"- **File Count:** {bundle_analysis.get('file_count', 'N/A')}"
            )
            report.append("")

        # Startup performance section
        startup_perf = results.get("startup_performance", {})
        report.append("## 🚀 Startup Performance")
        report.append(f"- **Status:** {startup_perf.get('status', 'unknown')}")
        report.append(
            f"- **Estimated Time:** {startup_perf.get('estimated_startup_time', 'N/A')}s"
        )
        report.append(f"- **Benchmark:** {startup_perf.get('benchmark', 'N/A')}s")
        report.append("")

        # Recommendations section
        recommendations = results.get("recommendations", [])
        if recommendations:
            report.append("## 💡 Recommendations")
            for rec in recommendations:
                report.append(f"- {rec}")
            report.append("")

        return "\n".join(report)
