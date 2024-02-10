/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import { fetchUtils } from "react-admin";
import { stringify } from "query-string";
import { apiUrl } from "../constants";
import httpClient from "./httpClient";

export default {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      ...fetchUtils.flattenObject(params.filter),
      orderBy: field,
      order,
      limit: perPage,
      startAfter: (page - 1) * perPage,
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json: { count, rows, counts } }) => {
      localStorage.setItem(`${resource}_count`, JSON.stringify(counts));
      return {
        data: rows,
        total: count,
      };
    });
  },

  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json: { rows } }) => ({
      data: rows[0],
    })),

  getMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
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
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json: { rows, count } }) => ({
      data: rows,
      total: count,
    }));
  },

  update: async (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json: { rows } }) => ({
      data: rows[0],
    })),

  updateMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json.data }));
  },

  create: async (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json: { rows } }) => ({
      data: rows[0],
    })),

  createMany: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/bulk-upload`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json: { data } }) => ({ data })),

  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
    }).then(({ json: { rows } }) => ({
      data: rows[0],
    })),

  deleteMany: (resource, params) =>
    Promise.all(
      params.ids.map((id) =>
        httpClient(`${apiUrl}/${resource}/${id}`, {
          method: "DELETE",
          body: JSON.stringify(params.data),
        })
      )
    ).then(({ json: { rows } }) => ({
      data: rows,
    })),

  deleteImage: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/delete-image?${stringify(params)}`).then(() => ({
      data: "",
    })),
  pdfDownload: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}/${params.name}?${stringify(query)}`).then(
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
};
