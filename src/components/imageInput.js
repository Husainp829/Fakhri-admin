import React from "react";
import Button from "@mui/material/Button";

function ImageInput() {
  return (
    <>
      <Button variant="contained" component="label">
        Upload File
        <input type="file" hidden />
      </Button>
    </>
  );
}

export default ImageInput;
