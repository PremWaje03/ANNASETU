import { useEffect, useMemo, useRef, useState } from "react";
import DonationMap from "../components/maps/DonationMap";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import CountdownTimer from "../components/ui/CountdownTimer";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useDebounce from "../hooks/useDebounce";
import { donationService, requestService, userService } from "../services/api";
import { DONATION_STATUSES } from "../utils/constants";
import { formatDateTime } from "../utils/format";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? `${window.location.protocol}//${window.location.hostname}:8081`
    : window.location.origin);

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  return `${API_BASE}${imageUrl}`;
}

function DonationsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showMap, setShowMap] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [trackingDonation, setTrackingDonation] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);

  const debouncedQuery = useDebounce(query, 400);
  const debouncedLocation = useDebounce(locationFilter, 400);
  const lastLocationSyncRef = useRef(0);

  const loadDefaultDonations = async () => {
    if (user?.role === "DONOR") {
      const { data } = await donationService.list();
      setDonations(data || []);
      return;
    }

    try {
      const { data } = await donationService.nearest({ limit: 30 });
      setDonations(data || []);
    } catch {
      const { data } = await donationService.list();
      setDonations(data || []);
    }
  };

  const loadDonations = async () => {
    setLoading(true);
    try {
      await loadDefaultDonations();
    } catch (err) {
      error(err.message || "Failed to load donations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasFilters =
      debouncedQuery.trim().length > 0 ||
      debouncedLocation.trim().length > 0 ||
      statusFilter !== "ALL";

    let active = true;

    async function runSearch() {
      setLoading(true);
      try {
        const { data } = await donationService.search({
          foodType: debouncedQuery || undefined,
          location: debouncedLocation || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        });

        if (active) {
          setDonations(data || []);
        }
      } catch (err) {
        error(err.message || "Search failed.");
      } finally {
        if (active) setLoading(false);
      }
    }

    async function runDefaultList() {
      setLoading(true);
      try {
        await loadDefaultDonations();
      } catch (err) {
        error(err.message || "Failed to load donations.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (hasFilters) {
      runSearch();
    } else {
      runDefaultList();
    }

    return () => {
      active = false;
    };
  }, [debouncedQuery, debouncedLocation, statusFilter, user?.role]);

  const mapCenter = useMemo(() => {
    if (currentPosition) return currentPosition;
    const donationWithCoords = donations.find(
      (donation) =>
        typeof donation.latitude === "number" &&
        Number.isFinite(donation.latitude) &&
        typeof donation.longitude === "number" &&
        Number.isFinite(donation.longitude)
    );
    if (donationWithCoords) {
      return {
        lat: donationWithCoords.latitude,
        lng: donationWithCoords.longitude,
      };
    }
    return null;
  }, [donations, currentPosition]);

  const syncLocation = async (lat, lng) => {
    const now = Date.now();
    if (now - lastLocationSyncRef.current < 10000) return;

    lastLocationSyncRef.current = now;
    try {
      await userService.updateLocation(lat, lng);
    } catch {
      // Best effort sync.
    }
  };

  const detectCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentPosition({ lat, lng });
        await syncLocation(lat, lng);
        success("Current location detected and synced.");
      },
      () => error("Unable to detect your location.")
    );
  };

  const loadNearest = async () => {
    setLoading(true);
    try {
      const params = currentPosition
        ? { latitude: currentPosition.lat, longitude: currentPosition.lng, limit: 30 }
        : { limit: 30 };
      const { data } = await donationService.nearest(params);
      const result = data || [];
      setDonations(result);
      success(`Loaded ${result.length} nearest smart matches.`);
    } catch (err) {
      error(err.message || "Failed to load nearest donations.");
    } finally {
      setLoading(false);
    }
  };

  const acceptDonation = async (donationId) => {
    try {
      await requestService.accept(donationId);
      success("Donation request accepted.");
      loadDonations();
    } catch (err) {
      error(err.message || "Could not accept donation.");
    }
  };

  return (
    <div className="page-grid">
      <Card
        title="Donations"
        subtitle="Smart matching, server-side search, and live location tracking"
        action={
          <div className="inline-actions">
            <Button variant="outline" size="sm" onClick={loadDonations}>Refresh</Button>
            <Button variant="ghost" size="sm" onClick={detectCurrentLocation}>Use My Location</Button>
            <Button variant="secondary" size="sm" onClick={loadNearest}>Smart Match</Button>
            <Button variant="outline" size="sm" onClick={() => setShowMap((prev) => !prev)}>
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
          </div>
        }
      >
        <div className="filters-grid filters-grid-3">
          <input
            placeholder="Search by food type"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            placeholder="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            {DONATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {showMap ? (
        <Card title="Live Tracking Map" subtitle="Donor and volunteer movement simulation">
          <DonationMap
            donations={donations}
            center={mapCenter}
            userLocation={currentPosition}
            trackingDonation={trackingDonation}
            onSimulatedPositionChange={(pos) => syncLocation(pos.lat, pos.lng)}
          />
        </Card>
      ) : null}

      {loading ? (
        <Skeleton lines={6} />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No donations found"
          description="Try changing search/filter or refresh the list."
        />
      ) : (
        <section className="donation-grid">
          {donations.map((donation) => (
            <Card key={donation.id} className="donation-card">
              {donation.imageUrl ? (
                <img
                  className="donation-image"
                  src={resolveImageUrl(donation.imageUrl)}
                  alt={donation.foodName}
                />
              ) : null}

              <div className="donation-header">
                <h4>{donation.foodName}</h4>
                <StatusBadge status={donation.status} />
              </div>

              <div className="inline-actions">
                {donation.bestMatch ? <span className="best-match-pill">Best Match</span> : null}
                {donation.urgent ? <span className="urgent-pill">URGENT</span> : null}
                {donation.distanceKm != null ? (
                  <span className="distance-pill">{donation.distanceKm.toFixed(2)} km</span>
                ) : null}
              </div>

              <p>Quantity: {donation.quantity}</p>
              <p>Location: {donation.location}</p>
              <p>Donor: {donation.donorName}</p>
              <p>Expiry: {formatDateTime(donation.expiryTime)}</p>
              <CountdownTimer expiryTime={donation.expiryTime} />

              <div className="inline-actions">
                <Button variant="ghost" size="sm" onClick={() => setSelectedDonation(donation)}>
                  View Details
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTrackingDonation(donation)}>
                  Track Live
                </Button>
                {user?.role !== "DONOR" && donation.status === "PENDING" ? (
                  <Button variant="primary" size="sm" onClick={() => acceptDonation(donation.id)}>
                    Accept Request
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </section>
      )}

      <Modal
        open={Boolean(selectedDonation)}
        title={selectedDonation ? `Donation #${selectedDonation.id}` : "Donation"}
        onClose={() => setSelectedDonation(null)}
      >
        {selectedDonation ? (
          <div className="details-grid">
            {selectedDonation.imageUrl ? (
              <img
                className="donation-image"
                src={resolveImageUrl(selectedDonation.imageUrl)}
                alt={selectedDonation.foodName}
              />
            ) : null}
            <p><strong>Food:</strong> {selectedDonation.foodName}</p>
            <p><strong>Quantity:</strong> {selectedDonation.quantity}</p>
            <p><strong>Location:</strong> {selectedDonation.location}</p>
            <p><strong>Status:</strong> {selectedDonation.status}</p>
            <p><strong>Donor:</strong> {selectedDonation.donorName}</p>
            <p><strong>Expiry:</strong> {formatDateTime(selectedDonation.expiryTime)}</p>
            <p><strong>Distance:</strong> {selectedDonation.distanceKm?.toFixed(2) ?? "N/A"} km</p>
            <p>
              <strong>Coordinates:</strong> {selectedDonation.latitude}, {selectedDonation.longitude}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default DonationsPage;
