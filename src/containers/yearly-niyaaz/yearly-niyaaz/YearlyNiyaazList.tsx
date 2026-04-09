import {
  Datagrid,
  List,
  NumberField,
  TextField,
  FunctionField,
  Pagination,
  TextInput,
  SelectInput,
} from "react-admin";
import type { RaRecord } from "react-admin";
import { Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { callApi } from "@/dataprovider/misc-apis";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const useHijriYears = () => {
  const [years, setYears] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    callApi({ location: "yearlyNiyaaz", method: "GET", id: "hijri-years" })
      .then((res) => {
        const data = res.data as string[];
        setYears(data.map((y) => ({ id: y, name: y })));
      })
      .catch(() => {});
  }, []);
  return years;
};

export const YearlyNiyaazList = () => {
  const years = useHijriYears();

  const filters = [
    <SelectInput
      source="hijriYear"
      label="Hijri Year"
      choices={years}
      alwaysOn
      key="hijriYear"
      sx={{ minWidth: 150 }}
    />,
    <TextInput label="Search By ITS" source="itsNo" alwaysOn key="itsNo" sx={{ minWidth: 200 }} />,
    <TextInput label="Form No" source="formNo" key="formNo" sx={{ minWidth: 150 }} />,
  ];

  return (
    <List
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
      sort={{ field: "createdAt", order: "DESC" }}
      filters={filters}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="formNo" label="Form No" />
        <TextField source="hijriYear" label="Hijri Year" />
        <TextField source="itsNo" label="ITS No" />
        <TextField source="name" label="Name" />
        <NumberField source="takhmeen" label="Takhmeen" />
        <NumberField source="zabihatCount" label="Zabihat Count" />
        <NumberField source="zabihatTotal" label="Zabihat Total" />
        <NumberField source="paid" label="Paid" />
        <FunctionField
          label="Balance"
          render={(record: RaRecord) => {
            const balance = Number(record.balance ?? 0);
            return (
              <Typography
                variant="body2"
                fontWeight={600}
                color={balance > 0 ? "error.main" : "success.main"}
              >
                {formatCurrency(balance)}
              </Typography>
            );
          }}
        />
      </Datagrid>
    </List>
  );
};

export default YearlyNiyaazList;
