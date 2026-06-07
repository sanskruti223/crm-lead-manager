import React from "react";
import { STATUS_CONFIG } from "../utils/constants";

const StatusBadge = ({ status, size = "sm" }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["New"];
  const padding = size === "sm" ? "3px 10px" : "5px 14px";
  const fontSize = size === "sm" ? "11px" : "13px";

  return (
    <span
      style={{
        display: "inline-block",
        padding,
        borderRadius: "999px",
        fontSize,
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}30`,
        letterSpacing: "0.3px",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
