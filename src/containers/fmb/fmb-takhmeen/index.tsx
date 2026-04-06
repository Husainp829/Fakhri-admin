import FmbTakhmeenCreate from "./FmbTakhmeenCreate";
import FmbTakhmeenEdit from "./FmbTakhmeenEdit";
import FmbTakhmeenList from "./FmbTakhmeenList";
import FmbTakhmeenShow from "./FmbTakhmeenShow";

export default {
  list: FmbTakhmeenList,
  create: FmbTakhmeenCreate,
  edit: FmbTakhmeenEdit,
  show: FmbTakhmeenShow,
  name: "fmbTakhmeen",
  options: { label: "FMB Takhmeen" },
};
