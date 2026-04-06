/**
 * Permission utility functions for react-admin integration
 */
import type { PermissionRecord } from "@/types/permissions";

type PermissionActionsWithWildcard = Record<string, boolean> & { "*"?: boolean };

export const hasPermission = (
  permissions: PermissionRecord | null | undefined,
  permission: string
): boolean => {
  if (!permissions || !permission) {
    return false;
  }

  if (permissions["*"]) {
    if (permissions["*"]["*"] === true) {
      return true;
    }
    if (Object.values(permissions["*"]).some((value) => value === true)) {
      return true;
    }
  }

  const parts = permission.split(".");
  if (parts.length < 2) {
    return false;
  }

  const resource = parts[0];
  const action = parts.slice(1).join(".");

  const resourceActions = permissions[resource];
  if (resourceActions && resourceActions["*"] === true) {
    return true;
  }

  if (resourceActions && resourceActions[action] === true) {
    return true;
  }

  return false;
};

export const hasAnyPermission = (
  permissions: PermissionRecord | null | undefined,
  permissionList: string[]
): boolean => {
  if (!permissions || !permissionList || !Array.isArray(permissionList)) {
    return false;
  }

  return permissionList.some((permission) => hasPermission(permissions, permission));
};

export const hasAllPermissions = (
  permissions: PermissionRecord | null | undefined,
  permissionList: string[]
): boolean => {
  if (!permissions || !permissionList || !Array.isArray(permissionList)) {
    return false;
  }

  return permissionList.every((permission) => hasPermission(permissions, permission));
};

export const getResourcePermissions = (
  permissions: PermissionRecord | null | undefined,
  resource: string
): PermissionActionsWithWildcard | null => {
  if (!permissions || !resource) {
    return null;
  }

  if (permissions["*"]) {
    if (
      permissions["*"]["*"] === true ||
      Object.values(permissions["*"]).some((value) => value === true)
    ) {
      return { "*": true };
    }
  }

  const resourceActions = permissions[resource];
  if (resourceActions && resourceActions["*"] === true) {
    return { "*": true };
  }

  if (resourceActions) {
    return { ...resourceActions };
  }

  return null;
};

export const hasResourceAccess = (
  permissions: PermissionRecord | null | undefined,
  resource: string
): boolean => {
  if (!permissions || !resource) {
    return false;
  }

  if (permissions["*"]) {
    if (
      permissions["*"]["*"] === true ||
      Object.values(permissions["*"]).some((value) => value === true)
    ) {
      return true;
    }
  }

  const resourceActions = permissions[resource];
  if (resourceActions) {
    if (resourceActions["*"] === true) {
      return true;
    }
    return Object.values(resourceActions).some((value) => value === true);
  }

  return false;
};

export const parsePermissionsArray = (
  permissionArray: string[] | null | undefined
): PermissionRecord => {
  if (!permissionArray || !Array.isArray(permissionArray)) {
    return {};
  }

  return permissionArray.reduce<PermissionRecord>((acc, permission) => {
    if (!permission || typeof permission !== "string") {
      return acc;
    }

    const parts = permission.split(".");
    if (parts.length < 2) {
      return acc;
    }

    const resource = parts[0];
    const action = parts.slice(1).join(".");

    if (!acc[resource]) {
      acc[resource] = {};
    }

    acc[resource]![action] = true;

    return acc;
  }, {});
};

export const isWildcard = (permissionId: string): boolean =>
  permissionId === "*" || permissionId.endsWith(".*");

export type ByResourceEntry = {
  wildcard: string | null;
  individual: string[];
};

export type ByResourceMap = Record<string, ByResourceEntry>;

