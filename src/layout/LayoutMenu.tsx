import type { ReactElement } from "react";
import ListSubheader from "@mui/material/ListSubheader";
import type { Theme } from "@mui/material/styles";
import { useHasDashboard } from "ra-core";
import { Menu, usePermissions } from "react-admin";
import type { MenuProps } from "react-admin";
import { filterVisibleResourceConfigs } from "@/components/ResourcesRenderer";
import { GLOBAL_RESOURCES } from "@/config/global-resources";
import { MODULE_RESOURCES } from "@/config/module-resources";
import type { FmbMenuGroup, GlobalSidebarGroup } from "@/types/react-admin-config";
import type { PermissionRecord } from "@/types/permissions";
import { hasPermission } from "@/utils/permission-utils";
import { useBaseRoute, useRouteId } from "@/utils/route-utility";

const FMB_MENU_GROUP_LABEL: Record<FmbMenuGroup, string> = {
  kitchen: "Kitchen",
  vendors: "Vendors",
};

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

function FmbGroupedResourceItems(): ReactElement {
  const { permissions } = usePermissions<PermissionRecord>();
  const routeId = useRouteId();
  const perms = permissions ?? ({} as PermissionRecord);
  const configs = filterVisibleResourceConfigs(perms, MODULE_RESOURCES.fmb.resources, routeId);

  const nodes: React.ReactNode[] = [];
  let currentGroup: FmbMenuGroup | undefined;

  for (const config of configs) {
    const name = (config.resource as { name?: string }).name;
    if (!name) {
      continue;
    }
    const g = config.menuGroup;
    if (g !== currentGroup) {
      currentGroup = g;
      if (g) {
        nodes.push(
          <ListSubheader
            key={`fmb-sub-${g}`}
            disableGutters
            disableSticky
            sx={(theme) => menuSectionSubheaderSx(theme)}
          >
            {FMB_MENU_GROUP_LABEL[g]}
          </ListSubheader>
        );
      }
    }
    nodes.push(<Menu.ResourceItem key={name} name={name} />);
  }

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

  return <>{nodes}</>;
}

const LayoutMenu = (props: MenuProps): ReactElement => {
  const baseRoute = useBaseRoute();
  const hasDashboard = useHasDashboard();

  if (baseRoute !== "fmb") {
    return <Menu sx={menuSx} {...props} />;
  }

  return (
    <Menu sx={menuSx} {...props}>
      {hasDashboard ? <Menu.DashboardItem /> : null}
      <FmbGroupedResourceItems />
    </Menu>
  );
};

export default LayoutMenu;
