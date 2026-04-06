import type { ReactNode } from "react";
import { Box, Typography, Chip } from "@mui/material";

type DashboardHeaderProps = {
  periodLabel?: string | null;
  hijriYearStart?: number | null;
  collectionPercentage: number;
};

const getCollectionColor = (percentage: number): "success" | "warning" | "error" => {
  if (percentage >= 80) return "success";
  if (percentage >= 50) return "warning";
  return "error";
};

export default function DashboardHeader({
  periodLabel,
  hijriYearStart,
  collectionPercentage,
}: DashboardHeaderProps) {
  const title: ReactNode =
    hijriYearStart != null && periodLabel
      ? `Hijri period: ${periodLabel}`
      : "FMB period (no takhmeen data yet)";

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Chip
        label={`Collection vs takhmeen: ${collectionPercentage}%`}
        color={getCollectionColor(collectionPercentage)}
        sx={{ fontWeight: 600 }}
      />
    </Box>
  );
}
