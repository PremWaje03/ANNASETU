import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useNotifications from "../hooks/useNotifications";
import { dashboardService, donationService } from "../services/api";
import { formatDateTime } from "../utils/format";

function DashboardPage() {
  const { user } = useAuth();
  const { error } = useToast();
  const { notifications, unreadCount, connected, markAsRead } = useNotifications(user?.id);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [nearby, setNearby] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      try {
        const statsResponse = await dashboardService.stats();
        if (!active) return;
        setStats(statsResponse.data);

        if (user?.role !== "DONOR") {
          const nearestResponse = await donationService.nearest({ limit: 6 });
          if (!active) return;
          setNearby(nearestResponse.data || []);
        }
      } catch (err) {
        error(err.message || "Failed to load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [user?.role]);

  if (loading) {
    return (
      <div className="page-grid">
        <Skeleton lines={4} />
        <Skeleton lines={4} />
      </div>
    );
  }

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <Card title={user?.role === "DONOR" ? "Total Donations" : "Nearby Donations"}>
          <h2 className="metric-value">
            {user?.role === "DONOR" ? stats?.totalDonations ?? 0 : stats?.nearbyDonations ?? 0}
          </h2>
        </Card>

        <Card title={user?.role === "DONOR" ? "Active Donations" : "Accepted Requests"}>
          <h2 className="metric-value">
            {user?.role === "DONOR" ? stats?.activeDonations ?? 0 : stats?.acceptedRequests ?? 0}
          </h2>
        </Card>

        <Card title={user?.role === "DONOR" ? "Completed Donations" : "Completed Pickups"}>
          <h2 className="metric-value">
            {user?.role === "DONOR" ? stats?.completedDonations ?? 0 : stats?.completedPickups ?? 0}
          </h2>
        </Card>
      </section>

      <Card
        title={`Welcome, ${user?.name}`}
        subtitle={`Role: ${user?.role} | Realtime: ${connected ? "Connected" : "Reconnecting"}`}
      >
        <p>Email: {user?.email}</p>
        <p>
          Coordinates: {user?.latitude ?? "N/A"}, {user?.longitude ?? "N/A"}
        </p>
      </Card>

      {user?.role !== "DONOR" ? (
        <Card title="Best Nearby Matches" subtitle="Smart matching sorted by nearest distance">
          {!nearby.length ? (
            <EmptyState
              title="No nearby donations"
              description="Set your location in profile to get smarter nearby matches."
            />
          ) : (
            <div className="timeline-list">
              {nearby.map((donation) => (
                <div className="timeline-item" key={donation.id}>
                  <div className="timeline-row">
                    <p>
                      <strong>{donation.foodName}</strong> | {donation.location}
                    </p>
                    {donation.bestMatch ? <span className="best-match-pill">Best Match</span> : null}
                  </div>
                  <small>
                    Distance: {donation.distanceKm?.toFixed(2)} km | Expires: {formatDateTime(donation.expiryTime)}
                  </small>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      <Card title="Recent Notifications" subtitle={`${unreadCount} unread`}>
        {!notifications.length ? (
          <EmptyState
            title="No notifications yet"
            description="Updates about requests and expiry alerts will appear here."
          />
        ) : (
          <div className="timeline-list">
            {notifications.slice(0, 8).map((item) => (
              <div className="timeline-item" key={item.id}>
                <div className="timeline-row">
                  <p>{item.message}</p>
                  {!item.isRead ? (
                    <button className="link-btn" onClick={() => markAsRead(item.id)}>
                      Mark read
                    </button>
                  ) : (
                    <StatusBadge status="DELIVERED" />
                  )}
                </div>
                <small>{formatDateTime(item.createdAt)}</small>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default DashboardPage;
