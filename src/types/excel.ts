export type ExcelColumn<T = Record<string, unknown>> = {
  header: string;
  field: string | ((rec: T) => unknown);
  width?: number;
  formatter?: (rec: T, rawValue: unknown) => unknown;
};

export type ExportToExcelOptions = {
  filenamePrefix?: string;
  sheetName?: string;
};
