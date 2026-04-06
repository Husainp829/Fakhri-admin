/**
 * Shape of the permission object from react-admin's usePermissions() / authProvider.
 * Resource keys map to action keys → granted when true.
 */
export type PermissionActions = Record<string, boolean>;

export type PermissionRecord = Record<string, PermissionActions | undefined>;
