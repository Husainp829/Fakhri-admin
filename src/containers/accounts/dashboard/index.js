import React from "react";
import { Card, CardContent, CardActionArea, Typography, Grid } from "@mui/material";
import { Title, usePermissions } from "react-admin";
import { hasPermission } from "../../../utils/permissionUtils";
import { ACCOUNTS_DASHBOARD_CARDS } from "../../../config/accountsDashboardCards";

const DashboardCard = ({ icon: Icon, title, description, path }) => {
  const handleClick = () => {
    window.location.hash = `/${path}`;
    window.dispatchEvent(new Event("hashchange"));
  };

  return (
    <Card sx={{ minHeight: 150, width: "100%" }}>
      <CardActionArea onClick={handleClick} sx={{ height: "100%" }}>
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

export default function AccountsDashboard() {
  const { permissions } = usePermissions();

  return (
    <>
      <Title title="Accounts" />
      <Grid container spacing={2} mt={3}>
        {ACCOUNTS_DASHBOARD_CARDS.filter((c) => hasPermission(permissions, c.permission)).map(
          (c) => (
            <Grid key={c.path} item size={{ xs: 6, sm: 6, md: 4 }}>
              <DashboardCard
                icon={c.icon}
                title={c.label}
                description={c.description}
                path={c.path}
              />
            </Grid>
          )
        )}
      </Grid>
    </>
  );
}
