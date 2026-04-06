import {
  Button,
  Datagrid,
  DateField,
  FunctionField,
  ReferenceManyField,
  TextField,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";

const Receipts = () => {
  const printReceipt = (id: string | number) => {
    window.open(`#/sabil-receipt?receiptId=${id}`, "_blank");
  };
  return (
    <ReferenceManyField reference="sabilReceipt" target="sabilId" label={false}>
      <Datagrid>
        <TextField source="receiptNo" label="Receipt No" />
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
        />
      </Datagrid>
    </ReferenceManyField>
  );
};

export default Receipts;
