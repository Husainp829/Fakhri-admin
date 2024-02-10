import React from "react";
import { useListContext } from "react-admin";
import LoadingGrid from "./loader";
import Table from "./table";

const TableWrapper = ({ width }) => {
  const { isLoading } = useListContext();
  return isLoading ? <LoadingGrid width={width} /> : <Table width={width} />;
};

export default TableWrapper;
