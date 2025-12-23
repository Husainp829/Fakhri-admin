/**
 * Permission utility functions for react-admin integration
 *
 * These functions work with the permission object structure returned by react-admin's usePermissions() hook.
 * The permission object has the format:
 * {
 *   resource: { action: true, ... },
 *   ...
 * }
 *
 * Supports hierarchical permission checking with wildcards:
 * - {resource}.* grants all actions for that resource
 * - * grants all permissions
 */

/**
 * Checks if a user has a specific permission, supporting wildcard expansion.
 *
 * @param {Object} permissions - Permission object from usePermissions() hook
 * @param {string} permission - Permission string in format "resource.action" (e.g., "bookings.view")
 * @returns {boolean} - True if user has the permission
 *
 * @example
 * hasPermission(permissions, "bookings.view") // checks bookings.view, bookings.*, or *
 * hasPermission(permissions, "bookings.edit") // checks bookings.edit, bookings.*, or *
 */
export const hasPermission = (permissions, permission) => {
  if (!permissions || !permission) {
    return false;
  }

  // Check for super wildcard (grants all permissions)
  // Handles both "*.*" and "*" permission formats
  if (permissions["*"]) {
    if (permissions["*"]["*"] === true) {
      return true;
    }
    // If "*" resource exists with any truthy permission, treat as super admin
    // This handles the case where "*" permission string is parsed as { "*": { "view": true } }
    if (Object.values(permissions["*"]).some((value) => value === true)) {
      return true;
    }
  }

  // Parse permission string (e.g., "bookings.view" -> { resource: "bookings", action: "view" })
  const parts = permission.split(".");
  if (parts.length < 2) {
    return false;
  }

  const resource = parts[0];
  const action = parts.slice(1).join("."); // Handle multi-part actions like "view.its.data"

  // Check for resource wildcard (e.g., "bookings.*")
  if (permissions[resource] && permissions[resource]["*"] === true) {
    return true;
  }

  // Check for exact permission match
  if (permissions[resource] && permissions[resource][action] === true) {
    return true;
  }

  return false;
};

/**
 * Checks if a user has any of the specified permissions.
 *
 * @param {Object} permissions - Permission object from usePermissions() hook
 * @param {string[]} permissionList - Array of permission strings to check
 * @returns {boolean} - True if user has at least one of the permissions
 *
 * @example
 * hasAnyPermission(permissions, ["bookings.view", "bookings.edit"]) // true if user has either
 */
export const hasAnyPermission = (permissions, permissionList) => {
  if (!permissions || !permissionList || !Array.isArray(permissionList)) {
    return false;
  }

  return permissionList.some((permission) =>
    hasPermission(permissions, permission)
  );
};

/**
 * Checks if a user has all of the specified permissions.
 *
 * @param {Object} permissions - Permission object from usePermissions() hook
 * @param {string[]} permissionList - Array of permission strings to check
 * @returns {boolean} - True if user has all of the permissions
 *
 * @example
 * hasAllPermissions(permissions, ["bookings.view", "bookings.edit"]) // true only if user has both
 */
export const hasAllPermissions = (permissions, permissionList) => {
  if (!permissions || !permissionList || !Array.isArray(permissionList)) {
    return false;
  }

  return permissionList.every((permission) =>
    hasPermission(permissions, permission)
  );
};

/**
 * Gets all permissions for a specific resource.
 *
 * @param {Object} permissions - Permission object from usePermissions() hook
 * @param {string} resource - Resource name (e.g., "bookings", "events")
 * @returns {Object} - Object with action names as keys and boolean values, or null if no permissions for resource
 *
 * @example
 * getResourcePermissions(permissions, "bookings")
 * // Returns: { view: true, edit: true, create: true } or null
 */
