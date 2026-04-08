import type { ComponentType, ReactNode } from "react";
import { Card, CardContent, CardActionArea, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type { SvgIconComponent } from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { Title, usePermissions } from "react-admin";
import { useTenantName } from "@/hooks/useTenantName";
import { navigateToBaseRoute } from "@/utils/route-utility";
import { hasAnyPermission, hasPermission } from "@/utils/permission-utils";
import { MODULE_REGISTRY } from "@/config/modules";

type DashboardCardProps = {
  icon: ComponentType<SvgIconProps>;
  title: ReactNode;
  description: ReactNode;
  path: string;
};

const DashboardCard = ({ icon: Icon, title, description, path }: DashboardCardProps) => (
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
  const tenantName = useTenantName();

  return (
    <>
      <Title title={tenantName || "Dashboard"} />
      <Grid container spacing={2} mt={1}>
        {MODULE_REGISTRY.filter((m) =>
          m.permissionsAny?.length
            ? hasAnyPermission(permissions, m.permissionsAny)
            : hasPermission(permissions, m.permission)
        ).map((m) => (
          <Grid key={m.path} size={{ xs: 6, sm: 6, md: 3 }}>
            <DashboardCard
              icon={m.icon as SvgIconComponent}
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
