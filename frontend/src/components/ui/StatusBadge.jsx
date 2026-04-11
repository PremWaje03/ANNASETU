import { statusToTone } from "../../utils/format";

function StatusBadge({ status }) {
  const tone = statusToTone(status);
  return <span className={`status-badge status-${tone}`}>{status}</span>;
}

export default StatusBadge;
