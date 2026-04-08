import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { alphaOnSurface } from "@/theme/surfaceAlpha";
import { Datagrid, FunctionField, List, TextField } from "react-admin";

export const HallsList = () => (
  <List sort={{ field: "name", order: "DESC" }}>
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <FunctionField
        label="Color"
        sortable={false}
        render={(record: { color?: string }) => (
          <Box
            component="span"
            sx={(t) => ({
              display: "inline-block",
              width: 24,
              height: 24,
              borderRadius: 0.5,
              bgcolor: record?.color || "action.disabledBackground",
              border: "1px solid",
              borderColor:
                t.palette.mode === "dark" ? alphaOnSurface(t, 0.28, 0.12) : t.palette.divider,
              boxShadow:
                t.palette.mode === "dark"
                  ? `inset 0 0 0 1px ${alpha(t.palette.common.white, 0.06)}`
                  : "none",
              verticalAlign: "middle",
            })}
            title={record?.color}
          />
        )}
      />
      <TextField source="name" label="Name" />
      <TextField source="shortCode" label="ShortCode" />
    </Datagrid>
  </List>
);

export default HallsList;
