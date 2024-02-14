/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useContext, useEffect } from "react";
import { Create, SimpleForm, useNotify } from "react-admin";

import { useFormContext } from "react-hook-form";
import { callApi } from "../../../dataprovider/miscApis";
import { EventContext } from "../../../dataprovider/eventProvider";
import CreateForm from "./createForm";
import { getEventId } from "../../../utils";

export default (props) => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const niyaazId = searchParams.get("niyaazId");
  const eventId = getEventId();

  const transform = (data) => ({
    eventId: data.eventId,
    niyaazId: data.niyaazId,
    formNo: data.formNo,
    amount: data.amount,
    mode: data.mode,
    details: data.details,
    markaz: data.markaz,
    HOFId: data.HOFId,
    HOFName: data.HOFName,
  });

  const receiptDefaultValues = () => ({ niyaazId, eventId });
  return (
    <Create {...props} transform={transform} redirect={() => `niyaaz/${niyaazId}/show/receipts`}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
      >
        <CreateForm niyaazId={niyaazId} />
      </SimpleForm>
    </Create>
  );
};
