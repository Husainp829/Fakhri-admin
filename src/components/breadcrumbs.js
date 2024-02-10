import React from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";

export default () => {
  const breadcrumbs = useBreadcrumbs();
  return <>{breadcrumbs.map(({ breadcrumb }) => breadcrumb)}</>;
};
