import {
  Button,
  Datagrid,
  FunctionField,
  ReferenceManyField,
  TextField,
  type RaRecord,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import { formatListDate } from "@/utils/date-format";
import { formatINR } from "@/utils";

export default function ReceiptsTab() {
  const printReceipt = (id: string | number) => {
    window.open(`#/fmb-receipt?receiptId=${id}`, "_blank");
  };

  return (
    <ReferenceManyField reference="fmbReceipt" target="fmbId" label={false}>
      <Datagrid>
        <TextField source="receiptNo" label="Receipt No" />
        <FunctionField
          label="Amount"
          textAlign="right"
          render={(record) => formatINR(record?.amount, { empty: "—" })}
        />
        <FunctionField
          label="Receipt date"
          sortBy="receiptDate"
          render={(record: RaRecord) => formatListDate(record?.receiptDate, { empty: "—" })}
        />
        <FunctionField
          label="Target"
          render={(record) => {
            const lines = record?.allocations as { fmbContributionId?: string }[] | undefined;
            if (lines?.length && lines.length > 1) {
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
    </ReferenceManyField>
  );
}
