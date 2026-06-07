import React, { useEffect, useState } from "react";
import { Users, TrendingUp, Target, AlertCircle, UserCheck, UserX } from "lucide-react";
import { leadsAPI } from "../utils/api";
import { STATUS_CONFIG } from "../utils/constants";

const StatCard = ({ icon: Icon, label, value, color, bg, sublabel }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: "20px 24px",
    border: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 16,
  }}>
    <div style={{ width: 48, height: 48, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{label}</p>
      <p style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 700, color: "#111827" }}>{value}</p>
      {sublabel && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9CA3AF" }}>{sublabel}</p>}
    </div>
  </div>
);

const StatsBar = ({ label, count, total, config }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, color: "#6B7280" }}>{count} <span style={{ color: "#9CA3AF" }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 6, background: "#F3F4F6", borderRadius: 99 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: config.color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
};

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await leadsAPI.getStats();
      setStats(res.data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 32, color: "#9CA3AF" }}>Loading stats...</div>;
  if (!stats) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard icon={Users} label="Total Leads" value={stats.total} color="#3B82F6" bg="#EFF6FF" />
        <StatCard icon={TrendingUp} label="New This Month" value={stats.recentThisMonth} color="#8B5CF6" bg="#F5F3FF" sublabel="Last 30 days" />
        <StatCard icon={UserCheck} label="Converted" value={stats.byStatus.Converted} color="#10B981" bg="#ECFDF5" />
        <StatCard icon={Target} label="Conversion Rate" value={`${stats.conversionRate}%`} color="#F59E0B" bg="#FFFBEB" />
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #F0F0F0" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#111827" }}>Pipeline Overview</h3>
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <StatsBar key={status} label={status} count={count} total={stats.total} config={STATUS_CONFIG[status]} />
        ))}
      </div>
    </div>
  );
};

export default StatsDashboard;
