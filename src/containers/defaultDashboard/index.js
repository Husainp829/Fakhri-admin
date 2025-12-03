import React from "react";
import { Card, CardContent, CardActionArea, Typography, Grid } from "@mui/material";
import { Title, usePermissions } from "react-admin";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import BadgeIcon from "@mui/icons-material/Badge";
import FestivalIcon from "@mui/icons-material/Festival";

import { navigateToBaseRoute } from "../../utils/routeUtility";

const DashboardCard = ({ icon: Icon, title, description, path }) => (
  <Card sx={{ minHeight: 150, width: "100%" }}>
    <CardActionArea onClick={() => navigateToBaseRoute(path)} sx={{ height: "100%" }}>
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

export default function DefaultDashboard() {
  const { permissions } = usePermissions();
  return (
    <>
      <Title title="Fakhri Mohalla Poona" />
      <Grid container spacing={2} mt={3}>
        {[
          [
            permissions?.bookings?.view,
            BookOnlineIcon,
            "Bookings",
            "View and manage all hall bookings",
            "bookings",
          ],
          [
            permissions?.event?.view,
            FestivalIcon,
            "Events",
            "View and manage all events",
            "events",
          ],
          [permissions?.employees?.view, BadgeIcon, "Staff", "View and manage all staff", "staff"],
        ].map(
          ([perm, icon, title, description, path]) =>
            perm && (
              <Grid key={path} item size={{ xs: 6, sm: 6, md: 4 }}>
                <DashboardCard icon={icon} title={title} description={description} path={path} />
              </Grid>
            )
        )}
      </Grid>
    </>
  );
}
