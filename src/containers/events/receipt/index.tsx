import Icon from "@mui/icons-material/SupervisorAccountTwoTone";
import { ReceiptList } from "./ReceiptList";
import { ReceiptCreate } from "./create/ReceiptCreate";

export default {
  list: ReceiptList,
  create: ReceiptCreate,
  icon: Icon,
  label: "Receipts",
  options: { label: "Receipts" },
  name: "receipts",
};
