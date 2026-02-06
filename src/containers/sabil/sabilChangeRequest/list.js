import React from "react";
import {
  Datagrid,
  List,
  TextField,
  ReferenceField,
  ChipField,
  FunctionField,
  DateField,
  SimpleList,
} from "react-admin";
import { useMediaQuery } from "@mui/material";
import dayjs from "dayjs";
import { getColor } from "./utils";

export default () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });

  return (
    <List sort={{ field: "createdAt", order: "DESC" }}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) =>
            `${record.changeType ?? "—"} · ${record.sabilData?.sabilNo ?? record.sabilNo ?? "—"}`
          }
          secondaryText={(record) => (
            <>
              {record.fromITS ?? "—"} → {record.toITS ?? "—"}
              <br />
              {record.transferTo ?? "—"} · {record.status ?? "—"}
            </>
          )}
          tertiaryText={(record) =>
            record.createdAt ? dayjs(record.createdAt).format("DD-MMM-YYYY") : "—"
          }
          linkType="show"
          rowSx={() => ({ borderBottom: "1px solid #e0e0e0" })}
        />
      ) : (
        <Datagrid rowClick="show">
          <TextField source="changeType" />
          <ReferenceField source="sabilId" reference="sabilData" link="show">
            <TextField source="sabilNo" />
          </ReferenceField>
          <TextField source="transferTo" />
          <TextField source="fromITS" label="From ITS" />
          <TextField source="toITS" label="To ITS" />
          <FunctionField
            label="Status"
            source="status"
            render={(record) => <ChipField source="status" color={getColor(record.status)} />}
          />
          <TextField source="remarks" />
          <DateField source="createdAt" />
        </Datagrid>
      )}
    </List>
  );
};
