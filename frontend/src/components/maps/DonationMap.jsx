import { GoogleMap, InfoWindow, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useMemo, useState } from "react";
import { INDIA_CENTER, hasValidMapsKey } from "../../utils/maps";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";

const mapContainerStyle = { width: "100%", height: "360px" };

function moveTowards(start, target, factor = 0.12) {
  return {
    lat: start.lat + (target.lat - start.lat) * factor,
    lng: start.lng + (target.lng - start.lng) * factor,
  };
}

function DonationMap({
  donations = [],
  center,
  userLocation,
  trackingDonation,
  onSimulatedPositionChange,
}) {
  const [activeDonation, setActiveDonation] = useState(null);
  const [simulatedVolunteer, setSimulatedVolunteer] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapsReady = hasValidMapsKey(apiKey);

  const { isLoaded } = useJsApiLoader({
    id: "annasetu-donation-map",
    googleMapsApiKey: mapsReady ? apiKey : "",
  });

  const validDonations = useMemo(
    () =>
      donations.filter(
        (donation) =>
          typeof donation.latitude === "number" &&
          Number.isFinite(donation.latitude) &&
          typeof donation.longitude === "number" &&
          Number.isFinite(donation.longitude)
      ),
    [donations]
  );

  const mapCenter = useMemo(() => center || userLocation || INDIA_CENTER, [center, userLocation]);

  const trackingTarget = useMemo(() => {
    if (trackingDonation) {
      return { lat: trackingDonation.latitude, lng: trackingDonation.longitude };
    }
    if (validDonations.length) {
      const best = validDonations.find((donation) => donation.bestMatch) || validDonations[0];
      return { lat: best.latitude, lng: best.longitude };
    }
    return null;
  }, [trackingDonation, validDonations]);

  useEffect(() => {
    if (!userLocation) {
      setSimulatedVolunteer(null);
      return;
    }
    setSimulatedVolunteer(userLocation);
  }, [userLocation?.lat, userLocation?.lng]);

  useEffect(() => {
    if (!simulatedVolunteer || !trackingTarget) return undefined;

    const timer = setInterval(() => {
      setSimulatedVolunteer((prev) => {
        if (!prev) return prev;

        const next = moveTowards(prev, trackingTarget);
        if (onSimulatedPositionChange) {
          onSimulatedPositionChange(next);
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [simulatedVolunteer, trackingTarget, onSimulatedPositionChange]);

  if (!mapsReady) {
    return (
      <EmptyState
        title="Google Maps key missing"
        description="Add a valid VITE_GOOGLE_MAPS_API_KEY in frontend/.env and restart the frontend."
      />
    );
  }

  if (!isLoaded) {
    return <Spinner label="Loading map..." />;
  }

  return (
    <div className="map-shell">
      <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={6}>
        {simulatedVolunteer ? (
          <Marker
            position={simulatedVolunteer}
            label={{ text: "Volunteer", color: "#ffffff", fontSize: "11px" }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeColor: "#0f172a",
              strokeWeight: 1,
              scale: 7,
            }}
          />
        ) : null}

        {trackingTarget ? (
          <Marker
            position={trackingTarget}
            label={{ text: "Donor", color: "#ffffff", fontSize: "11px" }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#f97316",
              fillOpacity: 1,
              strokeColor: "#7c2d12",
              strokeWeight: 1,
              scale: 7,
            }}
          />
        ) : null}

        {simulatedVolunteer && trackingTarget ? (
          <Polyline
            path={[simulatedVolunteer, trackingTarget]}
            options={{
              strokeColor: "#22c55e",
              strokeOpacity: 0.9,
              strokeWeight: 3,
            }}
          />
        ) : null}

        {validDonations.map((donation) => (
          <Marker
            key={donation.id}
            position={{ lat: donation.latitude, lng: donation.longitude }}
            onClick={() => setActiveDonation(donation)}
          />
        ))}

        {activeDonation ? (
          <InfoWindow
            position={{ lat: activeDonation.latitude, lng: activeDonation.longitude }}
            onCloseClick={() => setActiveDonation(null)}
          >
            <div className="map-info-window">
              <h4>{activeDonation.foodName}</h4>
              <p>Qty: {activeDonation.quantity}</p>
              <p>Status: {activeDonation.status}</p>
              <p>{activeDonation.location}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

export default DonationMap;
