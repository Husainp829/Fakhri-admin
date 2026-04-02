import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useDataProvider } from "react-admin";
import { useFormContext } from "react-hook-form";
import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  FormControl,
  FormGroup,
  Divider,
} from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { authObj } from "../firebaseConfig";
import { isWildcard, buildResourceGroups } from "../utils/permissionUtils";
import { shouldBustCache } from "../utils/clearPermissionCache";

// Module-level cache for permissions to prevent refetching
let permissionsCache = null;
let permissionsCachePromise = null;

// Export function to clear cache (for development/debugging)
export const clearPermissionsCache = () => {
  permissionsCache = null;
  permissionsCachePromise = null;
};

// Listen for cache clear events
if (typeof window !== "undefined") {
  window.addEventListener("permissionsCacheCleared", () => {
    clearPermissionsCache();
  });
}

/**
 * Pure function: Check if a permission should be displayed as checked
 * This only checks if the permission is directly in the stored value
 */
const isPermissionChecked = (permissionId, storedValue) =>
  storedValue.includes(permissionId);

const GroupedPermissionsInput = (props) => {
  const { reference = "admins/permissions/available" } = props;
  const dataProvider = useDataProvider();
  const { getValues, setValue, watch } = useFormContext();
  const source = props.source || "permissions";
  const value = watch(source) || [];

  const [localChoices, setLocalChoices] = useState(permissionsCache);
  const [isLoading, setIsLoading] = useState(!permissionsCache);
  const [isAuthReady, setIsAuthReady] = useState(!!authObj.currentUser);

  // Wait for authentication to be ready
  useEffect(() => {
    if (authObj.currentUser) {
      setIsAuthReady(true);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(authObj, (user) => {
      setIsAuthReady(!!user);
    });
    return unsubscribe;
  }, []);

  // Fetch permissions once and cache them (only when auth is ready)
  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    // Check if cache should be busted
    const bustCache = shouldBustCache();

    if (permissionsCache && !bustCache) {
      setLocalChoices(permissionsCache);
      setIsLoading(false);
      return;
    }

    // If cache should be busted, clear it
    if (bustCache) {
      permissionsCache = null;
    }

    if (permissionsCachePromise) {
      permissionsCachePromise
        .then((data) => {
          setLocalChoices(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
      return;
    }

    setIsLoading(true);
    permissionsCachePromise = dataProvider
      .getList(reference, {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "id", order: "ASC" },
      })
      .then(({ data }) => {
        permissionsCache = data;
        permissionsCachePromise = null;
        setLocalChoices(data);
        setIsLoading(false);
        return data;
      })
      .catch((error) => {
        if (error?.status !== 401 && error?.message !== "No user") {
          console.error("Failed to fetch permissions:", error);
        }
        permissionsCachePromise = null;
        setIsLoading(false);
        return null;
      });
  }, [dataProvider, reference, isAuthReady]);

  const choices = useMemo(() => localChoices || [], [localChoices]);

  // Memoize resource groups structure for efficient lookups
  const resourceGroups = useMemo(
    () => buildResourceGroups(choices, isWildcard),
    [choices]
  );

  // Simple permission change handler - just add/remove the permission
  const handlePermissionChange = useCallback(
    (permissionId, checked) => {
      const currentValue = getValues(source) || [];
      const newValue = checked
        ? [...currentValue, permissionId]
        : currentValue.filter((id) => id !== permissionId);

      setValue(source, newValue, { shouldDirty: true });
    },
    [source, getValues, setValue]
  );

  // Memoized checkbox checked state
  const getCheckboxChecked = useCallback(
    (permissionId) => isPermissionChecked(permissionId, value),
    [value]
  );

  if (isLoading) {
    return (
      <FormControl fullWidth>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography>Loading permissions...</Typography>
        </Box>
      </FormControl>
    );
  }

  return (
    <FormControl fullWidth>
      <Box
        sx={{
          maxHeight: 500,
          overflowY: "auto",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          p: 1,
        }}
      >
        {resourceGroups.groups.length === 0 ? (
          <Typography
            sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
          >
            No permissions available
          </Typography>
        ) : (
          resourceGroups.groups.map((group, index) => (
            <Box key={group.resource} sx={{ mb: 2 }}>
              {index > 0 && <Divider sx={{ my: 2 }} />}
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}
              >
                {group.resourceLabel} ({group.permissions.length})
              </Typography>
              <FormGroup
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {group.permissions.map((permission) => {
                  const isWildcardPerm = isWildcard(permission.id);
                  const checked = getCheckboxChecked(permission.id);
                  return (
                    <FormControlLabel
                      key={permission.id}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(e) =>
                            handlePermissionChange(
                              permission.id,
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            fontWeight: isWildcardPerm ? 600 : 400,
                            color: isWildcardPerm ? "primary.main" : "inherit",
                          }}
                        >
                          {permission.name}
                        </Typography>
                      }
                    />
                  );
                })}
              </FormGroup>
            </Box>
          ))
        )}
      </Box>
    </FormControl>
  );
};

export default GroupedPermissionsInput;
