import { useEffect, useState } from "react";
import LocationPicker from "../components/maps/LocationPicker";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { donationService, uploadService } from "../services/api";
import { toLocalDateTime } from "../utils/format";

const initialForm = {
  foodName: "",
  quantity: 1,
  location: "",
  latitude: "",
  longitude: "",
  expiryTime: "",
  imageUrl: "",
};

function AddDonationPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (user?.role !== "DONOR") {
    return (
      <Card title="Access Restricted">
        <p>Only DONOR accounts can create donations.</p>
      </Card>
    );
  }

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const pickLocation = ({ lat, lng }) => {
    setForm((prev) => ({ ...prev, latitude: String(lat), longitude: String(lng) }));
  };

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        }));
        success("Current location updated.");
      },
      () => error("Could not detect current location.")
    );
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { data } = await uploadService.image(file);
      setForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
      success("Image uploaded successfully.");
    } catch (err) {
      error(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submitDonation = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await donationService.add({
        foodName: form.foodName,
        quantity: Number(form.quantity),
        location: form.location,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        expiryTime: toLocalDateTime(form.expiryTime),
        imageUrl: form.imageUrl || null,
      });

      success("Donation created and nearby users notified.");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setForm(initialForm);
    } catch (err) {
      error(err.message || "Failed to create donation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-split">
      <Card title="Add Donation" subtitle="Share surplus food with accurate location details">
        <form className="form-grid" onSubmit={submitDonation}>
          <label>
            Food Name
            <input value={form.foodName} onChange={updateField("foodName")} required />
          </label>

          <label>
            Quantity
            <input type="number" min="1" value={form.quantity} onChange={updateField("quantity")} required />
          </label>

          <label>
            Address / Pickup Location
            <input value={form.location} onChange={updateField("location")} required />
          </label>

          <div className="grid-two">
            <label>
              Latitude
              <input type="number" step="any" value={form.latitude} onChange={updateField("latitude")} required />
            </label>
            <label>
              Longitude
              <input type="number" step="any" value={form.longitude} onChange={updateField("longitude")} required />
            </label>
          </div>

          <label>
            Expiry Time
            <input type="datetime-local" value={form.expiryTime} onChange={updateField("expiryTime")} required />
          </label>

          <label>
            Food Image
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} />
          </label>

          {uploading ? <p className="hint-text">Uploading image...</p> : null}
          {form.imageUrl ? <p className="hint-text">Image saved: {form.imageUrl}</p> : null}
          {previewUrl ? <img src={previewUrl} alt="Food preview" className="upload-preview" /> : null}

          <div className="inline-actions">
            <Button variant="ghost" onClick={detectLocation} type="button">
              Detect Current Location
            </Button>
            <Button variant="primary" loading={loading} type="submit">
              Publish Donation
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Map Picker" subtitle="Tap on map to select latitude and longitude">
        <LocationPicker
          location={{
            lat: form.latitude ? Number(form.latitude) : null,
            lng: form.longitude ? Number(form.longitude) : null,
          }}
          onChange={pickLocation}
        />
      </Card>
    </div>
  );
}

export default AddDonationPage;
