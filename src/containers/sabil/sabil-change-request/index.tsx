import Icon from "@mui/icons-material/TrackChanges";
import SabilChangeRequestList from "./SabilChangeRequestList";
import SabilChangeRequestCreate from "./create";
import SabilChangeRequestShow from "./show";

export default {
  list: SabilChangeRequestList,
  create: SabilChangeRequestCreate,
  show: SabilChangeRequestShow,
  icon: Icon,
  label: "Change Requests",
  options: { label: "Change Requests" },
  name: "sabilChangeRequests",
};
