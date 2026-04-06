/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import { fetchUtils } from "react-admin";
import { stringify } from "query-string";
import { unflatten } from "flat";
import { getApiUrl } from "@/constants";
import httpClient from "./httpClient";
import { normalizePermissionsWithChoices } from "@/utils/permission-utils";

const convertRows = (rows) => rows.map(unflatten);

// Cache for available permissions (used for normalization)
let availablePermissionsCache = null;
let availablePermissionsPromise = null;

// Export function to clear cache
export const clearAvailablePermissionsCache = () => {
  availablePermissionsCache = null;
  availablePermissionsPromise = null;
};

// Listen for cache clear events
if (typeof window !== "undefined") {
  window.addEventListener("permissionsCacheCleared", () => {
    clearAvailablePermissionsCache();
  });
}

/**
 * Fetch available permissions (cached)
 */
const getAvailablePermissions = async () => {
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
      availablePermissionsCache = json.rows || json.data || [];
      availablePermissionsPromise = null;
      return availablePermissionsCache;
    })
    .catch((error) => {
      console.error("Failed to fetch permissions for normalization:", error);
      availablePermissionsPromise = null;
      return [];
    });

  return availablePermissionsPromise;
};

/**
 * Normalize admin permissions before saving
 */
const normalizeAdminPermissions = async (data) => {
  if (!data.permissions || !Array.isArray(data.permissions)) {
    return data;
  }

  const availableChoices = await getAvailablePermissions();

  if (!availableChoices || availableChoices.length === 0) {
    return data;
  }

  const normalized = normalizePermissionsWithChoices(data.permissions, availableChoices);

  return {
    ...data,
    permissions: normalized,
  };
};

