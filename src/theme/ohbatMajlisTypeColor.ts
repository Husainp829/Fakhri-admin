import type { Theme } from "@mui/material/styles";

export function ohbatMajlisTypeBackground(type: string | undefined, theme: Theme): string {
  const t = String(type ?? "");
  const p = theme.palette;
  if (t === "Jaman") return p.success.dark;
  if (t === "Food_packets") return p.primary.dark;
  if (t === "Salawaat") return p.warning.dark;
  return p.grey[700];
}
