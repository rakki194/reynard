/**
 * Dashboard Utils Composable
 *
 * Utility functions for the Code Quality Dashboard
 */

import { AnalysisResult } from "../types";

export function useDashboardUtils() {
  /**
   * 🦊 Get quality rating color
   */
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "A":
        return "text-green-600";
      case "B":
        return "text-blue-600";
      case "C":
        return "text-yellow-600";
      case "D":
        return "text-orange-600";
      case "E":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  /**
   * 🦊 Get quality gate status color
   */
  const getQualityGateColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "text-green-600 bg-green-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      case "WARNING":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  /**
   * 🦊 Prepare metrics chart data
   */
  const getMetricsChartData = (currentAnalysis: AnalysisResult | null) => {
    if (!currentAnalysis) return null;

    return {
      labels: ["Bugs", "Vulnerabilities", "Code Smells", "Security Hotspots"],
      datasets: [
        {
          label: "Issues",
          data: [
            currentAnalysis.metrics.bugs,
            currentAnalysis.metrics.vulnerabilities,
            currentAnalysis.metrics.codeSmells,
            currentAnalysis.metrics.securityHotspots,
          ],
          backgroundColor: ["#ef4444", "#f97316", "#eab308", "#8b5cf6"],
        },
      ],
    };
  };

  /**
   * 🦊 Prepare trend chart data
   */
  const getTrendChartData = (analysisHistory: AnalysisResult[]) => {
    if (analysisHistory.length < 2) return null;

    return {
      labels: analysisHistory.map((_, i) => `Analysis ${i + 1}`),
      datasets: [
        {
          label: "Lines of Code",
          data: analysisHistory.map(h => h.metrics.linesOfCode),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
        },
        {
          label: "Issues",
          data: analysisHistory.map(h => h.issues.length),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
        },
      ],
    };
  };

  return {
    getRatingColor,
    getQualityGateColor,
    getMetricsChartData,
    getTrendChartData,
  };
}
