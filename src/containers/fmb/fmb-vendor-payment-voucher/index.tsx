import Icon from "@mui/icons-material/ReceiptLong";
import FmbVendorPaymentVoucherCreate from "./FmbVendorPaymentVoucherCreate";
import FmbVendorPaymentVoucherEdit from "./FmbVendorPaymentVoucherEdit";
import FmbVendorPaymentVoucherList from "./FmbVendorPaymentVoucherList";

export default {
  name: "fmbVendorPaymentVoucher",
  list: FmbVendorPaymentVoucherList,
  create: FmbVendorPaymentVoucherCreate,
  edit: FmbVendorPaymentVoucherEdit,
  icon: Icon,
  label: "FMB Vendor Vouchers",
  options: { label: "FMB Vendor Vouchers" },
};
