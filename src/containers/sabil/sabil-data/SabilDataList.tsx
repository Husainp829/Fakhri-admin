import { useEffect, useState } from "react";
import type { ListProps, RaRecord } from "react-admin";
import {
  DatagridConfigurable,
  List,
  useListContext,
  TextInput,
  TextField,
  useUnselectAll,
  TopToolbar,
  FilterButton,
  CreateButton,
  ExportButton,
  SelectColumnsButton,
  Pagination,
  FunctionField,
  DateField,
  SelectInput,
  NumberInput,
} from "react-admin";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

type SabilTypeTab = { id: string; name: string };

const GRADE_FILTER_CHOICES = (
  [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
  ] as const
).map((g) => ({ id: g, name: g }));

const getTabIdFromFilters = (filters: Record<string, unknown>, statuses: SabilTypeTab[]) => {
  const t = statuses.findIndex((s) => s.id === filters?.sabilType);
  if (t !== -1) {
    return t;
  }
  return 1;
};

function TabbedDatagrid() {
  const listContext = useListContext();
  const { filterValues, setFilters, resource } = listContext;
  const raw = localStorage.getItem(`${resource}_count`);
  const initValues = (raw ? JSON.parse(raw) : []) as { sabilType: string; count: number }[];
  const sabilTypeList: SabilTypeTab[] = initValues.map((i) => ({
    id: i.sabilType,
    name: `${i.sabilType} (${i.count})`,
  }));

  const [tabValue, setTabValue] = useState(getTabIdFromFilters(filterValues, sabilTypeList));
  const getFilterValues = (tabId: number) => {
    const valueObj = sabilTypeList?.[tabId] || { id: "CHULA", name: "Chula" };
    return {
      sabilType: valueObj.id,
    };
  };

  const handleChange = (_event: React.SyntheticEvent, value: number) => {
    const newFilterValues = getFilterValues(value);
    setFilters({ ...filterValues, ...newFilterValues });
  };

  useEffect(() => {
    const t = getTabIdFromFilters(filterValues, sabilTypeList);
    setTabValue(t);
  }, [filterValues, sabilTypeList]);

  const fields = [
    <TextField source="sabilNo" label="Sabil No." key="sabilNo" />,
    <TextField source="sabilType" label="Type" key="sabilType" />,
    <TextField source="itsNo" label="ITS" key="itsNo" />,
    <FunctionField
      label="Name"
      render={(record: RaRecord) => record.itsdata?.Full_Name || record.name}
      key="name"
    />,
    <TextField
      source="sabilTakhmeenCurrent.takhmeenAmount"
      label="Takhmeen"
      sortBy="sabilTakhmeenCurrent.takhmeenAmount"
      key="takhmeenAmount"
    />,
    <TextField
      source="currentTakhmeenGrade"
      label="Grade"
      sortBy="currentTakhmeenGrade"
      emptyText="—"
      key="currentTakhmeenGrade"
    />,
    <TextField source="mohallah" label="Mohallah" key="itsdata" />,
    <DateField source="lastPaidDate" key="lastPaidDate" label="Last Paid Date" />,
  ];

  const PostBulkActionButtons = () => <div style={{ marginLeft: "25px" }} />;

  const DataGrid = () => (
    <DatagridConfigurable
      size="small"
      sx={{
        color: "success.main",
      }}
      bulkActionButtons={<PostBulkActionButtons />}
      rowClick="show"
    >
      {[...fields]}
    </DatagridConfigurable>
  );

  return (
    <>
      <Tabs value={tabValue} indicatorColor="primary" onChange={handleChange}>
        {sabilTypeList?.map((choice, i) => (
          <Tab key={i} label={choice.name} value={i} />
        ))}
      </Tabs>
      <Divider />
      <div>
        <DataGrid />
      </div>
    </>
  );
}

const getFilterFromURL = () => {
  if (typeof window === "undefined") return { sabilType: "CHULA" };

  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get("filter");

  if (filterParam) {
    try {
      const parsed = JSON.parse(filterParam) as Record<string, unknown>;
      return { ...parsed, sabilType: (parsed.sabilType as string) || "CHULA" };
    } catch (e) {
      console.error("Error parsing filter from URL:", e);
    }
  }

  return { sabilType: "CHULA" };
};

/** Base keys help the default FilterForm register fields; URL/deep-link values merge on top. */
const getListFilterDefaults = () => ({
  search: "",
  takhmeenGrade: "",
  ...getFilterFromURL(),
});

const RegistrationFilters = [
  <TextInput
    label="Search By HOF ITS OR Sabil No..."
    source="search"
    alwaysOn
    key="search"
    sx={{ minWidth: 300 }}
  />,
  <NumberInput
    label="Takhmeen amount"
    source="takhmeenAmount"
    key="takhmeenAmount"
    helperText="Exact match; clear to remove"
    parse={(v) => (v === "" || v == null ? undefined : Number(v))}
    format={(v) => (v == null || Number.isNaN(v as number) ? "" : v)}
  />,
  <SelectInput
    label="Grade"
    source="takhmeenGrade"
    key="takhmeenGrade"
    alwaysOn
    choices={GRADE_FILTER_CHOICES}
    emptyText="Any grade"
  />,
  <SelectInput
    label="Status"
    source="status"
    key="status"
    choices={[
      { id: "ACTIVE", name: "Active" },
      { id: "CLOSED", name: "Closed" },
    ]}
    sx={{ marginBottom: 0 }}
  />,
];

const ListActions = () => (
  <TopToolbar sx={{ justifyContent: "start" }}>
    <FilterButton />
    <SelectColumnsButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export default function SabilDataList(props: ListProps) {
  const { resource } = props;
  const unselectAll = useUnselectAll(resource);

  useEffect(() => {
    unselectAll();
  }, [resource, unselectAll]);

  return (
    <List
      {...props}
      sort={{ field: "updatedAt", order: "DESC" }}
      filterDefaultValues={getListFilterDefaults()}
      perPage={25}
      pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
      filters={RegistrationFilters}
      actions={<ListActions />}
      sx={{
        "& .RaList-main form": {
          flex: "none",
        },
        "& .RaList-main .MuiToolbar-root": {
          justifyContent: "start",
        },
        "& .RaList-main .MuiTablePagination-spacer": {
          display: "none",
        },
      }}
    >
      <TabbedDatagrid />
    </List>
  );
}
