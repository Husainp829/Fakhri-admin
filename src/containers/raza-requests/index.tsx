import Icon from "@mui/icons-material/AssignmentTurnedIn";
import RazaRequestsList from "./RazaRequestsList";
import RazaRequestsCreate from "./RazaRequestsCreate";
import RazaRequestsEdit from "./RazaRequestsEdit";
import RazaRequestsShow from "./RazaRequestsShow";

export default {
  list: RazaRequestsList,
  create: RazaRequestsCreate,
  edit: RazaRequestsEdit,
  show: RazaRequestsShow,
  icon: Icon,
  label: "Raza requests",
  options: { label: "Raza requests" },
  name: "razaRequests",
};
