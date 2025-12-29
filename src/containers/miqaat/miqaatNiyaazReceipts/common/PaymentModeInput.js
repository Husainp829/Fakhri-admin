import React from "react";
import { TextInput, RadioButtonGroupInput } from "react-admin";
import { useWatch } from "react-hook-form";

export default () => {
  const paymentMode = useWatch({ name: "paymentMode" });
  return (
    <>
      <RadioButtonGroupInput
        source="paymentMode"
        choices={[
          { id: "CASH", name: "CASH" },
          { id: "ONLINE", name: "ONLINE" },
        ]}
        fullWidth
      />
      {paymentMode && paymentMode !== "CASH" && (
        <TextInput source="paymentRef" label="Payment Reference" fullWidth multiline />
      )}
    </>
  );
};
