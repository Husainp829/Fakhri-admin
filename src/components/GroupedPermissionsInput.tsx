import { useMemo, useEffect, useCallback, useState } from "react";
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
import { authObj } from "@/firebase-config";
import { isWildcard, buildResourceGroups } from "@/utils/permission-utils";
import { shouldBustCache } from "@/utils/clear-permission-cache";
import type { PermissionChoice } from "@/utils/permission-utils";

let permissionsCache: PermissionChoice[] | null = null;
let permissionsCachePromise: Promise<PermissionChoice[] | null> | null = null;

export const clearPermissionsCache = () => {
  permissionsCache = null;
  permissionsCachePromise = null;
};

if (typeof window !== "undefined") {
  window.addEventListener("permissionsCacheCleared", () => {
    clearPermissionsCache();
  });
}

const isPermissionChecked = (permissionId: string, storedValue: string[]) =>
  storedValue.includes(permissionId);

const EMPTY_PERMISSIONS: string[] = [];

export type GroupedPermissionsInputProps = {
  reference?: string;
  source?: string;
};

const GroupedPermissionsInput = (props: GroupedPermissionsInputProps) => {
  const { reference = "admins/permissions/available" } = props;
  const dataProvider = useDataProvider();
  const { getValues, setValue, watch } = useFormContext();
  const source = props.source || "permissions";
  const value = (watch(source) as string[] | undefined) ?? EMPTY_PERMISSIONS;

  const [localChoices, setLocalChoices] = useState(permissionsCache);
  const [isLoading, setIsLoading] = useState(!permissionsCache);
  const [isAuthReady, setIsAuthReady] = useState(!!authObj.currentUser);

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

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const bustCache = shouldBustCache();

    if (permissionsCache && !bustCache) {
      setLocalChoices(permissionsCache);
      setIsLoading(false);
      return;
    }

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
        const rows = data as PermissionChoice[];
        permissionsCache = rows;
        permissionsCachePromise = null;
        setLocalChoices(rows);
        setIsLoading(false);
        return rows;
      })
      .catch((error: { status?: number; message?: string }) => {
        if (error?.status !== 401 && error?.message !== "No user") {
          console.error("Failed to fetch permissions:", error);
        }
        permissionsCachePromise = null;
        setIsLoading(false);
        return null;
      });
  }, [dataProvider, reference, isAuthReady]);

  const choices = useMemo(() => localChoices || [], [localChoices]);

  const resourceGroups = useMemo(() => buildResourceGroups(choices, isWildcard), [choices]);

  const handlePermissionChange = useCallback(
    (permissionId: string, checked: boolean) => {
      const currentValue = (getValues(source) as string[] | undefined) || [];
      const newValue = checked
        ? [...currentValue, permissionId]
        : currentValue.filter((id) => id !== permissionId);

      setValue(source, newValue, { shouldDirty: true });
    },
    [source, getValues, setValue]
  );

  const getCheckboxChecked = useCallback(
    (permissionId: string) => isPermissionChecked(permissionId, value),
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
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          p: 1,
        }}
      >
        {resourceGroups.groups.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
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
                          onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
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
