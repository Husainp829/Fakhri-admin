import React from "react";
import {
  Datagrid,
  List,
  TextField,
  FunctionField,
  Button,
  ReferenceField,
  ReferenceInput,
  AutocompleteInput,
  TextInput,
} from "react-admin";
import type { RaRecord } from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import { formatINR } from "@/utils";
import { formatListDate } from "@/utils/date-format";

export default function FmbReceiptList() {
  const printReceipt = (id: string | number) => {
    window.open(`#/fmb-receipt?receiptId=${id}`, "_blank");
  };
  const optionRenderer = (choice: { itsNo?: string }) => `${choice.itsNo}`;
  const ReceiptFilters = [
    <TextInput
      key="q"
      source="q"
      label="Search receipt no., type, mode, remarks"
      alwaysOn
      sx={{ minWidth: 280 }}
    />,
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
          <ReferenceField source="fmbId" reference="fmbData" link="show" sortable={false}>
            <TextField source="fileNo" />
          </ReferenceField>
          <ReferenceField
            source="fmbId"
            label="HOF ITS"
            reference="fmbData"
            link="show"
            sortable={false}
          >
            <TextField source="itsNo" />
          </ReferenceField>
          <FunctionField
            label="Amount"
            textAlign="right"
            sortBy="amount"
            render={(record) => formatINR(record?.amount, { empty: "—" })}
          />
          <FunctionField
            label="Credit used"
            textAlign="right"
            sortBy="creditUsed"
            render={(record) => formatINR(record?.creditUsed ?? 0, { empty: "—" })}
          />
          <FunctionField
            label="Receipt date"
            sortBy="receiptDate"
            render={(record: RaRecord) => formatListDate(record?.receiptDate, { empty: "—" })}
          />
          <FunctionField
            label="Target"
            sortable={false}
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
            sortable={false}
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
