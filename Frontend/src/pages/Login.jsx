import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Mail, Lock, Sparkles, ArrowRight, Hospital, ShieldCheck } from "lucide-react";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${apiUrl}/api/v1/user/login`,
        { email, password, role: "Patient" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(response.data.message || "Welcome back!");
      setIsAuthenticated(true);
      setUser(response.data.user || {});
      navigate("/myappointments");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoPatient = () => {
    setEmail("patient@curamed.com");
    setPassword("Password123!");
    toast.info("Demo patient credentials populated!");
  };

  if (isAuthenticated) {
    return <Navigate to="/myappointments" />;
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Hospital size={28} color="#fff" />
          </div>
          <h2>Sign In to Curamed</h2>
          <p>Access your OPD appointments, live queue tokens, and medical passes</p>
        </div>

        {/* Quick Demo Fill Button */}
        <button
          type="button"
          onClick={fillDemoPatient}
          className="demo-credentials-btn"
        >
          <Sparkles size={16} />
          <span>⚡ One-Click Demo Patient Login</span>
        </button>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-input-group">
            <label>Registered Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="form-input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            <span>{loading ? "Signing in..." : "Sign In to Patient Portal"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer-links">
          <div>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </div>
          <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>
            Hospital Staff / Doctor?{" "}
            <a href="http://localhost:5174" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: "600" }}>
              Clinical Console ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
