/**
 * Basic Chart Example
 * Demonstrates the improved Reynard Charts package
 */
import { createSignal } from "solid-js";
import { Chart } from "../components/Chart";
import type { Dataset } from "../types";

export function BasicChartExample() {
  const [data, setData] = createSignal<Dataset[]>([
    {
      label: "Sales",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 2,
    },
    {
      label: "Revenue",
      data: [8, 15, 7, 12, 6, 9],
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 2,
    },
  ]);

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return (
    <div style={{ padding: "20px", background: "#1a1a1a", color: "white" }}>
      <h2>🦊 Reynard Charts - Basic Example</h2>
      
      <div style={{ margin: "20px 0" }}>
        <h3>Line Chart with OKLCH Colors</h3>
        <Chart
          type="line"
          labels={labels}
          datasets={data()}
          useOKLCH={true}
          colorTheme="dark"
          width={600}
          height={400}
          title="Monthly Sales & Revenue"
          showLegend={true}
          showGrid={true}
          xAxisLabel="Month"
          yAxisLabel="Amount"
        />
      </div>

      <div style={{ margin: "20px 0" }}>
        <h3>Bar Chart with Custom Colors</h3>
        <Chart
          type="bar"
          labels={labels}
          datasets={data()}
          useOKLCH={false}
          colorTheme="dark"
          width={600}
          height={400}
          title="Monthly Comparison"
          showLegend={true}
          showGrid={true}
        />
      </div>

      <div style={{ margin: "20px 0" }}>
        <h3>Pie Chart</h3>
        <Chart
          type="pie"
          labels={["Desktop", "Mobile", "Tablet"]}
          datasets={[
            {
              label: "Traffic Sources",
              data: [45, 35, 20],
            },
          ]}
          useOKLCH={true}
          colorTheme="dark"
          width={400}
          height={400}
          title="Traffic Sources"
          showLegend={true}
        />
      </div>
    </div>
  );
}
