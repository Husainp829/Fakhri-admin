import { Box, Typography } from "@mui/material";

/**
 * Registered only so `ReferenceManyField` can use `reference="fmbThaliDeliveryToggleLog"`.
 * Data is loaded via the dataProvider; this list is not linked from the menu.
 */
export default function ToggleLogPlaceholderList() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Delivery history is shown on each FMB household under the Delivery tab.
      </Typography>
    </Box>
  );
}
