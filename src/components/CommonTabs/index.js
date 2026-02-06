import React from "react";
import { Tabs, Tab, Box, Divider, useMediaQuery } from "@mui/material";

/**
 * CommonTabs - Responsive tabs (scrollable on small screens, no scroll buttons).
 * @param {Array} options - { id/value, name/label, shortLabel? }
 * @param {string|number} value - Selected tab
 * @param {Function} onChange - (event, newValue) => void
 * @param {boolean} showDivider - Divider below tabs
 * @param {Object} sx - Tabs sx
 * @param {Object} tabSx - Tab sx
 */
const CommonTabs = ({
  options = [],
  value,
  onChange,
  showDivider = false,
  sx = {},
  tabSx = {},
}) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });

  const boxSx = {
    mb: showDivider ? 0 : 3,
    width: "100%",
    maxWidth: isSmall ? "100vw" : "100%",
    minWidth: 0,
    overflow: "hidden",
  };

  const tabsSx = {
    borderBottom: 1,
    borderColor: "divider",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    "& .MuiTabs-scroller": { maxWidth: "100%", minWidth: 0 },
    "& .MuiTabs-flexContainer": { flexWrap: "nowrap" },
    ...(isSmall && { minHeight: 48 }),
    ...sx,
  };

  const mergedTabSx = {
    fontWeight: "bold",
    fontSize: isSmall ? "0.875rem" : "1rem",
    ...(isSmall ? { minHeight: 48, px: 1.5 } : { px: 2 }),
    ...tabSx,
  };

  return (
    <>
      <Box sx={boxSx}>
        <Tabs
          value={value}
          onChange={onChange}
          variant={isSmall ? "scrollable" : "standard"}
          scrollButtons={false}
          sx={tabsSx}
        >
          {options.map((option, index) => {
            const tabValue = option.id ?? option.value ?? index;
            const label = option.name ?? option.label ?? option.id ?? option.value;
            return (
              <Tab
                key={tabValue}
                label={isSmall ? option.shortLabel ?? label : label}
                value={tabValue}
                sx={mergedTabSx}
              />
            );
          })}
        </Tabs>
      </Box>
      {showDivider && <Divider />}
    </>
  );
};

export default CommonTabs;
