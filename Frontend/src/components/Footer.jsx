import React from "react";
import { Link } from "react-router-dom";
import { Hospital, Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1 */}
          <div className="footer-col">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                  padding: "8px",
                  borderRadius: "8px",
                  display: "flex",
                }}
              >
                <Hospital size={22} color="#fff" />
              </div>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>CURAMED</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px" }}>
              Integrated Hospital & Smart Outpatient Queue Management System. Minimizing patient wait times through live token tracking and digital cabin consultations.
            </p>
            <div style={{ fontSize: "13px", color: "#38bdf8", fontWeight: "600" }}>
              24/7 OPD Emergency Care Available
            </div>
          </div>

          {/* Col 2 */}
          <div className="footer-col">
            <h4>Quick Navigation</h4>
            <ul>
              <li><Link to="/">Hospital Home</Link></li>
              <li><Link to="/appointment">Book OPD Appointment</Link></li>
              <li><Link to="/myappointments">My Live Queue & Passes</Link></li>
              <li><Link to="/about">About Curamed</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="footer-col">
            <h4>Clinical Centers</h4>
            <ul>
              <li><Link to="/appointment">Pediatrics Clinic</Link></li>
              <li><Link to="/appointment">Cardiology Wing</Link></li>
              <li><Link to="/appointment">Orthopedics & Spine</Link></li>
              <li><Link to="/appointment">Neurology Center</Link></li>
              <li><Link to="/appointment">Oncology Care</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="footer-col">
            <h4>Hospital Desk</h4>
            <ul>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={16} color="#38bdf8" />
                <span>100 Health Boulevard, MedCity</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Phone size={16} color="#38bdf8" />
                <span>+1 (800) 420-CURA / +91 98765 43210</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={16} color="#38bdf8" />
                <span>opd-desk@curamed.com</span>
              </li>
              <li style={{ marginTop: "12px" }}>
                <a
                  href="http://localhost:5174"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#38bdf8",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  <span>Staff / Doctor Console</span>
                  <ExternalLink size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Curamed Hospital Systems. Built with modern full-stack engineering. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