export const normalizePermissions = (
  permissions: string[] | null | undefined,
  byResource: ByResourceMap | null | undefined
): string[] => {
  if (
    !permissions ||
    permissions.length === 0 ||
    !byResource ||
    Object.keys(byResource).length === 0
  ) {
    return permissions || [];
  }

  const normalized = [...permissions];
  const normalizedSet = new Set(normalized);

  Object.keys(byResource).forEach((resource) => {
    const { wildcard, individual } = byResource[resource];
    if (wildcard && individual.length > 0) {
      const allIndividualPresent = individual.every((permId) => normalizedSet.has(permId));
      const wildcardPresent = normalizedSet.has(wildcard);

      if (allIndividualPresent) {
        individual.forEach((permId) => {
          const index = normalized.indexOf(permId);
          if (index > -1) {
            normalized.splice(index, 1);
            normalizedSet.delete(permId);
          }
        });
        if (!wildcardPresent) {
          normalized.push(wildcard);
          normalizedSet.add(wildcard);
        }
      } else if (wildcardPresent) {
        individual.forEach((permId) => {
          const index = normalized.indexOf(permId);
          if (index > -1) {
            normalized.splice(index, 1);
            normalizedSet.delete(permId);
          }
        });
      }
    }
  });

  const superAdminPresent = normalizedSet.has("*");
  const resources = Object.keys(byResource);
  const allResourcesFullySelected =
    resources.length > 0 &&
    resources.every((resource) => {
      const { wildcard, individual } = byResource[resource];
      if (!wildcard || individual.length === 0) return false;
      return normalizedSet.has(wildcard) || individual.every((permId) => normalizedSet.has(permId));
    });

  if (superAdminPresent || allResourcesFullySelected) {
    Object.keys(byResource).forEach((resource) => {
      const { wildcard, individual } = byResource[resource];
      if (wildcard && wildcard !== "*") {
        const index = normalized.indexOf(wildcard);
        if (index > -1) {
          normalized.splice(index, 1);
        }
      }
      individual.forEach((permId) => {
        const index = normalized.indexOf(permId);
        if (index > -1) {
          normalized.splice(index, 1);
        }
      });
    });
    if (!normalized.includes("*")) {
      normalized.push("*");
    }
  }

  return normalized;
};

export type PermissionChoice = {
  id: string;
  name: string;
  resource?: string;
  resourceLabel?: string;
};

export const normalizePermissionsWithChoices = (
  permissions: string[] | null | undefined,
  availableChoices: PermissionChoice[] | null | undefined
): string[] => {
  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
    return permissions || [];
  }

  if (!availableChoices || !Array.isArray(availableChoices) || availableChoices.length === 0) {
    return permissions;
  }

  const resourceGroups = buildResourceGroups(availableChoices, isWildcard);

  return normalizePermissions(permissions, resourceGroups.byResource);
};

export const buildResourceGroups = (
  choices: PermissionChoice[],
  isWildcardFn: (id: string) => boolean
): { groups: ResourcePermissionGroup[]; byResource: ByResourceMap } => {
  if (!choices || choices.length === 0) {
    return { groups: [], byResource: {} };
  }

  const groups: Record<string, ResourcePermissionGroup> = {};
  const byResource: ByResourceMap = {};

  choices.forEach((choice) => {
    const resource = choice.resource || "other";
    const resourceLabel = choice.resourceLabel || resource;

    if (!groups[resource]) {
      groups[resource] = {
        resource,
        resourceLabel,
        permissions: [],
        wildcard: null,
        individual: [],
      };
      byResource[resource] = {
        wildcard: null,
        individual: [],
      };
    }
    groups[resource].permissions.push(choice);

    if (isWildcardFn(choice.id)) {
      groups[resource].wildcard = choice.id;
      byResource[resource].wildcard = choice.id;
    } else {
      groups[resource].individual.push(choice.id);
      byResource[resource].individual.push(choice.id);
    }
  });

  Object.keys(groups).forEach((key) => {
    groups[key].permissions.sort((a, b) => {
      const aIsWildcard = isWildcardFn(a.id);
      const bIsWildcard = isWildcardFn(b.id);
      if (aIsWildcard && !bIsWildcard) return -1;
      if (!aIsWildcard && bIsWildcard) return 1;
      return a.name.localeCompare(b.name);
    });
  });

  const sortedGroups = Object.values(groups).sort((a, b) =>
    a.resourceLabel.localeCompare(b.resourceLabel)
  );

  return { groups: sortedGroups, byResource };
};

type ResourcePermissionGroup = {
  resource: string;
  resourceLabel: string;
  permissions: PermissionChoice[];
  wildcard: string | null;
  individual: string[];
};
