import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { ShieldPlus, ArrowLeft } from "lucide-react";

const AddNewAdmin = () => {
  const { isAuthenticated } = useContext(Context);
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
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNewAdmin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { data } = await axios.post(
        `${apiUrl}/api/v1/user/admin/addnew`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(data.message || "New Administrator created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create administrator");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Register Hospital Administrator 🛡️</h1>
          <p className="page-subtitle">
            Grant managerial access for hospital departments, OPD scheduling, and staff control
          </p>
        </div>

        <button className="btn btn-outline" onClick={() => navigate("/")}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="form-container">
        <form onSubmit={handleAddNewAdmin}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                required
                className="form-input"
                placeholder="e.g. Sarah"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                required
                className="form-input"
                placeholder="e.g. Connor"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Email *</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="admin@curamed.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="tel"
                name="phone"
                required
                className="form-input"
                placeholder="10 digit phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">National ID / NIC *</label>
              <input
                type="text"
                name="nic"
                required
                className="form-input"
                placeholder="ID number"
                value={formData.nic}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="dob"
                required
                className="form-input"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                name="gender"
                required
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Master Account Password *</label>
              <input
                type="password"
                name="password"
                required
                className="form-input"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ padding: "10px 24px" }}
            >
              <ShieldPlus size={16} />
              <span>{submitting ? "Creating Admin..." : "Create Administrator"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewAdmin;