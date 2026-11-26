import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { User, Mail, Phone, Lock, Calendar, IdCard, Hospital, ArrowRight } from "lucide-react";

const Register = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nic: "",
    dob: "",
    gender: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${apiUrl}/api/v1/user/patient/register`,
        { ...formData, role: "Patient" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(response.data.message || "Registration successful!");
      setIsAuthenticated(true);
      setUser(response.data.user || {});
      navigate("/appointment");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/appointment" />;
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Hospital size={28} color="#fff" />
          </div>
          <h2>Create Patient Account</h2>
          <p>Register once to book OPD doctor slots, track real-time queue tokens, and view consultation slips</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-grid-2">
            <div className="form-input-group">
              <label>First Name *</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-input-group">
              <label>Last Name *</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-input-group">
              <label>Email Address *</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-input-group">
              <label>Mobile Number *</label>
              <div className="input-with-icon">
                <Phone size={18} className="field-icon" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-input-group">
              <label>National ID / NIC *</label>
              <div className="input-with-icon">
                <IdCard size={18} className="field-icon" />
                <input
                  type="text"
                  name="nic"
                  required
                  placeholder="ID / NIC number"
                  value={formData.nic}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-input-group">
              <label>Date of Birth *</label>
              <div className="input-with-icon">
                <Calendar size={18} className="field-icon" />
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-input-group">
              <label>Gender *</label>
              <select
                name="gender"
                required
                className="styled-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-input-group">
              <label>Account Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: "16px" }}
          >
            <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer-links">
          Already registered with Curamed?{" "}
          <Link to="/login" className="auth-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
