import React, { useContext, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Tv,
  Stethoscope,
  UserPlus,
  ShieldPlus,
  Mail,
  LogOut,
  Menu,
  X,
  Hospital,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, setIsAuthenticated, admin, setAdmin } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();

  // If in Waiting Room full-screen mode, hide sidebar
  if (location.pathname === "/waiting-room" || !isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const { data } = await axios.get(`${apiUrl}/api/v1/user/admin/logout`, {
        withCredentials: true,
      });
      toast.success(data.message || "Logged out successfully");
      setIsAuthenticated(false);
      setAdmin({});
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={18} />,
    },
    {
      title: "OPD Queue Controller",
      path: "/queue",
      icon: <Activity size={18} />,
      badge: "LIVE",
      pulse: true,
    },
    {
      title: "Waiting Room TV Mode",
      path: "/waiting-room",
      icon: <Tv size={18} />,
    },
    {
      title: "Doctors Directory",
      path: "/doctors",
      icon: <Stethoscope size={18} />,
    },
    {
      title: "Add New Doctor",
      path: "/doctor/addnew",
      icon: <UserPlus size={18} />,
    },
    {
      title: "Add Administrator",
      path: "/admin/addnew",
      icon: <ShieldPlus size={18} />,
    },
    {
      title: "Patient Messages",
      path: "/messages",
      icon: <Mail size={18} />,
    },
  ];

  return (
    <>
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Hospital size={24} color="#38bdf8" />
          <span style={{ fontWeight: "700", fontSize: "16px" }}>CURAMED</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <Hospital size={22} />
          </div>
          <div>
            <div className="sidebar-brand-name">CURAMED</div>
            <div className="sidebar-brand-tag">Clinical Console</div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div className="sidebar-section-title">Operations</div>
          {menuItems.slice(0, 3).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              <span>{item.title}</span>
              {item.badge && (
                <span className={`sidebar-badge ${item.pulse ? "pulse" : ""}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <div className="sidebar-section-title">Administration</div>
          {menuItems.slice(3).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-pill">
            <div className="user-avatar">
              {admin?.firstName ? admin.firstName.charAt(0) : "A"}
            </div>
            <div className="user-info-text">
              <div className="user-name">
                {admin?.firstName ? `${admin.firstName} ${admin.lastName}` : "Admin Staff"}
              </div>
              <div className="user-role">{admin?.role || "Hospital Admin"}</div>
            </div>
          </div>

          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;