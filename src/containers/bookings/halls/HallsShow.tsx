import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FunctionField, Show, SimpleShowLayout, TextField, type ShowProps } from "react-admin";
import { alphaOnSurface } from "@/theme/surfaceAlpha";

export const HallsShow = (props: ShowProps) => (
  <Show {...props}>
    <SimpleShowLayout>
      <FunctionField
        label="Calendar color"
        render={(record: { color?: string | null }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Box
              component="span"
              sx={(t) => ({
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: record?.color || "action.disabledBackground",
                border: "1px solid",
                borderColor:
                  t.palette.mode === "dark" ? alphaOnSurface(t, 0.28, 0.12) : t.palette.divider,
                boxShadow:
                  t.palette.mode === "dark"
                    ? `inset 0 0 0 1px ${alpha(t.palette.common.white, 0.06)}`
                    : "none",
              })}
            />
            <span>{record?.color ?? "Auto (short-code map)"}</span>
          </Box>
        )}
      />
      <TextField source="name" label="Name" />
      <TextField source="shortCode" label="Short code" />
      <TextField source="thaalCapacity" label="Thaal capacity" />
    </SimpleShowLayout>
  </Show>
);

export default HallsShow;
