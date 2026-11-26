import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate, Link } from "react-router-dom";
import { Stethoscope, Phone, Mail, MapPin, Clock, Plus, Activity } from "lucide-react";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(Context);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${apiUrl}/api/v1/user/doctors`, {
          withCredentials: true,
        });
        setDoctors(data.doctors || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchDoctors();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const departments = [
    "All",
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Dermatology",
    "ENT",
    "Physical Therapy",
  ];

  const filteredDoctors = doctors.filter(
    (doc) => selectedDept === "All" || doc.doctorDepartment === selectedDept
  );

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Staff & Doctor Roster 👨‍⚕️</h1>
          <p className="page-subtitle">
            Registered medical specialists, assigned OPD cabins, and consultation schedules
          </p>
        </div>

        <div className="header-actions">
          <Link to="/doctor/addnew" className="btn btn-primary">
            <Plus size={16} />
            <span>Onboard New Doctor</span>
          </Link>
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "12px",
          marginBottom: "28px",
        }}
      >
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: selectedDept === dept ? "var(--primary)" : "var(--border)",
              backgroundColor: selectedDept === dept ? "var(--primary)" : "#fff",
              color: selectedDept === dept ? "#fff" : "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          Loading registered medical specialists...
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="doctors-grid">
          {filteredDoctors.map((doc) => {
            const avatarUrl =
              doc.docAvatar?.url || doc.docAvator?.url || "/docHolder.jpg";

            return (
              <div className="doctor-card" key={doc._id}>
                <img
                  src={avatarUrl}
                  alt={doc.firstName}
                  className="doctor-avatar-lg"
                  onError={(e) => {
                    e.target.src = "/docHolder.jpg";
                  }}
                />

                <div className="doctor-name">
                  Dr. {doc.firstName} {doc.lastName}
                </div>

                <div className="doctor-dept-pill">{doc.doctorDepartment}</div>

                <div className="doctor-meta-list">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={15} color="var(--primary)" />
                    <span>Location: <strong>{doc.cabinNumber || "Cabin 101 (OPD)"}</strong></span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock size={15} color="var(--primary)" />
                    <span>Avg Consult: <strong>{doc.averageConsultationMinutes || 15} mins</strong></span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Mail size={15} color="#94a3b8" />
                    <span>{doc.email}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone size={15} color="#94a3b8" />
                    <span>{doc.phone}</span>
                  </div>
                </div>

                <div style={{ marginTop: "18px", width: "100%" }}>
                  <Link
                    to="/queue"
                    className="btn btn-outline"
                    style={{ width: "100%", justifyContent: "center", fontSize: "13px" }}
                  >
                    <Activity size={14} color="var(--primary)" />
                    <span>View Doctor Queue</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="content-card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
          No doctors currently registered for {selectedDept}.
        </div>
      )}
    </div>
  );
};

export default Doctors;