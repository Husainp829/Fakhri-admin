import React from "react";
import { Box, Typography, Chip } from "@mui/material";

const DashboardHeader = ({ financialYear, collectionPercentage }) => {
  const getCollectionColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    return "error";
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Financial Year: {financialYear}
      </Typography>
      <Chip
        label={`Collection: ${collectionPercentage}%`}
        color={getCollectionColor(collectionPercentage)}
        sx={{ fontWeight: 600 }}
      />
    </Box>
  );
};

export default DashboardHeader;
