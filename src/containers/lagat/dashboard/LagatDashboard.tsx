import type { ComponentType, ReactNode } from "react";
import { Card, CardContent, CardActionArea, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { Title, usePermissions } from "react-admin";
import { hasPermission } from "@/utils/permission-utils";
import { LAGAT_DASHBOARD_CARDS } from "@/config/lagat-dashboard-cards";

type DashboardCardProps = {
  icon: ComponentType<SvgIconProps>;
  title: ReactNode;
  description: ReactNode;
  path: string;
};

const DashboardCard = ({ icon: Icon, title, description, path }: DashboardCardProps) => {
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
        {LAGAT_DASHBOARD_CARDS.filter((c) => hasPermission(permissions, c.permission)).map((c) => (
          <Grid
            key={c.path}
            size={{
              xs: 6,
              sm: 6,
              md: 4,
            }}
          >
            <DashboardCard
              icon={c.icon}
              title={c.label}
              description={c.description}
              path={c.path}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
