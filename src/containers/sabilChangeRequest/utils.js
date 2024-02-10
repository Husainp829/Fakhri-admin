export const getColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "DECLINED":
      return "error";
    default:
      return "default";
  }
};
