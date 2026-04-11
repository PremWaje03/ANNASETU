import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../context/ToastContext";
import { donationService } from "../services/api";

const statusColors = {
  PENDING: "#facc15",
  ACCEPTED: "#3b82f6",
  PICKED: "#a855f7",
  DELIVERED: "#22c55e",
};

function AnalyticsPage() {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoading(true);
      try {
        const { data } = await donationService.stats();
        if (active) {
          setStats(data);
        }
      } catch (err) {
        if (active) {
          error(err.message || "Failed to load analytics.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStats();
    return () => {
      active = false;
    };
  }, [error]);

  const weeklyData = useMemo(() => {
    if (!stats?.donationsPerWeek?.length) return [];
    return stats.donationsPerWeek.map((item) => ({
      week: item.week,
      donations: item.count,
    }));
  }, [stats]);

  const statusData = useMemo(() => {
    if (!stats?.statusCounts) return [];
    return Object.entries(stats.statusCounts).map(([name, value]) => ({
      name,
      value,
      color: statusColors[name] || "#94a3b8",
    }));
  }, [stats]);

  if (loading) {
    return (
      <div className="page-grid">
        <Skeleton lines={5} />
        <Skeleton lines={5} />
      </div>
    );
  }

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <Card title="Total Donations">
          <h2 className="metric-value">{stats?.totalDonations ?? 0}</h2>
        </Card>
        <Card title="Completed">
          <h2 className="metric-value">{stats?.completedDonations ?? 0}</h2>
        </Card>
        <Card title="Pending">
          <h2 className="metric-value">{stats?.pendingDonations ?? 0}</h2>
        </Card>
      </section>

      <div className="analytics-grid">
        <Card title="Donations Per Week" subtitle="Last 8 weeks trend">
          {!weeklyData.length ? (
            <EmptyState
              title="No weekly data yet"
              description="Create donations to unlock weekly analytics."
            />
          ) : (
            <div className="chart-shell">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                  <XAxis dataKey="week" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(148,163,184,0.3)",
                      borderRadius: "10px",
                    }}
                  />
                  <Bar dataKey="donations" radius={[8, 8, 0, 0]}>
                    {weeklyData.map((entry) => (
                      <Cell key={entry.week} fill="#f97316" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Status Split" subtitle="Completed vs pending pipeline">
          {!statusData.length ? (
            <EmptyState
              title="No status data yet"
              description="Status distribution appears once donations are created."
            />
          ) : (
            <div className="chart-shell">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={98}
                    innerRadius={54}
                    paddingAngle={4}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(148,163,184,0.3)",
                      borderRadius: "10px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsPage;
