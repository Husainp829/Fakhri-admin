import React from "react";
import { Card, CardContent, Typography, Box, Grid, LinearProgress } from "@mui/material";
import { formatINR } from "../../../../utils";

const FmbCollectionProgress = ({ stats, collectionPercentage }) => {
  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return "success.main";
    if (percentage >= 50) return "warning.main";
    return "error.main";
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Receipts vs period commitments
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Share of annual + contribution commitments collected (by receipts)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {collectionPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(collectionPercentage, 100)}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                backgroundColor: getProgressBarColor(collectionPercentage),
              },
            }}
          />
        </Box>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Receipts (period)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main" }}>
              {formatINR(stats.paymentsReceived || 0)}
            </Typography>
          </Grid>
          <Grid item size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Pending (period)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "error.main" }}>
              {formatINR(stats.paymentsPending || 0)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FmbCollectionProgress;
