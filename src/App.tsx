import { useCallback, useEffect, useMemo } from "react";
import { Admin, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useBaseRoute, useRouteId } from "@/utils/route-utility";
import { checkAndClearCacheFromURL } from "@/utils/clear-permission-cache";
import { useTenantBrandedThemes } from "@/hooks/useTenantBrandedThemes";

import withClientVersionCheck from "@/components/ClientVersionCheck";
import dataProvider from "@/dataprovider";
import authProvider from "@/auth-provider";
import layout from "@/layout";
import DashboardAdmin from "@/layout/DashboardAdmin";
import Login from "@/layout/Login";
import { buildAdminResourceChildren } from "@/components/ResourcesRenderer";
import { AUTHLESS_ROUTES } from "@/config/authless-routes";
import FmbDistributorPortalPage from "@/containers/fmb/fmb-distributor-portal/FmbDistributorPortalPage";
import i18nProvider from "@/config/i18n";
import type { PermissionRecord } from "@/types/permissions";

dayjs.extend(utc);

const MainApp = () => {
  const baseRoute = useBaseRoute();
  const routeId = useRouteId();
  const themes = useTenantBrandedThemes();

  useEffect(() => {
    checkAndClearCacheFromURL();
  }, []);

  // Stable callback + direct Resource nodes (not a wrapper component — see buildAdminResourceChildren).
  const renderResources = useCallback(
    (permissions: PermissionRecord) => buildAdminResourceChildren(permissions, baseRoute, routeId),
    [baseRoute, routeId]
  );

  const authlessCustomRoutes = useMemo(
    () => (
      <CustomRoutes noLayout>
        {AUTHLESS_ROUTES.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      </CustomRoutes>
    ),
    []
  );

  const distributorPortalRoute = useMemo(
    () => (
      <CustomRoutes noLayout key="fmb-distributor-portal-routes">
        <Route path="/fmb-distributor-portal" element={<FmbDistributorPortalPage />} />
      </CustomRoutes>
    ),
    []
  );

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      layout={layout}
      dashboard={DashboardAdmin}
      theme={themes.light}
      darkTheme={themes.dark}
      loginPage={Login}
    >
      {renderResources}
      {authlessCustomRoutes}
      {distributorPortalRoute}
    </Admin>
  );
};

const MainAppWithClientVersionCheck = withClientVersionCheck(MainApp);

export default function App() {
  return <MainAppWithClientVersionCheck />;
}
