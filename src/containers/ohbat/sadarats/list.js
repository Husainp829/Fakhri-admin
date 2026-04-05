import React from "react";
import { Datagrid, List, TextField, EditButton, SimpleList } from "react-admin";
import { Box, Typography, useMediaQuery } from "@mui/material";

const listRowSx = () => ({
  borderBottom: "1px solid #e0e0e0",
});

const SadaratList = () => {
  const isNarrow = useMediaQuery((theme) => theme.breakpoints.down("md"), { noSsr: true });

  return (
    <List sort={{ field: "name", order: "ASC" }} perPage={25}>
      {isNarrow ? (
        <SimpleList
          rowClick="edit"
          primaryText={(r) => (
            <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>
              {r.name || "—"}
            </Typography>
          )}
          secondaryText={(r) =>
            [r.itsNo != null && r.itsNo !== "" ? `ITS ${r.itsNo}` : null, r.mobile]
              .filter(Boolean)
              .join(" · ") || "—"
          }
          rowSx={listRowSx}
        />
      ) : (
        <Box sx={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <Datagrid rowClick="edit" bulkActionButtons={false} sx={{ minWidth: 480 }}>
            <TextField source="itsNo" label="ITS" />
            <TextField source="name" />
            <TextField source="mobile" />
            <EditButton />
          </Datagrid>
        </Box>
      )}
    </List>
  );
};

export default SadaratList;