export default {
  getList: (resource, params) => {
    if (resource === "ohbatMajlisUpcoming") {
      const scope = params?.meta?.attendanceScope === "past" ? "past" : "upcoming";
      const path = scope === "past" ? "past" : "upcoming";
      return httpClient(`${getApiUrl()}/ohbatMajalis/attendance/${path}`).then(
        ({ json: { count, rows } }) => ({
          data: convertRows(rows || []),
          total: count ?? (rows || []).length,
        })
      );
    }

    if (resource === "itsdataAddressChangeQueue") {
      const { pagination = {}, filter = {}, sort = {} } = params;
      const { page = 1, perPage = 10 } = pagination;
      const { field, order } = sort;
      const query = {
        ...fetchUtils.flattenObject(filter),
        orderBy: field,
        order,
        limit: perPage,
        startAfter: (page - 1) * perPage,
      };
      const url = `${getApiUrl()}/itsdata/address-change-queue?${stringify(query)}`;
      return httpClient(url).then(({ json: { count, rows } }) => ({
        data: convertRows(rows || []),
        total: count,
      }));
    }

    const { pagination = {}, filter = {}, sort = {} } = params;
    const { page = 1, perPage = 10 } = pagination;
    const { field, order } = sort;
    const query = {
      ...fetchUtils.flattenObject(filter),
      orderBy: field,
      order,
      limit: perPage,
      startAfter: (page - 1) * perPage,
    };
    const url = `${getApiUrl(resource)}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json: { count, rows, counts } }) => {
      localStorage.setItem(`${resource}_count`, JSON.stringify(counts));
      return {
        data: convertRows(rows),
        total: count,
      };
    });
  },

  getOne: (resource, params) =>
    httpClient(`${getApiUrl(resource)}/${resource}/${params.id}`).then(({ json: { rows } }) => ({
      data: rows[0],
    })),

  getMany: (resource, params) => {
    const ids = (params.ids || []).map((id) => (id == null ? "" : String(id))).filter(Boolean);
    const uuidLike = (s) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
    const uuidIds = ids.filter(uuidLike);
    const itsIds = ids.filter((id) => !uuidLike(id));

    if (resource === "itsdata" && itsIds.length > 0 && uuidIds.length === 0) {
      const query = {
        filter: JSON.stringify({ ITS_ID_in: itsIds }),
        limit: Math.min(Math.max(itsIds.length, 50), 100),
      };
      const url = `${getApiUrl(resource)}/${resource}?${stringify(query)}`;
      return httpClient(url).then(({ json: { rows } }) => ({
        data: convertRows(rows || []),
        total: (rows || []).length,
      }));
    }

    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${getApiUrl(resource)}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json: { count, rows } }) => ({
      data: rows,
      total: count,
    }));
  },

  getManyReference: (resource, params) => {
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
    return httpClient(url).then(({ json: { rows, count } }) => ({
      data: rows,
      total: count,
    }));
  },

  update: async (resource, params) => {
    let dataToSend = params.data;

    // Normalize permissions for admins resource
    if (resource === "admins" && dataToSend.permissions) {
      dataToSend = await normalizeAdminPermissions(dataToSend);
    }

    if (resource === "itsdataAddressChangeQueue" && dataToSend.markDone) {
      return httpClient(`${getApiUrl()}/itsdata/address-change-queue/${params.id}/done`, {
        method: "PATCH",
        body: "{}",
      }).then(({ json: { rows } }) => ({
        data: convertRows(rows || [])[0] || rows[0],
      }));
    }

    return httpClient(`${getApiUrl(resource)}/${resource}/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(dataToSend),
    }).then(({ json: { rows } }) => ({
      data: rows[0],
    }));
  },

  updateMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${getApiUrl(resource)}/${resource}?${stringify(query)}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json.data }));
  },

  create: async (resource, params) => {
    let dataToSend = params.data;

    // Normalize permissions for admins resource
    if (resource === "admins" && dataToSend.permissions) {
      dataToSend = await normalizeAdminPermissions(dataToSend);
    }

    return httpClient(`${getApiUrl(resource)}/${resource}`, {
      method: "POST",
      body: JSON.stringify(dataToSend),
    }).then(({ json: { rows } }) => ({
      data: rows[0],
    }));
  },

  createMany: (resource, params) =>
    httpClient(`${getApiUrl(resource)}/${resource}/bulk-upload`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json: { data } }) => ({ data })),

  delete: (resource, params) =>
    httpClient(`${getApiUrl(resource)}/${resource}/${params.id}`, {
      method: "DELETE",
    }).then(({ json: { rows } }) => ({
      data: rows[0],
    })),

  deleteMany: (resource, params) =>
    Promise.all(
      params.ids.map((id) =>
        httpClient(`${getApiUrl(resource)}/${resource}/${id}`, {
          method: "DELETE",
          body: JSON.stringify(params.data),
        })
      )
    ).then(() => ({
      data: [],
    })),

  deleteImage: (resource, params) =>
    httpClient(`${getApiUrl(resource)}/${resource}/delete-image?${stringify(params)}`).then(() => ({
      data: "",
    })),
  pdfDownload: (resource, params) => {
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
  previewRecipients: (resource, params) => {
    const { filterCriteria, limit = 25, offset = 0 } = params;
    return httpClient(`${getApiUrl(resource)}/${resource}/preview-recipients`, {
      method: "POST",
      body: JSON.stringify({
        filterCriteria,
        limit,
        offset,
      }),
    }).then(({ json }) => {
      const recipients = json.recipients || [];
      return {
        data: convertRows(recipients),
        total: json.count || 0,
        fields: json.fields || [],
      };
    });
  },
  lookupIts: (resource, params) => {
    const { itsIds } = params;
    return httpClient(`${getApiUrl(resource)}/${resource}/lookup-its`, {
      method: "POST",
      body: JSON.stringify({ itsIds }),
    }).then(({ json }) => ({
      matched: json.matched || [],
      unmatched: json.unmatched || [],
      count: json.count || 0,
    }));
  },
};
