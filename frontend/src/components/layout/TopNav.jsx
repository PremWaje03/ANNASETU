import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  Menu,
  MoonStar,
  Sun,
  UserCircle2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { APP_NAME } from "../../utils/constants";
import { useTheme } from "../../context/ThemeContext";
import Button from "../ui/Button";
import NotificationBell from "./NotificationBell";

function TopNav({ user, connected, onToggleSidebar, notifications, unreadCount, onMarkRead, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/auth");
  };

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        {user ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="icon-btn icon-glass"
            onClick={onToggleSidebar}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </motion.button>
        ) : null}

        <Link to={user ? "/dashboard" : "/"} className="brand-link">
          <strong>{APP_NAME}</strong>
          <small>Food Donation Management</small>
        </Link>
      </div>

      <div className="top-nav-right">
        {user ? (
          <span className={`net-status ${connected ? "online" : "offline"}`}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />} {connected ? "Live" : "Retrying"}
          </span>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          icon={theme === "dark" ? <Sun size={14} /> : <MoonStar size={14} />}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </Button>

        {user ? (
          <>
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={onMarkRead}
            />
            <Button
              variant="outline"
              size="sm"
              icon={<UserCircle2 size={14} />}
              onClick={() => navigate("/profile")}
            >
              My Profile
            </Button>
            <Button variant="danger" size="sm" icon={<LogOut size={14} />} onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" onClick={() => navigate("/auth")}>
            Login
          </Button>
        )}
      </div>

      <AnimatePresence>
        {user && !connected ? (
          <motion.div
            className="top-nav-banner"
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
          >
            Reconnecting real-time feed...
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export default TopNav;
