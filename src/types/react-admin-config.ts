import type { ComponentType, ReactElement } from "react";

/** Default export from a typical react-admin resource folder (list/create/show/edit + name). */
export type ResourceModule = Record<string, unknown>;

export type ModuleFallbackNavigate = { type: "navigate"; path: string };
export type ModuleFallbackDefault = { type: "defaultDashboard"; path: null };
export type ModuleFallback = ModuleFallbackNavigate | ModuleFallbackDefault;

export type ModuleRegistryEntry = {
  id: string;
  path: string;
  label: string;
  description: string;
  icon: ComponentType<Record<string, unknown>>;
  permission: string;
  dashboardPermission: string | null;
  fallback: ModuleFallback;
  hasChildDashboard?: boolean;
  dashboard: ComponentType<Record<string, unknown>>;
  childDashboard?: ComponentType<Record<string, unknown>>;
  /** When set, any of these permissions may grant dashboard access (OR). */
  permissionsAny?: string[];
};

export type ResourceConfig = {
  permission?: string | null;
  permissionsAny?: string[];
  resource: ResourceModule;
  createPermission?: string;
  requireRouteId?: boolean;
};

export type CustomRouteConfig = {
  path: string;
  element: ComponentType | (() => ReactElement);
};

export type ModuleResourcesValue = {
  resources: ResourceConfig[];
  customRoutes?: CustomRouteConfig[];
};

export type GlobalResourceConfig = {
  permission: string;
  resource: ResourceModule;
  name?: string;
};

export type AuthlessRouteConfig = {
  path: string;
  element: ComponentType | (() => ReactElement);
};
