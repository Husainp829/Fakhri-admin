import * as React from "react";
import { Card, CardContent, CardActionArea, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

import BookOnlineIcon from "@mui/icons-material/BookOnline";

const DashboardCard = ({ icon: Icon, title, description, path }) => {
  const navigate = useNavigate();
  return (
    <Card sx={{ minHeight: 150 }}>
      <CardActionArea onClick={() => navigate(path)} sx={{ height: "100%" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Icon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default function DefaultDashboard() {
  return (
    <Grid container spacing={2} mt={3}>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          icon={BookOnlineIcon}
          title="Bookings"
          description="View and manage all hall bookings"
          path="/bookings"
        />
      </Grid>
    </Grid>
  );
}
