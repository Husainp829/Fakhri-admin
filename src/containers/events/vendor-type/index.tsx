import Icon from "@mui/icons-material/AccountTree";
import { VendorTypeList } from "./VendorTypeList";
import { VendorTypeEdit } from "./VendorTypeEdit";
import { VendorTypeCreate } from "./VendorTypeCreate";

export default {
  list: VendorTypeList,
  edit: VendorTypeEdit,
  create: VendorTypeCreate,
  icon: Icon,
  label: "Vendor Types",
  options: { label: "Vendor Types" },
  name: "vendorTypes",
};
