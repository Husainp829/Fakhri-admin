import Icon from "@mui/icons-material/ReceiptLongTwoTone";
import { RentBookingReceiptList } from "./RentBookingReceiptList";
import { RentBookingReceiptCreate } from "./RentBookingReceiptCreate";
import { RentBookingReceiptEdit } from "./RentBookingReceiptEdit";

export default {
  list: RentBookingReceiptList,
  create: RentBookingReceiptCreate,
  edit: RentBookingReceiptEdit,
  icon: Icon,
  label: "Booking Receipts",
  options: { label: "Booking Receipts" },
  name: "contRcpt",
};
