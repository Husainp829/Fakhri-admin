import { NumberField, TextField, FunctionField, Button, Datagrid } from "react-admin";
import type { RaRecord } from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import { formatListDate } from "@/utils/date-format";

export const RentBookingReceiptDataGrid = () => (
  <Datagrid rowClick={false} bulkActionButtons={false}>
    <TextField source="receiptNo" />
    <TextField source="organiserIts" label="ITS No." />
    <TextField source="organiser" label="Organiser" />
    <FunctionField
      label="Date"
      source="date"
      render={(record: RaRecord) =>
        record?.date ? <span>{formatListDate(record.date as string)}</span> : <span>-</span>
      }
    />
    <NumberField source="amount" />
    <TextField source="mode" />
    <FunctionField
      label="Created By"
      source="createdBy"
      render={(record: RaRecord) => (
        <span>{(record?.admin as { name?: string } | undefined)?.name || record.createdBy}</span>
      )}
    />
    <FunctionField
      label="Download"
      source="formNo"
      render={(record: RaRecord) => (
        <Button
          onClick={() => {
            window.open(`#/cont-rcpt/${record.id}`, "_blank");
          }}
        >
          <DownloadIcon />
        </Button>
      )}
      key="name"
    />
  </Datagrid>
);

export default RentBookingReceiptDataGrid;
