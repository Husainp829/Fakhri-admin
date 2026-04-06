import { memo } from "react";
import { Chip } from "@mui/material";

export const BROADCAST_STATUS_COLORS = {
  PENDING: "default",
  PROCESSING: "warning",
  COMPLETED: "success",
  FAILED: "error",
  CANCELLED: "default",
} as const;

export const RECIPIENT_STATUS_COLORS = {
  PENDING: "default",
  SENT: "info",
  DELIVERED: "success",
  READ: "success",
  FAILED: "error",
} as const;

type StatusChipProps = { status?: string };

export const StatusChip = memo(({ status }: StatusChipProps) => {
  const color =
    (status && BROADCAST_STATUS_COLORS[status as keyof typeof BROADCAST_STATUS_COLORS]) ||
    "default";
  return <Chip label={status} color={color} size="small" />;
});
StatusChip.displayName = "StatusChip";

export const RecipientStatusChip = memo(({ status }: StatusChipProps) => {
  const color =
    (status && RECIPIENT_STATUS_COLORS[status as keyof typeof RECIPIENT_STATUS_COLORS]) ||
    "default";
  return <Chip label={status} color={color} size="small" />;
});
RecipientStatusChip.displayName = "RecipientStatusChip";
