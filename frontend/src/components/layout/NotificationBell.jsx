import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDateTime } from "../../utils/format";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";

function NotificationBell({ notifications, unreadCount, onMarkRead }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notifications]
  );

  useEffect(() => {
    if (!open) return;

    const onWindowClick = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, [open]);

  return (
    <div className="notification-bell-wrap" ref={containerRef}>
      <motion.button
        whileTap={{ scale: 0.92 }}
        className="icon-btn bell-btn icon-glass"
        aria-label="Notifications"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={18} />
        {unreadCount > 0 ? <span className="notif-count">{Math.min(unreadCount, 9)}</span> : null}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="notification-panel"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="panel-header">
              <h4>Notifications</h4>
              <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>

            {!sortedNotifications.length ? (
              <EmptyState
                title="No notifications"
                description="You will see real-time updates here."
              />
            ) : (
              <div className="notification-list">
                {sortedNotifications.slice(0, 15).map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className={`notification-row ${item.isRead ? "read" : "unread"}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p>{item.message}</p>
                    <small>{formatDateTime(item.createdAt)}</small>
                    {!item.isRead ? (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Check size={13} />}
                        onClick={() => onMarkRead(item.id)}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;
