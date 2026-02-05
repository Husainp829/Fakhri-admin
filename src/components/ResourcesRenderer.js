import React from "react";
import { Resource, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import { hasPermission } from "../utils/permissionUtils";
import { MODULE_RESOURCES } from "../config/moduleResources";
import { GLOBAL_RESOURCES } from "../config/globalResources";

const renderResource = (permissions, { permission, resource, createPermission, name }) => {
  if (permission !== null && !hasPermission(permissions, permission)) {
    return null;
  }
  const create =
    createPermission === undefined || hasPermission(permissions, createPermission)
      ? resource.create
      : null;
  const props = { ...resource, create };
  if (name) {
    props.name = name;
  }
  return <Resource key={resource.name || name} {...props} />;
};

/**
 * Returns an array of Resource and CustomRoutes elements for react-admin to discover.
 * Must return a flat array (not wrapped in Fragment) so Admin's child inspector finds them.
 * baseRoute and routeId must be passed from a parent that calls useBaseRoute/useRouteId
 * (hooks cannot be called inside the render prop callback).
 */
export const ResourcesRenderer = ({ permissions, baseRoute, routeId }) => {
  const moduleConfig = MODULE_RESOURCES[baseRoute];
  const elements = [];

  if (moduleConfig) {
    moduleConfig.resources
      .filter((r) => !r.requireRouteId || routeId)
      .forEach((r) => {
        const el = renderResource(permissions, r);
        if (el) elements.push(el);
      });
    if (moduleConfig.customRoutes && moduleConfig.customRoutes.length > 0) {
      elements.push(
        <CustomRoutes key="module-custom-routes" noLayout>
          {moduleConfig.customRoutes.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
        </CustomRoutes>
      );
    }
  }

  GLOBAL_RESOURCES.filter((g) => hasPermission(permissions, g.permission)).forEach((g) => {
    const el = renderResource(permissions, {
      permission: g.permission,
      resource: g.resource,
      name: g.name,
    });
    if (el) elements.push(el);
  });

  return elements;
};
