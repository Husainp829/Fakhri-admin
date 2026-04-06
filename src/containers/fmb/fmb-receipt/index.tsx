import Icon from "@mui/icons-material/Receipt";
import FmbReceiptList from "./FmbReceiptList";
import FmbReceiptCreate from "./FmbReceiptCreate";
import FmbReceiptShow from "./FmbReceiptShow";

export default {
  list: FmbReceiptList,
  create: FmbReceiptCreate,
  show: FmbReceiptShow,
  icon: Icon,
  label: "Fmb Receipts",
  options: { label: "Fmb Receipts" },
  name: "fmbReceipt",
};
