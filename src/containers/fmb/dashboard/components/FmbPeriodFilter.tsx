import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

export type FmbDashboardPeriod = {
  hijriYearStart: number;
  hijriYearEnd: number;
  label: string;
};

type FmbPeriodFilterProps = {
  periods: FmbDashboardPeriod[];
  value: number | null | undefined;
  onChange: (hijriYearStart: number) => void;
};

export default function FmbPeriodFilter({ periods, value, onChange }: FmbPeriodFilterProps) {
  const handleChange = (e: SelectChangeEvent<string>) => {
    onChange(Number.parseInt(e.target.value, 10));
  };

  return (
    <Card elevation={1} sx={{ mb: 2 }}>
      <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          FMB period (Hijri)
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="fmb-dashboard-period-label">Period</InputLabel>
          <Select
            labelId="fmb-dashboard-period-label"
            label="Period"
            value={value != null ? String(value) : ""}
            onChange={handleChange}
            disabled={!periods?.length}
          >
            {periods?.map((p) => (
              <MenuItem key={p.hijriYearStart} value={String(p.hijriYearStart)}>
                {p.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );
}
