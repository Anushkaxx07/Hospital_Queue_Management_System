import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import {
  Activity,
  PhoneCall,
  CheckCircle2,
  Clock,
  UserCheck,
  Stethoscope,
  Tv,
  Users,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const OpdQueueController = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Fetch doctors list on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/api/v1/user/doctors`, {
          withCredentials: true,
        });
        setDoctors(data.doctors || []);
        if (data.doctors && data.doctors.length > 0) {
          setSelectedDoctorId(data.doctors[0]._id);
        }
      } catch (err) {
        toast.error("Failed to load doctors list");
      }
    };
    fetchDoctors();
  }, []);

  // Fetch queue data whenever selected doctor changes
  const fetchQueueData = async () => {
    if (!selectedDoctorId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${apiUrl}/api/v1/appointment/live-queue?doctorId=${selectedDoctorId}`,
        { withCredentials: true }
      );
      setQueueData(data);
    } catch (err) {
      console.error("Queue fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, [selectedDoctorId]);

  // Socket.io real-time listener for live queue updates
  useEffect(() => {
    const socket = io(apiUrl, { withCredentials: true });

    socket.on("queue:updated", (payload) => {
      if (!selectedDoctorId || payload.doctorId === selectedDoctorId) {
        fetchQueueData();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedDoctorId]);

  // One-Click: Call Next Patient in Line
  const handleCallNext = async () => {
    try {
      setActionLoading(true);
      const { data } = await axios.post(
        `${apiUrl}/api/v1/appointment/call-next`,
        { doctorId: selectedDoctorId },
        { withCredentials: true }
      );

      if (data.appointment) {
        toast.success(`Now Calling: Token ${data.appointment.tokenCode} (${data.appointment.firstName})`);
      } else {
        toast.info(data.message || "No more patients waiting today!");
      }
      fetchQueueData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to call next patient");
    } finally {
      setActionLoading(false);
    }
  };

  // Complete current consultation
  const handleCompleteCurrent = async (appointmentId) => {
    try {
      setActionLoading(true);
      const { data } = await axios.put(
        `${apiUrl}/api/v1/appointment/update/${appointmentId}`,
        { status: "Completed" },
        { withCredentials: true }
      );
      toast.success(data.message || "Consultation marked as completed!");
      fetchQueueData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId);

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctor OPD Queue Controller 🩺</h1>
          <p className="page-subtitle">
            Manage live patient flow, call next token, and track cabin consultations
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchQueueData} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            <span>Refresh Queue</span>
          </button>
          <a href="/waiting-room" target="_blank" rel="noreferrer" className="btn btn-outline">
            <Tv size={16} />
            <span>Waiting Room Screen</span>
          </a>
        </div>
      </div>

      {/* Doctor & Department Selector Bar */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div className="kpi-icon-box kpi-icon-blue" style={{ width: "42px", height: "42px" }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Active Clinical Station
            </div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
              {selectedDoctor ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}` : "Select Doctor"}
              <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--primary)", marginLeft: "8px" }}>
                ({selectedDoctor?.doctorDepartment} • {selectedDoctor?.cabinNumber || "Cabin 101"})
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
            Switch Doctor:
          </label>
          <select
            className="filter-select"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            style={{ minWidth: "260px" }}
          >
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                Dr. {doc.firstName} {doc.lastName} ({doc.doctorDepartment})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main OPD Queue Split View */}
      <div className="opd-controller-container">
        {/* Left Side: Now Calling Hero & Active Controls */}
        <div>
          {queueData?.currentlyServing ? (
            <div className="now-calling-hero">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="now-calling-badge">
                  <Activity size={14} /> NOW IN CONSULTATION (CABIN OCCUPIED)
                </span>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Called at: {new Date(queueData.currentlyServing.calledAt || Date.now()).toLocaleTimeString()}
                </span>
              </div>

              <div className="calling-token-display">
                {queueData.currentlyServing.tokenCode}
              </div>

              <div className="calling-patient-name">
                {queueData.currentlyServing.firstName} {queueData.currentlyServing.lastName}
              </div>

              <div className="calling-meta-row">
                <div>
                  <strong>Phone:</strong> {queueData.currentlyServing.phone}
                </div>
                <div>
                  <strong>Gender / Age:</strong> {queueData.currentlyServing.gender}
                </div>
                <div>
                  <strong>Department:</strong> {queueData.currentlyServing.department}
                </div>
                <div>
                  <strong>Location:</strong> {selectedDoctor?.cabinNumber || "Cabin 101"}
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", marginTop: "24px" }}>
                <button
                  className="btn btn-success"
                  onClick={() => handleCompleteCurrent(queueData.currentlyServing._id)}
                  disabled={actionLoading}
                  style={{ padding: "12px 24px", fontSize: "15px" }}
                >
                  <CheckCircle2 size={18} />
                  <span>Complete Consultation</span>
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleCallNext}
                  disabled={actionLoading}
                  style={{ padding: "12px 24px", fontSize: "15px" }}
                >
                  <PhoneCall size={18} />
                  <span>Call Next Patient</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="now-calling-hero"
              style={{
                background: "linear-gradient(135deg, #1e293b, #334155)",
                textAlign: "center",
                padding: "48px 32px",
              }}
            >
              <div style={{ color: "#94a3b8", marginBottom: "12px" }}>
                <Users size={48} style={{ opacity: 0.6 }} />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
                Doctor's Cabin Is Currently Idle
              </h2>
              <p style={{ color: "#94a3b8", maxWidth: "480px", margin: "0 auto 24px", fontSize: "14px" }}>
                There is currently no patient inside the consultation room. Ready to admit the next patient from the waiting lounge?
              </p>
              <button
                className="btn btn-success"
                onClick={handleCallNext}
                disabled={actionLoading || queueData?.waitingCount === 0}
                style={{ padding: "14px 28px", fontSize: "16px" }}
              >
                <PhoneCall size={20} />
                <span>Call Next Patient In Line</span>
              </button>
            </div>
          )}

          {/* Upcoming Patients Waiting Line */}
          <div className="content-card">
            <div className="content-card-header">
              <div className="content-card-title">
                Patients Waiting in Queue ({queueData?.waitingCount || 0})
              </div>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Next in queue for today
              </span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Patient Name</th>
                    <th>Phone</th>
                    <th>Est. Wait</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queueData?.nextInLine && queueData.nextInLine.length > 0 ? (
                    queueData.nextInLine.map((patient, index) => (
                      <tr key={patient._id}>
                        <td>
                          <span className="badge-token">{patient.tokenCode}</span>
                        </td>
                        <td style={{ fontWeight: "600" }}>
                          {patient.firstName} {patient.lastName}
                        </td>
                        <td>{patient.phone}</td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)" }}>
                            <Clock size={14} color="#d97706" />
                            ~{index * (selectedDoctor?.averageConsultationMinutes || 15)} mins
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-waiting">Waiting</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={handleCallNext}
                            disabled={actionLoading}
                          >
                            <span>Call This Patient</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                        No waiting patients in line for Dr. {selectedDoctor?.firstName} today!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats & Doctor Summary */}
        <div>
          <div className="content-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
              Queue Performance Today
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total Booked Today</span>
                <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>{queueData?.totalToday || 0}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Waiting Patients</span>
                <strong style={{ fontSize: "16px", color: "#d97706" }}>{queueData?.waitingCount || 0}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Completed Consultations</span>
                <strong style={{ fontSize: "16px", color: "#059669" }}>{queueData?.completedCount || 0}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Average Consult Time</span>
                <strong style={{ fontSize: "16px", color: "var(--primary)" }}>{selectedDoctor?.averageConsultationMinutes || 15} mins</strong>
              </div>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px" }}>
                Doctor Information
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>
                Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Specialty: {selectedDoctor?.doctorDepartment}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Room: {selectedDoctor?.cabinNumber || "Cabin 101"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpdQueueController;
