import { type ChangeEvent, useMemo } from "react";
import type { InputProps } from "react-admin";
import { useInput } from "react-admin";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { alphaOnSurface } from "@/theme/surfaceAlpha";
import {
  contrastRatioWhiteOnHex,
  getStandardHallColorsForTheme,
} from "@/utils/hall-calendar-colors";

const MIN_CONTRAST_HINT = 4.5;

function normalizePickerValue(value: unknown, fallbackHex: string): string {
  if (typeof value !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return fallbackHex;
  }
  return value;
}

/**
 * Hall calendar color: standard names (gray, blue, …) auto-tuned for tenant paper + white labels,
 * plus native color input.
 */
export function HallColorInput(props: InputProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { field, fieldState, isRequired, id } = useInput(props);

  const standardColors = useMemo(() => getStandardHallColorsForTheme(theme), [theme]);
  const pickerFallback = theme.palette.grey[700];

  const current = typeof field.value === "string" ? field.value : null;
  const pickerDisplay = normalizePickerValue(current, pickerFallback);

  return (
    <FormControl fullWidth error={!!fieldState.error} required={isRequired} margin="dense">
      <FormLabel
        required={isRequired}
        error={!!fieldState.error}
        htmlFor={id}
        sx={{
          mb: 0.5,
          display: "block",
          typography: "body2",
          color: fieldState.error ? "error.main" : "text.primary",
        }}
      >
        {props.label}
      </FormLabel>

      <Stack spacing={1.5} sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Standard colors pick a family (red, blue, gray, …); the exact shade is chosen for strong
          contrast with your admin background and readable white text on the hall calendar.
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
          {standardColors.map(({ id, label, hex }) => {
            const selected = current != null && current.toLowerCase() === hex.toLowerCase();
            return (
              <Button
                key={id}
                type="button"
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => field.onChange(hex)}
                title={hex}
                aria-label={`Select ${label} (${hex})`}
                sx={{
                  textTransform: "none",
                  borderWidth: 2,
                  py: 0.5,
                  px: 1,
                  flexShrink: 0,
                  borderColor: selected ? "primary.main" : "divider",
                  color: "text.primary",
                  bgcolor: "background.paper",
                  boxShadow: selected
                    ? `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${alpha(theme.palette.primary.main, isDark ? 0.85 : 0.45)}`
                    : isDark
                      ? `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.06)}`
                      : "none",
                  "&:hover": {
                    borderColor: selected ? "primary.main" : alphaOnSurface(theme, 0.45, 0.2),
                    bgcolor: "action.hover",
                  },
                }}
                startIcon={
                  <Box
                    aria-hidden
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: 0.75,
                      bgcolor: hex,
                      border: "1px solid",
                      borderColor: alphaOnSurface(theme, 0.35, 0.14),
                      flexShrink: 0,
                    }}
                  />
                }
              >
                {label}
              </Button>
            );
          })}
        </Stack>

        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" useFlexGap>
          <Typography variant="body2" color="text.secondary" component="span">
            Custom
          </Typography>
          <Box
            component="input"
            id={id}
            type="color"
            value={pickerDisplay}
            onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
            sx={{
              width: 52,
              height: 40,
              padding: 0,
              border: "1px solid",
              borderColor: isDark ? alphaOnSurface(theme, 0.28, 0.12) : "divider",
              borderRadius: 1,
              cursor: "pointer",
              bgcolor: "background.paper",
              boxShadow: isDark
                ? `0 0 0 1px ${alpha(theme.palette.common.black, 0.4)} inset`
                : "none",
              "&::-webkit-color-swatch-wrapper": { p: 0.5 },
              "&::-webkit-color-swatch": { borderRadius: 0.5, border: "none" },
            }}
          />
          {current != null && (
            <Typography variant="body2" color="text.secondary" fontFamily="monospace">
              {current}
            </Typography>
          )}
        </Stack>
        {current != null && contrastRatioWhiteOnHex(current) < MIN_CONTRAST_HINT && (
          <Typography variant="caption" color="warning.main">
            This color is quite light; white calendar labels may be hard to read. Choose a darker
            tone if possible.
          </Typography>
        )}
      </Stack>

      {(props.helperText || fieldState.error?.message) && (
        <FormHelperText error={!!fieldState.error}>
          {fieldState.error?.message ?? props.helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}
