import Icon from "@mui/icons-material/FormatListNumbered";
import { VendorLedgerList } from "./VendorLedgerList";
import { VendorLedgerEdit } from "./VendorLedgerEdit";
import { VendorLedgerCreate } from "./VendorLedgerCreate";

export default {
  list: VendorLedgerList,
  edit: VendorLedgerEdit,
  create: VendorLedgerCreate,
  icon: Icon,
  label: "Ledger",
  options: { label: "Ledger" },
  name: "vendorLedger",
};
