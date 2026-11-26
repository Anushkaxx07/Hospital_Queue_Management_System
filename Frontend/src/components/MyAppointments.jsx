import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Context } from "../main";
import {
  Activity,
  Printer,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw,
  CalendarPlus,
  Hospital,
  User,
  Phone,
  ShieldCheck,
} from "lucide-react";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useContext(Context);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${apiUrl}/api/v1/appointment/my`, {
        withCredentials: true,
      });
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchMyAppointments();
  }, [isAuthenticated]);

  // Real-time live queue listener
  useEffect(() => {
    const socket = io(apiUrl, { withCredentials: true });

    socket.on("queue:updated", () => {
      fetchMyAppointments();
    });

    const interval = setInterval(fetchMyAppointments, 10000); // 10-sec fallback
    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  // Active appointment for today (or latest active)
  const activeTodayAppointment = appointments.find(
    (app) => app.appointment_date === todayStr && ["Waiting", "Serving", "Accepted", "Pending"].includes(app.status)
  ) || appointments.find((app) => ["Waiting", "Serving"].includes(app.status)) || appointments[0];

  const isServingNow = activeTodayAppointment?.status === "Serving";

  return (
    <div className="my-appointments-page">
      <div className="container">
        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontSize: "13px", fontWeight: "700", textTransform: "uppercase" }}>
              <Activity size={16} />
              <span>Live OPD Queue System</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px" }}>
              My Appointments & Live OPD Pass 🎫
            </h1>
            <p>
              Welcome, <strong>{user?.firstName} {user?.lastName}</strong>. Monitor your active queue token and view your consultation history.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-outline" onClick={fetchMyAppointments} disabled={loading}>
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              <span>Refresh Queue</span>
            </button>
            <Link to="/appointment" className="btn btn-primary">
              <CalendarPlus size={16} />
              <span>Book New Slot</span>
            </Link>
          </div>
        </div>

        {/* 1. Star Component: Active Live OPD Boarding Pass */}
        {activeTodayAppointment ? (
          <div className="active-token-hero">
            <div className="token-pass-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "#0284c7", padding: "10px", borderRadius: "10px", display: "flex" }}>
                  <Hospital size={24} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "1px" }}>
                    CURAMED OUTPATIENT PASS
                  </div>
                  <div style={{ fontSize: "12px", color: "#38bdf8" }}>
                    OFFICIAL OPD APPOINTMENT TOKEN
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700",
                    background: isServingNow ? "#10b981" : "rgba(245, 158, 11, 0.2)",
                    color: isServingNow ? "#fff" : "#fbbf24",
                    border: `1px solid ${isServingNow ? "#10b981" : "#f59e0b"}`,
                  }}
                >
                  {isServingNow ? "🚨 NOW IN CONSULTATION" : "⏳ QUEUED / WAITING"}
                </span>

                <button
                  className="btn btn-outline"
                  onClick={() => window.print()}
                  style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff", borderColor: "rgba(255, 255, 255, 0.2)", padding: "6px 14px" }}
                >
                  <Printer size={16} />
                  <span>Print OPD Slip</span>
                </button>
              </div>
            </div>

            {/* Giant Token Callout */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>
                  Your Allocated Token Number
                </div>
                <div className="token-code-giant">
                  {activeTodayAppointment.tokenCode || `#${activeTodayAppointment.tokenNumber}`}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>
                  Dr. {activeTodayAppointment.doctor?.firstName} {activeTodayAppointment.doctor?.lastName}
                </div>
                <div style={{ fontSize: "14px", color: "#38bdf8", marginTop: "4px" }}>
                  {activeTodayAppointment.department} • <strong>{activeTodayAppointment.doctorId?.cabinNumber || "Cabin 101"}</strong>
                </div>
              </div>

              {/* Dynamic Live Status Box */}
              <div
                style={{
                  background: isServingNow ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                  border: `2px solid ${isServingNow ? "#10b981" : "rgba(255, 255, 255, 0.15)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                {isServingNow ? (
                  <div>
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔔</div>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "#34d399" }}>
                      YOUR TOKEN IS CALLED!
                    </div>
                    <p style={{ color: "#e2e8f0", fontSize: "14px", marginTop: "6px" }}>
                      Please proceed directly to <strong>{activeTodayAppointment.doctorId?.cabinNumber || "Cabin 101"}</strong> now.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>
                      Current Station Status
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "800", color: "#38bdf8", margin: "8px 0" }}>
                      Now Serving: {activeTodayAppointment.currentlyServingToken || "Not Started"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#e2e8f0" }}>
                      {activeTodayAppointment.patientsAhead === 0 ? (
                        <strong style={{ color: "#f59e0b" }}>You are next in line! Stay ready.</strong>
                      ) : (
                        <span>
                          <strong>{activeTodayAppointment.patientsAhead}</strong> patient(s) ahead of you
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Progress Metrics Bar */}
            <div className="queue-progress-bar-container">
              <div className="queue-stat-item">
                <span className="queue-stat-label">Estimated Wait Time</span>
                <span className="queue-stat-value">
                  {isServingNow ? "0 mins" : `~${activeTodayAppointment.liveEstimatedWaitMinutes || 15} mins`}
                </span>
              </div>

              <div className="queue-stat-item">
                <span className="queue-stat-label">Total in Doctor's Queue</span>
                <span className="queue-stat-value">
                  {activeTodayAppointment.totalInQueue || 1} Patients
                </span>
              </div>

              <div className="queue-stat-item">
                <span className="queue-stat-label">Appointment Date</span>
                <span className="queue-stat-value" style={{ fontSize: "18px" }}>
                  {activeTodayAppointment.appointment_date}
                </span>
              </div>

              <div className="queue-stat-item">
                <span className="queue-stat-label">Consultation Cabin</span>
                <span className="queue-stat-value" style={{ fontSize: "18px", color: "#38bdf8" }}>
                  {activeTodayAppointment.doctorId?.cabinNumber || "Cabin 101"}
                </span>
              </div>
            </div>

            <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} color="#38bdf8" />
              <span>Real-time Socket sync enabled. Your queue status updates automatically as the doctor admits patients.</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "48px 24px",
              textAlign: "center",
              marginBottom: "40px",
            }}
          >
            <CalendarPlus size={48} color="var(--primary)" style={{ opacity: 0.6, margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
              No Active Appointments Found
            </h3>
            <p style={{ maxWidth: "480px", margin: "0 auto 20px" }}>
              You don't have any pending outpatient appointments scheduled. Book a slot with our specialist doctors to get your digital queue token.
            </p>
            <Link to="/appointment" className="btn btn-primary">
              <CalendarPlus size={16} />
              <span>Book Appointment Now</span>
            </Link>
          </div>
        )}

        {/* 2. Patient Appointment History Table */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px" }}>
            All Booked OPD Visits & Passes ({appointments.length})
          </h3>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Cabin</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: "700",
                            background: "#f1f5f9",
                            padding: "4px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {app.tokenCode || `#${app.tokenNumber}`}
                        </span>
                      </td>
                      <td>{app.appointment_date}</td>
                      <td>
                        <strong>Dr. {app.doctor?.firstName} {app.doctor?.lastName}</strong>
                      </td>
                      <td>{app.department}</td>
                      <td>{app.doctorId?.cabinNumber || "Cabin 101"}</td>
                      <td>
                        <span
                          className={`badge ${
                            app.status === "Serving"
                              ? "badge-serving"
                              : app.status === "Completed"
                              ? "badge-completed"
                              : app.status === "Cancelled"
                              ? "badge-cancelled"
                              : "badge-waiting"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      No past appointments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAppointments;
