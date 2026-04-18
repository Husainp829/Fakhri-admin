import { useMemo } from "react";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import {
  Datagrid,
  FilterButton,
  FunctionField,
  List,
  TextField,
  TextInput,
  TopToolbar,
  useInput,
  useListContext,
  type InputProps,
  type ListProps,
} from "react-admin";

type FmbDistributionDashboardMeta = {
  isTenantHoliday?: boolean;
  holidayName?: string | null;
  dashboardDate?: string;
  timezone?: string;
};

function FmbHolidayDayBanner() {
  const { meta, isLoading } = useListContext();
  if (isLoading) {
    return null;
  }
  const m = meta as FmbDistributionDashboardMeta | undefined;
  if (!m?.isTenantHoliday) {
    return null;
  }
  const label = m.holidayName?.trim();
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      {label
        ? `This date is marked as an FMB holiday (${label}). Rosters show no thalis for delivery.`
        : "This date is marked as an FMB holiday. Rosters show no thalis for delivery."}
    </Alert>
  );
}

/** e.g. Mon, 09 Apr 26 */
const SERVICE_DATE_DISPLAY_FORMAT = "ddd, DD MMM YY";

function ServiceDateFilter(props: InputProps) {
  const { field, fieldState, isRequired } = useInput(props);
  const { value: rawValue, onChange, onBlur, name, ref } = field;

  let value: Dayjs | null = null;
  if (rawValue != null && rawValue !== "") {
    const parsed = rawValue instanceof Date ? dayjs(rawValue) : dayjs(String(rawValue));
    if (parsed.isValid()) {
      value = parsed.startOf("day");
    }
  }

  const handleChange = (newValue: Dayjs | null) => {
    if (newValue == null || !newValue.isValid()) {
      onChange("");
      return;
    }
    onChange(newValue.format("YYYY-MM-DD"));
  };

  const baseDay = value ?? dayjs().startOf("day");

  const shiftByDays = (delta: number) => {
    const next = baseDay.add(delta, "day");
    if (next.isValid()) {
      onChange(next.format("YYYY-MM-DD"));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "nowrap" }}>
        <IconButton
          type="button"
          size="small"
          color="inherit"
          onClick={() => shiftByDays(-1)}
          aria-label="Previous day"
        >
          <ChevronLeft fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: 280 }}>
          <DatePicker
            label={props.label ?? "Service date"}
            format={SERVICE_DATE_DISPLAY_FORMAT}
            value={value}
            onChange={handleChange}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                name,
                inputRef: ref,
                onBlur,
                error: !!fieldState?.error,
                helperText: fieldState?.error?.message,
                required: isRequired,
              },
            }}
          />
        </Box>
        <IconButton
          type="button"
          size="small"
          color="inherit"
          onClick={() => shiftByDays(1)}
          aria-label="Next day"
        >
          <ChevronRight fontSize="small" />
        </IconButton>
      </Box>
    </LocalizationProvider>
  );
}

const filters = [
  <ServiceDateFilter key="date" source="date" label="Service date" alwaysOn />,
  <TextInput
    key="q"
    source="q"
    label="Search distributor or roster"
    alwaysOn
    sx={{ minWidth: 260 }}
  />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
  </TopToolbar>
);

type DashboardRow = {
  total?: number;
  thaliTypeCounts?: Array<{ name?: string; count?: number }>;
};

function RosterBreakdownField() {
  return (
    <FunctionField<DashboardRow>
      label="Roster (thalis)"
      sortable={false}
      render={(record) => {
        const total = typeof record.total === "number" ? record.total : 0;
        const raw = record.thaliTypeCounts;
        const breakdown = Array.isArray(raw)
          ? raw.filter(
              (x): x is { name: string; count: number } =>
                x != null &&
                typeof x === "object" &&
                typeof x.name === "string" &&
                typeof x.count === "number"
            )
          : [];
        const parts = breakdown.map((x) => `${x.name}: ${x.count}`);
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 0.5 }}>
            {parts.length > 0 ? (
              <Typography variant="body2" color="text.secondary" component="span">
                {parts.join(" · ")}
              </Typography>
            ) : null}
            <Typography variant="body2" component="span" fontWeight={600}>
              Total: {total}
            </Typography>
          </Box>
        );
      }}
    />
  );
}

export default function FmbThaliDistributionDailyRunList(props: ListProps) {
  const filterDefaultValues = useMemo(() => ({ date: new Date().toISOString().slice(0, 10) }), []);

  return (
    <List
      {...props}
      title="Daily thali roster"
      perPage={50}
      filterDefaultValues={filterDefaultValues}
      filters={filters}
      actions={<ListActions />}
      sort={{ field: "code", order: "ASC" }}
      exporter={false}
      pagination={false}
    >
      <FmbHolidayDayBanner />
      <Datagrid bulkActionButtons={false}>
        <TextField source="code" label="Distributor code" />
        <TextField source="name" label="Distributor" />
        <RosterBreakdownField />
      </Datagrid>
    </List>
  );
}
