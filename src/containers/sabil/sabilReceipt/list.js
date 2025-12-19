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
    window.open(`#/sabil-receipt?receiptId=${id}`, "_blank");
  };
  const optionRenderer = (choice) => `${choice.itsNo} - ${choice.sabilType}`;
  const ReceiptFilters = [
    <ReferenceInput source="sabilId" reference="sabilData" required key="sabilId" alwaysOn>
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
          <ReferenceField source="sabilId" reference="sabilData" link="show">
            <TextField source="sabilNo" />
          </ReferenceField>
          <ReferenceField source="sabilId" label="HOF ITS" reference="sabilData" link="show">
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
