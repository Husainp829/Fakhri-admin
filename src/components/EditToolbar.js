import React from "react";
import { Toolbar, SaveButton, DeleteButton } from "react-admin";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CrossIcon from "@mui/icons-material/Close";

export default (props) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(props.goBackPath);
  };

  return (
    <Toolbar {...props} sx={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <SaveButton />
        <Button
          label="Back"
          onClick={handleClick}
          color="error"
          sx={{ marginLeft: 2 }}
          startIcon={<CrossIcon />}
        >
          CANCEL
        </Button>
      </div>
      <DeleteButton mutationMode="pessimistic" />
    </Toolbar>
  );
};
