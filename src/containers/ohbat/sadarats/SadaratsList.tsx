import { Datagrid, List, TextField, EditButton, SimpleList } from "react-admin";
import type { RaRecord } from "react-admin";
import type { SxProps } from "@mui/material";
import { Box, Typography, useMediaQuery } from "@mui/material";

const listRowSx = (): SxProps => ({
  borderBottom: 1,
  borderBottomColor: "divider",
});

export default function SadaratsList() {
  const isNarrow = useMediaQuery((theme) => theme.breakpoints.down("md"), { noSsr: true });

  return (
    <List sort={{ field: "name", order: "ASC" }} perPage={25}>
      {isNarrow ? (
        <SimpleList
          rowClick="edit"
          primaryText={(r: RaRecord) => (
            <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>
              {(r.name as string) || "—"}
            </Typography>
          )}
          secondaryText={(r: RaRecord) =>
            [r.itsNo != null && r.itsNo !== "" ? `ITS ${String(r.itsNo)}` : null, r.mobile]
              .filter(Boolean)
              .join(" · ") || "—"
          }
          rowSx={(_record, _index) => listRowSx()}
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
}
