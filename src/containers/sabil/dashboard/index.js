import React from "react";
import { Title } from "react-admin";
import { Card, CardContent, Typography, Box, Grid } from "@mui/material";

export default function SabilDashboard() {
  return (
    <Box sx={{ p: 2 }}>
      <Title title="Sabil Management" />
      <Grid container spacing={2}>
        <Grid item size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Sabil Dashboard</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
