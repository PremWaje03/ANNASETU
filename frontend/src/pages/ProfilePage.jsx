import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/api";

function ProfilePage() {
  const { user, setAuth } = useAuth();
  const { error, success } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const syncAuthCoords = (next) => {
    setAuth((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        latitude: next.latitude,
        longitude: next.longitude,
      };
    });
  };

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const { data } = await userService.profile();
        if (!active) return;
        setProfile(data);
        setLatitude(data.latitude != null ? String(data.latitude) : "");
        setLongitude(data.longitude != null ? String(data.longitude) : "");
      } catch (err) {
        if (active) {
          error(err.message || "Failed to load profile.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [error]);

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        success("Current location captured.");
      },
      () => error("Could not fetch current location.")
    );
  };

  const updateLocation = async () => {
    if (latitude === "" || longitude === "") {
      error("Please set both latitude and longitude.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await userService.updateLocation(Number(latitude), Number(longitude));
      setProfile(data);
      syncAuthCoords(data);
      success("Location updated successfully.");
    } catch (err) {
      error(err.message || "Location update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-grid">
        <Skeleton lines={4} />
      </div>
    );
  }

  const summaryCards =
    profile?.role === "DONOR"
      ? [
          { label: "Total Donations", value: profile?.totalDonations ?? 0 },
          { label: "Completed Donations", value: profile?.completedDonations ?? 0 },
        ]
      : [
          { label: "Accepted Requests", value: profile?.acceptedRequests ?? 0 },
          { label: "Completed Pickups", value: profile?.completedPickups ?? 0 },
        ];

  return (
    <div className="page-grid">
      <Card title="My Profile" subtitle="User information and activity summary">
        <div className="profile-grid">
          <div>
            <span className="label">Name</span>
            <p>{profile?.name || user?.name}</p>
          </div>
          <div>
            <span className="label">Email</span>
            <p>{profile?.email || user?.email}</p>
          </div>
          <div>
            <span className="label">Role</span>
            <p>{profile?.role || user?.role}</p>
          </div>
        </div>
      </Card>

      <section className="stats-grid">
        {summaryCards.map((item) => (
          <Card key={item.label} title={item.label} className="hover-glow">
            <h2 className="metric-value">{item.value}</h2>
          </Card>
        ))}
      </section>

      <Card title="Live Location" subtitle="Used for smart matching and nearby suggestions">
        <div className="grid-two">
          <label>
            Latitude
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
            />
          </label>

          <label>
            Longitude
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
            />
          </label>
        </div>

        <div className="inline-actions">
          <Button variant="ghost" onClick={useCurrentLocation}>Use Current Location</Button>
          <Button variant="primary" onClick={updateLocation} loading={saving}>
            Save Location
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ProfilePage;
