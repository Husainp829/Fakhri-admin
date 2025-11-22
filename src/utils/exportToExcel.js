// exporter.util.js
import * as XLSX from "xlsx";
import dayjs from "dayjs";

/**
 * columns: [
 *   { header: 'Booking No', field: 'booking.bookingNo', width: 20 },
 *   { header: 'Date', field: 'date', formatter: (rec, v) => dayjs(v).format('DD-MMM-YYYY') },
 *   { header: 'Slot', field: rec => slotNameMap[rec.slot] },
 * ]
 *
 * data: array of records (objects)
 *
 * options: {
 *   filenamePrefix: 'bookings',
 *   sheetName: 'Sheet1'
 * }
 */
export function exportToExcel(columns = [], data = [], options = {}) {
  const { filenamePrefix = "export", sheetName = "Sheet1" } = options;

  // helper to get nested values by path 'a.b.c'
  const getByPath = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };

  // Build flat rows with column headers as keys (preserves order)
  const rows = data.map((rec) => {
    const row = {};
    columns.forEach((col) => {
      const { header, field, formatter } = col;
      let rawValue;
      if (typeof field === "function") {
        try {
          rawValue = field(rec);
        } catch (e) {
          // fail gracefully
          rawValue = "";
          // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.error("formatter error for header:", header, e);
        }
      }

      // Avoid `undefined` in excel cells
      row[header] = finalValue === undefined || finalValue === null ? "" : finalValue;
    });
    return row;
  });

  // Create worksheet & workbook
  const worksheet = XLSX.utils.json_to_sheet(rows, { origin: "A1" });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Optionally set column widths if provided
  const widths = columns.map((c) => ({ wch: c.width || 20 }));
  worksheet["!cols"] = widths;

  // Write workbook to array buffer
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // Create blob and trigger download in browser (no file-saver)
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const filename = `${filenamePrefix}_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.xlsx`;

  // Browser download
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
