import React from "react";
import { usePermissions } from "react-admin";
import { Navigate } from "react-router-dom";
import { useBaseRoute, useRouteId } from "../utils/routeUtility";
import { hasPermission } from "../utils/permissionUtils";
import { getModuleByPath } from "../config/modules";
import DefaultDashboard from "../containers/defaultDashboard";

const DashboardAdmin = () => {
  const baseRoute = useBaseRoute();
  const routeId = useRouteId();
  const { permissions } = usePermissions();
  const module = getModuleByPath(baseRoute);

  if (!module) {
    return <DefaultDashboard />;
  }

  const dashboardPermission = module.dashboardPermission ?? module.permission;
  const hasDashboardAccess = hasPermission(permissions, dashboardPermission);

  if (!hasDashboardAccess) {
    if (module.fallback.type === "navigate" && module.fallback.path) {
      return <Navigate to={module.fallback.path} />;
    }
    return <DefaultDashboard />;
  }

  if (module.hasChildDashboard && routeId) {
    const ChildDashboard = module.childDashboard;
    return <ChildDashboard />;
  }

  const Dashboard = module.dashboard;
  return <Dashboard />;
};

export default DashboardAdmin;
