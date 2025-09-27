/**
 * Dashboard Page
 * 
 * 🦊 *whiskers twitch with dashboard cunning* Main dashboard view showing
 * comprehensive testing ecosystem overview with statistics and recent test runs.
 */

import { Component, createSignal, createEffect, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useI18n } from 'reynard-themes';
import { testingApi } from '../utils/api';
import type { TestRun, DashboardStats, FilterOptions } from '../types/testing';
import TestRunCard from '../components/TestRunCard';
import StatsCard from '../components/StatsCard';
import FilterPanel from '../components/FilterPanel';
import { TestRunDetailModal } from '../components/TestRunDetailModal';

const Dashboard: Component = () => {
  const { locale, isRTL } = useI18n();
  const navigate = useNavigate();
  const [testRuns, setTestRuns] = createSignal<TestRun[]>([]);
  const [stats, setStats] = createSignal<DashboardStats | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [apiAvailable, setApiAvailable] = createSignal(false);
  const [filters, setFilters] = createSignal<FilterOptions>({ limit: 50 });
  const [selectedTestRun, setSelectedTestRun] = createSignal<TestRun | null>(null);
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  onMount(async () => {
    await checkApiAvailability();
    await loadDashboardData();
  });

  const checkApiAvailability = async () => {
    try {
      const available = await testingApi.isApiAvailable();
      setApiAvailable(available);
      if (!available) {
        setError('Testing API is not available. Please ensure the backend server is running on http://localhost:8000');
      }
    } catch (err) {
      setApiAvailable(false);
      setError('Failed to connect to testing API');
    }
  };

  const loadDashboardData = async () => {
    if (!apiAvailable()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [testRunsData, statsData] = await Promise.all([
        testingApi.getTestRuns(filters()),
        testingApi.getDashboardStats()
      ]);
      
      setTestRuns(testRunsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    if (apiAvailable()) {
      loadDashboardData();
    }
  });

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleTestRunClick = (testRun: TestRun) => {
    setSelectedTestRun(testRun);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTestRun(null);
  };

  return (
    <div class="dashboard" dir={isRTL ? "rtl" : "ltr"}>
      <header class="dashboard-header">
        <div class="header-content">
          <div class="header-text">
            <h1>🦦 Reynard Testing Dashboard</h1>
            <p>Comprehensive view of all test results, benchmarks, and profiling data</p>
          </div>
          <div class="header-actions">
            <button 
              class="nav-button quality-gates"
              onClick={() => navigate('/quality-gates')}
              title="Manage Quality Gates"
            >
              🦊 Quality Gates
            </button>
          </div>
        </div>
      </header>

      <Show when={!apiAvailable()}>
        <div class="api-error">
          <div class="error-content">
            <h2>🚫 API Not Available</h2>
            <p>{error()}</p>
            <button class="retry-button" onClick={checkApiAvailability}>
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </Show>

      <Show when={apiAvailable()}>
        <main class="dashboard-main">
          <div class="dashboard-stats">
            <Show when={stats()}>
              <StatsCard
                title="Total Test Runs"
                value={stats()!.total_test_runs}
                icon="🧪"
                color="var(--color-primary)"
                description="All test executions recorded"
              />
              <StatsCard
                title="Total Tests"
                value={stats()!.total_tests}
                icon="✅"
                color="var(--color-success)"
                description="Individual test cases executed"
              />
              <StatsCard
                title="Success Rate"
                value={stats()!.success_rate}
                unit="%"
                icon="📊"
                color="var(--color-info)"
                description="Overall test success percentage"
              />
              <StatsCard
                title="Avg Duration"
                value={stats()!.avg_duration}
                unit="s"
                icon="⏱️"
                color="var(--color-warning)"
                description="Average test run duration"
              />
              <StatsCard
                title="Recent Failures"
                value={stats()!.recent_failures}
                icon="❌"
                color="var(--color-error)"
                description="Failures in last 24 hours"
              />
              <StatsCard
                title="Coverage Trend"
                value={stats()!.coverage_trend}
                unit="%"
                icon="📈"
                color="var(--color-success)"
                description="Code coverage trend"
              />
            </Show>
          </div>

          <div class="dashboard-content">
            <div class="filters-section">
              <FilterPanel onFiltersChange={handleFiltersChange} initialFilters={filters()} />
            </div>

            <div class="test-runs-section">
              <div class="section-header">
                <h2>Recent Test Runs</h2>
                <Show when={loading()}>
                  <div class="loading-spinner">⏳ Loading...</div>
                </Show>
              </div>

              <Show when={error()}>
                <div class="error-message">
                  <h3>❌ Error Loading Data</h3>
                  <p>{error()}</p>
                  <button class="retry-button" onClick={loadDashboardData}>
                    🔄 Retry
                  </button>
                </div>
              </Show>

              <Show when={!loading() && !error()}>
                <div class="test-runs-grid">
                  <For each={testRuns()}>
                    {(testRun) => (
                      <TestRunCard
                        testRun={testRun}
                        onClick={() => handleTestRunClick(testRun)}
                        showDetails={false}
                      />
                    )}
                  </For>
                </div>

                <Show when={testRuns().length === 0}>
                  <div class="empty-state">
                    <h3>📭 No Test Runs Found</h3>
                    <p>No test runs match your current filters. Try adjusting your search criteria.</p>
                  </div>
                </Show>
              </Show>
            </div>
          </div>
        </main>
      </Show>

      {/* Test Run Detail Modal */}
      <TestRunDetailModal
        testRun={selectedTestRun()}
        isOpen={isModalOpen()}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Dashboard;
