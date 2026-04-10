import { useMemo, type ReactElement } from "react";
import ListSubheader from "@mui/material/ListSubheader";
import type { Theme } from "@mui/material/styles";
import { useHasDashboard } from "ra-core";
import { Menu, usePermissions } from "react-admin";
import type { MenuProps } from "react-admin";
import { filterVisibleResourceConfigs } from "@/components/ResourcesRenderer";
import { GLOBAL_RESOURCES } from "@/config/global-resources";
import { getModuleRuntimeShape } from "@/config/module-resources";
import type { GlobalSidebarGroup, ModuleResourceRow } from "@/types/react-admin-config";
import type { PermissionRecord } from "@/types/permissions";
import { hasPermission } from "@/utils/permission-utils";
import { useBaseRoute, useRouteId } from "@/utils/route-utility";

const EMPTY_PERMISSIONS = {} as PermissionRecord;

const GLOBAL_SIDEBAR_GROUP_LABEL: Record<GlobalSidebarGroup, string> = {
  admin: "Admin",
};

const menuSx = {
  borderRight: 1,
  borderColor: "divider",
  height: "100%",
} as const;

const menuSectionSubheaderSx = (theme: Theme) => ({
  typography: "overline" as const,
  color: "text.secondary",
  lineHeight: theme.typography.overline?.lineHeight ?? 2,
  mt: 1,
  mb: 0.5,
  pl: 2,
  bgcolor: "transparent",
});

/** Renders module resource links; subheaders when `menuSection` + parent `menuSections` are set. */
function appendModuleResourceMenuItems(
  nodes: React.ReactNode[],
  moduleResources: readonly ModuleResourceRow[],
  menuSections: Record<string, string> | undefined,
  menuRouteKey: string
): void {
  let currentSection: string | undefined;
  let subheaderOrdinal = 0;
  for (const config of moduleResources) {
    if (config.hideFromMenu) {
      continue;
    }
    const name = (config.resource as { name?: string }).name;
    if (!name) {
      continue;
    }
    const section = config.menuSection;
    if (section !== currentSection) {
      currentSection = section;
      if (section) {
        const label = menuSections?.[section] ?? section;
        nodes.push(
          <ListSubheader
            key={`${menuRouteKey}-sec-${section}-${subheaderOrdinal}`}
            disableGutters
            disableSticky
            sx={(theme) => menuSectionSubheaderSx(theme)}
          >
            {label}
          </ListSubheader>
        );
        subheaderOrdinal += 1;
      }
    }
    nodes.push(<Menu.ResourceItem key={name} name={name} />);
  }
}

function appendGlobalMenuItems(nodes: React.ReactNode[], perms: PermissionRecord): void {
  let currentGlobalGroup: GlobalSidebarGroup | undefined;
  for (const g of GLOBAL_RESOURCES) {
    if (!hasPermission(perms, g.permission)) {
      continue;
    }
    const globalName = (g.resource as { name?: string }).name || g.name;
    if (!globalName) {
      continue;
    }
    const sg = g.sidebarGroup;
    if (sg !== currentGlobalGroup) {
      currentGlobalGroup = sg;
      if (sg) {
        nodes.push(
          <ListSubheader
            key={`global-sub-${sg}`}
            disableGutters
            disableSticky
            sx={(theme) => menuSectionSubheaderSx(theme)}
          >
            {GLOBAL_SIDEBAR_GROUP_LABEL[sg]}
          </ListSubheader>
        );
      }
    }
    nodes.push(<Menu.ResourceItem key={globalName} name={globalName} />);
  }
}

function GroupedMenuContent(): ReactElement {
  const { permissions } = usePermissions<PermissionRecord>();
  const baseRoute = useBaseRoute();
  const routeId = useRouteId();
  const perms = permissions ?? EMPTY_PERMISSIONS;

  const { moduleResources, menuSections, menuRouteKey } = useMemo(() => {
    const moduleRuntime = getModuleRuntimeShape(baseRoute);
    if (!moduleRuntime) {
      return {
        moduleResources: [] as ModuleResourceRow[],
        menuSections: undefined as Record<string, string> | undefined,
        menuRouteKey: baseRoute ?? "root",
      };
    }
    return {
      moduleResources: filterVisibleResourceConfigs(perms, moduleRuntime.resources, routeId),
      menuSections: moduleRuntime.menuSections,
      menuRouteKey: baseRoute ?? "root",
    };
  }, [baseRoute, perms, routeId]);

  const nodes: React.ReactNode[] = [];
  appendModuleResourceMenuItems(nodes, moduleResources, menuSections, menuRouteKey);
  appendGlobalMenuItems(nodes, perms);

  return <>{nodes}</>;
}

const LayoutMenu = (props: MenuProps): ReactElement => {
  const hasDashboard = useHasDashboard();

  return (
    <Menu sx={menuSx} {...props}>
      {hasDashboard ? <Menu.DashboardItem /> : null}
      <GroupedMenuContent />
    </Menu>
  );
};

export default LayoutMenu;
