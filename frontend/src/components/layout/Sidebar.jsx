import {
  BarChart3,
  LayoutDashboard,
  MessageSquareHeart,
  PackageSearch,
  PlusCircle,
  Truck,
  UserCircle2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { APP_NAME, NAV_ITEMS } from "../../utils/constants";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  "package-search": PackageSearch,
  "plus-circle": PlusCircle,
  truck: Truck,
  "bar-chart-3": BarChart3,
  "message-square-heart": MessageSquareHeart,
  "user-circle": UserCircle2,
};

function Sidebar({ user, open, onClose }) {
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.auth) return false;
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <aside className={`app-sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>{APP_NAME}</h2>
        <button className="icon-btn only-mobile" onClick={onClose} aria-label="Close menu">
          x
        </button>
      </div>

      <p className="sidebar-subtitle">Role: {user?.role}</p>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="link-icon-wrap">{Icon ? <Icon size={16} /> : null}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
