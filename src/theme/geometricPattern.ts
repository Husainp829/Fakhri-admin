/**
 * Dense lattice of six-pointed stars (hexagrams) on a honeycomb grid.
 * Stroke colours derive from the merged app theme (no local hex literals).
 */

import { alpha, createTheme } from "@mui/material/styles";
import { getBrandedThemeOptions } from "@/theme/brandedThemeOptions";

const patternPalette = createTheme(getBrandedThemeOptions().light).palette;
const tealDark = patternPalette.primary.dark;
const sandPaper = patternPalette.grey[100];
const darkPrimaryLight = patternPalette.primary.light;

const patternStrokeOnLightShell = alpha(tealDark, 0.7);
const patternStrokeOnDarkShell = alpha(darkPrimaryLight, 0.55);
const patternStrokeOnAppBarLight = alpha(sandPaper, 0.24);
const patternStrokeOnAppBarDark = alpha(darkPrimaryLight, 0.32);

/** One hexagram (two triangles), centered at origin, line art only. R = outer vertex radius. */
function hexagramPath(R: number): string {
  const r = R * 0.8660254; // R*sin(60°) = horizontal offset for equilateral triangle
  const h = R * 0.5;
  // Triangle A (point-up apex)
  const a0 = `0 ${-R}`;
  const a1 = `${r} ${h}`;
  const a2 = `${-r} ${h}`;
  // Triangle B (point-down)
  const b0 = `${r} ${-h}`;
  const b1 = `${-r} ${-h}`;
  const b2 = `0 ${R}`;
  return `M ${a0} L ${a1} L ${a2} Z M ${b0} L ${b1} L ${b2} Z`;
}

/**
 * Honeycomb: neighbor distance L; row step = (√3/2)×L.
 * Tile is **2× horizontal periods** so we never center a star on x=0 / x=W (avoids tile clipping when
 * used as a CSS data-URI background — `overflow: visible` on `<pattern>` is not reliable there).
 */
const L = 22;
const rowH = L * 0.8660254;

/** Vertical inset so y₁ − starR and y₂ + starR stay inside the tile. */
const TILE_YPAD = 2;

function buildPattern(stroke: string, id: string): string {
  const starR = 9;
  const hp = hexagramPath(starR);

  const yTop = rowH / 2 + TILE_YPAD;
  const yBot = rowH * 1.5 + TILE_YPAD;

  const positions: { x: number; y: number }[] = [
    { x: L / 2, y: yTop },
    { x: L / 2 + L, y: yTop },
    { x: L / 2 + 2 * L, y: yTop },
    { x: L / 2 + 3 * L, y: yTop },
    { x: L, y: yBot },
    { x: 2 * L, y: yBot },
    { x: 3 * L, y: yBot },
  ];

  const stars = positions
    .map(
      ({ x, y }) =>
        `<g transform="translate(${x.toFixed(2)},${y.toFixed(2)})"><path d="${hp}" /></g>`
    )
    .join("");

  const W = 4 * L;
  const H = 2 * rowH + 2 * TILE_YPAD;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="${id}" width="${W}" height="${H}" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
      <g fill="none" stroke="${stroke}" stroke-width="1" opacity="0.14" stroke-linejoin="round" stroke-linecap="round">
        ${stars}
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#${id})"/>
</svg>`;
}

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const geometricPatternLight = svgToDataUri(
  buildPattern(patternStrokeOnLightShell, "fakhriHex")
);
export const geometricPatternDark = svgToDataUri(
  buildPattern(patternStrokeOnDarkShell, "fakhriHexD")
);

export const geometricPatternAppBarLight = svgToDataUri(
  buildPattern(patternStrokeOnAppBarLight, "fakhriHexAppL")
);
export const geometricPatternAppBarDark = svgToDataUri(
  buildPattern(patternStrokeOnAppBarDark, "fakhriHexAppD")
);

/** Tile size in CSS px — matches SVG outer dimensions for crisp repeat. */
export const geometricPatternTileCss = `${4 * L}px ${(2 * rowH + 2 * TILE_YPAD).toFixed(1)}px`;
