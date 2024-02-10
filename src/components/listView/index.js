import React from "react";
import PropTypes from "prop-types";
import {
  useListController,
  ListContextProvider,
  CreateButton,
  ExportButton,
  TopToolbar,
} from "react-admin";

import Table from "./tableWrapper";

function TableView({ hasCreate }) {
  return (
    <>
      <TopToolbar>
        {hasCreate && <CreateButton />}
        <ExportButton />
      </TopToolbar>
      <Table />
    </>
  );
}

const ListBase = ({ children, ...props }) => (
  <ListContextProvider value={{ ...props, ...useListController(props) }}>
    {children}
  </ListContextProvider>
);

const ListView = (props) => (
  <ListBase {...props}>
    <TableView hasCreate={props.hasCreate} />
  </ListBase>
);

ListView.propTypes = {
  columnDef: PropTypes.object,
};

export default ListView;
export { ListView };
