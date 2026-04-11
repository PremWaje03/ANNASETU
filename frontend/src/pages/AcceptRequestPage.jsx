import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { requestService } from "../services/api";

function RequestsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data } = await requestService.myRequests();
      setRequests(data || []);
    } catch (err) {
      error(err.message || "Could not fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  if (user?.role === "DONOR") {
    return (
      <Card title="Access Restricted">
        <p>Only NGO and VOLUNTEER users can manage requests.</p>
      </Card>
    );
  }

  const updateStatus = async (requestId, status) => {
    try {
      await requestService.updateStatus(requestId, status);
      success(`Request marked ${status}.`);
      loadRequests();
    } catch (err) {
      error(err.message || "Failed to update request status.");
    }
  };

  return (
    <div className="page-grid">
      <Card title="Accepted Requests" subtitle="Move each pickup through the delivery pipeline" />

      {loading ? (
        <Skeleton lines={6} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests assigned"
          description="Accept donations from the Donations page to start pickup workflow."
        />
      ) : (
        <div className="donation-grid">
          {requests.map((request) => (
            <Card key={request.id}>
              <div className="donation-header">
                <h4>{request.foodName}</h4>
                <StatusBadge status={request.status} />
              </div>

              <p>Request ID: {request.id}</p>
              <p>Donation ID: {request.donationId}</p>
              <p>Volunteer: {request.volunteerName}</p>
              <p>
                Donation Status: <StatusBadge status={request.donationStatus} />
              </p>

              <div className="inline-actions">
                {request.status === "ACCEPTED" ? (
                  <Button variant="secondary" size="sm" onClick={() => updateStatus(request.id, "PICKED")}>
                    Mark PICKED
                  </Button>
                ) : null}

                {request.status === "PICKED" ? (
                  <Button variant="primary" size="sm" onClick={() => updateStatus(request.id, "DELIVERED")}>
                    Mark DELIVERED
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default RequestsPage;
