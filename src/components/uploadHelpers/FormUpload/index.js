/* eslint-disable no-unused-vars */
import React from "react";
import { Button, useCreate } from "react-admin";
import { forms } from "./forms";

export default () => {
  const [create] = useCreate();

  const onUploadITS = () => {
    forms.map(async (s) => {
      const created = await create("niyaaz", {
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
