export const STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"];

export const STATUS_CONFIG = {
  New: { color: "#3B82F6", bg: "#EFF6FF", label: "New" },
  Contacted: { color: "#F59E0B", bg: "#FFFBEB", label: "Contacted" },
  Qualified: { color: "#8B5CF6", bg: "#F5F3FF", label: "Qualified" },
  Converted: { color: "#10B981", bg: "#ECFDF5", label: "Converted" },
  Lost: { color: "#EF4444", bg: "#FEF2F2", label: "Lost" },
};

export const SOURCES = [
  "Website",
  "Referral",
  "Social Media",
  "Cold Call",
  "Email Campaign",
  "Other",
];

export const SORT_OPTIONS = [
  { value: "createdAt", label: "Date Created" },
  { value: "name", label: "Name" },
  { value: "company", label: "Company" },
  { value: "status", label: "Status" },
  { value: "updatedAt", label: "Last Updated" },
];
