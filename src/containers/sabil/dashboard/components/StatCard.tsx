import type { SvgIconComponent } from "@mui/icons-material";
import { Card, CardContent, Typography, Box } from "@mui/material";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: SvgIconComponent;
  color?: "primary" | "success" | "error" | "warning" | "secondary";
  subtitle?: string;
  onClick?: () => void;
  /** Default: currency (₹). Use "count" for integers like number of sabils. */
  valueType?: "currency" | "count";
};

function formatStatValue(value: number | string, valueType: "currency" | "count"): string {
  if (typeof value === "string") {
    return value;
  }
  if (valueType === "count") {
    return value.toLocaleString("en-IN");
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "primary",
  subtitle,
  onClick,
  valueType = "currency",
}: StatCardProps) => (
  <Card
    elevation={2}
    onClick={onClick}
    sx={{
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease-in-out",
      "&:hover": onClick
        ? {
            elevation: 4,
            transform: "translateY(-2px)",
          }
        : {},
    }}
  >
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mt: 1,
              fontWeight: 700,
              color: `${color}.main`,
            }}
          >
            {formatStatValue(value, valueType)}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: "50%",
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ fontSize: 32, color: "white" }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
