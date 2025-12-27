import React from "react";
import { Card, CardContent, Typography, Box, Grid, LinearProgress } from "@mui/material";

const CollectionProgress = ({ stats, collectionPercentage }) => {
  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return "success.main";
    if (percentage >= 50) return "warning.main";
    return "error.main";
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Collection Progress
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Collection Rate
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {collectionPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={collectionPercentage}
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
              Received
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main" }}>
              ₹{(stats.paymentsReceived || 0).toLocaleString("en-IN")}
            </Typography>
          </Grid>
          <Grid item size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Pending
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "error.main" }}>
              ₹{(stats.paymentsPending || 0).toLocaleString("en-IN")}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CollectionProgress;
