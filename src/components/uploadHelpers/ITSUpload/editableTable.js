/* eslint-disable no-console */
import React from "react";
import { AgGridReact } from "ag-grid-react";
import Box from "@mui/material/Box";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import { red } from "@mui/material/colors";
import { schema } from "./schema";

export default ({ data, setData }) => {
  const columnDefs = Object.keys(schema).map((header) => ({
    field: schema[header].prop,
    cellEditor: schema[header].oneOf ? "agSelectCellEditor" : undefined,
    cellEditorParams: {
      values: schema[header].oneOf,
    },

    cellStyle: (params) => (!params.value ? { "background-color": red[400] } : null),
    onCellValueChanged: (e) => {
      const d = e.api?.rowModel.rowsToDisplay.map((r) => r.data);
      setData(d);
      e.api.redrawRows({ rowNode: e.node });
    },
  }));

  return (
    <Box
      className="ag-theme-material"
      sx={{
        height: "calc(100vh - 10em)",
        width: "calc(100vw - 1em)",
        fontFamily: (theme) => theme.typography.fontFamily,
      }}
    >
      <AgGridReact
        rowData={data}
        columnDefs={columnDefs}
        suppressRowClickSelection
        defaultColDef={{
          initialWidth: 170,
          resizable: true,
          editable: true,
        }}
      ></AgGridReact>
    </Box>
  );
};
