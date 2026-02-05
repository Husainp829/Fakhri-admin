import React, { useEffect } from "react";
import { Admin, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useBaseRoute, useRouteId } from "./utils/routeUtility";
import { checkAndClearCacheFromURL } from "./utils/clearPermissionCache";

import withClearCache from "./ClearCache";

import dataProvider from "./dataprovider";
import authProvider from "./authProvider";
import layout from "./layout";
import DashboardAdmin from "./layout/DashboardAdmin";
import { ResourcesRenderer } from "./components/ResourcesRenderer";
import { AUTHLESS_ROUTES } from "./config/authlessRoutes";
import i18nProvider from "./config/i18n";
import appTheme from "./config/theme";
import MyLoginPage from "./layout/login";

dayjs.extend(utc);

const MainApp = () => {
  const baseRoute = useBaseRoute();
  const routeId = useRouteId();

  // Check URL for permission cache refresh parameter
  useEffect(() => {
    checkAndClearCacheFromURL();
  }, []);

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      layout={layout}
      dashboard={DashboardAdmin}
      theme={appTheme}
      loginPage={MyLoginPage}
    >
      {(permissions) => ResourcesRenderer({ permissions, baseRoute, routeId })}
      <CustomRoutes noLayout>
        {AUTHLESS_ROUTES.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      </CustomRoutes>
    </Admin>
  );
};

const MainAppWithClearCache = withClearCache(MainApp);

function App() {
  return <MainAppWithClearCache />;
}

export default App;
