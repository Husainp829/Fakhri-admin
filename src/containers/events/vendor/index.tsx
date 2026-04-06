import Icon from "@mui/icons-material/Badge";
import { VendorList } from "./VendorList";
import { VendorEdit } from "./VendorEdit";
import { VendorCreate } from "./VendorCreate";

export default {
  list: VendorList,
  edit: VendorEdit,
  create: VendorCreate,
  icon: Icon,
  label: "Vendors",
  options: { label: "Vendors" },
  name: "vendors",
};
