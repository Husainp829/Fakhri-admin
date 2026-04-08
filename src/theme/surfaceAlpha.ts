import { alpha, type Theme } from "@mui/material/styles";

/** White/black overlays on shells (chips, calendar chrome) without raw #fff / #000. */
export function alphaOnSurface(theme: Theme, lightOpacity: number, darkOpacity: number) {
  return theme.palette.mode === "dark"
    ? alpha(theme.palette.common.white, lightOpacity)
    : alpha(theme.palette.common.black, darkOpacity);
}
