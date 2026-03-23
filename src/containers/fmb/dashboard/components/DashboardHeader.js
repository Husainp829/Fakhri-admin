import React from "react";
import { Box, Typography, Chip } from "@mui/material";

const DashboardHeader = ({ periodLabel, hijriYearStart, collectionPercentage }) => {
  const getCollectionColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    return "error";
  };

  const title =
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
};

export default DashboardHeader;
