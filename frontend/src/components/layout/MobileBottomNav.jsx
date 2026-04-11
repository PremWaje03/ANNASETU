import {
  BarChart3,
  Home,
  PackageSearch,
  PlusCircle,
  Truck,
  UserCircle2,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function MobileBottomNav({ user }) {
  if (!user) return null;

  const items = [
    { to: "/dashboard", label: "Home", icon: Home, show: true },
    { to: "/donations", label: "Donations", icon: PackageSearch, show: true },
    { to: "/donations/add", label: "Add", icon: PlusCircle, show: user.role === "DONOR" },
    { to: "/requests", label: "Requests", icon: Truck, show: user.role !== "DONOR" },
    { to: "/analytics", label: "Analytics", icon: BarChart3, show: true },
    { to: "/profile", label: "Profile", icon: UserCircle2, show: true },
  ].filter((item) => item.show);

  return (
    <nav className="mobile-nav">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}
          >
            <Icon size={15} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;
