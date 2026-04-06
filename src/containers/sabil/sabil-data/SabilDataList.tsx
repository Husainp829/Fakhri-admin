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
} from "react-admin";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

type SabilTypeTab = { id: string; name: string };

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
      key="takhmeenAmount"
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

const RegistrationFilters = [
  <TextInput
    label="Search By HOF ITS OR Sabil No..."
    source="search"
    alwaysOn
    key={0}
    sx={{ minWidth: 300 }}
  />,
  <SelectInput
    label="Status"
    source="status"
    key={1}
    choices={[
      { id: "ACTIVE", name: "Active" },
      { id: "CLOSED", name: "Closed" },
    ]}
    sx={{ marginBottom: 0 }}
  />,
];

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
      filterDefaultValues={getFilterFromURL()}
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
