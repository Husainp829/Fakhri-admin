/* eslint-disable no-unused-vars */
import React from "react";
import { Button, useCreate } from "react-admin";
import { itsdata } from "./itsdata";

export default () => {
  const [create] = useCreate();

  const onUploadITS = () => {
    itsdata.map(async (s) => {
      const created = await create("itsdata", {
        data: s,
      });

      return created;
    });
  };

  return <Button onClick={onUploadITS}> upload ITS DATA</Button>;
};
