import { useCallback, useEffect, useMemo } from "react";
import { Admin, CustomRoutes, bwDarkTheme, bwLightTheme } from "react-admin";
import { Route } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useBaseRoute, useRouteId } from "@/utils/route-utility";
import { checkAndClearCacheFromURL } from "@/utils/clear-permission-cache";

import withClearCache from "@/ClearCache";
import dataProvider from "@/dataprovider";
import authProvider from "@/auth-provider";
import layout from "@/layout";
import DashboardAdmin from "@/layout/DashboardAdmin";
import Login from "@/layout/Login";
import { buildAdminResourceChildren } from "@/components/ResourcesRenderer";
import { AUTHLESS_ROUTES } from "@/config/authless-routes";
import i18nProvider from "@/config/i18n";
import type { PermissionRecord } from "@/types/permissions";

dayjs.extend(utc);

const MainApp = () => {
  const baseRoute = useBaseRoute();
  const routeId = useRouteId();

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

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      layout={layout}
      dashboard={DashboardAdmin}
      theme={bwLightTheme}
      darkTheme={bwDarkTheme}
      loginPage={Login}
    >
      {renderResources}
      {authlessCustomRoutes}
    </Admin>
  );
};

const MainAppWithClearCache = withClearCache(MainApp);

export default function App() {
  return <MainAppWithClearCache />;
}
