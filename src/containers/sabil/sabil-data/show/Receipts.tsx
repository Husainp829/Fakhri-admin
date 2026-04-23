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

const Receipts = () => {
  const printReceipt = (id: string | number) => {
    window.open(`#/sabil-receipt?receiptId=${id}`, "_blank");
  };
  return (
    <ReferenceManyField reference="sabilReceipt" target="sabilId" label={false}>
      <Datagrid>
        <TextField source="receiptNo" label="Receipt No" />
        <TextField source="amount" />
        <FunctionField
          label="Receipt date"
          sortBy="receiptDate"
          render={(record: RaRecord) => formatListDate(record?.receiptDate, { empty: "—" })}
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
        />
      </Datagrid>
    </ReferenceManyField>
  );
};

export default Receipts;
