import React from "react";
import {
  CreateButton,
  Datagrid,
  DateInput,
  FunctionField,
  List,
  Pagination,
  TextField,
  TextInput,
  TopToolbar,
  FilterButton,
  useRecordContext,
  type ListProps,
  type RaRecord,
} from "react-admin";
import { formatListDate } from "@/utils/date-format";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type DailyMenuDishLine = {
  sortOrder: number;
  dishId: string;
  dish?: {
    id: string;
    name: string;
    dietaryType: string;
  } | null;
};

function FmbDailyMenuDishesExpandPanel() {
  const record = useRecordContext<{ dishes?: DailyMenuDishLine[] }>();
  const lines = [...(record?.dishes ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  if (lines.length === 0) {
    return (
      <Box sx={{ py: 2, px: 2, bgcolor: "action.hover" }}>
        <Typography variant="body2" color="text.secondary">
          No dishes on this menu.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, px: 2, bgcolor: "action.hover" }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Dishes ({lines.length})
      </Typography>
      <Stack spacing={1}>
        {lines.map((line, index) => (
          <Stack
            key={`${line.dishId}-${line.sortOrder}`}
            direction="row"
            spacing={1}
            alignItems="baseline"
          >
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: "1.75em" }}>
              {index + 1}.
            </Typography>
            <Typography variant="body2" component="span">
              {line.dish?.name ?? line.dishId}
            </Typography>
            <Typography variant="caption" color="text.secondary" component="span">
              {line.dish?.dietaryType ?? "—"}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

const filters = [
  <TextInput key="q" source="q" label="Search notes" alwaysOn sx={{ minWidth: 220 }} />,
  <DateInput key="from" source="from" label="From" />,
  <DateInput key="to" source="to" label="To" />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
  </TopToolbar>
);

export default function FmbDailyMenuList(props: ListProps) {
  return (
    <List
      {...props}
      title="Daily menus"
      perPage={50}
      sort={{ field: "serviceDate", order: "DESC" }}
      filters={filters}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      actions={<ListActions />}
    >
      <Datagrid
        bulkActionButtons={false}
        rowClick="edit"
        expand={<FmbDailyMenuDishesExpandPanel />}
      >
        <FunctionField
          label="Service date"
          sortBy="serviceDate"
          render={(record: RaRecord) => formatListDate(record?.serviceDate, { empty: "—" })}
        />
        <FunctionField
          label="Dishes"
          sortable={false}
          render={(record: { dishIds?: string[] }) => record.dishIds?.length ?? 0}
        />
        <TextField source="notes" emptyText="—" />
      </Datagrid>
    </List>
  );
}
