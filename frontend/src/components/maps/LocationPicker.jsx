import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { INDIA_CENTER, hasValidMapsKey } from "../../utils/maps";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";

const mapContainerStyle = { width: "100%", height: "320px" };

function LocationPicker({ location, onChange }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapsReady = hasValidMapsKey(apiKey);

  const { isLoaded } = useJsApiLoader({
    id: "annasetu-location-picker",
    googleMapsApiKey: mapsReady ? apiKey : "",
  });

  const hasLocation = location?.lat != null && location?.lng != null;
  const center = hasLocation ? location : INDIA_CENTER;

  const handleClick = (event) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat == null || lng == null) return;
    onChange({ lat, lng });
  };

  if (!mapsReady) {
    return (
      <EmptyState
        title="Map not available"
        description="Please configure a valid Google Maps API key to use location picker."
      />
    );
  }

  if (!isLoaded) {
    return <Spinner label="Loading map picker..." />;
  }

  return (
    <div className="map-shell">
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={8} onClick={handleClick}>
        {hasLocation ? <Marker position={location} /> : null}
      </GoogleMap>
    </div>
  );
}

export default LocationPicker;
