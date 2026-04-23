import {
  List,
  Datagrid,
  TextField,
  NumberField,
  FunctionField,
  SimpleList,
  type ListProps,
  type RaRecord,
} from "react-admin";
import { useMediaQuery } from "@mui/material";
import { formatListDate } from "@/utils/date-format";

export const VendorLedgerList = (props: ListProps) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  return (
    <List {...props}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.vendor?.name ?? "—"}
          tertiaryText={(record) =>
            `₹ ${Intl.NumberFormat("en-IN").format(Number(record.paid || 0))}`
          }
          secondaryText={(record) => (
            <>
              Bill: {record.billNo} | {record.billDate ? formatListDate(record.billDate) : ""}
              <br />
              Paid: {record.paidDate ? formatListDate(record.paidDate) : ""} | {record.mode}
            </>
          )}
          linkType="edit"
          rowSx={() => ({ borderBottom: 1, borderBottomColor: "divider" })}
        />
      ) : (
        <Datagrid rowClick="edit">
          <TextField source="ledgerNo" />
          <TextField source="billNo" />
          <TextField source="vendor.name" />
          <TextField source="type" />
          <FunctionField
            label="Bill Date"
            source="billDate"
            render={(r: RaRecord) =>
              r.billDate ? <span>{formatListDate(r.billDate as string)}</span> : <span>—</span>
            }
          />
          <NumberField source="paid" label="Payment (Rs)" />
          <FunctionField
            label="Payment Date"
            source="paidDate"
            render={(r: RaRecord) =>
              r.paidDate ? <span>{formatListDate(r.paidDate as string)}</span> : <span>—</span>
            }
          />
          <TextField source="mode" label="Payment Mode" />
          <TextField source="remarks" label="Remarks" />
        </Datagrid>
      )}
    </List>
  );
};
