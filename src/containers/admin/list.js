import React from "react";
import { List, Datagrid, TextField, EmailField } from "react-admin";
import ReceiptUpload from "../../components/uploadHelpers/ReceiptUpload";

export default (props) => (
  <>
  <ReceiptUpload />
    <List {...props}>
      <Datagrid rowClick="edit">
        <TextField source="name" />
        <EmailField source="email" />
      </Datagrid>
    </List>
  </>
);
