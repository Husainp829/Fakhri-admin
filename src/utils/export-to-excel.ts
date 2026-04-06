/* eslint-disable no-console */
import * as XLSX from "xlsx";
import dayjs from "dayjs";

import type { ExcelColumn, ExportToExcelOptions } from "@/types/excel";

export function exportToExcel<T extends Record<string, unknown> = Record<string, unknown>>(
  columns: ExcelColumn<T>[] = [],
  data: T[] = [],
  options: ExportToExcelOptions = {}
): { filename: string; blob: Blob } {
  const { filenamePrefix = "export", sheetName = "Sheet1" } = options;

  const getByPath = (obj: T, path: string): unknown => {
    if (!obj || !path) return undefined;
    return path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object" && key in (acc as object)) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  };

  const rows = data.map((rec) => {
    const row: Record<string, unknown> = {};
    columns.forEach((col) => {
      const { header, field, formatter } = col;
      let rawValue: unknown;
      if (typeof field === "function") {
        try {
          rawValue = field(rec);
        } catch (e) {
          rawValue = "";
          console.error("column field function error for header:", header, e);
        }
      } else if (typeof field === "string") {
        rawValue = getByPath(rec, field);
      } else {
        rawValue = "";
      }

      let finalValue = rawValue;
      if (typeof formatter === "function") {
        try {
          finalValue = formatter(rec, rawValue);
        } catch (e) {
          finalValue = rawValue;
          console.error("formatter error for header:", header, e);
        }
      }

      row[header] = finalValue === undefined || finalValue === null ? "" : finalValue;
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(
    rows as Record<string, unknown>[],
    {
      origin: "A1",
    } as XLSX.JSON2SheetOpts
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const widths = columns.map((c) => ({ wch: c.width || 20 }));
  worksheet["!cols"] = widths;

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const filename = `${filenamePrefix}_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);

  return { filename, blob };
}
