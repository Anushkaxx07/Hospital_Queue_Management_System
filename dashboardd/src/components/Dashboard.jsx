import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Users,
  CalendarCheck,
  Clock,
  Stethoscope,
  Activity,
  Tv,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
} from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated, admin } = useContext(Context);
  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [apptRes, analyticsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/v1/appointment/getall`, { withCredentials: true }),
        axios.get(`${apiUrl}/api/v1/appointment/analytics`, { withCredentials: true }),
      ]);

      setAppointments(apptRes.data.appointment || apptRes.data.appointments || []);
      setAnalytics(analyticsRes.data.analytics);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const { data } = await axios.put(
        `${apiUrl}/api/v1/appointment/update/${appointmentId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(data.message || `Status updated to ${newStatus}`);

      // Optimistically update appointment in state
      setAppointments((prev) =>
        prev.map((app) =>
          app._id === appointmentId ? { ...app, status: newStatus } : app
        )
      );

      // Re-fetch analytics to update live counters
      const analyticsRes = await axios.get(`${apiUrl}/api/v1/appointment/analytics`, {
        withCredentials: true,
      });
      setAnalytics(analyticsRes.data.analytics);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update appointment status");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.doctor?.firstName &&
        `${app.doctor.firstName} ${app.doctor.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (app.tokenCode && app.tokenCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      app.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      app.status === statusFilter ||
      (statusFilter === "Waiting" && ["Waiting", "Accepted", "Pending"].includes(app.status));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="main-content">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome, Dr./Admin {admin?.firstName || "Staff"} 👋
          </h1>
          <p className="page-subtitle">
            Hospital Operations & Real-Time OPD Queue Command Center
          </p>
        </div>

        <div className="header-actions">
          <Link to="/queue" className="btn btn-primary">
            <Activity size={16} />
            <span>OPD Queue Controller</span>
          </Link>
          <Link to="/waiting-room" className="btn btn-outline" target="_blank">
            <Tv size={16} />
            <span>Launch Waiting Room TV</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Today's OPD Volume</div>
            <div className="kpi-value">
              {analytics ? analytics.todayAppointments : appointments.length}
            </div>
            <div className="kpi-meta">
              <span>Total Scheduled Today</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-blue">
            <CalendarCheck size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Active Waiting Queue</div>
            <div className="kpi-value">
              {analytics ? analytics.waitingAppointments : "--"}
            </div>
            <div className="kpi-meta">
              <span style={{ color: "#d97706" }}>Patients In Waiting Line</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-yellow">
            <Clock size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Consultations Done</div>
            <div className="kpi-value">
              {analytics ? analytics.completedAppointments : "--"}
            </div>
            <div className="kpi-meta">
              <span style={{ color: "#059669" }}>Completed & Discharged</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-green">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Registered Doctors</div>
            <div className="kpi-value">
              {analytics ? analytics.totalDoctors : "--"}
            </div>
            <div className="kpi-meta">
              <span>Specialists On Duty</span>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-blue">
            <Stethoscope size={24} />
          </div>
        </div>
      </div>

      {/* Department Breakdown Bar */}
      {analytics?.departmentStats && analytics.departmentStats.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "18px 24px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>
            DEPARTMENT WORKLOAD:
          </span>
          {analytics.departmentStats.map((dept) => (
            <span
              key={dept._id}
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              {dept._id}: <strong>{dept.count}</strong>
            </span>
          ))}
        </div>
      )}

      {/* Appointments Management Table Card */}
      <div className="content-card">
        <div className="content-card-header">
          <div className="content-card-title">Appointments & OPD Patient Roster</div>

          <div className="search-filter-bar">
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: "absolute", left: "12px" }}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search patient, token, doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Waiting">Waiting / Queued</option>
              <option value="Serving">In Consultation (Serving)</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient Details</th>
                <th>Doctor & Cabin</th>
                <th>Department</th>
                <th>Scheduled Date</th>
                <th>Queue Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                    Loading real-time hospital appointments...
                  </td>
                </tr>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <span className="badge-token">{app.tokenCode || `#${app.queuePosition}`}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600" }}>
                        {app.firstName} {app.lastName}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {app.phone} • {app.gender}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "500" }}>
                        Dr. {app.doctor?.firstName} {app.doctor?.lastName}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--primary)" }}>
                        {app.doctorId?.cabinNumber || "Cabin 101"}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "var(--primary-light)",
                          color: "var(--primary)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {app.department}
                      </span>
                    </td>
                    <td>{app.appointment_date}</td>
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
                        {app.status === "Serving" && "● "}
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <select
                        style={{
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border)",
                          fontSize: "13px",
                          fontWeight: "500",
                          backgroundColor: "#fff",
                          cursor: "pointer",
                        }}
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                      >
                        <option value="Waiting">Waiting</option>
                        <option value="Serving">Call / Serving</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No-Show">No Show</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No matching appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
