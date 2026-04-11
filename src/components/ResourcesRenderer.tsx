import React from "react";
import { Resource, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import { getModuleRuntimeShape } from "@/config/module-resources";
import { GLOBAL_RESOURCES } from "@/config/global-resources";
import type { ModuleResourceRow } from "@/types/react-admin-config";
import type { PermissionRecord } from "@/types/permissions";
import { hasPermission } from "@/utils/permission-utils";

/**
 * Whether a module resource row should appear in the menu and be registered as a `<Resource>`.
 * Shared by {@link filterVisibleResourceConfigs}, {@link buildAdminResourceChildren}, and {@link renderResource}.
 */
export function isModuleResourceRowVisible(
  permissions: PermissionRecord,
  row: Pick<ModuleResourceRow, "permission" | "permissionsAny" | "requireRouteId">,
  routeId: string | null | undefined
): boolean {
  if (row.requireRouteId && !routeId) {
    return false;
  }
  if (row.permissionsAny?.length) {
    return row.permissionsAny.some((p) => hasPermission(permissions, p));
  }
  if (row.permission != null && !hasPermission(permissions, row.permission)) {
    return false;
  }
  return true;
}

/** View/route visibility for module resources (uses {@link isModuleResourceRowVisible}). */
export function filterVisibleResourceConfigs(
  permissions: PermissionRecord,
  configs: readonly ModuleResourceRow[],
  routeId: string | null | undefined
): ModuleResourceRow[] {
  return configs.filter((r) => isModuleResourceRowVisible(permissions, r, routeId));
}

type ResourceRenderInput = ModuleResourceRow & { name?: string };

const renderResource = (
  permissions: PermissionRecord,
  row: ResourceRenderInput,
  routeId: string | null | undefined
) => {
  if (!isModuleResourceRowVisible(permissions, row, routeId)) {
    return null;
  }
  const { resource, createPermission, name } = row;
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
  const moduleRuntime = getModuleRuntimeShape(baseRoute);
  const elements: React.ReactNode[] = [];

  if (moduleRuntime) {
    const { resources, customRoutes } = moduleRuntime;
    resources.forEach((r) => {
      const el = renderResource(permissions, r, routeId);
      if (el) {
        elements.push(el);
      }
    });
    if (customRoutes && customRoutes.length > 0) {
      elements.push(
        <CustomRoutes key="module-custom-routes" noLayout>
          {customRoutes.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
        </CustomRoutes>
      );
    }
  }

  GLOBAL_RESOURCES.filter((g) => hasPermission(permissions, g.permission)).forEach((g) => {
    const el = renderResource(
      permissions,
      {
        permission: g.permission,
        resource: g.resource,
        name: g.name,
      },
      routeId
    );
    if (el) {
      elements.push(el);
    }
  });

  return elements;
}
