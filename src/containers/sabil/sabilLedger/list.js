import React, { useEffect, useState } from "react";
import {
  DatagridConfigurable,
  List,
  TextInput,
  TextField,
  useUnselectAll,
  TopToolbar,
  FilterButton,
  SelectColumnsButton,
  Pagination,
  FunctionField,
  DateField,
  NumberField,
  SelectInput,
  ReferenceInput,
  Button,
} from "react-admin";
import CancelIcon from "@mui/icons-material/Cancel";
import WriteoffDialog from "./writeoffDialog";

const RegistrationFilters = [
  <TextInput label="Search..." source="search" alwaysOn key={0} sx={{ minWidth: 300 }} />,
  <ReferenceInput source="sabilId" reference="sabilData" key={1}>
    <SelectInput optionText="sabilNo" label="Sabil" />
  </ReferenceInput>,
  <TextInput label="Financial Year" source="financialYear" key={2} sx={{ minWidth: 200 }} />,
];

function SabilLedgerDatagrid() {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const fullMonthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fields = [
    <TextField source="sabilData.sabilNo" label="Sabil No." key="sabilNo" />,
    <TextField source="sabilData.sabilType" label="Type" key="sabilType" />,
    <FunctionField
      label="Period"
      key="period"
      render={(record) => {
        const isEstablishment = record?.sabilData?.sabilType === "ESTABLISHMENT";
        
        // For establishment, if month is April (4), show range April {year} to March {year+1}
        if (isEstablishment && record.month === 4) {
          return `${fullMonthNames[3]} ${record.year} to ${fullMonthNames[2]} ${record.year + 1}`;
        }
        
        return `${monthNames[record.month - 1]} ${record.year}`;
      }}
    />,
    <TextField source="month" label="Month" key="month" />,
    <TextField source="year" label="Year" key="year" />,
    <TextField source="financialYear" label="Financial Year" key="financialYear" />,
    <NumberField
      source="dueAmount"
      label="Due Amount"
      key="dueAmount"
      options={{ style: "currency", currency: "INR" }}
    />,
    <NumberField
      source="paidAmount"
      label="Paid Amount"
      key="paidAmount"
      options={{ style: "currency", currency: "INR" }}
    />,
    <NumberField
      source="openingBalance"
      label="Opening Balance"
      key="openingBalance"
      options={{ style: "currency", currency: "INR" }}
    />,
    <FunctionField
      label="Status"
      render={(record) => {
        if (record.status === "WRITTEN_OFF") return "Written Off";
        if (record.status === "FULLY_PAID") return "Fully Paid";
        if (record.status === "PARTIALLY_PAID") return "Partially Paid";
        return "Unpaid";
      }}
      key="status"
    />,
    <FunctionField
      label="Outstanding"
      render={(record) => {
        if (record.status === "WRITTEN_OFF") {
          return `Written Off: ₹${(record.writeoffAmount || 0).toLocaleString()}`;
        }
        const outstanding = (record.dueAmount || 0) - (record.paidAmount || 0);
        return `₹${Math.max(0, outstanding).toLocaleString()}`;
      }}
      key="outstanding"
    />,
    <DateField source="createdAt" label="Created At" key="createdAt" />,
  ];

  const PostBulkActionButtons = ({ selectedIds, resource }) => {
    const [writeoffOpen, setWriteoffOpen] = useState(false);
    const unselectAll = useUnselectAll(resource);

    const handleWriteoffClick = () => {
      // Filter out already written off entries
      setWriteoffOpen(true);
    };

    const handleWriteoffClose = () => {
      setWriteoffOpen(false);
      unselectAll();
    };

    if (!selectedIds || selectedIds.length === 0) {
      return <div style={{ marginLeft: "25px" }}></div>;
    }

    return (
      <>
        <Button
          label="Write Off"
          onClick={handleWriteoffClick}
          startIcon={<CancelIcon />}
          sx={{ ml: 1 }}
        >
          Write Off ({selectedIds.length})
        </Button>
        <WriteoffDialog
          open={writeoffOpen}
          onClose={handleWriteoffClose}
          selectedIds={selectedIds}
          resource={resource}
        />
      </>
    );
  };

  return (
    <DatagridConfigurable
      size="small"
      sx={{
        color: "success.main",
      }}
      bulkActionButtons={(props) => <PostBulkActionButtons {...props} />}
      rowClick="show"
      isRowSelectable={(record) => record.status !== "WRITTEN_OFF"}
    >
      {[...fields]}
    </DatagridConfigurable>
  );
}

export default function SabilLedgerList(props) {
  const { resource } = props;
  const unselectAll = useUnselectAll(resource);

  useEffect(() => {
    unselectAll();
  }, [resource]);

  const ListActions = () => (
    <TopToolbar sx={{ justifyContent: "start" }}>
      <FilterButton />
      <SelectColumnsButton />
    </TopToolbar>
  );
  return (
    <>
      <List
        {...props}
        sort={{ field: "createdAt", order: "DESC" }}
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
        <SabilLedgerDatagrid {...props} />
      </List>
    </>
  );
}
