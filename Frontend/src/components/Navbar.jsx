import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Context } from "../main";
import axios from "axios";
import { toast } from "react-toastify";
import { Hospital, Activity, CalendarPlus, User, LogOut, Menu, X, ArrowRight } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/user/patient/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message || "Logged out successfully");
      setIsAuthenticated(false);
      setUser({});
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="container">
        <nav className="navbar">
          {/* Brand Logo */}
          <Link to="/" className="nav-brand">
            <div className="nav-logo-icon">
              <Hospital size={24} color="#fff" />
            </div>
            <div>
              <div className="nav-brand-title">CURAMED</div>
              <div className="nav-brand-subtitle">Smart Hospital & Queue</div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              to="/appointment"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Appointment
            </NavLink>

            <NavLink
              to="/myappointments"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Activity size={16} color="var(--primary)" />
              <span>Live Queue & Passes</span>
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About Hospital
            </NavLink>
          </div>

          {/* User Auth Actions */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Link to="/myappointments" className="nav-user-pill">
                  <User size={16} />
                  <span>{user?.firstName ? `${user.firstName} ${user.lastName}` : "Patient"}</span>
                </Link>
                <button
                  className="btn btn-outline"
                  onClick={handleLogout}
                  style={{ padding: "8px 14px", fontSize: "13px" }}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link to="/login" className="btn btn-outline" style={{ padding: "8px 16px" }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: "8px 16px" }}>
                  <span>Register</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
