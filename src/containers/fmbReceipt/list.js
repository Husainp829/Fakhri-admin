import React from "react";
import {
  Datagrid,
  List,
  TextField,
  DateField,
  FunctionField,
  Button,
  ReferenceField,
  ReferenceInput,
  AutocompleteInput,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";

export default () => {
  const printReceipt = (id) => {
    window.open(`#/fmb-receipt?receiptId=${id}`, "_blank");
  };
  const optionRenderer = (choice) => `${choice.itsNo}`;
  const ReceiptFilters = [
    <ReferenceInput source="fmbId" reference="fmbData" required key="fmbId" alwaysOn>
      <AutocompleteInput
        fullWidth
        optionText={optionRenderer}
        shouldRenderSuggestions={(val) => val.trim().length === 8}
        noOptionsText="Enter valid HOF ITS No."
        label="Search By HOF ITS..."
        sx={{ minWidth: 300 }}
      />
    </ReferenceInput>,
  ];
  return (
    <>
      <List sort={{ field: "receiptNo", order: "DESC" }} filters={ReceiptFilters}>
        <Datagrid rowClick="show">
          <TextField source="receiptNo" />
          <ReferenceField source="fmbId" reference="fmbData" link="show">
            <TextField source="fmbNo" />
          </ReferenceField>
          <ReferenceField source="fmbId" label="HOF ITS" reference="fmbData" link="show">
            <TextField source="itsNo" />
          </ReferenceField>
          <TextField source="amount" />
          <DateField source="receiptDate" />
          <TextField source="receiptType" />
          <FunctionField
            label="Download"
            source="formNo"
            render={(record) => (
              <Button onClick={() => printReceipt(record.id)}>
                <DownloadIcon />
              </Button>
            )}
            key="name"
          />
        </Datagrid>
      </List>
    </>
  );
};
