import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, Filter, RefreshCw, Phone, Mail, Building2,
} from "lucide-react";
import { leadsAPI } from "../utils/api";
import { STATUSES, SOURCES, SORT_OPTIONS, STATUS_CONFIG } from "../utils/constants";
import StatusBadge from "../components/StatusBadge";
import LeadForm from "../components/LeadForm";
import StatsDashboard from "../components/StatsDashboard";
import toast from "react-hot-toast";

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [statsKey, setStatsKey] = useState(0);

  const debouncedSearch = useDebounce(search, 400);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sortBy, sortOrder };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      const res = await leadsAPI.getAll(params);
      setLeads(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, debouncedSearch, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortOrder("asc"); }
  };

  const handleDelete = async (id) => {
    try {
      await leadsAPI.delete(id);
      toast.success("Lead deleted");
      fetchLeads();
      setStatsKey(k => k + 1);
    } catch (err) {
      toast.error(err.message);
    }
    setDeleteId(null);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await leadsAPI.updateStatus(id, status);
      toast.success("Status updated");
      fetchLeads();
      setStatsKey(k => k + 1);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp size={12} color="#D1D5DB" />;
    return sortOrder === "asc" ? <ChevronUp size={12} color="#3B82F6" /> : <ChevronDown size={12} color="#3B82F6" />;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>⚡</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>LeadFlow CRM</h1>
              <p style={{ margin: 0, fontSize: 11, color: "#6B7280" }}>Lead Management Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => { setEditLead(null); setFormOpen(true); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>
            {pagination.total ?? "—"} Leads
          </h2>
          <button
            onClick={() => setShowStats(s => !s)}
            style={{ fontSize: 13, color: "#6B7280", background: "none", border: "1px solid #E5E7EB", padding: "6px 14px", borderRadius: 8, cursor: "pointer" }}
          >
            {showStats ? "Hide" : "Show"} Analytics
          </button>
        </div>

        {showStats && <StatsDashboard key={statsKey} />}

        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #F0F0F0", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or company..."
              style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#FAFAFA", outline: "none" }}
            />
          </div>

          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, background: "#FAFAFA", color: "#374151", cursor: "pointer" }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, background: "#FAFAFA", color: "#374151", cursor: "pointer" }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
            style={{ padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, background: "#FAFAFA", cursor: "pointer", color: "#374151", fontSize: 13 }}>
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>

          <button onClick={fetchLeads} title="Refresh"
            style={{ padding: "9px", border: "1px solid #E5E7EB", borderRadius: 8, background: "#FAFAFA", cursor: "pointer", display: "flex" }}>
            <RefreshCw size={15} color="#6B7280" />
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  {[
                    { label: "Name", field: "name" },
                    { label: "Contact", field: null },
                    { label: "Company", field: "company" },
                    { label: "Status", field: "status" },
                    { label: "Created", field: "createdAt" },
                    { label: "Actions", field: null },
                  ].map(({ label, field }) => (
                    <th key={label}
                      onClick={field ? () => handleSort(field) : undefined}
                      style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", whiteSpace: "nowrap", cursor: field ? "pointer" : "default", userSelect: "none" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {label} {field && <SortIcon field={field} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: "#9CA3AF" }}>Loading leads...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: "#9CA3AF" }}>
                    {search || statusFilter ? "No leads match your filters" : "No leads yet. Add your first lead!"}
                  </td></tr>
                ) : leads.map((lead, i) => (
                  <tr key={lead._id} style={{ borderBottom: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{lead.name}</div>
                      {lead.source && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{lead.source}</div>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 13, marginBottom: 4 }}>
                        <Mail size={12} />{lead.email}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 13 }}>
                        <Phone size={12} />{lead.phone}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#374151" }}>
                        <Building2 size={13} color="#9CA3AF" />{lead.company}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead._id, e.target.value)}
                        style={{
                          border: "none", borderRadius: 20, padding: "4px 10px", fontSize: 12,
                          fontWeight: 600, cursor: "pointer", outline: "none",
                          color: STATUS_CONFIG[lead.status]?.color,
                          background: STATUS_CONFIG[lead.status]?.bg,
                        }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#9CA3AF", fontSize: 13, whiteSpace: "nowrap" }}>
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setEditLead(lead); setFormOpen(true); }}
                          style={{ padding: "6px 12px", border: "1px solid #E5E7EB", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#374151" }}>
                          <Edit2 size={12} /> Edit
                        </button>
                        <button onClick={() => setDeleteId(lead._id)}
                          style={{ padding: "6px 12px", border: "1px solid #FEE2E2", borderRadius: 6, background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#EF4444" }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #F3F4F6" }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage}
                  style={{ padding: "7px 14px", border: "1px solid #E5E7EB", borderRadius: 8, background: pagination.hasPrevPage ? "#fff" : "#F9FAFB", cursor: pagination.hasPrevPage ? "pointer" : "not-allowed", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                  <ChevronLeft size={14} /> Prev
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}
                  style={{ padding: "7px 14px", border: "1px solid #E5E7EB", borderRadius: 8, background: pagination.hasNextPage ? "#fff" : "#F9FAFB", cursor: pagination.hasNextPage ? "pointer" : "not-allowed", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lead Form Modal */}
      {formOpen && (
        <LeadForm
          lead={editLead}
          onClose={() => { setFormOpen(false); setEditLead(null); }}
          onSuccess={() => { fetchLeads(); setStatsKey(k => k + 1); }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, maxWidth: 380, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>Delete Lead?</h3>
            <p style={{ color: "#6B7280", margin: "0 0 24px", fontSize: 14 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDeleteId(null)}
                style={{ padding: "9px 20px", border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: "#EF4444", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
