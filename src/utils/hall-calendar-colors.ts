import type { Theme } from "@mui/material/styles";

/** WCAG contrast of white text on `hex` background (simplified for sRGB hex). */
export function contrastRatioWhiteOnHex(hex: string): number {
  const rgb = parseHexRgb(hex);
  if (!rgb) return 0;
  const L = relativeLuminance(rgb[0], rgb[1], rgb[2]);
  return (1 + 0.05) / (L + 0.05);
}

function parseHexRgb(hex: string): [number, number, number] | null {
  let h = hex.trim();
  if (!h.startsWith("#")) return null;
  h = h.slice(1);
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 || !/^[0-9a-fA-F]+$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = [r, g, b].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

function contrastRatioBetweenHex(a: string, b: string): number {
  const A = parseHexRgb(a);
  const B = parseHexRgb(b);
  if (!A || !B) return 0;
  const La = relativeLuminance(A[0], A[1], A[2]);
  const Lb = relativeLuminance(B[0], B[1], B[2]);
  const lighter = Math.max(La, Lb);
  const darker = Math.min(La, Lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function hexFromHsl(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function tryParseColorToRgb(value: string): [number, number, number] | null {
  const v = value.trim();
  if (v.startsWith("#")) return parseHexRgb(v);
  const rgb = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];
  return null;
}

function paperRgb(theme: Theme): [number, number, number] {
  const paper = theme.palette.background.paper;
  if (typeof paper === "string") {
    const rgb = tryParseColorToRgb(paper);
    if (rgb) return rgb;
  }
  return theme.palette.mode === "dark" ? [18, 18, 18] : [255, 255, 255];
}

function paperHex(theme: Theme): string {
  const [r, g, b] = paperRgb(theme);
  return rgbToHex(r, g, b);
}

/** Minimum contrast for white caption text on calendar event chips (WCAG AA body text). */
const MIN_CONTRAST_WITH_WHITE = 4.5;

const MIN_CONTRAST_WITH_PAPER_DARK = 1.35;
const MIN_CONTRAST_WITH_PAPER_LIGHT = 1.22;

const SATURATION_STEPS = [72, 64, 56, 48, 40] as const;

/**
 * Lightest HSL lightness (%) that still meets white-text contrast for this hue/saturation
 * (higher = more separation from dark `paper` while staying accessible).
 */
function maxLightnessForWhiteText(h: number, s: number): number {
  let lo = 16;
  let hi = 48;
  let best = lo;
  while (hi - lo > 0.35) {
    const mid = (lo + hi) / 2;
    const hex = hexFromHsl(h, s, mid);
    if (contrastRatioWhiteOnHex(hex) >= MIN_CONTRAST_WITH_WHITE) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

function minPaperContrast(theme: Theme): number {
  return theme.palette.mode === "dark"
    ? MIN_CONTRAST_WITH_PAPER_DARK
    : MIN_CONTRAST_WITH_PAPER_LIGHT;
}

function meetsPaper(hex: string, theme: Theme): boolean {
  return contrastRatioBetweenHex(hex, paperHex(theme)) >= minPaperContrast(theme);
}

/**
 * Chromatic standard (red, blue, …): pick saturation/lightness so white calendar text passes WCAG
 * and the swatch separates from the tenant `background.paper`.
 */
function tuneChromaticForTenant(theme: Theme, hue: number): string {
  for (const s of SATURATION_STEPS) {
    let L = maxLightnessForWhiteText(hue, s);
    let hex = hexFromHsl(hue, s, L);

    if (meetsPaper(hex, theme) && contrastRatioWhiteOnHex(hex) >= MIN_CONTRAST_WITH_WHITE) {
      return hex;
    }

    while (L >= 15 && contrastRatioWhiteOnHex(hex) >= MIN_CONTRAST_WITH_WHITE) {
      if (meetsPaper(hex, theme)) return hex;
      L -= 1.5;
      hex = hexFromHsl(hue, s, L);
    }
  }

  const fallback = hexFromHsl(hue, 70, 20);
  if (contrastRatioWhiteOnHex(fallback) >= MIN_CONTRAST_WITH_WHITE) return fallback;
  return hexFromHsl(hue, 70, 16);
}

/** Neutral gray aligned with tenant grey scale, still readable vs paper and with white labels. */
function tuneGrayForTenant(theme: Theme): string {
  const g = theme.palette.grey;
  const candidates: string[] = [];
  for (const shade of [900, 800, 700, 600, 500] as const) {
    const v = g[String(shade) as keyof typeof g];
    if (typeof v === "string") {
      const rgb = tryParseColorToRgb(v);
      if (rgb) candidates.push(rgbToHex(rgb[0], rgb[1], rgb[2]));
    }
  }

  for (const hex of candidates) {
    if (contrastRatioWhiteOnHex(hex) >= MIN_CONTRAST_WITH_WHITE && meetsPaper(hex, theme)) {
      return hex;
    }
  }

  for (let L = 42; L >= 14; L -= 1) {
    const hex = hexFromHsl(0, 0, L);
    if (contrastRatioWhiteOnHex(hex) >= MIN_CONTRAST_WITH_WHITE && meetsPaper(hex, theme)) {
      return hex;
    }
  }

  return theme.palette.mode === "dark" ? "#1E1E1E" : "#424242";
}

/** Named presets shown in {@link HallColorInput}; `hue` omitted only for gray. */
export const HALL_COLOR_STANDARD_PRESETS = [
  { id: "gray", label: "Gray" },
  { id: "red", label: "Red", hue: 358 },
  { id: "orange", label: "Orange", hue: 28 },
  { id: "yellow", label: "Yellow", hue: 52 },
  { id: "green", label: "Green", hue: 138 },
  { id: "teal", label: "Teal", hue: 174 },
  { id: "cyan", label: "Cyan", hue: 195 },
  { id: "blue", label: "Blue", hue: 218 },
  { id: "indigo", label: "Indigo", hue: 246 },
  { id: "purple", label: "Purple", hue: 278 },
  { id: "pink", label: "Pink", hue: 322 },
] as const;

export type HallColorStandardPresetId = (typeof HALL_COLOR_STANDARD_PRESETS)[number]["id"];

export type StandardHallColorRow = {
  id: HallColorStandardPresetId;
  label: string;
  hex: string;
};

/** Resolved hex for each standard name for the current tenant theme (paper + white-text rules). */
export function getStandardHallColorsForTheme(theme: Theme): StandardHallColorRow[] {
  return HALL_COLOR_STANDARD_PRESETS.map((p) => {
    if (p.id === "gray") {
      return { id: p.id, label: p.label, hex: tuneGrayForTenant(theme) };
    }
    return { id: p.id, label: p.label, hex: tuneChromaticForTenant(theme, p.hue) };
  });
}

/** Single preset (e.g. after storing only an id — today we store hex from the row above). */
export function getTenantAdjustedStandardHallColor(
  theme: Theme,
  presetId: HallColorStandardPresetId
): string {
  const row = getStandardHallColorsForTheme(theme).find((r) => r.id === presetId);
  return row?.hex ?? tuneGrayForTenant(theme);
}
