import { fetchUtils } from "react-admin";
import type { DataProvider, Identifier } from "ra-core";
import { stringify } from "query-string";
import { unflatten } from "flat";
import { getApiUrl } from "@/constants";
import httpClient from "./http-client";
import { normalizePermissionsWithChoices, type PermissionChoice } from "@/utils/permission-utils";

const convertRows = (rows: unknown[]) => rows.map((row) => unflatten(row as object));

let availablePermissionsCache: PermissionChoice[] | null = null;
let availablePermissionsPromise: Promise<PermissionChoice[]> | null = null;

export const clearAvailablePermissionsCache = (): void => {
  availablePermissionsCache = null;
  availablePermissionsPromise = null;
};

if (typeof window !== "undefined") {
  window.addEventListener("permissionsCacheCleared", () => {
    clearAvailablePermissionsCache();
  });
}

const getAvailablePermissions = async (): Promise<PermissionChoice[]> => {
  if (availablePermissionsCache) {
    return availablePermissionsCache;
  }

  if (availablePermissionsPromise) {
    return availablePermissionsPromise;
  }

  availablePermissionsPromise = httpClient(`${getApiUrl()}/admins/permissions/available`, {
    method: "GET",
  })
    .then(({ json }) => {
      const body = json as { rows?: PermissionChoice[]; data?: PermissionChoice[] };
      availablePermissionsCache = body.rows ?? body.data ?? [];
      availablePermissionsPromise = null;
      return availablePermissionsCache;
    })
    .catch((error: unknown) => {
      console.error("Failed to fetch permissions for normalization:", error);
      availablePermissionsPromise = null;
      return [];
    });

  return availablePermissionsPromise;
};

const normalizeAdminPermissions = async (
  data: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  const permissions = data.permissions;
  if (!permissions || !Array.isArray(permissions)) {
    return data;
  }

  const availableChoices = await getAvailablePermissions();

  if (!availableChoices || availableChoices.length === 0) {
    return data;
  }

  const normalized = normalizePermissionsWithChoices(permissions as string[], availableChoices);

  return {
    ...data,
    permissions: normalized,
  };
};

