import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import {
  CalendarPlus,
  Stethoscope,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  IdCard,
  Calendar,
  Building2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const AppointmentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useContext(Context);

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nic: "",
    dob: "",
    gender: "",
    appointmentDate: todayStr,
    department: location.state?.preselectedDepartment || "Pediatrics",
    doctorId: "",
    address: "100 MedCity Ave",
    hasVisited: false,
  });

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const departmentsArray = [
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

  // Auto-fill from authenticated user context
  useEffect(() => {
    if (user && user.firstName) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        nic: user.nic || prev.nic,
        dob: user.dob ? user.dob.split("T")[0] : prev.dob,
        gender: user.gender || prev.gender,
      }));
    }
  }, [user]);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const { data } = await axios.get(`${apiUrl}/api/v1/user/doctors`, {
          withCredentials: true,
        });
        setDoctors(data.doctors || []);

        // Pick first doctor in department if available
        const matching = (data.doctors || []).filter(
          (d) => d.doctorDepartment === formData.department
        );
        if (matching.length > 0) {
          setFormData((prev) => ({ ...prev, doctorId: matching[0]._id }));
        }
      } catch (err) {
        toast.error("Failed to fetch available doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Update selected doctor when department changes
  const handleDepartmentChange = (dept) => {
    const matching = doctors.filter((d) => d.doctorDepartment === dept);
    setFormData((prev) => ({
      ...prev,
      department: dept,
      doctorId: matching.length > 0 ? matching[0]._id : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.warn("Please sign in to confirm and book your OPD appointment!");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      const selectedDoc = doctors.find((d) => d._id === formData.doctorId);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        nic: formData.nic,
        dob: formData.dob,
        gender: formData.gender,
        appointment_date: formData.appointmentDate,
        department: formData.department,
        doctorId: formData.doctorId,
        doctor_firstName: selectedDoc?.firstName,
        doctor_lastName: selectedDoc?.lastName,
        address: formData.address,
        hasVisited: formData.hasVisited,
      };

      const { data } = await axios.post(
        `${apiUrl}/api/v1/appointment/post`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(data.message || "Appointment booked! OPD Token Generated.");
      navigate("/myappointments");
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const departmentDoctors = doctors.filter(
    (d) => d.doctorDepartment === formData.department
  );
  const selectedDoctor = doctors.find((d) => d._id === formData.doctorId);

  return (
    <div className="appointment-page">
      <div className="container">
        <div className="appointment-card">
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--primary-light)",
                color: "var(--primary)",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              <CalendarPlus size={16} />
              <span>Digital OPD Booking System</span>
            </div>
            <h2>Book Outpatient Specialist Appointment</h2>
            <p>
              Choose your clinical department, select a consultant doctor, and receive your live OPD queue token pass instantly.
            </p>
          </div>

          <form onSubmit={handleBookAppointment}>
            {/* 1. Patient Demographics */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>
                1. Patient Demographics & Identification
              </h3>

              <div className="form-grid-2">
                <div className="form-input-group">
                  <label>First Name *</label>
                  <div className="input-with-icon">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-input-group">
                  <label>Last Name *</label>
                  <div className="input-with-icon">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-input-group">
                  <label>Contact Email *</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="field-icon" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-input-group">
                  <label>Mobile Phone *</label>
                  <div className="input-with-icon">
                    <Phone size={16} className="field-icon" />
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
                    <IdCard size={16} className="field-icon" />
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
                    <Calendar size={16} className="field-icon" />
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
                  <label>Residential City / Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="styled-select"
                    placeholder="e.g. 100 MedCity Ave"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* 2. Clinical Specialty & Doctor */}
            <div style={{ marginBottom: "32px", borderTop: "1px solid var(--border)", paddingTop: "28px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>
                2. Clinical Specialty & Doctor Selection
              </h3>

              <div className="form-grid-2" style={{ marginBottom: "20px" }}>
                <div className="form-input-group">
                  <label>Department Specialty *</label>
                  <div className="input-with-icon">
                    <Building2 size={16} className="field-icon" />
                    <select
                      className="styled-select"
                      style={{ paddingLeft: "42px", width: "100%" }}
                      value={formData.department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                    >
                      {departmentsArray.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-input-group">
                  <label>Appointment Date *</label>
                  <div className="input-with-icon">
                    <Calendar size={16} className="field-icon" />
                    <input
                      type="date"
                      name="appointmentDate"
                      min={todayStr}
                      required
                      value={formData.appointmentDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Cards Selector */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
                  Select Attending Physician:
                </label>

                {departmentDoctors.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                    {departmentDoctors.map((doc) => {
                      const isSelected = formData.doctorId === doc._id;
                      const avatarUrl = doc.docAvatar?.url || doc.docAvator?.url || "/docHolder.jpg";

                      return (
                        <div
                          key={doc._id}
                          className={`doctor-select-card ${isSelected ? "selected" : ""}`}
                          onClick={() => setFormData((prev) => ({ ...prev, doctorId: doc._id }))}
                        >
                          <img
                            src={avatarUrl}
                            alt={doc.firstName}
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid #e2e8f0",
                            }}
                            onError={(e) => {
                              e.target.src = "/docHolder.jpg";
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)" }}>
                              Dr. {doc.firstName} {doc.lastName}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>
                              {doc.cabinNumber || "Cabin 101"}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                              Avg consult: {doc.averageConsultationMinutes || 15} mins
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 size={20} color="var(--primary)" />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
                    No doctor currently listed for {formData.department}.
                  </div>
                )}
              </div>
            </div>

            {/* Previous Visit Checkbox */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "28px",
                padding: "14px",
                background: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              <input
                type="checkbox"
                id="hasVisited"
                name="hasVisited"
                checked={formData.hasVisited}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="hasVisited" style={{ fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                I have visited Curamed Hospital previously
              </label>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting || !formData.doctorId}
              style={{ padding: "14px", fontSize: "16px" }}
            >
              <span>{submitting ? "Allocating OPD Token..." : "Confirm Booking & Generate OPD Token"}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
