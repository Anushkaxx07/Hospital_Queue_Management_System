import React from "react";
import { CheckCircle2, Clock, ShieldCheck, HeartHandshake } from "lucide-react";

const Biography = ({ imageUrl }) => {
  return (
    <section className="biography-section">
      <div className="container">
        <div className="biography-grid">
          <div className="biography-img-wrapper">
            <img
              src={imageUrl || "/images/about.png"}
              alt="Curamed Hospital facility"
              onError={(e) => {
                e.target.src = "/images/about.png";
              }}
            />
          </div>

          <div>
            <div className="section-tag">About Curamed Healthcare</div>
            <h2 className="section-title" style={{ textAlign: "left", marginBottom: "18px" }}>
              Transforming Patient Experience Through Digital Clinical Care
            </h2>

            <p style={{ marginBottom: "16px" }}>
              Welcome to <strong>Curamed</strong>, an integrated hospital management and digital queue ecosystem designed to eliminate overcrowded waiting rooms, minimize stress, and provide seamless access to specialist medical care.
            </p>

            <p style={{ marginBottom: "24px" }}>
              By merging modern electronic OPD token generation with physician cabin consoles, patients can monitor their estimated wait times, receive live status notifications, and proceed to their doctor's cabin only when their token is called.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={20} color="var(--primary)" />
                <span style={{ fontWeight: "600", fontSize: "14px" }}>Verified Specialists</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={20} color="var(--primary)" />
                <span style={{ fontWeight: "600", fontSize: "14px" }}>Real-Time Queue Wait</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <span style={{ fontWeight: "600", fontSize: "14px" }}>Digital Consultation Slips</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <HeartHandshake size={20} color="var(--primary)" />
                <span style={{ fontWeight: "600", fontSize: "14px" }}>Patient-First Triage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Biography;
