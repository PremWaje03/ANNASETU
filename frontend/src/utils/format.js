export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export function toLocalDateTime(value) {
  if (!value) return "";
  return value.length === 16 ? `${value}:00` : value;
}

export function statusToTone(status) {
  switch (status) {
    case "ACCEPTED":
      return "accepted";
    case "PICKED":
      return "picked";
    case "DELIVERED":
      return "delivered";
    default:
      return "pending";
  }
}