const dataProvider = {
  getList: (resource: string, params: Parameters<DataProvider["getList"]>[1]) => {
    if (resource === "ohbatMajlisUpcoming") {
      const scope = params?.meta?.attendanceScope === "past" ? "past" : "upcoming";
      const path = scope === "past" ? "past" : "upcoming";
      return httpClient(`${getApiUrl()}/ohbatMajalis/attendance/${path}`).then(({ json }) => {
        const body = json as { count?: number; rows?: unknown[] };
        const rows = body.rows ?? [];
        return {
          data: convertRows(rows),
          total: body.count ?? rows.length,
        };
      });
    }

    if (resource === "itsdataAddressChangeQueue") {
      const pagination = params.pagination ?? { page: 1, perPage: 10 };
      const filter = params.filter ?? {};
      const sort = params.sort ?? { field: "id", order: "DESC" as const };
      const page = pagination.page ?? 1;
      const perPage = pagination.perPage ?? 10;
      const query = {
        ...fetchUtils.flattenObject(filter),
        orderBy: sort.field,
        order: sort.order,
        limit: perPage,
        startAfter: (page - 1) * perPage,
      };
      const url = `${getApiUrl()}/itsdata/address-change-queue?${stringify(query)}`;
      return httpClient(url).then(({ json }) => {
        const body = json as { count?: number; rows?: unknown[] };
        const rows = body.rows ?? [];
        return {
          data: convertRows(rows),
          total: body.count,
        };
      });
    }

    if (resource === "fmbThaliDistributionDailyRun") {
      const filter = params.filter ?? {};
      const flat = fetchUtils.flattenObject(filter) as Record<string, unknown>;
      const rawDate = flat.date;
      let dateStr = "";
      if (typeof rawDate === "string") {
        dateStr = rawDate.trim();
      } else if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
        dateStr = rawDate.toISOString().slice(0, 10);
      }
      const date = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
        ? dateStr
        : new Date().toISOString().slice(0, 10);
      const url = `${getApiUrl()}/fmbThaliDistribution/dashboard?${stringify({ date })}`;
      return httpClient(url).then(({ json }) => {
        const body = json as {
          count?: number;
          rows?: Array<Record<string, unknown> & { distributorId?: string }>;
          isTenantHoliday?: boolean;
          holidayName?: string | null;
          date?: string;
          timezone?: string;
        };
        const rows = body.rows ?? [];
        const withIds = rows.map((row) => ({
          ...row,
          id: String(row.distributorId ?? ""),
        }));
        return {
          data: convertRows(withIds),
          total: body.count ?? rows.length,
          meta: {
            isTenantHoliday: Boolean(body.isTenantHoliday),
            holidayName: body.holidayName ?? null,
            dashboardDate: body.date ?? date,
            timezone: body.timezone,
          },
        };
      });
    }

    const pagination = params.pagination ?? { page: 1, perPage: 10 };
    const filter = params.filter ?? {};
    const sort = params.sort ?? { field: "id", order: "DESC" as const };
    const page = pagination.page ?? 1;
    const perPage = pagination.perPage ?? 10;
    const query = {
      ...fetchUtils.flattenObject(filter),
      orderBy: sort.field,
      order: sort.order,
      limit: perPage,
      startAfter: (page - 1) * perPage,
    };
    const url = `${getApiUrl(resource)}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => {
      const body = json as { count?: number; rows?: unknown[]; counts?: unknown };
      localStorage.setItem(`${resource}_count`, JSON.stringify(body.counts));
      return {
        data: convertRows(body.rows ?? []),
        total: body.count,
      };
    });
  },

  getOne: (resource: string, params: Parameters<DataProvider["getOne"]>[1]) =>
    httpClient(`${getApiUrl(resource)}/${resource}/${params.id}`).then(({ json }) => {
      const body = json as { rows?: Record<string, unknown>[] };
      const row = body.rows![0];
      if (resource === "fmbDailyMenu" && row && Array.isArray(row.dishIds)) {
        const dishIds = row.dishIds as string[];
        return {
          data: {
            ...row,
            menuLines: dishIds.map((dishId) => ({ dishId })),
          },
        };
      }
      return { data: row };
    }),

  getMany: (resource: string, params: Parameters<DataProvider["getMany"]>[1]) => {
    const ids = (params.ids ?? []).map((id) => (id == null ? "" : String(id))).filter(Boolean);
    const uuidLike = (s: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
    const uuidIds = ids.filter(uuidLike);
    const itsIds = ids.filter((id) => !uuidLike(id));

    if (resource === "itsdata" && itsIds.length > 0 && uuidIds.length === 0) {
      const query = {
        filter: JSON.stringify({ ITS_ID_in: itsIds }),
        limit: Math.min(Math.max(itsIds.length, 50), 100),
      };
      const url = `${getApiUrl(resource)}/${resource}?${stringify(query)}`;
      return httpClient(url).then(({ json }) => {
        const body = json as { rows?: unknown[] };
        const rows = body.rows ?? [];
        return {
          data: convertRows(rows),
          total: rows.length,
        };
      });
    }

    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${getApiUrl(resource)}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => {
      const body = json as { count?: number; rows?: unknown[] };
      return {
        data: body.rows ?? [],
        total: body.count,
      };
    });
  },

  getManyReference: (resource: string, params: Parameters<DataProvider["getManyReference"]>[1]) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      ...fetchUtils.flattenObject(params.filter),
      [params.target]: params.id,
      orderBy: field,
      order,
      limit: perPage,
      startAfter: (page - 1) * perPage,
    };
    const url = `${getApiUrl(resource)}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => {
      const body = json as { rows?: unknown[]; count?: number };
      return {
        data: body.rows ?? [],
        total: body.count,
      };
    });
  },

  update: async (resource: string, params: Parameters<DataProvider["update"]>[1]) => {
    let dataToSend: Record<string, unknown> = { ...params.data } as Record<string, unknown>;

    if (resource === "admins" && dataToSend.permissions) {
      dataToSend = await normalizeAdminPermissions(dataToSend);
    }

    if (resource === "itsdataAddressChangeQueue" && dataToSend.markDone) {
      return httpClient(`${getApiUrl()}/itsdata/address-change-queue/${params.id}/done`, {
        method: "PATCH",
        body: "{}",
      }).then(({ json }) => {
        const body = json as { rows?: unknown[] };
        const rows = body.rows ?? [];
        const converted = convertRows(rows);
        return { data: converted[0] ?? rows[0] };
      });
    }

    return httpClient(`${getApiUrl(resource)}/${resource}/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(dataToSend),
    }).then(({ json }) => {
      const body = json as { rows?: Record<string, unknown>[] };
      return { data: body.rows![0] };
    });
  },

  updateMany: (resource: string, params: Parameters<DataProvider["updateMany"]>[1]) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${getApiUrl(resource)}/${resource}?${stringify(query)}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: (json as { data?: Identifier[] }).data }));
  },

  create: async (resource: string, params: Parameters<DataProvider["create"]>[1]) => {
    let dataToSend: Record<string, unknown> = { ...params.data } as Record<string, unknown>;

    if (resource === "admins" && dataToSend.permissions) {
      dataToSend = await normalizeAdminPermissions(dataToSend);
    }

    return httpClient(`${getApiUrl(resource)}/${resource}`, {
      method: "POST",
      body: JSON.stringify(dataToSend),
    }).then(({ json }) => {
      const body = json as { rows?: Record<string, unknown>[] };
      return { data: body.rows![0] };
    });
  },

  createMany: (resource: string, params: { data?: unknown }) =>
    httpClient(`${getApiUrl(resource)}/${resource}/bulk-upload`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json }) => {
      const body = json as { data?: unknown };
      return { data: body.data };
    }),

  delete: (resource: string, params: Parameters<DataProvider["delete"]>[1]) =>
    httpClient(`${getApiUrl(resource)}/${resource}/${params.id}`, {
      method: "DELETE",
    }).then(({ json }) => {
      const body = json as { rows?: Record<string, unknown>[] };
      return { data: body.rows![0] };
    }),

  deleteMany: (
    resource: string,
    params: Parameters<DataProvider["deleteMany"]>[1] & { data?: unknown }
  ) =>
    Promise.all(
      params.ids.map((id) =>
        httpClient(`${getApiUrl(resource)}/${resource}/${id}`, {
          method: "DELETE",
          body: JSON.stringify(params.data),
        })
      )
    ).then(() => ({
      data: [] as Identifier[],
    })),

  deleteImage: (resource: string, params: Record<string, unknown>) =>
    httpClient(`${getApiUrl(resource)}/${resource}/delete-image?${stringify(params)}`).then(() => ({
      data: "",
    })),

  pdfDownload: (resource: string, params: { ids?: Identifier[]; name?: string }) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${getApiUrl(resource)}/${resource}/${params.name}?${stringify(query)}`).then(
      (response) => {
        const linkSource = `data:application/pdf;base64,${response.body}`;
        const downloadLink = document.createElement("a");
        const fileName = `${params.name}-${Date.now()}.pdf`;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
        return { data: [] };
      }
    );
  },

  previewRecipients: (
    resource: string,
    params: { filterCriteria?: unknown; limit?: number; offset?: number }
  ) => {
    const { filterCriteria, limit = 25, offset = 0 } = params;
    return httpClient(`${getApiUrl(resource)}/${resource}/preview-recipients`, {
      method: "POST",
      body: JSON.stringify({
        filterCriteria,
        limit,
        offset,
      }),
    }).then(({ json }) => {
      const body = json as {
        recipients?: unknown[];
        count?: number;
        fields?: unknown[];
      };
      const recipients = body.recipients ?? [];
      return {
        data: convertRows(recipients),
        total: body.count ?? 0,
        fields: body.fields ?? [],
      };
    });
  },

  lookupIts: (resource: string, params: { itsIds?: unknown }) =>
    httpClient(`${getApiUrl(resource)}/${resource}/lookup-its`, {
      method: "POST",
      body: JSON.stringify({ itsIds: params.itsIds }),
    }).then(({ json }) => {
      const body = json as {
        matched?: unknown[];
        unmatched?: unknown[];
        count?: number;
      };
      return {
        matched: body.matched ?? [],
        unmatched: body.unmatched ?? [],
        count: body.count ?? 0,
      };
    }),
} as DataProvider;

export default dataProvider;
