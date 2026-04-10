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

type ResourceConfigFields = {
  permission?: string | null;
  permissionsAny?: string[];
  resource: ResourceModule;
  createPermission?: string;
  requireRouteId?: boolean;
  hideFromMenu?: boolean;
};

type MenuSectionPart<TMenuSectionKey extends string | never> = [TMenuSectionKey] extends [never]
  ? { menuSection?: never }
  : { menuSection?: TMenuSectionKey };

/**
 * One row in `MODULE_RESOURCES[*].resources`.
 * For grouped modules, build the module with {@link moduleWithSections} so `menuSection` is inferred from `menuSections`.
 */
export type ResourceConfig<TMenuSectionKey extends string | never = never> = ResourceConfigFields &
  MenuSectionPart<TMenuSectionKey>;

/**
 * Widened row type for router/menu helpers (any optional `menuSection` string).
 */
export type ModuleResourceRow = ResourceConfigFields & {
  menuSection?: string;
};

export type CustomRouteConfig = {
  path: string;
  element: ComponentType | (() => ReactElement);
};

/**
 * Per-module resource bundle. Prefer {@link moduleWithSections} when you have `menuSections` so keys stay in sync.
 */
export type ModuleResourcesValue<TMenuSectionKey extends string | never = never> = [
  TMenuSectionKey,
] extends [never]
  ? {
      resources: Array<ResourceConfig<never>>;
      customRoutes?: CustomRouteConfig[];
    }
  : {
      menuSections: Record<TMenuSectionKey, string>;
      resources: Array<ResourceConfig<TMenuSectionKey>>;
      customRoutes?: CustomRouteConfig[];
    };

/**
 * Normalized module entry for dynamic access (`baseRoute` lookup).
 * Casts from `MODULE_RESOURCES` after `isModuleResourcesKey` — avoids brittle unions on `resources` / `customRoutes`.
 */
export type ModuleRuntimeShape = {
  resources: readonly ModuleResourceRow[];
  customRoutes?: CustomRouteConfig[];
  menuSections?: Record<string, string>;
};

/** Every `MODULE_RESOURCES` baseRoute must appear; values checked structurally as {@link ModuleRuntimeShape}. */
export type ModuleResourcesRegistry = {
  bookings: ModuleRuntimeShape;
  events: ModuleRuntimeShape;
  staff: ModuleRuntimeShape;
  sabil: ModuleRuntimeShape;
  lagat: ModuleRuntimeShape;
  fmb: ModuleRuntimeShape;
  miqaat: ModuleRuntimeShape;
  ohbat: ModuleRuntimeShape;
  yearlyNiyaaz: ModuleRuntimeShape;
  accounts: ModuleRuntimeShape;
};

/**
 * Wraps a module that declares `menuSections` so each `resources[].menuSection` must be a key of that object.
 * Define sections inline in `module-resources.ts` — no separate constants file.
 */
export function moduleWithSections<const S extends Record<string, string>>(definition: {
  menuSections: S;
  resources: ReadonlyArray<ResourceConfig<Extract<keyof S, string>>>;
  customRoutes?: CustomRouteConfig[];
}): ModuleResourcesValue<Extract<keyof S, string>> {
  const out = {
    menuSections: definition.menuSections,
    resources: [...definition.resources],
    ...(definition.customRoutes !== undefined ? { customRoutes: definition.customRoutes } : {}),
  };
  return out as ModuleResourcesValue<Extract<keyof S, string>>;
}

/** Sidebar section for `GLOBAL_RESOURCES` (see `LayoutMenu`). */
export type GlobalSidebarGroup = "admin";

export type GlobalResourceConfig = {
  permission: string;
  resource: ResourceModule;
  name?: string;
  /** When set, shown under this heading in sidebars that support grouping (e.g. FMB). */
  sidebarGroup?: GlobalSidebarGroup;
};

export type AuthlessRouteConfig = {
  path: string;
  element: ComponentType | (() => ReactElement);
};
