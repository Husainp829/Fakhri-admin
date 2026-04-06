import React from "react";
import { Resource, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import { hasPermission } from "@/utils/permission-utils";
import { MODULE_RESOURCES } from "@/config/module-resources";
import { GLOBAL_RESOURCES } from "@/config/global-resources";
import type { ResourceConfig } from "@/types/react-admin-config";
import type { PermissionRecord } from "@/types/permissions";

const renderResource = (
  permissions: PermissionRecord,
  {
    permission,
    permissionsAny,
    resource,
    createPermission,
    name,
  }: ResourceConfig & { name?: string }
) => {
  if (permissionsAny?.length) {
    const allowed = permissionsAny.some((p) => hasPermission(permissions, p));
    if (!allowed) {
      return null;
    }
  } else if (permission != null && !hasPermission(permissions, permission)) {
    return null;
  }
  const create =
    createPermission === undefined || hasPermission(permissions, createPermission)
      ? resource.create
      : null;
  const props: Record<string, unknown> = { ...resource, create };
  if (name) {
    props.name = name;
  }
  const resourceName = (resource as { name?: string }).name || name;
  return (
    <Resource
      key={resourceName}
      {...(props as unknown as React.ComponentPropsWithoutRef<typeof Resource>)}
    />
  );
};

/**
 * Build `<Resource>` / `<CustomRoutes>` nodes for `<Admin>`'s function child.
 * Must return these elements directly — not wrapped in another component. React-admin's router only
 * walks the immediate return value of `(permissions) => …` and ignores unknown element types.
 *
 * `baseRoute` / `routeId` come from a parent that uses `useBaseRoute` / `useRouteId`.
 */
export function buildAdminResourceChildren(
  permissions: PermissionRecord,
  baseRoute: string | null,
  routeId: string | null | undefined
): React.ReactNode[] {
  const moduleConfig = baseRoute != null ? MODULE_RESOURCES[baseRoute] : undefined;
  const elements: React.ReactNode[] = [];

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
}
