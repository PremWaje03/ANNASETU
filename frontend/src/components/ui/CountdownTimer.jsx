import { useEffect, useMemo, useState } from "react";

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function CountdownTimer({ expiryTime }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { remainingMs, urgent, expired } = useMemo(() => {
    const expiryMs = new Date(expiryTime).getTime();
    const diff = expiryMs - now;
    return {
      remainingMs: diff,
      urgent: diff > 0 && diff <= 60 * 60 * 1000,
      expired: diff <= 0,
    };
  }, [expiryTime, now]);

  if (expired) {
    return <span className="expiry-pill expired">Expired</span>;
  }

  return (
    <span className={`expiry-pill ${urgent ? "urgent" : "normal"}`}>
      {urgent ? "URGENT " : "Expiry "}
      {formatDuration(remainingMs)}
    </span>
  );
}

export default CountdownTimer;