export const getResourcePermissions = (permissions, resource) => {
  if (!permissions || !resource) {
    return null;
  }

  // Check for super wildcard
  if (permissions["*"]) {
    if (
      permissions["*"]["*"] === true ||
      Object.values(permissions["*"]).some((value) => value === true)
    ) {
      // Return a special marker indicating all permissions
      return { "*": true };
    }
  }

  // Check for resource wildcard
  if (permissions[resource] && permissions[resource]["*"] === true) {
    return { "*": true };
  }

  // Return resource permissions if they exist
  if (permissions[resource]) {
    return { ...permissions[resource] };
  }

  return null;
};

/**
 * Checks if a user has any permission for a specific resource.
 * Useful for determining if a resource should be accessible at all.
 *
 * @param {Object} permissions - Permission object from usePermissions() hook
 * @param {string} resource - Resource name (e.g., "bookings", "events")
 * @returns {boolean} - True if user has any permission for the resource
 *
 * @example
 * hasResourceAccess(permissions, "bookings") // true if user has any booking permission
 */
export const hasResourceAccess = (permissions, resource) => {
  if (!permissions || !resource) {
    return false;
  }

  // Check for super wildcard
  if (permissions["*"]) {
    if (
      permissions["*"]["*"] === true ||
      Object.values(permissions["*"]).some((value) => value === true)
    ) {
      return true;
    }
  }

  // Check if resource exists and has any permissions
  if (permissions[resource]) {
    // Check for resource wildcard
    if (permissions[resource]["*"] === true) {
      return true;
    }
    // Check if any action is true
    return Object.values(permissions[resource]).some((value) => value === true);
  }

  return false;
};

/**
 * Converts a flat array of permission strings to the object structure used by react-admin.
 * This is useful for testing or when working with permission arrays from the API.
 *
 * @param {string[]} permissionArray - Array of permission strings (e.g., ["bookings.view", "bookings.edit"])
 * @returns {Object} - Permission object in react-admin format
 *
 * @example
 * parsePermissionsArray(["bookings.view", "bookings.edit", "events.view"])
 * // Returns: { bookings: { view: true, edit: true }, events: { view: true } }
 */
export const parsePermissionsArray = (permissionArray) => {
  if (!permissionArray || !Array.isArray(permissionArray)) {
    return {};
  }

  return permissionArray.reduce((acc, permission) => {
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

    acc[resource][action] = true;

    return acc;
  }, {});
};

/**
 * Permission management utilities for permission arrays (used in forms)
 * These functions work with arrays of permission strings (e.g., ["bookings.view", "admins.*"])
 */

/**
 * Checks if a permission ID is a wildcard (ends with ".*" or is "*")
 *
 * @param {string} permissionId - Permission ID to check
 * @returns {boolean} - True if the permission is a wildcard
 *
 * @example
 * isWildcard("admins.*") // true
 * isWildcard("*") // true
 * isWildcard("admins.view") // false
 */
export const isWildcard = (permissionId) =>
  permissionId === "*" || permissionId.endsWith(".*");

/**
 * Normalizes permissions array by replacing individual CRUD permissions with wildcard when all are present.
 * Also replaces all resource wildcards with Super Admin wildcard when all resources are fully selected.
 * This ensures the smallest JSON is stored in the database.
 *
 * @param {string[]} permissions - Array of permission IDs
 * @param {Object} byResource - Resource groups object with wildcard/individual mappings
 * @returns {string[]} - Normalized array with wildcards instead of all individual permissions
 *
 * @example
 * normalizePermissions(["admins.view", "admins.create", "admins.edit", "admins.delete"], byResource)
 * // Returns: ["admins.*"]
 *
 * normalizePermissions(["admins.*", "bookings.*", "events.*"], byResource)
 * // Returns: ["*"] (if all resources are present)
 */
