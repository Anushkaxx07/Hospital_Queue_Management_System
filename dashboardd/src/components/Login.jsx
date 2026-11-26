import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
import {
  Hospital,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Activity,
  Tv,
  Stethoscope,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [submitting, setSubmitting] = useState(false);

  const { isAuthenticated, setIsAuthenticated, setAdmin } = useContext(Context);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { data } = await axios.post(
        `${apiUrl}/api/v1/user/login`,
        { email, password, role },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(data.message || "Welcome to Curamed Console");
      setIsAuthenticated(true);
      setAdmin(data.user || {});
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@curamed.com");
    setPassword("Password123!");
    setRole("Admin");
    toast.info("Demo Admin credentials populated!");
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 60%, #020617 100%)",
        padding: "32px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexWrap: "wrap",
          overflow: "hidden",
        }}
      >
        {/* Left Column: Sign In Form */}
        <div
          style={{
            flex: "1 1 440px",
            padding: "44px 38px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "26px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
                boxShadow: "0 6px 16px rgba(2, 132, 199, 0.3)",
              }}
            >
              <Hospital size={26} color="#fff" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>
              CURAMED CONSOLE
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
              Hospital Staff & Clinical Queue Management Portal
            </p>
          </div>

          {/* Demo Credentials Quick-Fill Pill */}
          <button
            type="button"
            onClick={fillDemoAdmin}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px",
              borderRadius: "10px",
              border: "1px dashed #0284c7",
              background: "#f0f9ff",
              color: "#0284c7",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              marginBottom: "20px",
              transition: "all 0.2s",
            }}
          >
            <Sparkles size={16} />
            <span>⚡ One-Click Demo Admin Login</span>
          </button>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label
                className="form-label"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Account Role
              </label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  background: "#fff",
                }}
              >
                <option value="Admin">Hospital Administrator</option>
                <option value="Doctor">Medical Doctor / Specialist</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label
                className="form-label"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Official Email Address
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "14px" }} />
                <input
                  type="email"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                  placeholder="name@curamed.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "18px" }}>
              <label
                className="form-label"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Secure Password
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "14px" }} />
                <input
                  type="password"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#0284c7",
                color: "#fff",
                border: "none",
                fontWeight: "700",
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <span>{submitting ? "Signing in..." : "Sign In to Console"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#94a3b8" }}>
            Authorized personnel only. Patient portal is on{" "}
            <a href="http://localhost:5173" style={{ color: "#0284c7", textDecoration: "none", fontWeight: "600" }}>
              port 5173
            </a>
            .
          </div>
        </div>

        {/* Right Column: Hospital Console Showcase */}
        <div
          style={{
            flex: "1 1 380px",
            background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            padding: "44px 38px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "20px",
                background: "rgba(2, 132, 199, 0.2)",
                color: "#38bdf8",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "0.5px",
                marginBottom: "20px",
                border: "1px solid rgba(56, 189, 248, 0.3)",
              }}
            >
              <ShieldCheck size={14} />
              <span>CLINICAL OPERATIONS 2.0</span>
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: "800", lineHeight: "1.3", color: "#f8fafc" }}>
              Intelligent Hospital OPD & Real-Time Queue Control
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "8px", lineHeight: "1.5" }}>
              Centralized operational terminal to manage doctor appointments, sequential token allocation, and lobby waiting displays.
            </p>

            <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    background: "rgba(2, 132, 199, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#38bdf8",
                    flexShrink: 0,
                  }}
                >
                  <Activity size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>
                    One-Click Queue Controller
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Advance patient tokens (OPD-PED-01) with live state progression.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    background: "rgba(16, 185, 129, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#34d399",
                    flexShrink: 0,
                  }}
                >
                  <Tv size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>
                    Lobby Waiting Room TV Mode
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    High-contrast kiosk with audio-visual chimes and cabin routing.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    background: "rgba(245, 158, 11, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fbbf24",
                    flexShrink: 0,
                  }}
                >
                  <Stethoscope size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>
                    9 Medical Specialties
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Pediatrics, Cardiology, Orthopedics, Oncology, and more.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              marginTop: "32px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#38bdf8" }}>9</div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                Specialists
              </div>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#34d399" }}>Live</div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                Queue Sync
              </div>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>100%</div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                Digital
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
