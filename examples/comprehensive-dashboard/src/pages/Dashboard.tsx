import { Component, createSignal, createEffect, For } from "solid-js";
import { useI18n, useNotifications } from "@reynard/core";
import { Card, Button } from "@reynard/components";
import { Grid, GridItem } from "@reynard/ui";
import { LineChart, BarChart, PieChart } from "@reynard/charts";

// Mock data for demonstration
const generateMockData = () => ({
  visitors: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Visitors",
        data: [120, 190, 300, 500, 200, 300, 450],
        borderColor: "var(--color-primary)",
        backgroundColor: "var(--color-primary-alpha)",
      },
    ],
  },
  revenue: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [1200, 1900, 3000, 5000, 2000, 3000],
        backgroundColor: "var(--color-success)",
      },
    ],
  },
  userTypes: {
    labels: ["New Users", "Returning Users", "Premium Users"],
    datasets: [
      {
        data: [300, 500, 200],
        backgroundColor: [
          "var(--color-primary)",
          "var(--color-secondary)",
          "var(--color-warning)",
        ],
      },
    ],
  },
});

const Dashboard: Component = () => {
  const { t } = useI18n();
  const notifications = useNotifications();
  const [data, setData] = createSignal(generateMockData());
  const [stats, setStats] = createSignal({
    totalUsers: 1247,
    activeUsers: 892,
    revenue: 12450,
    conversionRate: 3.2,
  });

  // Simulate real-time updates
  createEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 2) - 1,
        revenue: prev.revenue + Math.floor(Math.random() * 100),
        conversionRate: Number(
          (prev.conversionRate + (Math.random() - 0.5) * 0.1).toFixed(1),
        ),
      }));
    }, 5000);

    return () => clearInterval(interval);
  });

  const refreshData = () => {
    setData(generateMockData());
    notifications.notify("Dashboard data refreshed", "success", {
      duration: 3000,
    });
  };

  const recentActivities = [
    { user: "Alice Johnson", action: "Created new project", time: "2 min ago" },
    { user: "Bob Smith", action: "Updated profile", time: "5 min ago" },
    { user: "Carol Wilson", action: "Uploaded files", time: "10 min ago" },
    { user: "David Brown", action: "Shared document", time: "15 min ago" },
  ];

  return (
    <div class="dashboard">
      <div class="dashboard__header">
        <h1 class="dashboard__title">{t("dashboard.welcome")}</h1>
        <Button
          variant="primary"
          onClick={refreshData}
          leftIcon={<span>🔄</span>}
        >
          {t("common.refresh")}
        </Button>
      </div>

      {/* Statistics Cards */}
      <Grid columns={4} gap="md" class="dashboard__stats">
        <GridItem>
          <Card class="dashboard__stat-card">
            <div class="dashboard__stat-icon">👥</div>
            <div class="dashboard__stat-content">
              <h3>{stats().totalUsers.toLocaleString()}</h3>
              <p>{t("users.total")}</p>
            </div>
          </Card>
        </GridItem>
        <GridItem>
          <Card class="dashboard__stat-card">
            <div class="dashboard__stat-icon">🟢</div>
            <div class="dashboard__stat-content">
              <h3>{stats().activeUsers.toLocaleString()}</h3>
              <p>{t("users.active")}</p>
            </div>
          </Card>
        </GridItem>
        <GridItem>
          <Card class="dashboard__stat-card">
            <div class="dashboard__stat-icon">💰</div>
            <div class="dashboard__stat-content">
              <h3>${stats().revenue.toLocaleString()}</h3>
              <p>{t("analytics.revenue")}</p>
            </div>
          </Card>
        </GridItem>
        <GridItem>
          <Card class="dashboard__stat-card">
            <div class="dashboard__stat-icon">📈</div>
            <div class="dashboard__stat-content">
              <h3>{stats().conversionRate}%</h3>
              <p>{t("analytics.conversionRate")}</p>
            </div>
          </Card>
        </GridItem>
      </Grid>

      {/* Charts Section */}
      <Grid columns={2} gap="lg" class="dashboard__charts">
        <GridItem>
          <Card class="dashboard__chart-card">
            <h3>{t("analytics.visitors")}</h3>
            <LineChart
              labels={data().visitors.labels}
              datasets={data().visitors.datasets}
              height={300}
            />
          </Card>
        </GridItem>
        <GridItem>
          <Card class="dashboard__chart-card">
            <h3>{t("analytics.revenue")}</h3>
            <BarChart
              labels={data().revenue.labels}
              datasets={data().revenue.datasets}
              height={300}
            />
          </Card>
        </GridItem>
      </Grid>

      {/* Bottom Section */}
      <Grid columns={3} gap="lg" class="dashboard__bottom">
        <GridItem>
          <Card class="dashboard__activity-card">
            <h3>{t("dashboard.recentActivity")}</h3>
            <div class="dashboard__activity-list">
              <For each={recentActivities}>
                {(activity) => (
                  <div class="dashboard__activity-item">
                    <div class="dashboard__activity-avatar">
                      {activity.user.charAt(0)}
                    </div>
                    <div class="dashboard__activity-content">
                      <p>
                        <strong>{activity.user}</strong> {activity.action}
                      </p>
                      <time>{activity.time}</time>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Card>
        </GridItem>
        <GridItem>
          <Card class="dashboard__chart-card">
            <h3>User Distribution</h3>
            <PieChart
              data={data().userTypes.datasets[0].data}
              labels={data().userTypes.labels}
              height={250}
            />
          </Card>
        </GridItem>
      </Grid>
    </div>
  );
};

export { Dashboard };
