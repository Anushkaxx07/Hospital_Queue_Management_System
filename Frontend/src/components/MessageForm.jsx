import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Send, Mail, Phone, User, MessageSquare } from "lucide-react";

const MessageForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMessage = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${apiUrl}/api/v1/message/send`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(response.data.message || "Message sent successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ padding: "80px 0", background: "#ffffff" }}>
      <div className="container">
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <div className="section-tag">Patient Helpdesk & Support</div>
          <h2 className="section-title">Send Us a Direct Inquiry</h2>
          <p style={{ marginBottom: "36px" }}>
            Have a question regarding OPD doctor schedules, queue status, or specialized treatments? Drop our hospital front desk a message.
          </p>

          <form
            onSubmit={handleMessage}
            style={{
              background: "#f8fafc",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "36px",
              boxShadow: "var(--shadow-sm)",
              textAlign: "left",
            }}
          >
            <div className="form-grid-2" style={{ marginBottom: "16px" }}>
              <div className="form-input-group">
                <label>First Name *</label>
                <div className="input-with-icon">
                  <User size={16} className="field-icon" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="Your first name"
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
                    placeholder="Your last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2" style={{ marginBottom: "16px" }}>
              <div className="form-input-group">
                <label>Email Address *</label>
                <div className="input-with-icon">
                  <Mail size={16} className="field-icon" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-input-group">
                <label>Phone Number *</label>
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
            </div>

            <div className="form-input-group" style={{ marginBottom: "24px" }}>
              <label>Message / Inquiry Details *</label>
              <textarea
                name="message"
                required
                rows={4}
                className="styled-select"
                style={{ width: "100%", padding: "12px", height: "auto" }}
                placeholder="How can our clinical team help you today?"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
              style={{ padding: "12px" }}
            >
              <Send size={16} />
              <span>{submitting ? "Sending Inquiry..." : "Transmit Message"}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default MessageForm;