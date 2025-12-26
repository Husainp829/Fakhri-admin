import React, { memo } from "react";
import { Chip } from "@mui/material";

// Status color mappings
export const BROADCAST_STATUS_COLORS = {
  PENDING: "default",
  PROCESSING: "warning",
  COMPLETED: "success",
  FAILED: "error",
  CANCELLED: "default",
};

export const RECIPIENT_STATUS_COLORS = {
  PENDING: "default",
  SENT: "info",
  DELIVERED: "success",
  READ: "success",
  FAILED: "error",
};

export const StatusChip = memo(({ status }) => {
  const color = BROADCAST_STATUS_COLORS[status] || "default";
  return <Chip label={status} color={color} size="small" />;
});
StatusChip.displayName = "StatusChip";

export const RecipientStatusChip = memo(({ status }) => {
  const color = RECIPIENT_STATUS_COLORS[status] || "default";
  return <Chip label={status} color={color} size="small" />;
});
RecipientStatusChip.displayName = "RecipientStatusChip";
