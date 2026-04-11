export function hasValidMapsKey(apiKey) {
  if (!apiKey) return false;
  const normalized = apiKey.trim();
  if (!normalized) return false;
  return normalized !== "YOUR_GOOGLE_MAPS_API_KEY";
}

export const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
