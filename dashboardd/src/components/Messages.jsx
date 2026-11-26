import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { Mail, Phone, Calendar, User, MessageSquare } from "lucide-react";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(Context);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${apiUrl}/api/v1/message/getall`, {
          withCredentials: true,
        });
        setMessages(data.message || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Inquiries & Feedback 📩</h1>
          <p className="page-subtitle">
            Messages and appointment support inquiries submitted via the public patient portal
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          Loading patient inquiries...
        </div>
      ) : messages.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {messages.map((item) => (
            <div
              key={item._id}
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                      }}
                    >
                      {item.firstName?.charAt(0) || "P"}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)" }}>
                        {item.firstName} {item.lastName}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Patient Inquiry
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid var(--border-light)",
                    borderRadius: "8px",
                    padding: "14px",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    color: "var(--text-secondary)",
                    marginBottom: "16px",
                  }}
                >
                  "{item.message}"
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--border-light)",
                  paddingTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={14} color="var(--primary)" />
                  <a href={`mailto:${item.email}`} style={{ color: "var(--primary)", textDecoration: "none" }}>
                    {item.email}
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone size={14} color="#64748b" />
                  <span>{item.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="content-card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
          <MessageSquare size={48} style={{ opacity: 0.4, margin: "0 auto 12px" }} />
          <div>No patient messages in the inbox.</div>
        </div>
      )}
    </div>
  );
};

export default Messages;