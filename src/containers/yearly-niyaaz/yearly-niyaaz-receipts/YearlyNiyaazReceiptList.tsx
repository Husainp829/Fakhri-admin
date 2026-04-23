import {
  Datagrid,
  List,
  NumberField,
  TextField,
  FunctionField,
  Button,
  Pagination,
  TextInput,
  DateInput,
} from "react-admin";
import type { RaRecord } from "react-admin";
import { formatListDate } from "@/utils/date-format";
import DownloadIcon from "@mui/icons-material/Download";
import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const ReceiptFilters = [
  <TextInput label="Search By ITS" source="itsNo" alwaysOn key="itsNo" sx={{ minWidth: 250 }} />,
  <DateInput source="start" label="From" alwaysOn key="start" />,
  <DateInput source="end" label="To" alwaysOn key="end" />,
  <TextInput label="Receipt No" source="receiptNo" key="receiptNo" sx={{ minWidth: 200 }} />,
];

export const YearlyNiyaazReceiptList = () => (
  <List
    pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
    sort={{ field: "receiptDate", order: "DESC" }}
    filters={ReceiptFilters}
  >
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="receiptNo" label="Receipt No" />
      <FunctionField
        label="Form No"
        render={(rec: RaRecord) => {
          const yn = rec?.yearlyNiyaaz as { id?: string; formNo?: string } | undefined;
          if (!yn?.id) return <span>-</span>;
          return (
            <Link
              component={RouterLink}
              to={`/yearlyNiyaaz/${yn.id}/show`}
              onClick={(e) => e.stopPropagation()}
            >
              {yn.formNo || yn.id}
            </Link>
          );
        }}
      />
      <FunctionField
        label="Name"
        render={(rec: RaRecord) =>
          (rec?.yearlyNiyaaz as { name?: string } | undefined)?.name || "-"
        }
      />
      <FunctionField
        label="ITS No"
        render={(rec: RaRecord) =>
          (rec?.yearlyNiyaaz as { itsNo?: string } | undefined)?.itsNo || "-"
        }
      />
      <FunctionField
        label="Date"
        sortBy="receiptDate"
        render={(rec: RaRecord) => formatListDate(rec?.receiptDate, { empty: "—" })}
      />
      <NumberField source="amount" label="Amount" />
      <TextField source="paymentMode" label="Mode" />
      <TextField source="paymentRef" label="Payment Ref" />
      <TextField source="remarks" label="Remarks" />
      <FunctionField
        label="Created By"
        render={(rec: RaRecord) =>
          (rec?.admin as { name?: string } | undefined)?.name || rec.createdBy || "-"
        }
      />
      <FunctionField
        label="Download"
        render={(rec: RaRecord) => (
          <Button
            onClick={() => {
              window.open(`#/yn-rcpt/${rec.id}`, "_blank");
            }}
          >
            <DownloadIcon />
          </Button>
        )}
      />
    </Datagrid>
  </List>
);

export default YearlyNiyaazReceiptList;
