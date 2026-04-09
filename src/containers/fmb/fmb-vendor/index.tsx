import Icon from "@mui/icons-material/Storefront";
import FmbVendorCreate from "./FmbVendorCreate";
import FmbVendorEdit from "./FmbVendorEdit";
import FmbVendorList from "./FmbVendorList";
import FmbVendorShow from "./FmbVendorShow";

export default {
  name: "fmbVendor",
  list: FmbVendorList,
  create: FmbVendorCreate,
  edit: FmbVendorEdit,
  show: FmbVendorShow,
  icon: Icon,
  label: "FMB Vendors",
  options: { label: "FMB Vendors" },
};
