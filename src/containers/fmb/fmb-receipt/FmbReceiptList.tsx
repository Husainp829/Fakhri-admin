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
import { formatINR } from "@/utils";

export default function FmbReceiptList() {
  const printReceipt = (id: string | number) => {
    window.open(`#/fmb-receipt?receiptId=${id}`, "_blank");
  };
  const optionRenderer = (choice: { itsNo?: string }) => `${choice.itsNo}`;
  const ReceiptFilters = [
    <ReferenceInput source="fmbId" reference="fmbData" key="fmbId" alwaysOn>
      <AutocompleteInput
        fullWidth
        optionText={optionRenderer}
        shouldRenderSuggestions={(val: string) => val.trim().length === 8}
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
            <TextField source="fileNo" />
          </ReferenceField>
          <ReferenceField source="fmbId" label="HOF ITS" reference="fmbData" link="show">
            <TextField source="itsNo" />
          </ReferenceField>
          <FunctionField
            label="Amount"
            textAlign="right"
            render={(record) => formatINR(record?.amount, { empty: "—" })}
          />
          <FunctionField
            label="Credit used"
            textAlign="right"
            render={(record) => formatINR(record?.creditUsed ?? 0, { empty: "—" })}
          />
          <DateField source="receiptDate" />
          <FunctionField
            label="Target"
            render={(record) => {
              const lines = record?.allocations;
              if (lines?.length > 1) {
                return `${lines.length} lines`;
              }
              if (lines?.length === 1) {
                return lines[0].fmbContributionId ? "Contribution" : "Annual";
              }
              return record?.unallocatedAmount > 0 ? "Credit" : "—";
            }}
          />
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
}
