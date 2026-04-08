import { useEffect, useState } from "react";
import { readStoredTenantName, TENANT_BRANDING_UPDATED_EVENT } from "@/utils/tenant-branding-cache";

/** Display name from `GET /tenant-branding/me` (`tenants.name`), cached in sessionStorage. */
export function useTenantName(): string {
  const [name, setName] = useState(() => readStoredTenantName());

  useEffect(() => {
    const sync = () => setName(readStoredTenantName());
    window.addEventListener(TENANT_BRANDING_UPDATED_EVENT, sync);
    return () => window.removeEventListener(TENANT_BRANDING_UPDATED_EVENT, sync);
  }, []);

  return name;
}
