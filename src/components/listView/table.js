/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
// /* eslint-disable no-unused-vars */
import React from "react";
import { AgGridReact as List, AgGridColumn as Field } from "ag-grid-react";
import { EditButton, useListContext, useRefresh, useNotify } from "react-admin";
import Box from "@mui/material/Box";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import { callApi } from "../../dataprovider/miscApis";

export default () => {
  const { data, rowHeight, fields, hasEdit, resource } = useListContext();
  if (!data) return null;

  const notify = useNotify();

  const getWidth = () => {
    const values = {
      xs: 0,
      sm: 580,
      md: 900,
      lg: 1200,
      xl: 1800,
    };
    return values.md;
  };
  const rowsData = data;

  const handleUpdate = async (orderedData) => {
    await callApi(`${resource}-order`, { orderedData })
      .then(() => {})
      .catch((err) => {
        notify(err.message, { type: "warning" });
      });
  };
  const onRowDragEnd = (e) => {
    const d = e.api.rowModel.rowsToDisplay.map((r) => r.data.id);
    handleUpdate(d);
  };

  const EditButtonComp = ({ data: record }) => <EditButton resource={resource} record={record} />;

  return (
    <Box
      className="ag-theme-material"
      sx={{
        height: "calc(100vh - 10em)",
        width: `${getWidth()}px-1em`,
        fontFamily: (theme) => theme.typography.fontFamily,
      }}
    >
      <List
        defaultColDef={{
          initialWidth: 195,
          resizable: true,
        }}
        rowData={rowsData}
        suppressMoveWhenRowDragging={false}
        animateRows
        rowDragManaged
        onRowDragEnd={onRowDragEnd}
        rowHeight={rowHeight}
        autoHeight
        rowSelection="multiple"
      >
        {fields.map(({ source, label, ...fieldProps }) => (
          <Field field={source} headerName={label} key={source} {...fieldProps} />
        ))}
        {hasEdit && <Field headerName="Action" cellRendererFramework={EditButtonComp} />}
      </List>
    </Box>
  );
};
