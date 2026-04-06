import React from "react";
import { Tabs, Tab, Box, Divider } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export type CommonTabOption = {
  id?: string | number;
  value?: string | number;
  name?: string;
  label?: string;
};

export type CommonTabsProps = {
  options?: CommonTabOption[];
  value: string | number;
  onChange: (event: React.SyntheticEvent, newValue: string | number) => void;
  showDivider?: boolean;
  sx?: SxProps<Theme>;
  tabSx?: SxProps<Theme>;
};

const CommonTabs = ({
  options = [],
  value,
  onChange,
  showDivider = false,
  sx = {},
  tabSx = {},
}: CommonTabsProps) => (
  <>
    <Box sx={{ mb: showDivider ? 0 : 3 }}>
      <Tabs
        value={value}
        onChange={onChange}
        sx={{ borderBottom: 1, borderColor: "divider", ...sx }}
      >
        {options.map((option, index) => {
          const tabValue = option.id ?? option.value ?? index;
          const label = option.name ?? option.label ?? option.id ?? option.value ?? index;
          return (
            <Tab
              key={String(tabValue)}
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
