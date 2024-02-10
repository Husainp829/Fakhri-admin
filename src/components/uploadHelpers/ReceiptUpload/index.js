/* eslint-disable no-unused-vars */
import React from "react";
import { Button, useCreate } from "react-admin";
import { receipts } from "./receipts";

export default () => {
  const [create] = useCreate();

  const onUploadITS = () => {
    receipts.map(async ({ _id, __v, ...s }) => {
      const created = await create("receipts", {
        data: {
          ...s,
          // familyMembers: {
          //   values: s.familyMembers,
          // },
        },
      });

      return created;
    });
  };

  return <Button onClick={onUploadITS}> upload Forms</Button>;
};
