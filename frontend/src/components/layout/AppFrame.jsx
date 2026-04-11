import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useNotifications from "../../hooks/useNotifications";
import MobileBottomNav from "./MobileBottomNav";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import ToastViewport from "../ui/ToastViewport";

function AppFrame({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, connected, markAsRead } = useNotifications(user?.id);
  const location = useLocation();

  return (
    <div className="app-frame">
      <div className="app-bg" aria-hidden="true">
        <span className="app-blob blob-one" />
        <span className="app-blob blob-two" />
        <span className="app-blob blob-three" />
        <span className="app-noise" />
      </div>

      <TopNav
        user={user}
        connected={connected}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={markAsRead}
        onLogout={logout}
      />

      <div className="app-content-wrap">
        {user ? <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> : null}
        <main className="app-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="route-stage"
              initial={{ opacity: 0, y: 10, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.26, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileBottomNav user={user} />
      <ToastViewport />
    </div>
  );
}

export default AppFrame;
