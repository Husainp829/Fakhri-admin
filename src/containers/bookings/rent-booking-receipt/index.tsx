import Icon from "@mui/icons-material/ReceiptLongTwoTone";
import { RentBookingReceiptList } from "./RentBookingReceiptList";
import { RentBookingReceiptCreate } from "./RentBookingReceiptCreate";

export default {
  list: RentBookingReceiptList,
  create: RentBookingReceiptCreate,
  icon: Icon,
  label: "Booking Receipts",
  options: { label: "Booking Receipts" },
  name: "contRcpt",
};
