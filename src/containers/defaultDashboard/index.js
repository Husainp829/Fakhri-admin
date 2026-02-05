import React from "react";
import { Card, CardContent, CardActionArea, Typography, Grid } from "@mui/material";
import { Title, usePermissions } from "react-admin";
import { navigateToBaseRoute } from "../../utils/routeUtility";
import { hasPermission } from "../../utils/permissionUtils";
import { MODULE_REGISTRY } from "../../config/modules";

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
      <Grid container spacing={2} mt={1}>
        {MODULE_REGISTRY.filter((m) => hasPermission(permissions, m.permission)).map((m) => (
          <Grid key={m.path} item size={{ xs: 6, sm: 6, md: 3 }}>
            <DashboardCard
              icon={m.icon}
              title={m.label}
              description={m.description}
              path={m.path}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
