import { createSignal, createMemo } from "solid-js";
import {
  LineChart,
  BarChart,
  PieChart,
  TimeSeriesChart,
} from "@reynard/charts";
import { Card, Select } from "@reynard/components";
import { useI18n } from "@reynard/core";

export function Charts() {
  const { t } = useI18n();
  const [chartType, setChartType] = createSignal<
    "line" | "bar" | "pie" | "timeseries"
  >("line");
  const [dataSet, setDataSet] = createSignal<"sales" | "users" | "performance">(
    "sales",
  );

  // Sample data for different chart types
  const salesData = createMemo(() => ({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
      },
    ],
  }));

  const usersData = createMemo(() => ({
    labels: ["Active", "Inactive", "Pending", "Banned"],
    datasets: [
      {
        label: "Users",
        data: [300, 50, 100, 15],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 205, 86, 0.6)",
          "rgba(201, 203, 207, 0.6)",
        ],
      },
    ],
  }));

  const timeSeriesData = createMemo(() => ({
    labels: [
      "2023-01-01",
      "2023-02-01",
      "2023-03-01",
      "2023-04-01",
      "2023-05-01",
      "2023-06-01",
    ],
    datasets: [
      {
        label: "Revenue",
        data: [1200, 1900, 800, 1500, 2000, 1800],
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
      },
    ],
  }));

  const getCurrentData = createMemo(() => {
    switch (dataSet()) {
      case "sales":
        return salesData();
      case "users":
        return usersData();
      case "performance":
        return timeSeriesData();
      default:
        return salesData();
    }
  });

  const renderChart = () => {
    const data = getCurrentData();
    switch (chartType()) {
      case "line":
        return <LineChart labels={data.labels} datasets={data.datasets} />;
      case "bar":
        return <BarChart labels={data.labels} datasets={data.datasets} />;
      case "pie":
        return <PieChart labels={data.labels} data={data.datasets[0].data} />;
      case "timeseries":
        // Convert to array of TimeSeriesDataPoint objects
        const timeSeriesPoints = data.labels.map((label, idx) => ({
          timestamp: Date.parse(label),
          value: data.datasets[0].data[idx],
          label,
        }));
        return <TimeSeriesChart data={timeSeriesPoints} />;
      default:
        return <LineChart labels={data.labels} datasets={data.datasets} />;
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{t("charts.title")}</h1>
        <div class="flex gap-4">
          <Select
            value={chartType()}
            onInput={(e) => setChartType(e.target.value as "line" | "bar" | "pie" | "timeseries")}
            options={[
              { value: "line", label: t("charts.types.line") },
              { value: "bar", label: t("charts.types.bar") },
              { value: "pie", label: t("charts.types.pie") },
              { value: "timeseries", label: t("charts.types.timeseries") },
            ]}
          />
          <Select
            value={dataSet()}
            onInput={(e) => setDataSet(e.target.value as "sales" | "users" | "performance")}
            options={[
              { value: "sales", label: t("charts.data.sales") },
              { value: "users", label: t("charts.data.users") },
              { value: "performance", label: t("charts.data.performance") },
            ]}
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div class="p-6">
            <h2 class="text-lg font-semibold mb-4">
              {t("charts.interactive.title")}
            </h2>
            <div class="h-64">{renderChart()}</div>
          </div>
        </Card>

        <Card>
          <div class="p-6">
            <h2 class="text-lg font-semibold mb-4">
              {t("charts.comparison.title")}
            </h2>
            <div class="h-64">
              <BarChart
                labels={["Q1", "Q2", "Q3", "Q4"]}
                datasets={[
                  {
                    label: "2022",
                    data: [10, 20, 30, 40],
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                  },
                ]}
              />
            </div>
          </div>
        </Card>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div class="p-6">
            <h3 class="text-md font-semibold mb-3">
              {t("charts.small.revenue")}
            </h3>
            <div class="h-32">
              <LineChart
                labels={["Week 1", "Week 2", "Week 3", "Week 4"]}
                datasets={[
                  {
                    label: "Revenue",
                    data: [1000, 1500, 1200, 1800],
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                  },
                ]}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div class="p-6">
            <h3 class="text-md font-semibold mb-3">
              {t("charts.small.users")}
            </h3>
            <div class="h-32">
              <PieChart
                labels={["Desktop", "Mobile", "Tablet"]}
                data={[60, 30, 10]}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div class="p-6">
            <h3 class="text-md font-semibold mb-3">
              {t("charts.small.performance")}
            </h3>
            <div class="h-32">
              <BarChart
                labels={["CPU", "Memory", "Disk", "Network"]}
                datasets={[
                  {
                    label: "Performance",
                    data: [65, 45, 30, 85],
                    backgroundColor: [
                      "rgba(153, 102, 255, 0.8)",
                      "rgba(255, 159, 64, 0.8)",
                      "rgba(75, 192, 192, 0.8)",
                      "rgba(255, 99, 132, 0.8)",
                    ],
                  },
                ]}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
