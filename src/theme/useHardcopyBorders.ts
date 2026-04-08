import { useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

/**
 * Inline `style={{ border… }}` helpers for receipt print routes (no `sx` on plain divs).
 */
export function useHardcopyBorders() {
  const theme = useTheme();
  const d = theme.palette.divider;
  const soft = alpha(theme.palette.text.primary, 0.14);
  return {
    solid1: `1px solid ${d}`,
    solid1Soft: `1px solid ${soft}`,
    solid5: `5px solid ${d}`,
  };
}
