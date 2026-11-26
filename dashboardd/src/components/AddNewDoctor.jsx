import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
import { UserPlus, Upload, Stethoscope, ArrowLeft } from "lucide-react";

const AddNewDoctor = () => {
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
    doctorDepartment: "",
    cabinNumber: "Cabin 101",
    averageConsultationMinutes: "15",
  });
  const [docAvatar, setDocAvatar] = useState(null);
  const [docAvatarPreview, setDocAvatarPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setDocAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (docAvatar) {
        data.append("docAvatar", docAvatar);
      }

      const response = await axios.post(
        `${apiUrl}/api/v1/user/doctor/addnew`,
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(response.data.message || "New Doctor registered successfully!");
      navigate("/doctors");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register doctor");
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
          <h1 className="page-title">Onboard New Medical Doctor 🩺</h1>
          <p className="page-subtitle">
            Add a physician to the hospital roster, assign OPD cabin, and set consultation timings
          </p>
        </div>

        <button className="btn btn-outline" onClick={() => navigate("/doctors")}>
          <ArrowLeft size={16} />
          <span>Back to Doctors</span>
        </button>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* Avatar upload section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              paddingBottom: "24px",
              borderBottom: "1px solid var(--border)",
              marginBottom: "24px",
            }}
          >
            <img
              src={docAvatarPreview || "/docHolder.jpg"}
              alt="Avatar Preview"
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--primary-light)",
              }}
            />
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                Doctor Profile Photo
              </div>
              <label
                className="btn btn-outline"
                style={{ cursor: "pointer", fontSize: "13px" }}
              >
                <Upload size={14} />
                <span>Upload Photograph</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatar}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                required
                className="form-input"
                placeholder="e.g. Robert"
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
                placeholder="e.g. Miller"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Professional Email *</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="e.g. rmiller@curamed.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                className="form-input"
                placeholder="10 digit contact"
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
                placeholder="NIC number"
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
              <label className="form-label">Medical Specialty / Department *</label>
              <select
                name="doctorDepartment"
                required
                className="form-select"
                value={formData.doctorDepartment}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {departmentsArray.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned OPD Cabin / Room</label>
              <input
                type="text"
                name="cabinNumber"
                className="form-input"
                placeholder="e.g. Cabin 201 (Cardio Wing)"
                value={formData.cabinNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Average Consultation Time (Minutes)</label>
              <input
                type="number"
                name="averageConsultationMinutes"
                min="5"
                max="60"
                className="form-input"
                value={formData.averageConsultationMinutes}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Temporary Account Password *</label>
              <input
                type="password"
                name="password"
                required
                className="form-input"
                placeholder="Set secure password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/doctors")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ padding: "10px 24px" }}
            >
              <UserPlus size={16} />
              <span>{submitting ? "Registering Doctor..." : "Register Doctor"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewDoctor;