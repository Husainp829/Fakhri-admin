import React from "react";
import { Tabs, Tab, Box, Divider } from "@mui/material";

/**
 * CommonTabs - A reusable tabs component
 * @param {Object} props
 * @param {Array} props.options - Array of tab options. Each option should have {id, name} or {value, label}
 * @param {string|number} props.value - Current selected tab value
 * @param {Function} props.onChange - Callback when tab changes: (event, newValue) => void
 * @param {boolean} props.showDivider - Whether to show divider below tabs (default: false)
 * @param {Object} props.sx - Additional sx styles for the Tabs component
 * @param {Object} props.tabSx - Additional sx styles for individual Tab components
 */
const CommonTabs = ({
  options = [],
  value,
  onChange,
  showDivider = false,
  sx = {},
  tabSx = {},
}) => (
    <>
      <Box sx={{ mb: showDivider ? 0 : 3 }}>
        <Tabs
          value={value}
          onChange={onChange}
          sx={{ borderBottom: 1, borderColor: "divider", ...sx }}
        >
          {options.map((option, index) => {
            const tabValue = option.id || option.value || index;
            const label = option.name || option.label || option.id || option.value;
            return (
              <Tab
                key={tabValue}
                label={label}
                value={tabValue}
                sx={{ fontWeight: "bold", fontSize: "1rem", ...tabSx }}
              />
            );
          })}
        </Tabs>
      </Box>
      {showDivider && <Divider />}
    </>
  );

export default CommonTabs;
