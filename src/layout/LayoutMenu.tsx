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

/**
 * Renders module resource links.
 * When `menuSections` is set, **group order** follows `Object.keys(menuSections)` (insertion order in the config object).
 * Within each group, resources keep their order in `module-resources`. Leading rows without `menuSection` render first;
 * remaining ungrouped rows render after all keyed sections.
 */
function appendModuleResourceMenuItems(
  nodes: React.ReactNode[],
  moduleResources: readonly ModuleResourceRow[],
  menuSections: Record<string, string> | undefined,
  menuRouteKey: string
): void {
  const withName = moduleResources.filter((config) => {
    if (config.hideFromMenu) {
      return false;
    }
    return Boolean((config.resource as { name?: string }).name);
  });

  if (!menuSections || Object.keys(menuSections).length === 0) {
    let currentSection: string | undefined;
    let subheaderOrdinal = 0;
    for (const config of withName) {
      const name = (config.resource as { name?: string }).name!;
      const section = config.menuSection;
      if (section !== currentSection) {
        currentSection = section;
        if (section) {
          nodes.push(
            <ListSubheader
              key={`${menuRouteKey}-sec-${section}-${subheaderOrdinal}`}
              disableGutters
              disableSticky
              sx={(theme) => menuSectionSubheaderSx(theme)}
            >
              {section}
            </ListSubheader>
          );
          subheaderOrdinal += 1;
        }
      }
      nodes.push(<Menu.ResourceItem key={name} name={name} />);
    }
    return;
  }

  const emitted = new WeakSet<ModuleResourceRow>();
  const pushResourceItem = (config: ModuleResourceRow) => {
    if (emitted.has(config)) {
      return;
    }
    emitted.add(config);
    const name = (config.resource as { name?: string }).name!;
    nodes.push(<Menu.ResourceItem key={name} name={name} />);
  };

  let subheaderOrdinal = 0;
  let i = 0;
  while (i < withName.length && !withName[i].menuSection) {
    pushResourceItem(withName[i]);
    i += 1;
  }

  for (const sectionKey of Object.keys(menuSections)) {
    const inSection = withName.filter((r) => r.menuSection === sectionKey);
    if (inSection.length === 0) {
      continue;
    }
    nodes.push(
      <ListSubheader
        key={`${menuRouteKey}-sec-${sectionKey}-${subheaderOrdinal}`}
        disableGutters
        disableSticky
        sx={(theme) => menuSectionSubheaderSx(theme)}
      >
        {menuSections[sectionKey]}
      </ListSubheader>
    );
    subheaderOrdinal += 1;
    for (const r of inSection) {
      pushResourceItem(r);
    }
  }

  for (const r of withName) {
    if (!r.menuSection) {
      pushResourceItem(r);
    }
  }

  const orphanSectionHeaderEmitted = new Set<string>();
  for (const r of withName) {
    if (!emitted.has(r)) {
      const orphanKey = r.menuSection;
      if (orphanKey && !orphanSectionHeaderEmitted.has(orphanKey)) {
        orphanSectionHeaderEmitted.add(orphanKey);
        nodes.push(
          <ListSubheader
            key={`${menuRouteKey}-sec-orphan-${orphanKey}-${subheaderOrdinal}`}
            disableGutters
            disableSticky
            sx={(theme) => menuSectionSubheaderSx(theme)}
          >
            {orphanKey}
          </ListSubheader>
        );
        subheaderOrdinal += 1;
      }
      pushResourceItem(r);
    }
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
