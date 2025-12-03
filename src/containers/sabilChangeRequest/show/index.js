/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import {
  TextField,
  useShowContext,
  SimpleShowLayout,
  Labeled,
  Button,
  Show,
  TopToolbar,
  Confirm,
  useNotify,
  useRefresh,
  FunctionField,
  ChipField,
  WrapperField,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { callApi } from "../../../dataprovider/miscApis";
import { getColor } from "../utils";

const SabilActions = () => {
  const {
    record, // record fetched via dataProvider.getOne() based on the id from the location
  } = useShowContext();
  const [approveOpen, setApproveOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  return (
    <TopToolbar>
      {record?.status === "PENDING" && (
        <>
          <Button onClick={() => setApproveOpen(true)} color="success">
            <DoneIcon sx={{ mr: 1 }} />
            Approve
          </Button>
          <Button onClick={() => setDeclineOpen(true)} color="error">
            <CloseIcon sx={{ mr: 1 }} />
            Decline
          </Button>

          <Confirm
            isOpen={approveOpen}
            title="Approve Change Request"
            content="Are you sure you want to approve this request?"
            onConfirm={() =>
              callApi({
                location: "sabilChangeRequests/approve",
                method: "PUT",
                id: record.id,
              })
                .then(() => {
                  notify("Approved");
                  refresh();
                })
                .catch((err) => {
                  notify(err.message, { type: "warning" });
                })
                .finally(() => {
                  setApproveOpen(false);
                })
            }
            onClose={() => {
              setApproveOpen(false);
            }}
          />
          <Confirm
            isOpen={declineOpen}
            title="Decline Change Request"
            content="Are you sure you want to decline this request?"
            onConfirm={() =>
              callApi({ location: "sabilChangeRequests/decline", method: "PUT", id: record.id })
                .then(() => {
                  notify("Approved");
                })
                .catch((err) => {
                  notify(err.message, { type: "warning" });
                })
                .finally(() => {
                  setApproveOpen(false);
                })
            }
            onClose={() => {
              setDeclineOpen(false);
            }}
          />
        </>
      )}
    </TopToolbar>
  );
};

const CloseRequestShow = () => {
  const { record } = useShowContext();
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={3}>
        <SimpleShowLayout>
          <TextField source="changeType" />
          {record?.changeType === "TRANSFER_WITHIN_JAMAAT" && (
            <>
              <Labeled>
                <TextField source="fromITS" key="FromITS" label="From ITS" />
              </Labeled>
            </>
          )}
          {record?.changeType === "TRANSFER_OUT" && (
            <>
              <Labeled>
                <TextField source="transferTo" label="Transfer To " />
              </Labeled>
            </>
          )}
          <TextField source="sabilData.sabilNo" />
          <TextField source="sabilData.sabilType" />
          <WrapperField source="sabilData.pendingBalance" label="Pending Balance">
            <span>₹ {record?.sabilData?.pendingBalance - record?.sabilData?.paidBalance}</span>
          </WrapperField>
        </SimpleShowLayout>
      </Grid>
      <Grid item xs={12} sm={4}>
        <SimpleShowLayout>
          <TextField source="sabilData.itsdata.Full_Name" label="Name" />
          {record?.changeType === "TRANSFER_WITHIN_JAMAAT" && (
            <>
              <Labeled>
                <TextField source="toITS" key="toITS" label="To ITS" />
              </Labeled>
            </>
          )}
          <TextField source="sabilData.itsdata.ITS_ID" label="ITS No." />
          <TextField source="sabilData.itsdata.Jamaat" label="Mohalla" />
          <TextField source="sabilData.itsdata.Address" label="Address" />
        </SimpleShowLayout>
      </Grid>
      <Grid item xs={12} sm={4}>
        <SimpleShowLayout>
          <ChipField source="status" color={getColor(record?.status)} />
        </SimpleShowLayout>
      </Grid>
    </Grid>
  );
};

export default ({ props }) => (
  <Show actions={<SabilActions {...props} />}>
    <CloseRequestShow />
  </Show>
);
