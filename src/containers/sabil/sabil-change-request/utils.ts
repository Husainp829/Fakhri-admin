export const getColor = (status: string | undefined) => {
  switch (status) {
    case "APPROVED":
      return "success" as const;
    case "DECLINED":
      return "error" as const;
    default:
      return "default" as const;
  }
};
