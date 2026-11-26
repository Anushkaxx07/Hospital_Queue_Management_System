import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Hospital, Bell, Clock, ChevronRight, Volume2, ShieldAlert } from "lucide-react";

const WaitingRoomTv = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [queueData, setQueueData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [justCalled, setJustCalled] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/api/v1/user/doctors`);
        setDoctors(data.doctors || []);
        if (data.doctors && data.doctors.length > 0) {
          setSelectedDoctorId(data.doctors[0]._id);
        }
      } catch (err) {
        console.error("Doctors load failed:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch live queue data
  const fetchLiveQueue = async () => {
    try {
      const url = selectedDoctorId
        ? `${apiUrl}/api/v1/appointment/live-queue?doctorId=${selectedDoctorId}`
        : `${apiUrl}/api/v1/appointment/live-queue`;
      const { data } = await axios.get(url);
      setQueueData(data);
    } catch (err) {
      console.error("Failed to fetch live queue:", err);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
    const interval = setInterval(fetchLiveQueue, 8000); // 8-sec fallback sync
    return () => clearInterval(interval);
  }, [selectedDoctorId]);

  // Socket.io Real-Time Event Listener
  useEffect(() => {
    const socket = io(apiUrl);

    socket.on("queue:updated", (payload) => {
      fetchLiveQueue();
      // Trigger visual flash chime
      setJustCalled(true);
      setTimeout(() => setJustCalled(false), 5000);
    });

    return () => socket.disconnect();
  }, [selectedDoctorId]);

  const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId);

  return (
    <div className="tv-waiting-room">
      {/* Top TV Header */}
      <div className="tv-header">
        <div className="tv-brand">
          <div style={{ background: "#0284c7", padding: "10px", borderRadius: "12px", display: "flex" }}>
            <Hospital size={36} color="#fff" />
          </div>
          <div>
            <div className="tv-brand-logo">CURAMED HEALTHCARE</div>
            <div style={{ fontSize: "14px", color: "#38bdf8", letterSpacing: "1px", fontWeight: "700" }}>
              OUTPATIENT DIGITAL QUEUE BOARD • LIVE OPD
            </div>
          </div>
        </div>

        {/* Doctor Station Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", color: "#94a3b8" }}>Station:</span>
          <select
            style={{
              background: "#1e293b",
              color: "#fff",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "15px",
              fontWeight: "600",
              outline: "none",
            }}
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.doctorDepartment} — Dr. {d.firstName} {d.lastName} ({d.cabinNumber || "Cabin 101"})
              </option>
            ))}
          </select>
        </div>

        <div className="tv-clock">{time}</div>
      </div>

      {/* Main Dual Stage */}
      <div className="tv-grid">
        {/* Left: Giant Callout Card */}
        <div
          className="tv-card-main"
          style={{
            borderColor: justCalled ? "#10b981" : "rgba(56, 189, 248, 0.4)",
            boxShadow: justCalled
              ? "0 0 80px rgba(16, 185, 129, 0.4)"
              : "0 0 50px rgba(2, 132, 199, 0.15)",
            transition: "all 0.5s ease",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "18px",
              fontWeight: "800",
              color: "#38bdf8",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            <Bell size={22} className={justCalled ? "spin" : ""} />
            {justCalled ? "📢 NOW CALLING (NEW PATIENT)" : "NOW CALLING"}
          </div>

          {queueData?.currentlyServing ? (
            <>
              <div className="tv-token-giant">
                {queueData.currentlyServing.tokenCode}
              </div>

              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#f8fafc",
                  marginBottom: "20px",
                }}
              >
                {queueData.currentlyServing.firstName} {queueData.currentlyServing.lastName}
              </div>

              <div className="tv-cabin-badge">
                PLEASE PROCEED TO: {selectedDoctor?.cabinNumber || "CABIN 101"}
              </div>

              <div
                style={{
                  marginTop: "24px",
                  fontSize: "18px",
                  color: "#94a3b8",
                  fontWeight: "500",
                }}
              >
                Physician: Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName} •{" "}
                <span style={{ color: "#38bdf8" }}>{selectedDoctor?.doctorDepartment}</span>
              </div>
            </>
          ) : (
            <div style={{ padding: "40px 0" }}>
              <div style={{ fontSize: "60px", color: "#334155", marginBottom: "16px" }}>
                ⏳
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#94a3b8" }}>
                Cabin Currently Preparing
              </div>
              <p style={{ color: "#64748b", marginTop: "8px", fontSize: "16px" }}>
                Please wait. Next OPD Token will appear shortly.
              </p>
            </div>
          )}
        </div>

        {/* Right: Upcoming Tokens Line */}
        <div className="tv-card-side">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc" }}>
              UP NEXT IN QUEUE
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#38bdf8",
                background: "rgba(2, 132, 199, 0.2)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontWeight: "700",
              }}
            >
              Waiting: {queueData?.waitingCount || 0}
            </div>
          </div>

          {queueData?.nextInLine && queueData.nextInLine.length > 0 ? (
            queueData.nextInLine.map((patient, index) => (
              <div key={patient._id} className="tv-queue-row">
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "22px",
                      fontWeight: "900",
                      color: "#38bdf8",
                      background: "rgba(56, 189, 248, 0.1)",
                      padding: "4px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                    }}
                  >
                    {patient.tokenCode}
                  </span>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                      {patient.gender} • Est. Wait ~{index * 15} mins
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#f59e0b",
                    textTransform: "uppercase",
                  }}
                >
                  Position #{index + 1}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              No further patients waiting in line for this station.
            </div>
          )}
        </div>
      </div>

      {/* Hospital Ticker Announcement */}
      <div className="tv-ticker">
        <Volume2 size={20} color="#38bdf8" />
        <span>
          <strong>ANNOUNCEMENT:</strong> Please keep your OPD Appointment Token Slip handy. Please enter your designated cabin only when your Token Number is called on screen. For wheelchair or emergency assistance, contact the help desk.
        </span>
      </div>
    </div>
  );
};

export default WaitingRoomTv;