export const normalizePermissions = (permissions, byResource) => {
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

  // Step 1: For each resource, if all individual permissions are present, replace with resource wildcard
  Object.keys(byResource).forEach((resource) => {
    const { wildcard, individual } = byResource[resource];
    if (wildcard && individual.length > 0) {
      const allIndividualPresent = individual.every((permId) =>
        normalizedSet.has(permId)
      );
      const wildcardPresent = normalizedSet.has(wildcard);

      if (allIndividualPresent) {
        // Remove individual permissions and add wildcard if not present
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
        // If wildcard is present but not all individual are, keep wildcard (it's more efficient)
        // Remove any individual permissions that might be present
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

  // Step 2: Check if Super Admin is present or should be added
  const superAdminPresent = normalizedSet.has("*");
  const resources = Object.keys(byResource);
  const allResourcesFullySelected =
    resources.length > 0 &&
    resources.every((resource) => {
      const { wildcard, individual } = byResource[resource];
      if (!wildcard || individual.length === 0) return false;
      // Check if resource wildcard is present OR all individual permissions are present
      return (
        normalizedSet.has(wildcard) ||
        individual.every((permId) => normalizedSet.has(permId))
      );
    });

  if (superAdminPresent || allResourcesFullySelected) {
    // Remove all resource wildcards and individual permissions, keep only "*"
    Object.keys(byResource).forEach((resource) => {
      const { wildcard, individual } = byResource[resource];
      if (wildcard && wildcard !== "*") {
        const index = normalized.indexOf(wildcard);
        if (index > -1) {
          normalized.splice(index, 1);
        }
      }
      // Remove individual permissions for this resource
      individual.forEach((permId) => {
        const index = normalized.indexOf(permId);
        if (index > -1) {
          normalized.splice(index, 1);
        }
      });
    });
    // Ensure "*" is present
    if (!normalized.includes("*")) {
      normalized.push("*");
    }
  }

  return normalized;
};

/**
 * Normalizes permissions array using available permissions choices.
 * This is a convenience function that builds resource groups and normalizes in one call.
 *
 * @param {string[]} permissions - Array of permission IDs to normalize
 * @param {Array} availableChoices - Array of all available permission choices with {id, name, resource, resourceLabel}
 * @returns {string[]} - Normalized array with wildcards instead of all individual permissions
 *
 * @example
 * normalizePermissionsWithChoices(
 *   ["admins.view", "admins.create", "admins.edit", "admins.delete"],
 *   availableChoices
 * )
 * // Returns: ["admins.*"]
 */
export const normalizePermissionsWithChoices = (
  permissions,
  availableChoices
) => {
  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
    return permissions || [];
  }

  if (
    !availableChoices ||
    !Array.isArray(availableChoices) ||
    availableChoices.length === 0
  ) {
    return permissions;
  }

  // Build resource groups from available choices
  const resourceGroups = buildResourceGroups(availableChoices, isWildcard);

  // Normalize using resource groups
  return normalizePermissions(permissions, resourceGroups.byResource);
};

/**
 * Builds resource groups structure from choices array for efficient lookups
 *
 * @param {Array} choices - Array of permission choice objects with {id, name, resource, resourceLabel}
 * @param {Function} isWildcardFn - Function to check if a permission is a wildcard
 * @returns {Object} - Object with {groups: Array, byResource: Object} structure
 *
 * @example
 * buildResourceGroups(choices, isWildcard)
 * // Returns: {
 * //   groups: [{ resource: "admins", resourceLabel: "Admins", permissions: [...], ... }],
 * //   byResource: { admins: { wildcard: "admins.*", individual: ["admins.view", ...] } }
 * // }
 */
export const buildResourceGroups = (choices, isWildcardFn) => {
  if (!choices || choices.length === 0) {
    return { groups: [], byResource: {} };
  }

  const groups = {};
  const byResource = {};

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

  // Sort permissions within each group - wildcards first, then alphabetically
  Object.keys(groups).forEach((key) => {
    groups[key].permissions.sort((a, b) => {
      const aIsWildcard = isWildcardFn(a.id);
      const bIsWildcard = isWildcardFn(b.id);
      if (aIsWildcard && !bIsWildcard) return -1;
      if (!aIsWildcard && bIsWildcard) return 1;
      return a.name.localeCompare(b.name);
    });
  });

  // Sort groups by resource label
  const sortedGroups = Object.values(groups).sort((a, b) =>
    a.resourceLabel.localeCompare(b.resourceLabel)
  );

  return { groups: sortedGroups, byResource };
};
