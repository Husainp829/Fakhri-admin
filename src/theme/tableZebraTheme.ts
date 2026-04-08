import { alpha, type Theme, type ThemeOptions } from "@mui/material/styles";

/**
 * Alternating row backgrounds for MUI `<Table>` / React Admin datagrids.
 * Uses neutral grey from the theme (no hardcoded slate hex).
 */
const zebraEvenBg = (theme: Theme) =>
  theme.palette.mode === "dark"
    ? alpha(theme.palette.grey[400], 0.14)
    : alpha(theme.palette.grey[600], 0.075);

/** Slightly stronger tint on hover so it beats the even-row stripe. */
const rowHoverBg = (theme: Theme) =>
  theme.palette.mode === "dark"
    ? alpha(theme.palette.grey[300], 0.1)
    : alpha(theme.palette.grey[600], 0.12);

export const tableZebraThemeFragment: ThemeOptions = {
  components: {
    MuiTableBody: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiTableRow-root:nth-of-type(even)": {
            backgroundColor: zebraEvenBg(theme),
          },
          "& .MuiTableRow-root:hover": {
            backgroundColor: rowHoverBg(theme),
          },
        }),
      },
    },
  },
};
