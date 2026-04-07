import { alpha, type Theme, type ThemeOptions } from "@mui/material/styles";

/** Cool slate stripes — tuned for blue-grey / slate papers, not warm cream. */
const COOL_SLATE = "#64748b";
const COOL_SLATE_LIGHT = "#94a3b8";

/**
 * Alternating row backgrounds for MUI `<Table>` / React Admin datagrids.
 * Uses **cool slate** tints only (no primary / warm grey) so rows read cleanly on cool paper.
 */
const zebraEvenBg = (theme: Theme) =>
  theme.palette.mode === "dark" ? alpha(COOL_SLATE_LIGHT, 0.14) : alpha(COOL_SLATE, 0.075);

/** Slightly stronger cool tint on hover so it beats the even-row stripe. */
const rowHoverBg = (theme: Theme) =>
  theme.palette.mode === "dark" ? alpha("#e2e8f0", 0.1) : alpha(COOL_SLATE, 0.12);

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
