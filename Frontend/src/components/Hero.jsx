import React from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Activity, CheckCircle2, ShieldCheck, Clock } from "lucide-react";

const Hero = ({ title, imageUrl }) => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          <div>
            <div className="hero-badge">
              <ShieldCheck size={16} />
              <span>Accredited Healthcare & Smart Queue System</span>
            </div>

            <h1 className="hero-title">
              Skip The Waiting Room. <span>Track Your OPD Queue</span> In Real-Time.
            </h1>

            <p className="hero-description">
              Curamed revolutionizes hospital visits with instant specialist booking, automated OPD tokens, and live queue monitoring right from your mobile device.
            </p>

            <div className="hero-cta-group">
              <Link to="/appointment" className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "16px" }}>
                <CalendarPlus size={18} />
                <span>Book Doctor Appointment</span>
              </Link>

              <Link to="/myappointments" className="btn btn-outline" style={{ padding: "14px 28px", fontSize: "16px" }}>
                <Activity size={18} color="var(--primary)" />
                <span>Track Live Queue</span>
              </Link>
            </div>

            <div className="hero-metrics">
              <div className="hero-metric-item">
                <h4>9+</h4>
                <p>Specialties</p>
              </div>
              <div className="hero-metric-item">
                <h4>~15m</h4>
                <p>Avg Wait Time</p>
              </div>
              <div className="hero-metric-item">
                <h4>100%</h4>
                <p>Live OPD Tokens</p>
              </div>
            </div>
          </div>

          <div>
            <div className="hero-image-card">
              <img
                src={imageUrl || "/images/hero.png"}
                alt="Doctor consultation"
                onError={(e) => {
                  e.target.src = "/images/about.png";
                }}
              />
              <div className="hero-floating-badge">
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "var(--success-light)",
                    color: "var(--success)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Activity size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)" }}>
                    Digital Queue Active
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Live token calling & automated SMS/screen updates
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
