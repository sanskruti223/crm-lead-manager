import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { leadsAPI } from "../utils/api";
import { STATUSES, SOURCES } from "../utils/constants";
import toast from "react-hot-toast";

const EMPTY = { name: "", email: "", phone: "", company: "", status: "New", source: "Other", notes: "" };

const LeadForm = ({ lead, onClose, onSuccess }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(lead);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        status: lead.status || "New",
        source: lead.source || "Other",
        notes: lead.notes || "",
      });
    }
  }, [lead]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.company.trim()) e.company = "Company is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await leadsAPI.update(lead._id, form);
        toast.success("Lead updated successfully!");
      } else {
        await leadsAPI.create(form);
        toast.success("Lead created successfully!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Full Name", name: "name", type: "text", placeholder: "John Doe", required: true },
    { label: "Email Address", name: "email", type: "email", placeholder: "john@company.com", required: true },
    { label: "Phone Number", name: "phone", type: "tel", placeholder: "+1 (555) 000-0000", required: true },
    { label: "Company Name", name: "company", type: "text", placeholder: "Acme Corp", required: true },
  ];

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={modalHeader}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {isEdit ? "Edit Lead" : "Add New Lead"}
          </h2>
          <button onClick={onClose} style={closeBtn}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {fields.map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label style={labelStyle}>{label} <span style={{ color: "#EF4444" }}>*</span></label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  style={{ ...inputStyle, ...(errors[name] ? { borderColor: "#EF4444" } : {}) }}
                />
                {errors[name] && <p style={{ color: "#EF4444", fontSize: 11, margin: "4px 0 0" }}>{errors[name]}</p>}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Lead Source</label>
              <select name="source" value={form.source} onChange={handleChange} style={inputStyle}>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add any relevant notes about this lead..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? "Saving..." : isEdit ? "Update Lead" : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: 16,
};
const modal = {
  background: "#fff", borderRadius: 12, width: "100%",
  maxWidth: 640, maxHeight: "90vh", overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};
const modalHeader = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "20px 24px", borderBottom: "1px solid #F0F0F0",
};
const closeBtn = {
  background: "none", border: "none", cursor: "pointer",
  color: "#6B7280", padding: 4, borderRadius: 6, display: "flex",
};
const labelStyle = {
  display: "block", fontSize: 13, fontWeight: 500,
  color: "#374151", marginBottom: 6,
};
const inputStyle = {
  width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB",
  borderRadius: 8, fontSize: 14, color: "#111827",
  background: "#FAFAFA", boxSizing: "border-box", outline: "none",
  fontFamily: "inherit",
};
const cancelBtn = {
  padding: "9px 20px", border: "1px solid #E5E7EB", borderRadius: 8,
  background: "#fff", color: "#374151", fontSize: 14, cursor: "pointer",
  fontWeight: 500,
};
const submitBtn = {
  padding: "9px 24px", border: "none", borderRadius: 8,
  background: "#2563EB", color: "#fff", fontSize: 14,
  cursor: "pointer", fontWeight: 600,
};

export default LeadForm;
